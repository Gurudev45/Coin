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
        deletedAt: true,
      },
    });

    if (!customer || customer.deletedAt) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = customer;
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

module.exports = { authenticate };
