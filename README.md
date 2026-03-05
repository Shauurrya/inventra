# Inventra — Smart Inventory for Smart Manufacturers 🏭

**Inventra** is a modern, cloud-based inventory management SaaS built specifically for Indian manufacturing MSMEs. It automates raw material tracking, production deductions via Bill of Materials (BOM), sales management, and low-stock alerts.

Built by **Inventor Solutions Pvt. Ltd.** 🇮🇳

![Inventra Dashboard](https://img.shields.io/badge/status-production%20ready-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)

## ✨ Key Features

| Feature | Description |
|---------|------------|
| 📦 **Raw Material Management** | Track all raw materials with stock levels, units, and costs |
| 🏭 **Finished Product Management** | Manage products with SKU, pricing, and stock |
| 📐 **Bill of Materials (BOM)** | Define material requirements per product |
| ⚡ **Automatic Deduction** | Production auto-deducts materials based on BOM |
| 🔔 **Low Stock Alerts** | Instant alerts when materials drop below minimum |
| 💰 **Sales Tracking** | Record sales with customer info and revenue tracking |
| 🛒 **Purchase Recording** | Log material purchases with supplier details |
| 📊 **Reports & Analytics** | Inventory, production, consumption, and sales reports |
| 📥 **CSV Export** | Export any report to CSV |
| 🔐 **Multi-user Auth** | Role-based access (Admin/Staff) with NextAuth.js |
| 📱 **Responsive Design** | Works seamlessly on desktop, tablet, and mobile |
| 🌐 **Cloud-based** | Access from anywhere, data safely in the cloud |

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js
- **Data Fetching:** TanStack React Query
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Deployment:** Vercel

## 📁 Project Structure

```
inventra/
├── prisma/
│   ├── schema.prisma          # Database schema (9 models)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # Login page
│   │   │   └── register/page.tsx  # Company registration
│   │   ├── api/                   # 15+ API routes
│   │   │   ├── auth/              # Auth endpoints
│   │   │   ├── dashboard/         # Dashboard summary
│   │   │   ├── raw-materials/     # CRUD for materials
│   │   │   ├── finished-products/ # CRUD for products
│   │   │   ├── bom/               # BOM management
│   │   │   ├── production/        # Production recording
│   │   │   ├── sales/             # Sales recording
│   │   │   ├── purchases/         # Purchase recording
│   │   │   ├── alerts/            # Low stock alerts
│   │   │   ├── stock-adjustments/ # Manual adjustments
│   │   │   ├── reports/           # 4 report endpoints
│   │   │   ├── company/           # Company settings
│   │   │   └── users/             # User invite & management
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Dashboard with sidebar
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   ├── raw-materials/     # Materials page
│   │   │   ├── products/          # Products + detail + BOM
│   │   │   ├── production/        # Production page
│   │   │   ├── sales/             # Sales page
│   │   │   ├── inventory/         # Inventory overview
│   │   │   ├── reports/           # Reports & analytics
│   │   │   ├── alerts/            # Alert management
│   │   │   └── settings/          # Company/team/security
│   │   ├── page.tsx               # Public landing page
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   ├── error.tsx              # Error boundary
│   │   ├── loading.tsx            # Loading state
│   │   └── not-found.tsx          # 404 page
│   ├── components/
│   │   ├── providers.tsx          # Session + Query providers
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── utils.ts               # Utility functions
│   ├── types/
│   │   └── next-auth.d.ts         # Type augmentation
│   └── middleware.ts              # Route protection
├── .env.example                   # Environment template
├── .env.local                     # Local environment vars
├── next.config.mjs                # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14+ (local or hosted, e.g. Supabase, Neon)
- **npm** or **pnpm**

### 1. Install Dependencies

```bash
cd inventra
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventra"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Login
- **Email:** admin@demo.com
- **Password:** Demo@1234

## 🌐 Deployment on Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/inventra.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set the following environment variables in Vercel:
   - `DATABASE_URL` — Your PostgreSQL connection string (Neon/Supabase recommended)
   - `NEXTAUTH_SECRET` — A secure random string
   - `NEXTAUTH_URL` — Your deployed URL (e.g. `https://inventra.vercel.app`)
3. Deploy! 🎉

### 3. Run Migrations on Production

```bash
npx prisma db push
npx prisma db seed
```

## 📊 Database Schema

The database consists of **10 models**:

| Model | Purpose |
|-------|---------|
| `Company` | Multi-tenant company data |
| `User` | User accounts with roles |
| `RawMaterial` | Raw material inventory |
| `FinishedProduct` | Finished goods |
| `BillOfMaterials` | Material requirements per product |
| `ProductionEntry` | Production run records |
| `SalesEntry` | Sales transactions |
| `StockMovement` | Audit trail for all stock changes |
| `RawMaterialPurchase` | Purchase records |
| `LowStockAlert` | Triggered alerts |

## 🔄 Core Business Logic

### Production Flow
1. User selects a finished product and quantity
2. System checks BOM for material requirements
3. Live availability check shows SUFFICIENT/LOW/INSUFFICIENT
4. On confirmation:
   - Raw materials are **automatically deducted** per BOM
   - Finished product stock is **incremented**
   - **Stock movements** are recorded for audit
   - **Low stock alerts** are triggered if any material falls below minimum

### Sales Flow
1. User selects a product and quantity
2. System validates sufficient stock
3. On confirmation:
   - Finished product stock is **decremented**
   - Revenue is calculated and recorded
   - Stock movement is logged

## 📄 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Company registration |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| PUT | `/api/auth/change-password` | Change password |
| GET | `/api/dashboard/summary` | Dashboard KPIs |
| GET/POST | `/api/raw-materials` | List/Create materials |
| PUT/DELETE | `/api/raw-materials/[id]` | Update/Delete material |
| GET/POST | `/api/finished-products` | List/Create products |
| GET/PUT/DELETE | `/api/finished-products/[id]` | Product CRUD |
| POST | `/api/bom` | Create/Update BOM line |
| GET/DELETE | `/api/bom/[finishedProductId]` | Get/Delete BOM |
| GET/POST | `/api/production` | List/Record production |
| GET/POST | `/api/sales` | List/Record sales |
| GET/POST | `/api/purchases` | List/Record purchases |
| GET | `/api/alerts` | List alerts |
| PUT | `/api/alerts/[id]/read` | Mark alert read |
| POST | `/api/stock-adjustments` | Manual stock adjustment |
| PUT | `/api/company` | Update company |
| POST | `/api/users/invite` | Invite team member |
| PUT/DELETE | `/api/users/[id]/role` | Update/Remove user |
| GET | `/api/reports/inventory` | Inventory report |
| GET | `/api/reports/consumption` | Consumption report |
| GET | `/api/reports/production` | Production report |
| GET | `/api/reports/sales` | Sales report |

## 🎨 Design System

- **Primary Color:** `#0F172A` (slate-900)
- **Accent Color:** `#F97316` (orange-500) 
- **Font:** Inter (Google Fonts)
- **Glass Morphism:** Backdrop blur effects on navbar
- **Animations:** Fade-in, slide, pulse effects

## 📜 License

© 2025 Inventor Solutions Pvt. Ltd. All rights reserved.

---

Made with ❤️ in India 🇮🇳
