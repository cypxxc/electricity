# Electricity Cost Dashboard & Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, minimal enterprise web application for visualizing and managing electricity utility bills (ค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7) with PostgreSQL, Drizzle ORM, Docker Desktop, Next.js 16 (App Router), Recharts, and Admin authentication.

**Architecture:** Next.js 16 App Router with clean separation of layers: `lib/db` for Drizzle schema and connection pool, `lib/validations` for Zod schemas, `lib/services` for business logic (KPIs, aggregations, deduplication, Excel parsing), `lib/auth` for secure JWT-based sessions, and React Server/Client Components for a data-dense Minimal Enterprise UI.

**Tech Stack:** Bun, Next.js 16 (App Router), React 19, Tailwind CSS v4, PostgreSQL 17, Drizzle ORM, Drizzle Kit, Docker, Recharts, Lucide React, XLSX (SheetJS), Zod, Jose.

## Global Constraints
- Database credentials must only be stored in `.env.local` and never exposed to the client.
- Must run PostgreSQL via Docker Compose on port 5432 with volume `pgdata`.
- Deduplication must be strictly enforced at both schema (`UNIQUE(year_be, month)`) and service layers.
- No mock data once database is seeded with `สรุปค่าไฟฟ้า 62-69.xlsx`.
- Responsive layout supporting Desktop, Tablet, and Mobile.
- Follow Next.js 16 async conventions: `await cookies()`, `await params`, `await searchParams`.

---

### Task 1: Docker PostgreSQL & Drizzle Database Setup

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env.local`
- Create: `drizzle.config.ts`
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `db` client from `lib/db/index.ts`, `electricityRecords` and `users` tables from `lib/db/schema.ts`.

- [ ] **Step 1: Install core database and utility dependencies**

Run: `bun add drizzle-orm pg zod xlsx recharts lucide-react jose`  
Run: `bun add -d drizzle-kit @types/pg`

- [ ] **Step 2: Create `docker-compose.yml` with persistent volume**

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: electricity_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: electricity_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 3: Create `.env.local` and `.env.example`**

```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/electricity_db
JWT_SECRET=super-secret-jwt-key-min-32-chars-long-12345
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword123
```

- [ ] **Step 4: Define Drizzle schema in `lib/db/schema.ts`**

```typescript
import { pgTable, serial, integer, numeric, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const electricityRecords = pgTable('electricity_records', {
  id: serial('id').primaryKey(),
  yearBe: integer('year_be').notNull(),
  yearCe: integer('year_ce').notNull(),
  month: integer('month').notNull(), // 1 - 12
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('year_be_month_unique_idx').on(table.yearBe, table.month),
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('admin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ElectricityRecord = typeof electricityRecords.$inferSelect;
export type NewElectricityRecord = typeof electricityRecords.$inferInsert;
export type User = typeof users.$inferSelect;
```

- [ ] **Step 5: Define Drizzle connection and drizzle.config.ts**

Create `lib/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/electricity_db',
});

export const db = drizzle(pool, { schema });
```

Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/electricity_db',
  },
});
```

- [ ] **Step 6: Start Docker container and push migration**

Run: `docker compose up -d`  
Run: `bun run drizzle-kit push`  
Expected: "All changes applied to database"

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml drizzle.config.ts lib/db/ .env.example package.json bun.lock
git commit -m "feat(db): setup PostgreSQL docker container and Drizzle schema"
```

---

### Task 2: Data Validation & Excel Seed Script

**Files:**
- Create: `lib/validations/record.ts`
- Create: `scripts/seed.ts`
- Modify: `package.json` (add seed script)

**Interfaces:**
- Consumes: `db`, `electricityRecords`, `users` from `lib/db`
- Produces: `recordSchema`, `monthNames`, `parseExcelBuffer` from `lib/validations/record.ts`

- [ ] **Step 1: Create Validation Schemas in `lib/validations/record.ts`**

```typescript
import { z } from 'zod';

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
] as const;

export const recordInputSchema = z.object({
  yearBe: z.number().int().min(2500).max(2650),
  month: z.number().int().min(1).max(12),
  amount: z.number().positive('ยอดค่าไฟฟ้าต้องมากกว่า 0'),
  note: z.string().optional(),
});

export type RecordInput = z.infer<typeof recordInputSchema>;
```

- [ ] **Step 2: Create Seed Script in `scripts/seed.ts`**

Write a script that reads `D:\voltage\my-bun-app\สรุปค่าไฟฟ้า 62-69.xlsx`, parses the 2D matrix, normalizes rows into `(year_be, year_ce, month, amount, note)`, inserts records using Drizzle with `onConflictDoNothing()`, and inserts initial admin user (`admin` / `adminpassword123`) hashed with `Bun.password.hash`.

- [ ] **Step 3: Execute Seed Script**

Run: `bun run scripts/seed.ts`  
Expected: Prints inserted record count (84 records inserted from Excel) and created admin user.

- [ ] **Step 4: Verify Database Data with a Quick Query Script**

Run a one-liner: `bun -e "import { db } from './lib/db'; import { electricityRecords } from './lib/db/schema'; db.select().from(electricityRecords).then(r => console.log('Total records:', r.length));"`  
Expected: `Total records: 84`

- [ ] **Step 5: Commit**

```bash
git add lib/validations/record.ts scripts/seed.ts package.json
git commit -m "feat(data): add validations and excel seed script"
```

---

### Task 3: Authentication & Protected Session Service

**Files:**
- Create: `lib/auth/session.ts`
- Create: `lib/auth/actions.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `middleware.ts`

**Interfaces:**
- Produces: `createSessionToken`, `verifySessionToken`, `getSession`, `loginAction`, `logoutAction`.

- [ ] **Step 1: Implement JWT Session handlers in `lib/auth/session.ts`**

Use `jose` to sign HS256 JWT tokens containing `userId`, `username`, `role`. Provide `setSessionCookie()`, `clearSessionCookie()`, `verifyToken()`.

- [ ] **Step 2: Implement Server Actions in `lib/auth/actions.ts`**

`loginAction(formData)`: Verifies username and password with `Bun.password.verify`, sets cookie, and redirects to `/admin`.  
`logoutAction()`: Clears cookie and redirects to `/login`.

- [ ] **Step 3: Create Login Page in `app/(auth)/login/page.tsx`**

Minimal Enterprise style login form with error feedback, username & password inputs, and clean styling.

- [ ] **Step 4: Add Middleware in `middleware.ts`**

Protects `/admin` and `/api/admin/*` paths. If session token is missing or invalid, redirects to `/login`.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/ app/(auth)/ middleware.ts
git commit -m "feat(auth): implement JWT session auth and admin route protection"
```

---

### Task 4: Analytics Services & Reusable Data Access

**Files:**
- Create: `lib/services/analytics.ts`
- Create: `lib/services/records.ts`

**Interfaces:**
- Produces:
  - `getDashboardKPIs()`: Returns total cost, current year cost, previous year cost, YoY percentage change, average monthly cost.
  - `getMonthlyTrendData()`: Returns monthly amounts grouped chronologically.
  - `getYearlyComparisonData()`: Returns total and average grouped by year BE/CE.
  - `getYearMonthlyMatrix()`: Returns matrix formatted for comparison table.
  - `getAllRecords(filters)`: Returns records with search and pagination for Admin.

- [ ] **Step 1: Implement `lib/services/analytics.ts`**

Calculate aggregate KPIs, monthly trends, and yearly summaries directly using SQL/Drizzle aggregations.

- [ ] **Step 2: Implement `lib/services/records.ts`**

CRUD operations: `createRecord()`, `updateRecord()`, `deleteRecord()`, `checkDuplicateRecord()`, `exportRecordsToWorkbook()`.

- [ ] **Step 3: Write a test/verification script in `scripts/verify-services.ts`**

Run: `bun run scripts/verify-services.ts`  
Expected: Validates KPI calculations match raw Excel numbers (e.g. Total sum, year counts).

- [ ] **Step 4: Commit**

```bash
git add lib/services/ scripts/verify-services.ts
git commit -m "feat(services): implement analytics aggregations and records service"
```

---

### Task 5: Minimal Enterprise Dashboard UI

**Files:**
- Create: `components/navbar.tsx`
- Create: `components/dashboard/kpi-cards.tsx`
- Create: `components/dashboard/monthly-trend-chart.tsx`
- Create: `components/dashboard/yearly-comparison-chart.tsx`
- Create: `components/dashboard/data-matrix-table.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `getDashboardKPIs()`, `getMonthlyTrendData()`, `getYearlyComparisonData()`, `getYearMonthlyMatrix()` from `lib/services/analytics.ts`

- [ ] **Step 1: Configure Theme & Typography in `app/globals.css`**

Define enterprise color palette (neutral grays, crisp slate border lines, subtle primary blue accent `#1e40af` / `#2563eb`, monospaced number formatting `tabular-nums`).

- [ ] **Step 2: Build Navigation Bar in `components/navbar.tsx`**

Header showing: Organization name "สำนักงานเขตสุขภาพที่ 7 - ระบบติดตามค่าไฟฟ้า", Navigation links (แดชบอร์ด, จัดการข้อมูล Admin), current user status, responsive mobile hamburger menu.

- [ ] **Step 3: Build KPI Cards in `components/dashboard/kpi-cards.tsx`**

4 concise cards:
1. ค่าไฟฟ้ารวมทั้งหมด (Total Cost)
2. ค่าไฟฟ้ารวมปีล่าสุด (Latest Year Total)
3. ค่าเฉลี่ยต่อเดือน (Monthly Average)
4. อัตราการเปลี่ยนแปลงเทียบปีที่แล้ว (YoY Growth Rate % with trend arrow)

- [ ] **Step 4: Build Recharts Visualizations**

1. `monthly-trend-chart.tsx`: Area/Line Chart displaying cost trends across months and years with tooltip showing formatted Thai Baht.
2. `yearly-comparison-chart.tsx`: Bar Chart comparing total expenditure per Buddhist year with average reference line.

- [ ] **Step 5: Build Summary Matrix Table in `components/dashboard/data-matrix-table.tsx`**

Interactive 2D table matching the Excel format (Year as rows, Months as columns, Total as rightmost column) with cell highlights for min/max values and filter by year range.

- [ ] **Step 6: Assemble Dashboard in `app/page.tsx`**

Render KPI cards, charts in a 2-column responsive grid, and the matrix table.

- [ ] **Step 7: Test Dashboard rendering and responsive behavior**

Run: `bun run dev` and test responsiveness on desktop (1440px), tablet (768px), and mobile (375px).

- [ ] **Step 8: Commit**

```bash
git add components/ app/page.tsx app/globals.css
git commit -m "feat(ui): implement enterprise analytics dashboard and charts"
```

---

### Task 6: Admin Panel CRUD, Deduplication & Actions

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/actions.ts`
- Create: `components/admin/record-modal.tsx`
- Create: `components/admin/delete-dialog.tsx`
- Create: `components/admin/records-table.tsx`

**Interfaces:**
- Consumes: `records.ts`, `recordSchema`, `session.ts`
- Produces: Server actions `createRecordAction`, `updateRecordAction`, `deleteRecordAction`

- [ ] **Step 1: Implement Server Actions in `app/admin/actions.ts`**

- Verify admin session.
- Validate input with Zod.
- Check duplicate `(yearBe, month)` before insert/update. Return friendly error message if duplicate exists.
- Perform Drizzle insert / update / delete.
- Call `revalidatePath('/')` and `revalidatePath('/admin')`.

- [ ] **Step 2: Build Admin Records Table in `components/admin/records-table.tsx`**

- Search filter by year and month.
- Sortable columns (ปี พ.ศ., เดือน, ยอดค่าไฟฟ้า, หมายเหตุ, วันที่แก้ไข).
- Action buttons: "แก้ไข (Edit)", "ลบ (Delete)".
- Pagination controls.

- [ ] **Step 3: Build Record Modal (Add/Edit) in `components/admin/record-modal.tsx`**

- Form with inputs: Year BE, Month dropdown (ม.ค. - ธ.ค.), Amount (THB), Note.
- Real-time client and server validation errors.
- Duplicate warning prevention.

- [ ] **Step 4: Build Delete Confirmation Dialog in `components/admin/delete-dialog.tsx`**

Modal asking user to confirm before permanently deleting a record.

- [ ] **Step 5: Assemble Admin Page in `app/admin/page.tsx`**

Admin header with statistics, "เพิ่มข้อมูลใหม่" button, "นำเข้า Excel" button, "ส่งออกข้อมูล" button, and the records table.

- [ ] **Step 6: Commit**

```bash
git add app/admin/ components/admin/
git commit -m "feat(admin): implement admin CRUD operations and deduplication"
```

---

### Task 7: Excel Import (with Conflict Preview) & Export (Excel/CSV)

**Files:**
- Create: `lib/services/excel.ts`
- Create: `app/api/export/route.ts`
- Create: `app/api/import/route.ts`
- Create: `components/admin/import-modal.tsx`
- Create: `components/admin/export-dropdown.tsx`

**Interfaces:**
- Consumes: `electricityRecords`, `db`
- Produces: Import API, Export API, Import modal with duplicate conflict resolution

- [ ] **Step 1: Implement Excel & CSV Parser/Generator in `lib/services/excel.ts`**

- Parse uploaded `.xlsx` files supporting both matrix layout (like `สรุปค่าไฟฟ้า 62-69.xlsx`) and tabular list layout `(year, month, amount)`.
- Compare parsed rows with current database records to flag: `NEW`, `DUPLICATE / CONFLICT`, or `IDENTICAL`.
- Generate formatted Excel workbook with Thai column headers and auto-column widths.
- Generate standard CSV with UTF-8 BOM for Thai character compatibility in Excel.

- [ ] **Step 2: Implement Import and Export API Routes**

- `POST /api/import`: Accepts file and strategy (`skip_duplicates`, `overwrite`).
- `GET /api/export?format=xlsx|csv`: Downloads the file with proper headers.

- [ ] **Step 3: Build Import Modal in `components/admin/import-modal.tsx`**

- Drag-and-drop file upload.
- Preview table showing found records, highlighting detected duplicates in yellow/red badges.
- Import options: "ข้ามรายการที่ซ้ำ" (Skip duplicates) or "เขียนทับรายการเดิม" (Overwrite).
- Summary report after import (X inserted, Y updated/skipped).

- [ ] **Step 4: Build Export Dropdown in `components/admin/export-dropdown.tsx`**

Options to download as `.xlsx` (Excel) or `.csv` (CSV with UTF-8 BOM).

- [ ] **Step 5: Commit**

```bash
git add lib/services/excel.ts app/api/ components/admin/import-modal.tsx components/admin/export-dropdown.tsx
git commit -m "feat(import-export): add excel conflict resolution import and excel/csv export"
```

---

### Task 8: End-to-End Verification & Responsive Polish

**Files:**
- Test scripts & browser verification
- Refinements to UI components for mobile and tablet

- [ ] **Step 1: Run Full TypeScript and Build Validation**

Run: `bun run build`  
Expected: Exit code 0, no TypeScript or Lint errors.

- [ ] **Step 2: Test End-to-End User Flow via Verification Script**

Verify:
1. Docker container is healthy.
2. 84 seeded records are queryable.
3. Login works and returns valid session token.
4. Adding duplicate `(2567, 1)` fails validation with duplicate error.
5. Export API returns valid `.xlsx` and `.csv` buffers.
6. Admin CRUD operations function correctly.

- [ ] **Step 3: Responsive Viewport Checks**

Verify layout on Mobile (375px), Tablet (768px), and Desktop (1280px+).

- [ ] **Step 4: Final Commit & Summary**

```bash
git add .
git commit -m "feat: complete electricity dashboard system"
```
