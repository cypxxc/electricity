/**
 * Client-safe pure mathematical and fiscal year utility functions.
 * Strictly adheres to the official Thai Fiscal Year regulation:
 * "ปีงบประมาณของประเทศไทยนับตั้งแต่วันที่ 1 ตุลาคมของปีปัจจุบัน ถึงวันที่ 30 กันยายนของปีถัดไป
 * โดยจะใช้ พ.ศ. ของปีถัดไป เป็นชื่อเรียกปีงบประมาณนั้น"
 */

// Thai Fiscal Year month sequence: 10 (ต.ค.), 11 (พ.ย.), 12 (ธ.ค.), 1 (ม.ค.), 2 (ก.พ.), 3 (มี.ค.), 4 (เม.ย.), 5 (พ.ค.), 6 (มิ.ย.), 7 (ก.ค.), 8 (ส.ค.), 9 (ก.ย.)
export const FISCAL_MONTH_ORDER = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const THAI_FISCAL_MONTHS = [
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
] as const;

/**
 * คำนวณปีงบประมาณไทย (Thai Fiscal Year):
 * - วันที่ 1 ต.ค. - 31 ธ.ค. ของปี พ.ศ. ปัจจุบัน -> จัดเป็นปีงบประมาณ พ.ศ. ถัดไป (yearBe + 1)
 * - วันที่ 1 ม.ค. - 30 ก.ย. ของปี พ.ศ. ถัดไป -> จัดเป็นปีงบประมาณ พ.ศ. นั้น (yearBe)
 */
export function getFiscalYear(yearBe: number, month: number): number {
  if (month >= 10 && month <= 12) {
    return yearBe + 1;
  }
  return yearBe;
}

/**
 * หาว่าเดือนที่ระบุอยู่ในไตรมาสใดของปีงบประมาณไทย (Q1 - Q4):
 * - ไตรมาส 1: ตุลาคม, พฤศจิกายน, ธันวาคม (เดือน 10-12)
 * - ไตรมาส 2: มกราคม, กุมภาพันธ์, มีนาคม (เดือน 1-3)
 * - ไตรมาส 3: เมษายน, พฤษภาคม, มิถุนายน (เดือน 4-6)
 * - ไตรมาส 4: กรกฎาคม, สิงหาคม, กันยายน (เดือน 7-9)
 */
export function getFiscalQuarter(month: number): {
  quarter: 1 | 2 | 3 | 4;
  label: string;
  shortLabel: string;
} {
  if (month >= 10 && month <= 12) {
    return { quarter: 1, label: 'ไตรมาสที่ 1 (ต.ค. - ธ.ค.)', shortLabel: 'Q1 (ต.ค.-ธ.ค.)' };
  }
  if (month >= 1 && month <= 3) {
    return { quarter: 2, label: 'ไตรมาสที่ 2 (ม.ค. - มี.ค.)', shortLabel: 'Q2 (ม.ค.-มี.ค.)' };
  }
  if (month >= 4 && month <= 6) {
    return { quarter: 3, label: 'ไตรมาสที่ 3 (เม.ย. - มิ.ย.)', shortLabel: 'Q3 (เม.ย.-มิ.ย.)' };
  }
  return { quarter: 4, label: 'ไตรมาสที่ 4 (ก.ค. - ก.ย.)', shortLabel: 'Q4 (ก.ค.-ก.ย.)' };
}

/**
 * ลำดับเดือนในรอบปีงบประมาณ (1 สำหรับ ต.ค. จนถึง 12 สำหรับ ก.ย.)
 */
export function getFiscalMonthOrder(month: number): number {
  const idx = FISCAL_MONTH_ORDER.indexOf(month as (typeof FISCAL_MONTH_ORDER)[number]);
  return idx >= 0 ? idx + 1 : month;
}

/**
 * แปลงปีงบประมาณเป็นช่วงวันที่ทางการ: "1 ต.ค. {fyBe - 1} – 30 ก.ย. {fyBe}"
 */
export function formatFiscalYearRange(fyBe: number): string {
  return `1 ต.ค. ${fyBe - 1} – 30 ก.ย. ${fyBe}`;
}

/**
 * รูปแบบป้ายชื่อปีงบประมาณแบบทางการ
 */
export function formatFiscalYearLabel(fyBe: number): string {
  return `ปีงบประมาณ ${fyBe} (${formatFiscalYearRange(fyBe)})`;
}

/**
 * Pure helper for percentage calculation with zero-division handling.
 */
export function calculatePercentageChange(
  current: number,
  baseline: number | null | undefined
): number | null {
  if (baseline === null || baseline === undefined || baseline === 0) {
    return null;
  }
  return ((current - baseline) / Math.abs(baseline)) * 100;
}
