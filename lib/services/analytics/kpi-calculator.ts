import { getFiscalYear, calculatePercentageChange } from '../../utils/math';
import type { DashboardKPIs, FiscalYearComparisonItem } from './types';

interface RawRecordItem {
  id: number;
  yearBe: number;
  yearCe: number;
  month: number;
  amount: string;
}

export function calculateDashboardKPIs({
  records,
  totalCost,
  mean,
  sortedFYAsc,
  sortedYearsDesc,
  yearStatsMap,
  fiscalYearComparison,
  maxRec,
  minRec,
}: {
  records: RawRecordItem[];
  totalCost: number;
  mean: number;
  sortedFYAsc: number[];
  sortedYearsDesc: number[];
  yearStatsMap: Map<number, { yearCe: number; total: number; count: number; months: number[] }>;
  fiscalYearComparison: FiscalYearComparisonItem[];
  maxRec: { yearBe: number; month: number; monthName: string; amount: number } | null;
  minRec: { yearBe: number; month: number; monthName: string; amount: number } | null;
}): DashboardKPIs {
  const latestFYNum = sortedFYAsc[sortedFYAsc.length - 1] || 2569;
  const prevFYNum = sortedFYAsc[sortedFYAsc.length - 2] || latestFYNum - 1;
  const latestFYItem = fiscalYearComparison.find((f) => f.fyBe === latestFYNum);
  const prevFYItem = fiscalYearComparison.find((f) => f.fyBe === prevFYNum);

  // Calendar year-to-date YoY for KPI Card
  const latestCalYear = sortedYearsDesc[0] || 2569;
  const prevCalYear = sortedYearsDesc[1] || latestCalYear - 1;
  const latestCalStats = yearStatsMap.get(latestCalYear) || {
    yearCe: latestCalYear - 543,
    total: 0,
    count: 0,
    months: [] as number[],
  };
  const prevCalStats = yearStatsMap.get(prevCalYear) || {
    yearCe: prevCalYear - 543,
    total: 0,
    count: 0,
    months: [] as number[],
  };

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

  return {
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
}
