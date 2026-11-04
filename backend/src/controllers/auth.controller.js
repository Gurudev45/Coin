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

    // Find customer by idName or mailId
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ idName: username }, { mailId: username }],
        deletedAt: null,
      },
    });

    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!customer.passwordHash) {
      return res.status(401).json({ error: 'Password not set. Contact administrator.' });
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: customer.id, idName: customer.idName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await createAuditLog({
      customerId: customer.id,
      action: 'LOGIN',
      details: { idName: customer.idName },
      ipAddress: getClientIP(req),
    });

    res.json({
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
      token, // Also return token for mobile use
    });
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
    user: {
      id: req.user.id,
      idName: req.user.idName,
      mailId: req.user.mailId,
      balanceCoin: req.user.balanceCoin,
      withdrawCoin: req.user.withdrawCoin,
      remainingCoin: req.user.remainingCoin,
      totalCoin: req.user.totalCoin,
    },
  });
}

module.exports = { login, logout, getMe };
