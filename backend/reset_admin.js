require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin@123456';
  const hash = await bcrypt.hash(password, 12);

  // Force update the password
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash: hash },
    create: {
      username: 'admin',
      email: 'admin@coinmanagement.com',
      passwordHash: hash,
      role: 'admin',
    },
  });

  console.log('Admin updated:', admin.username);
  console.log('Password set to:', password);

  // Verify the password works
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  console.log('Password verification:', isValid ? '✅ PASS' : '❌ FAIL');

  await prisma.$disconnect();
}

main().catch(console.error);
