import { db } from '../db';
import { electricityRecords } from '../db/schema';
import { asc, desc, sql } from 'drizzle-orm';
import { THAI_MONTHS } from '../validations/record';

export interface DashboardKPIs {
  totalHistoricalCost: number;
  totalRecordsCount: number;
  monthlyAverage: number;
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
  } | null;
  minRecord: {
    yearBe: number;
    month: number;
    monthName: string;
    amount: number;
  } | null;
}

export interface MonthlyTrendItem {
  id: number;
  yearBe: number;
  month: number;
  periodLabel: string; // e.g. "ม.ค. 63"
  fullLabel: string;   // e.g. "ม.ค. 2563"
  amount: number;
}

export interface YearlyComparisonItem {
  yearBe: number;
  yearCe: number;
  totalAmount: number;
  averageMonthly: number;
  recordedMonths: number;
}

export interface MatrixRow {
  yearBe: number;
  months: (number | null)[]; // index 0..11 for months 1..12
  yearTotal: number;
  recordedCount: number;
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const records = await db
    .select({
      id: electricityRecords.id,
      yearBe: electricityRecords.yearBe,
      month: electricityRecords.month,
      amount: electricityRecords.amount,
    })
    .from(electricityRecords)
    .orderBy(asc(electricityRecords.yearBe), asc(electricityRecords.month));

  if (records.length === 0) {
    return {
      totalHistoricalCost: 0,
      totalRecordsCount: 0,
      monthlyAverage: 0,
      latestYearBe: 2569,
      latestYearTotal: 0,
      previousYearBe: 2568,
      previousYearTotal: 0,
      yoyChangeRate: null,
      maxRecord: null,
      minRecord: null,
    };
  }

  let totalCost = 0;
  let maxAmount = -Infinity;
  let minAmount = Infinity;
  let maxRec: DashboardKPIs['maxRecord'] = null;
  let minRec: DashboardKPIs['minRecord'] = null;

  const yearTotals = new Map<number, { total: number; months: number[] }>();

  for (const r of records) {
    const amt = parseFloat(r.amount);
    totalCost += amt;

    if (amt > maxAmount) {
      maxAmount = amt;
      maxRec = {
        yearBe: r.yearBe,
        month: r.month,
        monthName: THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`,
        amount: amt,
      };
    }

    if (amt < minAmount) {
      minAmount = amt;
      minRec = {
        yearBe: r.yearBe,
        month: r.month,
        monthName: THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`,
        amount: amt,
      };
    }

    const currentYear = yearTotals.get(r.yearBe) || { total: 0, months: [] };
    currentYear.total += amt;
    currentYear.months.push(r.month);
    yearTotals.set(r.yearBe, currentYear);
  }

  const sortedYears = Array.from(yearTotals.keys()).sort((a, b) => b - a);
  const latestYear = sortedYears[0] || 2569;
  const prevYear = sortedYears[1] || latestYear - 1;

  const latestStats = yearTotals.get(latestYear) || { total: 0, months: [] };
  const prevStats = yearTotals.get(prevYear) || { total: 0, months: [] };

  // Calculate comparable YoY change if latest year has partial months
  // e.g. compare same months in previous year for fairness
  let yoyChangeRate: number | null = null;
  if (prevStats.total > 0 && latestStats.months.length > 0) {
    // Sum of previous year for only the months that exist in latest year
    const prevMatchingTotal = records
      .filter((r) => r.yearBe === prevYear && latestStats.months.includes(r.month))
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    if (prevMatchingTotal > 0) {
      yoyChangeRate = ((latestStats.total - prevMatchingTotal) / prevMatchingTotal) * 100;
    }
  }

  return {
    totalHistoricalCost: totalCost,
    totalRecordsCount: records.length,
    monthlyAverage: records.length > 0 ? totalCost / records.length : 0,
    latestYearBe: latestYear,
    latestYearTotal: latestStats.total,
    previousYearBe: prevYear,
    previousYearTotal: prevStats.total,
    yoyChangeRate,
    maxRecord: maxRec,
    minRecord: minRec,
  };
}

export async function getMonthlyTrendData(): Promise<MonthlyTrendItem[]> {
  const records = await db
    .select({
      id: electricityRecords.id,
      yearBe: electricityRecords.yearBe,
      month: electricityRecords.month,
      amount: electricityRecords.amount,
    })
    .from(electricityRecords)
    .orderBy(asc(electricityRecords.yearBe), asc(electricityRecords.month));

  return records.map((r) => {
    const amt = parseFloat(r.amount);
    const shortYear = (r.yearBe % 100).toString().padStart(2, '0');
    const monthShort = THAI_MONTHS[r.month - 1] || `${r.month}`;
    return {
      id: r.id,
      yearBe: r.yearBe,
      month: r.month,
      periodLabel: `${monthShort} ${shortYear}`,
      fullLabel: `${monthShort} ${r.yearBe}`,
      amount: amt,
    };
  });
}

export async function getYearlyComparisonData(): Promise<YearlyComparisonItem[]> {
  const records = await db
    .select({
      yearBe: electricityRecords.yearBe,
      yearCe: electricityRecords.yearCe,
      totalAmount: sql<string>`sum(${electricityRecords.amount})::text`,
      avgAmount: sql<string>`avg(${electricityRecords.amount})::text`,
      recordedMonths: sql<number>`count(${electricityRecords.id})::int`,
    })
    .from(electricityRecords)
    .groupBy(electricityRecords.yearBe, electricityRecords.yearCe)
    .orderBy(asc(electricityRecords.yearBe));

  return records.map((r) => ({
    yearBe: r.yearBe,
    yearCe: r.yearCe,
    totalAmount: parseFloat(r.totalAmount || '0'),
    averageMonthly: parseFloat(r.avgAmount || '0'),
    recordedMonths: r.recordedMonths,
  }));
}

export async function getYearMonthlyMatrix(): Promise<MatrixRow[]> {
  const records = await db
    .select()
    .from(electricityRecords)
    .orderBy(asc(electricityRecords.yearBe), asc(electricityRecords.month));

  const map = new Map<number, (number | null)[]>();

  for (const r of records) {
    if (!map.has(r.yearBe)) {
      map.set(r.yearBe, new Array(12).fill(null));
    }
    const arr = map.get(r.yearBe)!;
    arr[r.month - 1] = parseFloat(r.amount);
  }

  const rows: MatrixRow[] = [];
  const years = Array.from(map.keys()).sort((a, b) => b - a); // latest first for table view

  for (const y of years) {
    const months = map.get(y)!;
    const yearTotal = months.reduce((sum: number, val) => sum + (val || 0), 0);
    const recordedCount = months.filter((v) => v !== null).length;
    rows.push({
      yearBe: y,
      months,
      yearTotal,
      recordedCount,
    });
  }

  return rows;
}
