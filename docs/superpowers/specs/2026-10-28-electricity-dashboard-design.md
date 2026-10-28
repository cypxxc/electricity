# Electricity Cost Dashboard & Management System Design

**Date:** 2026-10-28  
**System:** Electricity Cost Dashboard and Admin Management System (สรุปค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7)  
**Status:** Approved

---

## 1. Executive Summary & Objective

The goal is to develop a responsive, minimal enterprise-style web application for tracking, analyzing, and managing electricity utility bills for "สำนักงานเขตสุขภาพที่ 7" spanning from B.E. 2562 (2019) onwards. The system provides:
- A high-density executive analytics dashboard with monthly trends and year-over-year comparisons.
- An administrative panel with secure role-based authentication, CRUD operations, duplicate validation, Excel batch import, and Excel/CSV export.
- Backed by a containerized PostgreSQL database using Docker Desktop and managed with Drizzle ORM.

---

## 2. Technical Stack

- **Runtime & Package Manager:** Bun 1.3.14
- **Frontend / Fullstack Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + minimal enterprise design system inspired by shadcn/ui
- **Charts:** Recharts
- **Database:** PostgreSQL 17 (running via Docker with persistent volume)
- **ORM & Migrations:** Drizzle ORM + Drizzle Kit
- **Validation:** Zod
- **Spreadsheet Processing:** XLSX (SheetJS)
- **Authentication:** Stateless encrypted JWT sessions (via `jose`) with secure HTTP-only cookies

---

## 3. Database Schema Design (PostgreSQL + Drizzle)

### 3.1 Tables

#### `electricity_records`
Stores monthly electricity expenditures:
- `id`: `serial` primary key
- `year_be`: `integer` not null (e.g., 2567)
- `year_ce`: `integer` not null (e.g., 2024, derived as `year_be - 543`)
- `month`: `integer` not null (1 to 12)
- `amount`: `numeric(12, 2)` not null (electricity cost in THB)
- `note`: `text` (optional description or import provenance)
- `created_at`: `timestamp with time zone` default `now()`
- `updated_at`: `timestamp with time zone` default `now()`

**Constraints & Indexes:**
- Unique compound index on `(year_be, month)` to prevent duplicate monthly entries.
- Index on `(year_be)` and `(year_ce)` for fast filtering and grouping.

#### `users`
Stores administrative user accounts:
- `id`: `serial` primary key
- `username`: `varchar(50)` unique not null
- `password_hash`: `text` not null
- `role`: `varchar(20)` default `'admin'` not null
- `created_at`: `timestamp with time zone` default `now()`

---

## 4. Architecture & Component Structure

```
my-bun-app/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx               # Analytics Dashboard
│   │   └── layout.tsx             # Shared Navigation & Sidebar
│   ├── admin/
│   │   ├── page.tsx               # Admin CRUD Table & Management
│   │   └── layout.tsx             # Admin Protected Shell
│   ├── api/
│   │   ├── auth/                  # Login / Logout Server Actions / API
│   │   ├── export/                # Export Excel / CSV
│   │   └── records/               # REST / Action endpoints for data operations
│   └── globals.css
├── components/
│   ├── ui/                        # Button, Input, Table, Dialog, Badge, Select
│   ├── dashboard/
│   │   ├── metric-cards.tsx       # Summary KPI statistics
│   │   ├── monthly-trend-chart.tsx# Recharts Area/Line chart
│   │   ├── yearly-bar-chart.tsx   # Recharts Bar chart for YoY
│   │   └── records-table.tsx      # Breakdown table
│   └── admin/
│       ├── record-modal.tsx       # Add / Edit Dialog
│       ├── delete-confirm.tsx     # Confirmation dialog
│       └── import-modal.tsx       # Excel upload preview & conflict resolution
├── lib/
│   ├── db/
│   │   ├── index.ts               # Drizzle database client instance
│   │   └── schema.ts              # PostgreSQL schema definitions
│   ├── auth/
│   │   └── session.ts             # JWT token sign & verify, cookie handlers
│   ├── validations/
│   │   └── record.ts              # Zod schemas for forms and excel rows
│   └── services/
│       ├── records.ts             # DB operations & analytics queries
│       └── excel.ts               # XLSX parser and generator
├── docker-compose.yml             # Postgres service definition
├── drizzle.config.ts
└── scripts/
    └── seed.ts                    # Reads 'สรุปค่าไฟฟ้า 62-69.xlsx' and seeds DB
```

---

## 5. Key Features & Business Rules

1. **Dashboard Analytics:**
   - Total Historical Spending.
   - Current / Latest Year Total and Average Monthly Cost.
   - YoY Percentage Change.
   - Interactive Year filter and Month-by-Month comparison charts.
2. **Deduplication & Conflict Detection:**
   - Every creation or edit checks if `(year_be, month)` already exists.
   - Excel Import parses the sheet, displays a preview table highlighting conflicting records, and gives the user choices: Skip duplicates, Overwrite existing, or Cancel.
3. **Data Export:**
   - Download complete or filtered dataset as formatted `.xlsx` or `.csv`.
4. **Security & Role-based Access:**
   - Public view for Dashboard (configurable), Admin required for CRUD, Import, and Export.
   - Passwords hashed using Bun's native password hashing (`Bun.password`).
   - Database credentials isolated in `.env.local`.

---

## 6. Implementation Stages

1. **Infrastructure & Setup:** Docker PostgreSQL container, environment configuration, Drizzle ORM setup, schema migration.
2. **Data Ingestion:** Seed script executing against `สรุปค่าไฟฟ้า 62-69.xlsx`.
3. **Core Services & API:** Zod validation, record services, auth services.
4. **UI Design & Dashboard:** Responsive layout, metric cards, Recharts visualizations, dark/light minimal enterprise UI.
5. **Admin Management & Excel Import/Export:** Interactive data table, CRUD modals, file parsing & validation preview, export endpoints.
6. **Verification & Testing:** Full operational verification on Desktop, Tablet, and Mobile viewport sizes.
