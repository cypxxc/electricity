import type { MonthlyTrendItem, FiscalYearComparisonItem } from '@/lib/services/analytics';

export type ChartViewMode = 'monthly' | 'yearly' | 'yoy';

export interface ExpenditureTrendExplorerProps {
  monthlyTrends: MonthlyTrendItem[];
  fiscalYearComparison: FiscalYearComparisonItem[];
  selectedYear: string;
  selectedMonth: number | null;
  onSelectPoint?: (yearBe: number, month: number) => void;
  onSelectYear?: (yearBe: string) => void;
  onResetFilters?: () => void;
}

export interface MonthlyStats {
  total: number;
  avg: number;
  maxMonth: { name: string; amount: number } | null;
  minMonth: { name: string; amount: number } | null;
  count: number;
}

export interface YearlyStats {
  total: number;
  avg: number;
  maxYear: { year: number; amount: number } | null;
  minYear: { year: number; amount: number } | null;
  latestYoY: { rate: number | null; amount: number | null; year: number } | null;
}

export interface YoYStats {
  primarySum: number;
  benchmarkSum: number;
  comparedMonthsCount: number;
  netDiff: number;
  netPct: number | null;
  maxIncrease: { monthName: string; diff: number; pct: number } | null;
  maxDecrease: { monthName: string; diff: number; pct: number } | null;
}

export interface YoYComparisonRow {
  month: number;
  monthName: string;
  primaryAmount: number | null;
  benchmarkAmount: number | null;
  diff: number | null;
  pct: number | null;
}

export interface MonthlyViewDataItem extends MonthlyTrendItem {
  displayLabel: string;
  metricValue: number;
}

export interface YearlyViewDataItem extends FiscalYearComparisonItem {
  label: string;
  metricValue: number;
}
