# Coin Management System — Full-Stack Web + Mobile Application

A complete, production-ready **Coin Management System** consisting of:
1. **Responsive Web Application** (React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts)
2. **Mobile Application** (React Native + Expo SDK 58 + React Navigation)
3. **Shared Backend API** (Node.js + Express + Prisma ORM + JWT Authentication)
4. **Shared PostgreSQL Database** (Single unified schema powering both clients)

---

## Architecture Overview

```
coin/
├── backend/                  # Shared REST API (Express.js + Prisma)
│   ├── src/
│   │   ├── controllers/      # Auth, Customer, Dashboard, Reports, Export, Audit
│   │   ├── middleware/       # JWT auth, Rate limit, Validator
│   │   ├── routes/           # REST endpoints
│   │   ├── utils/            # Calculation helpers, audit log, token
│   │   └── server.js         # Entry point (port 5000)
│   └── package.json
│
├── prisma/                   # Database Layer
│   ├── schema.prisma         # Unified PostgreSQL Schema
│   └── seed.js               # Database seeder (Admin + sample customers)
│
├── web/                      # Admin Web Portal (React 18 + Vite)
│   ├── src/
│   │   ├── components/       # CustomerForm, DropdownPickers, Modals, Sidebar
│   │   ├── pages/            # Dashboard, Customers, Details, Add/Edit, Reports, Export, AuditLogs, Settings
│   │   ├── services/         # Axios API Client
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
└── mobile/                   # Cross-Platform Mobile App (Expo + React Native)
    ├── src/
    │   ├── components/       # Custom DropdownPicker modal sheet
    │   ├── screens/          # Login, Dashboard, CustomerList, CustomerDetail, CustomerForm
    │   ├── services/         # SecureStore API client
    │   └── types/            # Mobile TypeScript interfaces
    └── package.json
```

---

## 1. Single Field: ID Name

- **Database column:** `id_name`
- **UI Label:** `ID Name`
- **Behavior:** Single unique identifier field (e.g. `GURU001`, `USER1001`, `ABC123`).
- **Never split** into separate ID and Name fields.

---

## 2. Dropdown Button Specifications

Both Web and Mobile interfaces use custom dropdown selector buttons for:

- **Fixed:** Dropdown with options: `Fixed` (None), `3`, `5`
- **Regular:** Dropdown with options: `Regular` (None), `60`, `55`, `50`, `45`, `40`
- **Combo:** Dropdown with options: `Combo` (None), `5`, `3`

---

## 3. Coin Calculation Formulae (Automated)

All values are calculated automatically live on input and verified server-side:

$$\text{Withdraw Fee} = \text{Withdraw Coin} \times 0.05$$
$$\text{Remaining Coin} = \text{Balance Coin} - \text{Withdraw Coin}$$
$$\text{Total Coin} = \text{Remaining Coin} + \text{Withdraw Coin} + \text{Withdraw Fee}$$

---

## 4. Quick Start Guide

### Step 1: Environment & Database Setup

1. Copy `.env.example` to `backend/.env` (or configure PostgreSQL URL):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/coin_management"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

2. Push Prisma schema & seed initial data:
```bash
cd backend
npx prisma db push --schema=../prisma/schema.prisma
node ../prisma/seed.js
```

### Step 2: Running the Shared Backend API

```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

---

### Step 3: Running the Web Application

```bash
cd web
npm run dev
# Running on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

---

### Step 4: Running the Mobile Application

```bash
cd mobile
npx expo start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with the Expo Go app.

---

## 5. Security & Features

- **JWT Authentication:** Secure cookie on web, `expo-secure-store` on mobile.
- **Password Protection:** Passwords are never returned in plain text. Passwords can be unmasked on the edit screen via eye-toggle and reset securely via the dedicated "Reset Password" feature.
- **Audit Logging:** Every customer create, update, delete, and password reset is logged with timestamp, admin ID, and client IP.
- **Exporting:** Full Excel (.xlsx) and CSV (.csv) exports available on the Web portal with column selections.
