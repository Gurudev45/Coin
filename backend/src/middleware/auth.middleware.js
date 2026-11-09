const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token belongs to an admin
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (admin) {
      req.user = {
        id: admin.id,
        idName: admin.username,
        mailId: admin.email,
        role: admin.role,
      };
      req.admin = admin;
      return next();
    }

    // Otherwise check customer
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        idName: true,
        mailId: true,
        balanceCoin: true,
        withdrawCoin: true,
        remainingCoin: true,
        totalCoin: true,
        netCoin: true,
        deletedAt: true,
      },
    });

    if (!customer || customer.deletedAt) {
      return res.status(401).json({ error: 'User not found or account deactivated' });
    }

    req.user = {
      ...customer,
      role: 'customer',
    };
    req.admin = null;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Enforce administrator privileges.
 * Blocks any regular customer account from accessing administrative endpoints.
 */
const requireAdmin = (req, res, next) => {
  if (!req.admin || req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
