const ExcelJS = require('exceljs');
const { stringify } = require('csv-stringify/sync');
const prisma = require('../utils/prisma');
const { createAuditLog, getClientIP } = require('../utils/auditLog');

function sanitizeForExport(customers) {
  return customers.map((c) => ({
    'ID Name': c.idName,
    'Date': c.date ? new Date(c.date).toLocaleDateString() : '',
    'Mail ID': c.mailId || '',
    'M.Date': c.mDate ? new Date(c.mDate).toLocaleDateString() : '',
    'Password Status': c.passwordHash ? 'Set' : 'Not Set',
    'Fixed': c.fixedValue ?? '',
    'Regular': c.regularValue ?? '',
    'Combo': c.comboValue ?? '',
    'ARP': c.arp ?? '',
    'Balance Coin': c.balanceCoin ?? 0,
    'Withdraw Coin': c.withdrawCoin ?? 0,
    'Withdraw Fee': c.withdrawFee ?? 0,
    'Remaining Coin': c.remainingCoin ?? 0,
    'Total Coin': c.totalCoin ?? 0,
  }));
}

async function exportExcel(req, res) {
  try {
    const customers = await getFilteredCustomers(req.query);
    const data = sanitizeForExport(customers);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Coin Management System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Customers', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const columns = [
      { header: 'ID Name', key: 'ID Name', width: 18 },
      { header: 'Date', key: 'Date', width: 14 },
      { header: 'Mail ID', key: 'Mail ID', width: 28 },
      { header: 'M.Date', key: 'M.Date', width: 14 },
      { header: 'Password Status', key: 'Password Status', width: 16 },
      { header: 'Fixed', key: 'Fixed', width: 10 },
      { header: 'Regular', key: 'Regular', width: 10 },
      { header: 'Combo', key: 'Combo', width: 10 },
      { header: 'ARP', key: 'ARP', width: 10 },
      { header: 'Balance Coin', key: 'Balance Coin', width: 14 },
      { header: 'Withdraw Coin', key: 'Withdraw Coin', width: 14 },
      { header: 'Withdraw Fee', key: 'Withdraw Fee', width: 14 },
      { header: 'Remaining Coin', key: 'Remaining Coin', width: 14 },
      { header: 'Total Coin', key: 'Total Coin', width: 14 },
    ];

    worksheet.columns = columns;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF64748B' } },
      };
    });
    headerRow.height = 22;

    // Add auto filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    // Add data
    data.forEach((row, i) => {
      const dataRow = worksheet.addRow(row);
      if (i % 2 === 0) {
        dataRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        });
      }
      dataRow.eachCell((cell, colNumber) => {
        if (colNumber >= 10) {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: req.user?.id || null,
      action: 'EXCEL_EXPORT',
      details: { count: data.length },
      ipAddress: getClientIP(req),
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
}

async function exportCsv(req, res) {
  try {
    const customers = await getFilteredCustomers(req.query);
    const data = sanitizeForExport(customers);

    const csvData = stringify(data, { header: true });

    await createAuditLog({
      adminId: req.admin?.role === 'admin' ? req.admin.id : null,
      customerId: req.user?.id || null,
      action: 'CSV_EXPORT',
      details: { count: data.length },
      ipAddress: getClientIP(req),
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${Date.now()}.csv"`);
    res.send(csvData);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
}

async function getFilteredCustomers(query) {
  const {
    search = '',
    fixedValue,
    regularValue,
    comboValue,
    dateFrom,
    dateTo,
    mDateFrom,
    mDateTo,
  } = query;

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

  return prisma.customer.findMany({
    where,
    orderBy: { idName: 'asc' },
    select: {
      id: true, idName: true, date: true, mailId: true, mDate: true,
      fixedValue: true, regularValue: true, comboValue: true, arp: true,
      balanceCoin: true, withdrawCoin: true, withdrawFee: true,
      remainingCoin: true, totalCoin: true, passwordHash: true,
    },
  });
}

module.exports = { exportExcel, exportCsv };
