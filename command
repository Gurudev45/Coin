How to Run Locally
1. Start the Shared Backend
bash
cd backend
# 1. Push schema to PostgreSQL:
npx prisma db push --schema=../prisma/schema.prisma
# 2. Seed initial data (Admin: admin / Admin@123456):
node ../prisma/seed.js
# 3. Start server:
npm run dev
2. Start the Web Application
bash
cd web
npm run dev
# Running on http://localhost:3000 (proxies /api to backend)
3. Start the Mobile Application
bash
cd mobile
npx expo start
# Press 'a' for Android, 'i' for iOS, or scan QR code with Expo Go
