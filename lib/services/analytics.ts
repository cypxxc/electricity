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

export interface DashboardKPIs {
  totalHistoricalCost: number;
  totalRecordsCount: number;
  monthlyAverage: number;
  // Thai Fiscal Year Institutional Standard
  firstFiscalYearBe: number;
  totalFiscalYearsCount: number;
  completeFiscalYearsCount: number;
  latestFiscalYearBe: number;
  latestFiscalYearTotal: number;
  previousFiscalYearBe: number;
  previousFiscalYearTotal: number;
  fiscalYoyChangeRate: number | null; // percentage
  // Calendar Year Baseline (for audit & backward compatibility)
  latestYearBe: number;
  latestYearTotal: number;
  previousYearBe: number;
  previousYearTotal: number;
  yoyChangeRate: number | null; // percentage
  maxRecord: {
    yearBe: number;
    month: number;
    monthName: string;
    amount: number;
    fyBe?: number;
  } | null;
  minRecord: {
    yearBe: number;
    month: number;
    monthName: string;
    amount: number;
    fyBe?: number;
  } | null;
}

export interface MonthlyTrendItem {
  id: number;
  yearBe: number;
  yearCe: number;
  month: number;
  periodLabel: string; // e.g. "ม.ค. 63"
  fullLabel: string;   // e.g. "ม.ค. 2563"
  amount: number;
  momChangeAmount: number | null;
  momChangeRate: number | null;
  yoyChangeAmount: number | null;
  yoyChangeRate: number | null;
  fyBe: number;        // Thai Fiscal Year: Oct-Dec is yearBe + 1
  fiscalOrder: number; // 1 (Oct) to 12 (Sep)
  cumulativeFiscalAmount: number;
  isAnomaly: boolean;
  isPeak: boolean;
  zScore: number;
}

export interface YearlyComparisonItem {
  yearBe: number;
  yearCe: number;
  totalAmount: number;
  averageMonthly: number;
  recordedMonths: number;
  isComplete: boolean;
  coverageNote: string;
}

export interface FiscalMonthDetail {
  month: number;
  monthName: string;
  yearBe: number;
  amount: number;
  periodLabel: string;
  fullLabel: string;
  momChangeAmount: number | null;
  momChangeRate: number | null;
  fiscalOrder: number;
  cumulativeFiscalAmount: number;
}

export interface FiscalYearComparisonItem {
  fyBe: number;
  totalAmount: number;
  averageMonthly: number;
  recordedMonths: number;
  yoyChangeAmount: number | null;
  yoyChangeRate: number | null;
  isComplete: boolean;
  months: FiscalMonthDetail[];
  maxMonth: { monthName: string; amount: number; yearBe: number; month: number } | null;
  minMonth: { monthName: string; amount: number; yearBe: number; month: number } | null;
}

export interface MatrixRow {
  yearBe: number;
  months: (number | null)[]; // index 0..11 for months 1..12
  yearTotal: number;
  recordedCount: number;
}

export interface FiscalMatrixMonthCell {
  month: number;
  monthName: string;
  yearBe: number;
  amount: number | null;
  quarter: 1 | 2 | 3 | 4;
  fiscalOrder: number;
}

export interface FiscalMatrixRow {
  fyBe: number;
  months: FiscalMatrixMonthCell[]; // 12 items ordered from Oct (order 1) to Sep (order 12)
  yearTotal: number;
  averageMonthly: number;
  recordedCount: number;
  isComplete: boolean;
  q1Total: number; // ต.ค. - ธ.ค.
  q2Total: number; // ม.ค. - มี.ค.
  q3Total: number; // เม.ย. - มิ.ย.
  q4Total: number; // ก.ค. - ก.ย.
}

export interface AnomalyRecord {
  id: number;
  yearBe: number;
  month: number;
  monthName: string;
  periodLabel: string;
  amount: number;
  baselineMean: number;
  baselineStdDev: number;
  threshold: number;
  deviationAmount: number;
  deviationPct: number;
  zScore: number;
  isPeak: boolean;
  reason: string;
  operationalContext: string;
}

export interface TrendNarrative {
  latestMonth: {
    yearBe: number;
    month: number;
    monthName: string;
    periodLabel: string;
    amount: number;
  };
  previousMonth: {
    yearBe: number;
    month: number;
    monthName: string;
    periodLabel: string;
    amount: number;
  } | null;
  momChangeAmount: number | null;
  momChangeRate: number | null;
  sameMonthPreviousYear: {
    yearBe: number;
    month: number;
    amount: number;
  } | null;
  yoySameMonthChangeAmount: number | null;
  yoySameMonthChangeRate: number | null;
  currentFiscalYear: {
    fyBe: number;
    monthsCount: number;
    total: number;
    label: string;
  };
  previousFiscalYear: {
    fyBe: number;
    monthsCount: number;
    total: number;
    label: string;
  };
  fyYoyChangeAmount: number | null;
  fyYoyChangeRate: number | null;
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'mixed';
  trendDirectionTh: string;
  trendSummaryTh: string;
  dataCoverage: {
    totalRecords: number;
    startLabel: string;
    endLabel: string;
    completeFiscalYears: number;
  };
}

export interface DashboardAnalyticsData {
  kpis: DashboardKPIs;
  monthlyTrends: MonthlyTrendItem[];
  yearlyComparison: YearlyComparisonItem[];
  fiscalYearComparison: FiscalYearComparisonItem[];
  matrixRows: MatrixRow[];
  fiscalMatrixRows: FiscalMatrixRow[];
  anomalies: AnomalyRecord[];
  narrative: TrendNarrative;
  statisticalThresholds: {
    mean: number;
    stdDev: number;
    upperTwoSigma: number;
  };
}

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
        latestMonth: { yearBe: fallbackYearBe, month: 1, monthName: 'ม.ค.', periodLabel: `ม.ค. ${(fallbackYearBe % 100).toString().padStart(2, '0')}`, amount: 0 },
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
  let maxRec: DashboardKPIs['maxRecord'] = null;
  let minRec: DashboardKPIs['minRecord'] = null;

  const rawAmounts = new Array<number>(records.length);
  const matrixMap = new Map<number, (number | null)[]>();
  const yearStatsMap = new Map<number, { yearCe: number; total: number; count: number; months: number[] }>();

  // Map for fast O(1) lookup of (yearBe, month)
  const recordLookup = new Map<string, { id: number; amount: number; yearBe: number; month: number }>();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const amt = parseFloat(r.amount);
    rawAmounts[i] = amt;
    totalCost += amt;

    const key = `${r.yearBe}-${r.month}`;
    recordLookup.set(key, { id: r.id, amount: amt, yearBe: r.yearBe, month: r.month });

    const monthShort = THAI_MONTHS[r.month - 1] || `${r.month}`;

    // Max & Min Record
    if (amt > maxAmount) {
      maxAmount = amt;
      maxRec = {
        yearBe: r.yearBe,
        month: r.month,
        monthName: monthShort,
        amount: amt,
      };
    }
    if (amt < minAmount) {
      minAmount = amt;
      minRec = {
        yearBe: r.yearBe,
        month: r.month,
        monthName: monthShort,
        amount: amt,
      };
    }

    // Matrix Map
    if (!matrixMap.has(r.yearBe)) {
      matrixMap.set(r.yearBe, new Array(12).fill(null));
    }
    matrixMap.get(r.yearBe)![r.month - 1] = amt;

    // Calendar Year Stats
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

  // Statistical Baseline (Empirical Mean and Standard Deviation)
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

    // Running cumulative amount within that fiscal year
    const currentFYCum = (fyRunningSumMap.get(fyBe) || 0) + amt;
    fyRunningSumMap.set(fyBe, currentFYCum);

    // MoM change
    let momChangeAmount: number | null = null;
    let momChangeRate: number | null = null;
    if (i > 0) {
      const prevAmt = rawAmounts[i - 1];
      momChangeAmount = amt - prevAmt;
      momChangeRate = calculatePercentageChange(amt, prevAmt);
    }

    // YoY change for same month
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

    // Collect fiscal month details
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
      const mRange = minM === maxM
        ? (THAI_MONTHS[minM - 1] || `${minM}`)
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

  // Thai Fiscal Year Comparison (FY 2563 - FY 2569)
  const sortedFYAsc = Array.from(fyMonthsMap.keys()).sort((a, b) => a - b);
  const fiscalYearComparison: FiscalYearComparisonItem[] = sortedFYAsc.map((fy, idx) => {
    const rawMonths = fyMonthsMap.get(fy) || [];
    // Sort in exact fiscal sequence: Oct (10), Nov (11), Dec (12), Jan (1) ... Sep (9)
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

  // Matrix rows (sorted desc by year for audit scanning)
  const sortedYearsDesc = [...sortedYearsAsc].reverse();
  const matrixRows: MatrixRow[] = sortedYearsDesc.map((y) => {
    const months = matrixMap.get(y)!;
    const yearTotal = months.reduce((sum: number, val) => sum + (val || 0), 0);
    const recordedCount = months.filter((v) => v !== null).length;
    return {
      yearBe: y,
      months,
      yearTotal,
      recordedCount,
    };
  });

  // Thai Fiscal Year Matrix rows (sorted desc by FY for budget audit scanning)
  const sortedFYDesc = [...sortedFYAsc].reverse();
  const fiscalMatrixRows: FiscalMatrixRow[] = sortedFYDesc.map((fy) => {
    const monthsInFY: FiscalMatrixMonthCell[] = FISCAL_MONTH_ORDER.map((month) => {
      const yearBe = month >= 10 ? fy - 1 : fy;
      const rec = recordLookup.get(`${yearBe}-${month}`);
      const amt = rec ? rec.amount : null;
      const q = getFiscalQuarter(month);
      const fiscalOrder = getFiscalMonthOrder(month);
      return {
        month,
        monthName: THAI_MONTHS[month - 1] || `${month}`,
        yearBe,
        amount: amt,
        quarter: q.quarter,
        fiscalOrder,
      };
    });

    const validAmounts = monthsInFY.filter((m) => m.amount !== null).map((m) => m.amount as number);
    const totalAmount = validAmounts.reduce((sum, v) => sum + v, 0);
    const recordedCount = validAmounts.length;
    const averageMonthly = recordedCount > 0 ? totalAmount / recordedCount : 0;

    const q1Total = monthsInFY.filter((m) => m.quarter === 1).reduce((s, m) => s + (m.amount || 0), 0);
    const q2Total = monthsInFY.filter((m) => m.quarter === 2).reduce((s, m) => s + (m.amount || 0), 0);
    const q3Total = monthsInFY.filter((m) => m.quarter === 3).reduce((s, m) => s + (m.amount || 0), 0);
    const q4Total = monthsInFY.filter((m) => m.quarter === 4).reduce((s, m) => s + (m.amount || 0), 0);

    return {
      fyBe: fy,
      months: monthsInFY,
      yearTotal: totalAmount,
      averageMonthly,
      recordedCount,
      isComplete: recordedCount === 12,
      q1Total,
      q2Total,
      q3Total,
      q4Total,
    };
  });

  // Latest Month & Narrative Calculation
  const lastIndex = monthlyTrends.length - 1;
  const latestItem = monthlyTrends[lastIndex];
  const prevItem = lastIndex > 0 ? monthlyTrends[lastIndex - 1] : null;

  const sameMonthLastYearItem = monthlyTrends.find(
    (m) => m.yearBe === latestItem.yearBe - 1 && m.month === latestItem.month
  );

  // Latest FY vs Previous FY
  const latestFYNum = sortedFYAsc[sortedFYAsc.length - 1] || 2569;
  const prevFYNum = sortedFYAsc[sortedFYAsc.length - 2] || latestFYNum - 1;
  const latestFYItem = fiscalYearComparison.find((f) => f.fyBe === latestFYNum);
  const prevFYItem = fiscalYearComparison.find((f) => f.fyBe === prevFYNum);

  const fyYoyChangeAmount = latestFYItem && prevFYItem && prevFYItem.totalAmount > 0
    ? latestFYItem.totalAmount - prevFYItem.totalAmount
    : null;
  const fyYoyChangeRate = latestFYItem && prevFYItem && prevFYItem.totalAmount > 0
    ? calculatePercentageChange(latestFYItem.totalAmount, prevFYItem.totalAmount)
    : null;

  // Trend direction determination
  let trendDirection: TrendNarrative['trendDirection'] = 'stable';
  let trendDirectionTh = 'ระดับการใช้จ่ายทรงตัว';

  const momRate = latestItem.momChangeRate;
  const yoyRate = latestItem.yoyChangeRate;

  if (momRate !== null && yoyRate !== null) {
    if (momRate < -1 && yoyRate < -1) {
      trendDirection = 'decreasing';
      trendDirectionTh = 'มีแนวโน้มลดลงอย่างต่อเนื่อง';
    } else if (momRate > 1 && yoyRate > 1) {
      trendDirection = 'increasing';
      trendDirectionTh = 'มีแนวโน้มปรับตัวสูงขึ้น';
    } else if (Math.abs(momRate) <= 1 && Math.abs(yoyRate) <= 1) {
      trendDirection = 'stable';
      trendDirectionTh = 'ระดับการใช้จ่ายคงที่';
    } else {
      trendDirection = 'mixed';
      trendDirectionTh = 'ทิศทางผสมผสานตามปัจจัยฤดูกาล';
    }
  }

  const momText = momRate !== null
    ? `${momRate > 0 ? '+' : ''}${momRate.toFixed(1)}% (${momRate > 0 ? '+' : ''}฿${Math.abs(latestItem.momChangeAmount || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
    : 'ไม่มีข้อมูลงวดก่อนหน้า';

  const yoyText = yoyRate !== null
    ? `${yoyRate > 0 ? '+' : ''}${yoyRate.toFixed(1)}%`
    : 'ไม่มีข้อมูลงวดปีก่อนหน้า';

  const fyText = fyYoyChangeRate !== null
    ? `${fyYoyChangeRate > 0 ? '+' : ''}${fyYoyChangeRate.toFixed(1)}% (${fyYoyChangeRate > 0 ? '+' : ''}฿${Math.abs(fyYoyChangeAmount || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
    : 'ไม่มีข้อมูลปีงบก่อนหน้า';

  const latestQ = getFiscalQuarter(latestItem.month);
  const isFYCompleteText = latestFYItem?.isComplete
    ? 'มีข้อมูลครบ 12 เดือน'
    : `บันทึกแล้ว ${latestFYItem?.recordedMonths || 0}/12 เดือน (ระหว่างปีงบประมาณ)`;

  const trendSummaryTh = `ค่าไฟฟ้างวดล่าสุด (${latestItem.fullLabel} ${latestQ.shortLabel} ปีงบประมาณ ${latestItem.fyBe}) บันทึกที่ ฿${latestItem.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} โดยเปลี่ยนแปลง ${momText} เทียบเดือนก่อนหน้า และ ${yoyText} เทียบช่วงเดียวกันปีก่อนหน้า ในระดับปีงบประมาณ ${latestFYNum} (${formatFiscalYearRange(latestFYNum)}) ${isFYCompleteText} ยอดรวม ฿${(latestFYItem?.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} เปลี่ยนแปลง ${fyText} เทียบปีงบประมาณ ${prevFYNum}`;

  const narrative: TrendNarrative = {
    latestMonth: {
      yearBe: latestItem.yearBe,
      month: latestItem.month,
      monthName: THAI_MONTHS[latestItem.month - 1] || `${latestItem.month}`,
      periodLabel: latestItem.periodLabel,
      amount: latestItem.amount,
    },
    previousMonth: prevItem
      ? {
          yearBe: prevItem.yearBe,
          month: prevItem.month,
          monthName: THAI_MONTHS[prevItem.month - 1] || `${prevItem.month}`,
          periodLabel: prevItem.periodLabel,
          amount: prevItem.amount,
        }
      : null,
    momChangeAmount: latestItem.momChangeAmount,
    momChangeRate: latestItem.momChangeRate,
    sameMonthPreviousYear: sameMonthLastYearItem
      ? {
          yearBe: sameMonthLastYearItem.yearBe,
          month: sameMonthLastYearItem.month,
          amount: sameMonthLastYearItem.amount,
        }
      : null,
    yoySameMonthChangeAmount: latestItem.yoyChangeAmount,
    yoySameMonthChangeRate: latestItem.yoyChangeRate,
    currentFiscalYear: {
      fyBe: latestFYNum,
      monthsCount: latestFYItem?.recordedMonths || 0,
      total: latestFYItem?.totalAmount || 0,
      label: `ปีงบประมาณ ${latestFYNum} (ต.ค. ${latestFYNum - 1} – ก.ย. ${latestFYNum})`,
    },
    previousFiscalYear: {
      fyBe: prevFYNum,
      monthsCount: prevFYItem?.recordedMonths || 0,
      total: prevFYItem?.totalAmount || 0,
      label: `ปีงบประมาณ ${prevFYNum} (ต.ค. ${prevFYNum - 1} – ก.ย. ${prevFYNum})`,
    },
    fyYoyChangeAmount,
    fyYoyChangeRate,
    trendDirection,
    trendDirectionTh,
    trendSummaryTh,
    dataCoverage: {
      totalRecords: records.length,
      startLabel: monthlyTrends[0]?.fullLabel || '-',
      endLabel: latestItem.fullLabel,
      completeFiscalYears: fiscalYearComparison.filter((fy) => fy.isComplete).length,
    },
  };

  // Calendar year-to-date YoY for KPI Card
  const latestCalYear = sortedYearsDesc[0] || 2569;
  const prevCalYear = sortedYearsDesc[1] || latestCalYear - 1;
  const latestCalStats = yearStatsMap.get(latestCalYear) || { yearCe: latestCalYear - 543, total: 0, count: 0, months: [] as number[] };
  const prevCalStats = yearStatsMap.get(prevCalYear) || { yearCe: prevCalYear - 543, total: 0, count: 0, months: [] as number[] };

  let kpiYoyRate: number | null = null;
  if (prevCalStats.total > 0 && latestCalStats.months.length > 0) {
    const prevMatchingTotal = records
      .filter((r) => r.yearBe === prevCalYear && latestCalStats.months.includes(r.month))
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    if (prevMatchingTotal > 0) {
      kpiYoyRate = calculatePercentageChange(latestCalStats.total, prevMatchingTotal);
    }
  }

  const firstFYNum = sortedFYAsc[0] || latestFYNum;
  const completeFYCount = fiscalYearComparison.filter((fy) => fy.isComplete).length;

  const kpis: DashboardKPIs = {
    totalHistoricalCost: totalCost,
    totalRecordsCount: records.length,
    monthlyAverage: mean,
    firstFiscalYearBe: firstFYNum,
    totalFiscalYearsCount: fiscalYearComparison.length,
    completeFiscalYearsCount: completeFYCount,
    latestFiscalYearBe: latestFYNum,
    latestFiscalYearTotal: latestFYItem?.totalAmount || 0,
    previousFiscalYearBe: prevFYNum,
    previousFiscalYearTotal: prevFYItem?.totalAmount || 0,
    fiscalYoyChangeRate: latestFYItem?.yoyChangeRate || null,
    latestYearBe: latestCalYear,
    latestYearTotal: latestCalStats.total,
    previousYearBe: prevCalYear,
    previousYearTotal: prevCalStats.total,
    yoyChangeRate: kpiYoyRate,
    maxRecord: maxRec ? { ...maxRec, fyBe: getFiscalYear(maxRec.yearBe, maxRec.month) } : null,
    minRecord: minRec ? { ...minRec, fyBe: getFiscalYear(minRec.yearBe, minRec.month) } : null,
  };

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
