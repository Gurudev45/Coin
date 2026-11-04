const prisma = require('../utils/prisma');

async function getReports(req, res) {
  try {
    const { dateFrom, dateTo, mDateFrom, mDateTo } = req.query;

    const where = {
      deletedAt: null,
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      } : {}),
    };

    const [aggregates, fixedDistribution, regularDistribution, comboDistribution, monthlyCounts] = await Promise.all([
      prisma.customer.aggregate({
        where,
        _sum: {
          balanceCoin: true,
          withdrawCoin: true,
          withdrawFee: true,
          remainingCoin: true,
          totalCoin: true,
        },
        _count: { id: true },
      }),
      prisma.customer.groupBy({
        by: ['fixedValue'],
        where: { ...where, fixedValue: { not: null } },
        _count: { id: true },
        _sum: { totalCoin: true },
      }),
      prisma.customer.groupBy({
        by: ['regularValue'],
        where: { ...where, regularValue: { not: null } },
        _count: { id: true },
        _sum: { totalCoin: true },
      }),
      prisma.customer.groupBy({
        by: ['comboValue'],
        where: { ...where, comboValue: { not: null } },
        _count: { id: true },
        _sum: { totalCoin: true },
      }),
      // Monthly customer creation counts (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as count
        FROM customers
        WHERE deleted_at IS NULL
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `,
    ]);

    res.json({
      summary: {
        totalCustomers: aggregates._count.id,
        totalBalanceCoin: aggregates._sum.balanceCoin || 0,
        totalWithdrawCoin: aggregates._sum.withdrawCoin || 0,
        totalWithdrawFee: aggregates._sum.withdrawFee || 0,
        totalRemainingCoin: aggregates._sum.remainingCoin || 0,
        totalCoin: aggregates._sum.totalCoin || 0,
      },
      fixedDistribution,
      regularDistribution,
      comboDistribution,
      monthlyCounts,
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
}

module.exports = { getReports };
