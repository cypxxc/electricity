# Admin Panel Enterprise Standards & UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Admin Panel to international enterprise standards (WCAG AA 2.1 compliance, Nielsen Norman Group B2B data grid usability) by implementing interactive table sorting, real-time currency formatting feedback, an accessible toast notification system, and ARIA screen-reader enhancements.

**Architecture:** Extend existing administrative components modularly:
1. State-driven sorting in `records-table.tsx` with semantic icons and `aria-sort` in `records-table-view.tsx`.
2. Live currency preview helper in `record-modal.tsx` to prevent entry scale errors.
3. Lightweight zero-dependency feedback toast (`admin-toast.tsx`) triggered on create, edit, delete, and bulk import.
4. Comprehensive ARIA labels and keyboard ergonomics across all interactive row actions.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 (`@theme inline` tokens), Lucide React, Bun Test Runner.

## Global Constraints

- **Theme Compliance**: Always use semantic brand tokens (`bg-brand-navy`, `text-brand-navy`, `ring-brand-navy`, etc.) defined in `lib/constants/theme.ts` and `app/globals.css`. Never use raw hex values (`#0f2744`).
- **Accessibility**: Follow WCAG AA 2.1 standards. All icon-only buttons must have descriptive, dynamic `aria-label` attributes. Table headers must have proper `scope="col"` and `aria-sort`.
- **Zero Regression**: Maintain 100% existing functionality (Thai fiscal year computation, year completeness detection, pagination, filtering, Excel import/export).
- **Quality Gates**: Every step must pass `bun test`, `bun run lint`, and `bun run build` cleanly.

---

### Task 1: Sortable Columns for Data Grid

**Files:**
- Modify: `components/admin/records/records-types.ts`
- Modify: `components/admin/records/records-table-view.tsx`
- Modify: `components/admin/records-table.tsx`
- Test: `tests/admin-sorting.test.ts`

**Interfaces:**
- Consumes: `ElectricityRecord` from `@/lib/db/schema`
- Produces: `SortField` (`'period' | 'amount' | 'updatedAt'`), `SortOrder` (`'asc' | 'desc'`), `onSort: (field: SortField) => void`

- [ ] **Step 1: Write unit tests for data grid sorting logic**

Create `tests/admin-sorting.test.ts` testing sorting by period (year/month combined), by amount (numeric), and by update date (chronological):

```typescript
import { describe, it, expect } from 'bun:test';

type TestRecord = {
  id: number;
  yearBe: number;
  month: number;
  amount: string;
  updatedAt: Date;
};

function sortRecords(
  records: TestRecord[],
  field: 'period' | 'amount' | 'updatedAt',
  order: 'asc' | 'desc'
): TestRecord[] {
  return [...records].sort((a, b) => {
    let comparison = 0;
    if (field === 'period') {
      const periodA = a.yearBe * 100 + a.month;
      const periodB = b.yearBe * 100 + b.month;
      comparison = periodA - periodB;
    } else if (field === 'amount') {
      comparison = parseFloat(a.amount) - parseFloat(b.amount);
    } else if (field === 'updatedAt') {
      comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
    }
    return order === 'asc' ? comparison : -comparison;
  });
}

describe('Admin Data Grid Sorting', () => {
  const sampleRecords: TestRecord[] = [
    { id: 1, yearBe: 2568, month: 1, amount: '45000.00', updatedAt: new Date('2026-01-10') },
    { id: 2, yearBe: 2567, month: 12, amount: '32000.50', updatedAt: new Date('2026-02-15') },
    { id: 3, yearBe: 2568, month: 4, amount: '68000.00', updatedAt: new Date('2026-03-01') },
  ];

  it('sorts by amount descending (highest first)', () => {
    const sorted = sortRecords(sampleRecords, 'amount', 'desc');
    expect(sorted[0].id).toBe(3);
    expect(sorted[2].id).toBe(2);
  });

  it('sorts by amount ascending (lowest first)', () => {
    const sorted = sortRecords(sampleRecords, 'amount', 'asc');
    expect(sorted[0].id).toBe(2);
    expect(sorted[2].id).toBe(3);
  });

  it('sorts by period chronologically ascending', () => {
    const sorted = sortRecords(sampleRecords, 'period', 'asc');
    expect(sorted[0].yearBe).toBe(2567);
    expect(sorted[2].month).toBe(4);
  });

  it('sorts by period chronologically descending', () => {
    const sorted = sortRecords(sampleRecords, 'period', 'desc');
    expect(sorted[0].month).toBe(4);
    expect(sorted[2].yearBe).toBe(2567);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test tests/admin-sorting.test.ts`
Expected: 4 pass.

- [ ] **Step 3: Update `records-types.ts` with Sort types**

Add `SortField` and `SortOrder` definitions to `components/admin/records/records-types.ts`:
```typescript
export type SortField = 'period' | 'amount' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
```

- [ ] **Step 4: Update `records-table-view.tsx` with sortable headers**

Add sort header buttons with `ArrowUpDown`, `ArrowUp`, `ArrowDown` icons, `aria-sort`, and tooltip hints.

- [ ] **Step 5: Wire sorting state into `records-table.tsx`**

Implement `sortField` and `sortOrder` state in `records-table.tsx`, sort `filteredRecords` before slicing `paginatedRecords`.

- [ ] **Step 6: Run verification**

Run: `bun test` and `bun run lint`

---

### Task 2: Live Currency Preview & Input Usability in RecordModal

**Files:**
- Modify: `components/admin/record-modal.tsx`
- Test: `tests/admin-modal-formatting.test.ts`

**Interfaces:**
- Input: `amount: string | number`
- Output: Dynamic Thai Baht formatted string with comma separators (`฿124,500.50 บาท`) and scale warning if abnormally high (> ฿500,000) or negative.

- [ ] **Step 1: Write unit test for currency formatter helper**

Create `tests/admin-modal-formatting.test.ts`:
```typescript
import { describe, it, expect } from 'bun:test';

function formatCurrencyPreview(amountStr: string): { formatted: string; isValid: boolean; warning?: string } {
  if (!amountStr || amountStr.trim() === '') {
    return { formatted: '', isValid: false };
  }
  const val = parseFloat(amountStr);
  if (isNaN(val)) {
    return { formatted: 'ตัวเลขไม่ถูกต้อง', isValid: false, warning: 'กรุณากรอกเฉพาะตัวเลข' };
  }
  if (val < 0) {
    return { formatted: 'ไม่สามารถติดลบได้', isValid: false, warning: 'ยอดค่าไฟฟ้าต้องเป็นค่าบวก' };
  }
  const formatted = `฿${val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
  let warning: string | undefined;
  if (val > 1_000_000) {
    warning = 'คำเตือน: ยอดเงินสูงกว่า 1 ล้านบาท กรุณาตรวจสอบความถูกต้อง';
  }
  return { formatted, isValid: true, warning };
}

describe('Currency Input Preview Formatter', () => {
  it('formats standard valid currency with commas', () => {
    const res = formatCurrencyPreview('45200.75');
    expect(res.isValid).toBe(true);
    expect(res.formatted).toBe('฿45,200.75 บาท');
    expect(res.warning).toBeUndefined();
  });

  it('detects negative numbers', () => {
    const res = formatCurrencyPreview('-500');
    expect(res.isValid).toBe(false);
    expect(res.warning).toContain('ยอดค่าไฟฟ้าต้องเป็นค่าบวก');
  });

  it('warns on abnormally high amounts', () => {
    const res = formatCurrencyPreview('1500000');
    expect(res.isValid).toBe(true);
    expect(res.warning).toContain('สูงกว่า 1 ล้านบาท');
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `bun test tests/admin-modal-formatting.test.ts`
Expected: 3 pass.

- [ ] **Step 3: Implement Live Preview in `record-modal.tsx`**

Integrate amount state (`inputAmount`) in `record-modal.tsx` with live preview pill rendering Thai Baht formatted amount and soft validation warning.

- [ ] **Step 4: Verify modal interaction**

Run: `bun test` and `bun run lint`

---

### Task 3: Action Feedback Toast System

**Files:**
- Create: `components/admin/admin-toast.tsx`
- Modify: `components/admin/records-table.tsx`
- Modify: `components/admin/admin-header.tsx`
- Test: `tests/admin-toast.test.ts`

**Interfaces:**
- Produces: `ToastMessage = { id: string; type: 'success' | 'error' | 'info'; title: string; description?: string }`
- Component: `<AdminToast toast={toast} onDismiss={dismiss} />`

- [ ] **Step 1: Write test for Toast data structures**

Create `tests/admin-toast.test.ts` to test toast generation, type safety, and timing.

- [ ] **Step 2: Implement `components/admin/admin-toast.tsx`**

Create accessible floating toast container with slide-in animation, WCAG contrast, success/error styling, and dismiss action.

- [ ] **Step 3: Connect Toast triggers in `records-table.tsx` and `admin-header.tsx`**

Wire success callbacks on:
- Create record -> Toast: `"บันทึกข้อมูลสำเร็จ"` (รายละเอียดงวดเดือน)
- Update record -> Toast: `"แก้ไขข้อมูลสำเร็จ"` (รายละเอียดงวดเดือน)
- Delete record -> Toast: `"ลบข้อมูลเรียบร้อยแล้ว"`
- Excel import -> Toast: `"นำเข้าข้อมูล Excel สำเร็จ"` (แสดงจำนวนรายการที่นำเข้า)

- [ ] **Step 4: Run verification**

Run: `bun test` and `bun run lint`

---

### Task 4: WCAG AA Accessibility & Screen Reader Polish

**Files:**
- Modify: `components/admin/records/records-table-view.tsx`
- Modify: `components/admin/records/records-filter-toolbar.tsx`
- Modify: `components/admin/records/records-year-pills.tsx`

**Interfaces:**
- Adds explicit `aria-label`, `scope="col"`, and high-visibility focus rings (`focus-visible:ring-2 focus-visible:ring-brand-navy`).

- [ ] **Step 1: Audit and inject dynamic `aria-label`s**

Update table row action buttons:
```tsx
<button
  onClick={() => onOpenEdit(r)}
  aria-label={`แก้ไขข้อมูลค่าไฟเดือน ${monthName} พ.ศ. ${r.yearBe}`}
  title="แก้ไขข้อมูล"
  className="..."
>
```
Update delete button:
```tsx
<button
  onClick={() => onOpenDelete(r)}
  aria-label={`ลบข้อมูลค่าไฟเดือน ${monthName} พ.ศ. ${r.yearBe}`}
  title="ลบข้อมูล"
  className="..."
>
```

- [ ] **Step 2: Verify WCAG AA compliance across table headers and filters**

Ensure `scope="col"` on `th` tags, `aria-label` on month filter select and search bar.

- [ ] **Step 3: Run full verification build**

Run: `bun test`, `bun run lint`, and `bun run build`.

---

### Task 5: Final Verification & Commit

- [ ] **Step 1: Run comprehensive test suite**
- [ ] **Step 2: Verify ESLint zero warnings/errors**
- [ ] **Step 3: Verify Next.js production build (`next build` exit 0)**
- [ ] **Step 4: Commit changes with semantic commit message**
