const prisma = require('../utils/prisma');

/**
 * Log an audit event.
 */
async function createAuditLog({ adminId, customerId, action, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: adminId || null,
        customerId: customerId || null,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    // Audit log failure should not break main flow
    console.error('Audit log error:', err.message);
  }
}

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = { createAuditLog, getClientIP };
