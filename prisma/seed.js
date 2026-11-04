require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@coinmanagement.com',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  console.log(`✅ Admin created: ${admin.username} / ${adminPassword}`);

  // Sample customers
  const customers = [
    {
      idName: 'GURU001',
      date: new Date('2024-01-15'),
      mailId: 'guru001@example.com',
      mDate: new Date('2024-06-15'),
      password: 'Guru@001',
      fixedValue: 5,
      regularValue: 60,
      comboValue: 3,
      arp: 10.5,
      balanceCoin: 5000,
      withdrawCoin: 1000,
      withdrawFee: 50,
    },
    {
      idName: 'GURU002',
      date: new Date('2024-02-20'),
      mailId: 'guru002@example.com',
      mDate: new Date('2024-07-20'),
      password: 'Guru@002',
      fixedValue: 3,
      regularValue: 55,
      comboValue: 5,
      arp: 8.0,
      balanceCoin: 3500,
      withdrawCoin: 500,
      withdrawFee: 25,
    },
    {
      idName: 'USER1001',
      date: new Date('2024-03-10'),
      mailId: 'user1001@example.com',
      mDate: new Date('2024-08-10'),
      password: 'User@1001',
      fixedValue: 5,
      regularValue: 50,
      comboValue: 3,
      arp: 12.0,
      balanceCoin: 7000,
      withdrawCoin: 2000,
      withdrawFee: 100,
    },
    {
      idName: 'CLIENT001',
      date: new Date('2024-04-05'),
      mailId: 'client001@example.com',
      mDate: new Date('2024-09-05'),
      password: 'Client@001',
      fixedValue: 3,
      regularValue: 45,
      comboValue: 5,
      arp: 5.5,
      balanceCoin: 2000,
      withdrawCoin: 300,
      withdrawFee: 15,
    },
    {
      idName: 'ABC123',
      date: new Date('2024-05-25'),
      mailId: 'abc123@example.com',
      mDate: new Date('2024-10-25'),
      password: 'Abc@12345',
      fixedValue: 5,
      regularValue: 40,
      comboValue: 3,
      arp: 7.25,
      balanceCoin: 4500,
      withdrawCoin: 800,
      withdrawFee: 40,
    },
  ];

  for (const c of customers) {
    const withdrawFee = Math.round(c.withdrawCoin * 0.05 * 100) / 100;
    const remainingCoin = Math.round((c.balanceCoin - c.withdrawCoin) * 100) / 100;
    const totalCoin = Math.round((remainingCoin + c.withdrawCoin + withdrawFee) * 100) / 100;
    const passwordHash = await bcrypt.hash(c.password, 12);

    await prisma.customer.upsert({
      where: { idName: c.idName },
      update: {},
      create: {
        idName: c.idName,
        date: c.date,
        mailId: c.mailId,
        mDate: c.mDate,
        passwordHash,
        fixedValue: c.fixedValue,
        regularValue: c.regularValue,
        comboValue: c.comboValue,
        arp: c.arp,
        balanceCoin: c.balanceCoin,
        withdrawCoin: c.withdrawCoin,
        withdrawFee: c.withdrawFee,
        remainingCoin,
        totalCoin,
      },
    });
    console.log(`✅ Customer: ${c.idName}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nAdmin credentials:');
  console.log(`  Username: ${admin.username}`);
  console.log(`  Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
