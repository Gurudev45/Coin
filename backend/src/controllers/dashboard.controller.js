const prisma = require('../utils/prisma');

async function getDashboard(req, res) {
  try {
    const [
      totalCustomers,
      coinAggregates,
      recentCustomers,
      recentWithdrawals,
    ] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.customer.aggregate({
        where: { deletedAt: null },
        _sum: {
          balanceCoin: true,
          withdrawCoin: true,
          withdrawFee: true,
          remainingCoin: true,
          totalCoin: true,
        },
      }),
      prisma.customer.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, idName: true, mailId: true, balanceCoin: true,
          remainingCoin: true, createdAt: true, fixedValue: true,
          regularValue: true, comboValue: true,
        },
      }),
      prisma.withdrawal.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { id: true, idName: true, mailId: true } },
        },
      }),
    ]);

    res.json({
      stats: {
        totalCustomers,
        totalBalanceCoin: coinAggregates._sum.balanceCoin || 0,
        totalWithdrawCoin: coinAggregates._sum.withdrawCoin || 0,
        totalWithdrawFee: coinAggregates._sum.withdrawFee || 0,
        totalRemainingCoin: coinAggregates._sum.remainingCoin || 0,
        totalCoin: coinAggregates._sum.totalCoin || 0,
      },
      recentCustomers,
      recentWithdrawals,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

module.exports = { getDashboard };
