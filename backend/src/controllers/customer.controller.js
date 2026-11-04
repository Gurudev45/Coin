const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { recalculate } = require('../utils/coinCalculations');
const { createAuditLog, getClientIP } = require('../utils/auditLog');

const SALT_ROUNDS = 12;

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

function sanitizeCustomer(customer) {
  const { passwordHash, ...safe } = customer;
  return {
    ...safe,
    passwordStatus: passwordHash ? 'Set' : 'Not Set',
  };
}

async function getCustomers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fixedValue,
      regularValue,
      comboValue,
      dateFrom,
      dateTo,
      mDateFrom,
      mDateTo,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { idName: { contains: search, mode: 'insensitive' } },
          { mailId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(fixedValue && { fixedValue: parseInt(fixedValue) }),
      ...(regularValue && { regularValue: parseInt(regularValue) }),
      ...(comboValue && { comboValue: parseInt(comboValue) }),
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      } : {}),
      ...(mDateFrom || mDateTo ? {
        mDate: {
          ...(mDateFrom && { gte: new Date(mDateFrom) }),
          ...(mDateTo && { lte: new Date(mDateTo) }),
        }
      } : {}),
    };

    const allowedSortFields = [
      'idName', 'date', 'mailId', 'mDate', 'fixedValue',
      'regularValue', 'comboValue', 'arp', 'balanceCoin',
      'withdrawCoin', 'remainingCoin', 'totalCoin', 'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true, idName: true, date: true, mailId: true, mDate: true,
          fixedValue: true, regularValue: true, comboValue: true, arp: true,
          balanceCoin: true, withdrawCoin: true, withdrawFee: true,
          remainingCoin: true, totalCoin: true, createdAt: true, updatedAt: true,
          passwordHash: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      customers: customers.map(sanitizeCustomer),
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
}

async function getCustomer(req, res) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { withdrawals: { orderBy: { createdAt: 'desc' } } },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(sanitizeCustomer(customer));
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
}

async function createCustomer(req, res) {
  const validationErr = handleValidationErrors(req, res);
  if (validationErr !== null) return;

  try {
    const {
      id_name, date, mail_id, m_date, password,
      fixed_value, regular_value, combo_value, arp,
      balance_coin, withdraw_coin, withdraw_fee,
    } = req.body;

    // Check uniqueness
    const existing = await prisma.customer.findFirst({
      where: { idName: id_name, deletedAt: null },
    });
    if (existing) {
      return res.status(400).json({ error: 'ID Name already exists' });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Calculate coins
    const { remainingCoin, totalCoin } = recalculate({
      balanceCoin: balance_coin,
      withdrawCoin: withdraw_coin,
      withdrawFee: withdraw_fee,
    });

    const customer = await prisma.customer.create({
      data: {
        idName: id_name,
        date: date ? new Date(date) : null,
        mailId: mail_id || null,
        mDate: m_date ? new Date(m_date) : null,
        passwordHash,
        fixedValue: fixed_value ? parseInt(fixed_value) : null,
        regularValue: regular_value ? parseInt(regular_value) : null,
        comboValue: combo_value ? parseInt(combo_value) : null,
        arp: arp ? parseFloat(arp) : null,
        balanceCoin: balance_coin ? parseFloat(balance_coin) : 0,
        withdrawCoin: withdraw_coin ? parseFloat(withdraw_coin) : 0,
        withdrawFee: withdraw_fee ? parseFloat(withdraw_fee) : 0,
        remainingCoin,
        totalCoin,
      },
    });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: customer.id,
      action: 'CUSTOMER_CREATED',
      details: { idName: customer.idName },
      ipAddress: getClientIP(req),
    });

    res.status(201).json(sanitizeCustomer(customer));
  } catch (err) {
    console.error('Create customer error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'ID Name already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

async function updateCustomer(req, res) {
  const validationErr = handleValidationErrors(req, res);
  if (validationErr !== null) return;

  try {
    const { id } = req.params;
    const existing = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const {
      id_name, date, mail_id, m_date,
      fixed_value, regular_value, combo_value, arp,
      balance_coin, withdraw_coin, withdraw_fee,
    } = req.body;

    // Check id_name uniqueness if changed
    if (id_name && id_name !== existing.idName) {
      const dup = await prisma.customer.findFirst({
        where: { idName: id_name, deletedAt: null, NOT: { id } },
      });
      if (dup) {
        return res.status(400).json({ error: 'ID Name already exists' });
      }
    }

    const newBalanceCoin = balance_coin !== undefined ? parseFloat(balance_coin) : existing.balanceCoin;
    const newWithdrawCoin = withdraw_coin !== undefined ? parseFloat(withdraw_coin) : existing.withdrawCoin;
    const newWithdrawFee = withdraw_fee !== undefined ? parseFloat(withdraw_fee) : existing.withdrawFee;

    const { remainingCoin, totalCoin } = recalculate({
      balanceCoin: newBalanceCoin,
      withdrawCoin: newWithdrawCoin,
      withdrawFee: newWithdrawFee,
    });

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(id_name && { idName: id_name }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(mail_id !== undefined && { mailId: mail_id || null }),
        ...(m_date !== undefined && { mDate: m_date ? new Date(m_date) : null }),
        ...(fixed_value !== undefined && { fixedValue: fixed_value !== null ? parseInt(fixed_value) : null }),
        ...(regular_value !== undefined && { regularValue: regular_value !== null ? parseInt(regular_value) : null }),
        ...(combo_value !== undefined && { comboValue: combo_value !== null ? parseInt(combo_value) : null }),
        ...(arp !== undefined && { arp: arp !== null ? parseFloat(arp) : null }),
        balanceCoin: newBalanceCoin,
        withdrawCoin: newWithdrawCoin,
        withdrawFee: newWithdrawFee,
        remainingCoin,
        totalCoin,
      },
    });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: id,
      action: 'CUSTOMER_UPDATED',
      details: { idName: updated.idName },
      ipAddress: getClientIP(req),
    });

    res.json(sanitizeCustomer(updated));
  } catch (err) {
    console.error('Update customer error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'ID Name already exists' });
    }
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Soft delete
    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: id,
      action: 'CUSTOMER_DELETED',
      details: { idName: existing.idName },
      ipAddress: getClientIP(req),
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}

async function resetPassword(req, res) {
  const validationErr = handleValidationErrors(req, res);
  if (validationErr !== null) return;

  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const existing = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const passwordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

    await prisma.customer.update({
      where: { id },
      data: { passwordHash },
    });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: id,
      action: 'PASSWORD_RESET',
      details: { idName: existing.idName },
      ipAddress: getClientIP(req),
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

async function getAllForExport(req, res) {
  try {
    const {
      search = '',
      fixedValue,
      regularValue,
      comboValue,
      dateFrom,
      dateTo,
      mDateFrom,
      mDateTo,
    } = req.query;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { idName: { contains: search, mode: 'insensitive' } },
          { mailId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(fixedValue && { fixedValue: parseInt(fixedValue) }),
      ...(regularValue && { regularValue: parseInt(regularValue) }),
      ...(comboValue && { comboValue: parseInt(comboValue) }),
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      } : {}),
    };

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { idName: 'asc' },
      select: {
        id: true, idName: true, date: true, mailId: true, mDate: true,
        fixedValue: true, regularValue: true, comboValue: true, arp: true,
        balanceCoin: true, withdrawCoin: true, withdrawFee: true,
        remainingCoin: true, totalCoin: true, passwordHash: true,
        createdAt: true,
      },
    });

    return customers.map(sanitizeCustomer);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  resetPassword,
  getAllForExport,
};
