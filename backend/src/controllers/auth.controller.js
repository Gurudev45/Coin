const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { createAuditLog, getClientIP } = require('../utils/auditLog');

const SALT_ROUNDS = 12;

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    // 1. Try finding customer by idName or mailId (case-insensitive)
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { idName: { equals: username.trim(), mode: 'insensitive' } },
          { mailId: { equals: username.trim(), mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
    });

    if (customer) {
      if (!customer.passwordHash) {
        return res.status(401).json({ error: 'Password not set. Contact administrator.' });
      }

      const isValid = await bcrypt.compare(password, customer.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: customer.id, idName: customer.idName, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await createAuditLog({
        customerId: customer.id,
        action: 'LOGIN',
        details: { idName: customer.idName },
        ipAddress: getClientIP(req),
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: customer.id,
          idName: customer.idName,
          mailId: customer.mailId,
          balanceCoin: customer.balanceCoin,
          withdrawCoin: customer.withdrawCoin,
          remainingCoin: customer.remainingCoin,
          totalCoin: customer.totalCoin,
        },
        token,
      });
    }

    // 2. Try finding admin by username or email (case-insensitive)
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: { equals: username.trim(), mode: 'insensitive' } },
          { email: { equals: username.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (admin) {
      const isValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: admin.id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: admin.id,
          idName: admin.username,
          mailId: admin.email,
          role: admin.role,
        },
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        token,
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function logout(req, res) {
  try {
    await createAuditLog({
      customerId: req.user?.id,
      action: 'LOGOUT',
      details: { idName: req.user?.idName },
      ipAddress: getClientIP(req),
    });

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
}

async function getMe(req, res) {
  res.json({
    user: req.user,
    admin: req.admin || null,
  });
}

module.exports = { login, logout, getMe };
