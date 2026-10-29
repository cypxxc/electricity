import { db } from '../db';
import { electricityRecords } from '../db/schema';
import { asc } from 'drizzle-orm';
import { THAI_MONTHS } from '../validations/record';
import { unstable_cache } from 'next/cache';
import {
  FISCAL_MONTH_ORDER,
  THAI_FISCAL_MONTHS,
  getFiscalYear,
  getFiscalQuarter,
  getFiscalMonthOrder,
  formatFiscalYearRange,
  formatFiscalYearLabel,
  calculatePercentageChange,
} from '../utils/math';

export {
  FISCAL_MONTH_ORDER,
  THAI_FISCAL_MONTHS,
  getFiscalYear,
  getFiscalQuarter,
  getFiscalMonthOrder,
  formatFiscalYearRange,
  formatFiscalYearLabel,
  calculatePercentageChange,
};

// Re-export all type definitions from modular types file
export * from './analytics/types';
import type {
  DashboardKPIs,
  MonthlyTrendItem,
  YearlyComparisonItem,
  FiscalMonthDetail,
  FiscalYearComparisonItem,
  MatrixRow,
  FiscalMatrixRow,
  AnomalyRecord,
  DashboardAnalyticsData,
} from './analytics/types';
import { buildCalendarMatrixRows, buildFiscalMatrixRows } from './analytics/matrix-builder';
import { generateTrendNarrative } from './analytics/narrative-engine';
import { calculateDashboardKPIs } from './analytics/kpi-calculator';

/**
 * Single-pass query and computation of all dashboard analytics
 * Fetches the entire electricity dataset once and calculates KPIs, trends, comparisons, and matrix in memory.
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
  const records = await db
    .select({
      id: electricityRecords.id,
      yearBe: electricityRecords.yearBe,
      yearCe: electricityRecords.yearCe,
      month: electricityRecords.month,
      amount: electricityRecords.amount,
    })
    .from(electricityRecords)
    .orderBy(asc(electricityRecords.yearBe), asc(electricityRecords.month));

  if (records.length === 0) {
    const fallbackYearBe = new Date().getFullYear() + 543;
    const fallbackFY = getFiscalYear(fallbackYearBe, new Date().getMonth() + 1);
    return {
      kpis: {
        totalHistoricalCost: 0,
        totalRecordsCount: 0,
        monthlyAverage: 0,
        firstFiscalYearBe: fallbackFY,
        totalFiscalYearsCount: 0,
        completeFiscalYearsCount: 0,
        latestFiscalYearBe: fallbackFY,
        latestFiscalYearTotal: 0,
        previousFiscalYearBe: fallbackFY - 1,
        previousFiscalYearTotal: 0,
        fiscalYoyChangeRate: null,
        latestYearBe: fallbackYearBe,
        latestYearTotal: 0,
        previousYearBe: fallbackYearBe - 1,
        previousYearTotal: 0,
        yoyChangeRate: null,
        maxRecord: null,
        minRecord: null,
      },
      monthlyTrends: [],
      yearlyComparison: [],
      fiscalYearComparison: [],
      matrixRows: [],
      fiscalMatrixRows: [],
      anomalies: [],
      narrative: {
        latestMonth: {
          yearBe: fallbackYearBe,
          month: 1,
          monthName: 'ม.ค.',
          periodLabel: `ม.ค. ${(fallbackYearBe % 100).toString().padStart(2, '0')}`,
          amount: 0,
        },
        previousMonth: null,
        momChangeAmount: null,
        momChangeRate: null,
        sameMonthPreviousYear: null,
        yoySameMonthChangeAmount: null,
        yoySameMonthChangeRate: null,
        currentFiscalYear: { fyBe: fallbackFY, monthsCount: 0, total: 0, label: `ปีงบประมาณ ${fallbackFY}` },
        previousFiscalYear: { fyBe: fallbackFY - 1, monthsCount: 0, total: 0, label: `ปีงบประมาณ ${fallbackFY - 1}` },
        fyYoyChangeAmount: null,
        fyYoyChangeRate: null,
        trendDirection: 'stable',
        trendDirectionTh: 'ไม่มีข้อมูลเพียงพอ',
        trendSummaryTh: 'ยังไม่มีข้อมูลระเบียนค่าไฟฟ้าในระบบ',
        dataCoverage: { totalRecords: 0, startLabel: '-', endLabel: '-', completeFiscalYears: 0 },
      },
      statisticalThresholds: { mean: 0, stdDev: 0, upperTwoSigma: 0 },
    };
  }

  let totalCost = 0;
  let maxAmount = -Infinity;
  let minAmount = Infinity;
  let maxRec: { yearBe: number; month: number; monthName: string; amount: number } | null = null;
  let minRec: { yearBe: number; month: number; monthName: string; amount: number } | null = null;

  const rawAmounts = new Array<number>(records.length);
  const matrixMap = new Map<number, (number | null)[]>();
  const yearStatsMap = new Map<number, { yearCe: number; total: number; count: number; months: number[] }>();
  const recordLookup = new Map<string, { id: number; amount: number; yearBe: number; month: number }>();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const amt = parseFloat(r.amount);
    rawAmounts[i] = amt;
    totalCost += amt;

    const key = `${r.yearBe}-${r.month}`;
    recordLookup.set(key, { id: r.id, amount: amt, yearBe: r.yearBe, month: r.month });

    const monthShort = THAI_MONTHS[r.month - 1] || `${r.month}`;

    if (amt > maxAmount) {
      maxAmount = amt;
      maxRec = { yearBe: r.yearBe, month: r.month, monthName: monthShort, amount: amt };
    }
    if (amt < minAmount) {
      minAmount = amt;
      minRec = { yearBe: r.yearBe, month: r.month, monthName: monthShort, amount: amt };
    }

    if (!matrixMap.has(r.yearBe)) {
      matrixMap.set(r.yearBe, new Array(12).fill(null));
    }
    matrixMap.get(r.yearBe)![r.month - 1] = amt;

    const yStat = yearStatsMap.get(r.yearBe) || {
      yearCe: r.yearCe,
      total: 0,
      count: 0,
      months: [],
    };
    yStat.total += amt;
    yStat.count += 1;
    yStat.months.push(r.month);
    yearStatsMap.set(r.yearBe, yStat);
  }

  // Statistical Baseline
  const mean = totalCost / records.length;
  const variance = rawAmounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / records.length;
  const stdDev = Math.sqrt(variance);
  const upperTwoSigma = mean + 2 * stdDev;

  // Build Monthly Trends with MoM & YoY Deltas, Z-Scores, and Fiscal Cumulative Tracking
  const monthlyTrends: MonthlyTrendItem[] = new Array(records.length);
  const anomalies: AnomalyRecord[] = [];
  const fyRunningSumMap = new Map<number, number>();
  const fyMonthsMap = new Map<number, FiscalMonthDetail[]>();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const amt = rawAmounts[i];
    const monthShort = THAI_MONTHS[r.month - 1] || `${r.month}`;
    const shortYear = (r.yearBe % 100).toString().padStart(2, '0');
    const fyBe = r.month >= 10 ? r.yearBe + 1 : r.yearBe;
    const fiscalOrder = FISCAL_MONTH_ORDER.indexOf(r.month as (typeof FISCAL_MONTH_ORDER)[number]) + 1;

    const currentFYCum = (fyRunningSumMap.get(fyBe) || 0) + amt;
    fyRunningSumMap.set(fyBe, currentFYCum);

    let momChangeAmount: number | null = null;
    let momChangeRate: number | null = null;
    if (i > 0) {
      const prevAmt = rawAmounts[i - 1];
      momChangeAmount = amt - prevAmt;
      momChangeRate = calculatePercentageChange(amt, prevAmt);
    }

    let yoyChangeAmount: number | null = null;
    let yoyChangeRate: number | null = null;
    const prevYearKey = `${r.yearBe - 1}-${r.month}`;
    const prevYearRecord = recordLookup.get(prevYearKey);
    if (prevYearRecord) {
      yoyChangeAmount = amt - prevYearRecord.amount;
      yoyChangeRate = calculatePercentageChange(amt, prevYearRecord.amount);
    }

    const zScore = stdDev > 0 ? (amt - mean) / stdDev : 0;
    const isAnomaly = amt >= upperTwoSigma;
    const isPeak = amt === maxAmount;

    const item: MonthlyTrendItem = {
      id: r.id,
      yearBe: r.yearBe,
      yearCe: r.yearCe,
      month: r.month,
      periodLabel: `${monthShort} ${shortYear}`,
      fullLabel: `${monthShort} ${r.yearBe}`,
      amount: amt,
      momChangeAmount,
      momChangeRate,
      yoyChangeAmount,
      yoyChangeRate,
      fyBe,
      fiscalOrder,
      cumulativeFiscalAmount: currentFYCum,
      isAnomaly,
      isPeak,
      zScore,
    };
    monthlyTrends[i] = item;

    const fiscalMonthDetail: FiscalMonthDetail = {
      month: r.month,
      monthName: monthShort,
      yearBe: r.yearBe,
      amount: amt,
      periodLabel: `${monthShort} ${shortYear}`,
      fullLabel: `${monthShort} ${r.yearBe}`,
      momChangeAmount,
      momChangeRate,
      fiscalOrder,
      cumulativeFiscalAmount: currentFYCum,
    };

    if (!fyMonthsMap.has(fyBe)) {
      fyMonthsMap.set(fyBe, []);
    }
    fyMonthsMap.get(fyBe)!.push(fiscalMonthDetail);

    if (isAnomaly) {
      anomalies.push({
        id: r.id,
        yearBe: r.yearBe,
        month: r.month,
        monthName: monthShort,
        periodLabel: `${monthShort} ${r.yearBe}`,
        amount: amt,
        baselineMean: mean,
        baselineStdDev: stdDev,
        threshold: upperTwoSigma,
        deviationAmount: amt - mean,
        deviationPct: ((amt - mean) / mean) * 100,
        zScore,
        isPeak,
        reason: `ค่าใช้จ่ายสูงกว่าค่าเฉลี่ยสถิติเกิน 2 ส่วนเบี่ยงเบนมาตรฐาน (Z-Score = ${zScore.toFixed(2)})`,
        operationalContext:
          r.month === 4 || r.month === 5
            ? 'ช่วงฤดูร้อน (เม.ย. - พ.ค.) มีการใช้งานระบบปรับอากาศภายในอาคารสำนักงานเขตสุขภาพที่ 7 ต่อเนื่อง'
            : 'ระดับการใช้ไฟฟ้าของอาคารสำนักงานสูงกว่าเกณฑ์สถิติปกติ ควรตรวจสอบการใช้งานอุปกรณ์ไฟฟ้าในงวดดังกล่าว',
      });
    }
  }

  // Calendar Yearly Comparison
  const sortedYearsAsc = Array.from(yearStatsMap.keys()).sort((a, b) => a - b);
  const yearlyComparison: YearlyComparisonItem[] = sortedYearsAsc.map((y) => {
    const st = yearStatsMap.get(y)!;
    const isComplete = st.count === 12;
    let coverageNote = 'ข้อมูลสมบูรณ์ 12 เดือน';
    if (!isComplete) {
      const sortedMonths = [...st.months].sort((a, b) => a - b);
      const minM = sortedMonths[0];
      const maxM = sortedMonths[sortedMonths.length - 1];
      const mRange =
        minM === maxM
          ? THAI_MONTHS[minM - 1] || `${minM}`
          : `${THAI_MONTHS[minM - 1]} - ${THAI_MONTHS[maxM - 1]}`;
      coverageNote = `บันทึก ${st.count}/12 เดือน (${mRange})`;
    }
    return {
      yearBe: y,
      yearCe: st.yearCe,
      totalAmount: st.total,
      averageMonthly: st.count > 0 ? st.total / st.count : 0,
      recordedMonths: st.count,
      isComplete,
      coverageNote,
    };
  });

  // Thai Fiscal Year Comparison
  const sortedFYAsc = Array.from(fyMonthsMap.keys()).sort((a, b) => a - b);
  const fiscalYearComparison: FiscalYearComparisonItem[] = sortedFYAsc.map((fy, idx) => {
    const rawMonths = fyMonthsMap.get(fy) || [];
    const sortedMonths = [...rawMonths].sort((a, b) => a.fiscalOrder - b.fiscalOrder);
    const totalAmount = sortedMonths.reduce((s, m) => s + m.amount, 0);
    const recordedMonths = sortedMonths.length;

    let maxMonth: FiscalYearComparisonItem['maxMonth'] = null;
    let minMonth: FiscalYearComparisonItem['minMonth'] = null;

    if (sortedMonths.length > 0) {
      let maxA = -Infinity;
      let minA = Infinity;
      for (const m of sortedMonths) {
        if (m.amount > maxA) {
          maxA = m.amount;
          maxMonth = { monthName: m.monthName, amount: m.amount, yearBe: m.yearBe, month: m.month };
        }
        if (m.amount < minA) {
          minA = m.amount;
          minMonth = { monthName: m.monthName, amount: m.amount, yearBe: m.yearBe, month: m.month };
        }
      }
    }

    let yoyChangeAmount: number | null = null;
    let yoyChangeRate: number | null = null;

    if (idx > 0) {
      const prevFY = sortedFYAsc[idx - 1];
      const prevMonths = fyMonthsMap.get(prevFY) || [];
      const prevTotal = prevMonths.reduce((s, m) => s + m.amount, 0);
      if (prevTotal > 0) {
        yoyChangeAmount = totalAmount - prevTotal;
        yoyChangeRate = calculatePercentageChange(totalAmount, prevTotal);
      }
    }

    return {
      fyBe: fy,
      totalAmount,
      averageMonthly: recordedMonths > 0 ? totalAmount / recordedMonths : 0,
      recordedMonths,
      yoyChangeAmount,
      yoyChangeRate,
      isComplete: recordedMonths === 12,
      months: sortedMonths,
      maxMonth,
      minMonth,
    };
  });

  // Matrix rows via specialized builders
  const matrixRows: MatrixRow[] = buildCalendarMatrixRows(sortedYearsAsc, matrixMap);
  const fiscalMatrixRows: FiscalMatrixRow[] = buildFiscalMatrixRows(sortedFYAsc, recordLookup);

  // Narrative via specialized engine
  const narrative = generateTrendNarrative(
    monthlyTrends,
    fiscalYearComparison,
    sortedFYAsc,
    records.length
  );

  // KPIs via specialized calculator
  const sortedYearsDesc = [...sortedYearsAsc].reverse();
  const kpis: DashboardKPIs = calculateDashboardKPIs({
    records,
    totalCost,
    mean,
    sortedFYAsc,
    sortedYearsDesc,
    yearStatsMap,
    fiscalYearComparison,
    maxRec,
    minRec,
  });

  return {
    kpis,
    monthlyTrends,
    yearlyComparison,
    fiscalYearComparison,
    matrixRows,
    fiscalMatrixRows,
    anomalies,
    narrative,
    statisticalThresholds: {
      mean,
      stdDev,
      upperTwoSigma,
    },
  };
}

/**
 * Cached version of dashboard analytics.
 * Revalidated on-demand via revalidateTag('analytics') or after 1 hour.
 */
export const getCachedDashboardAnalytics = unstable_cache(
  async () => getDashboardAnalytics(),
  ['dashboard-analytics-v4'],
  { tags: ['analytics'], revalidate: 3600 }
);

// Backward-compatible individual helpers
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const data = await getCachedDashboardAnalytics();
  return data.kpis;
}

export async function getMonthlyTrendData(): Promise<MonthlyTrendItem[]> {
  const data = await getCachedDashboardAnalytics();
  return data.monthlyTrends;
}

export async function getYearlyComparisonData(): Promise<YearlyComparisonItem[]> {
  const data = await getCachedDashboardAnalytics();
  return data.yearlyComparison;
}

export async function getYearMonthlyMatrix(): Promise<MatrixRow[]> {
  const data = await getCachedDashboardAnalytics();
  return data.matrixRows;
}
