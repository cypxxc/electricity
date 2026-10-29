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
  quarter: number;
  fiscalOrder: number;
}

export interface FiscalMatrixRow {
  fyBe: number;
  months: FiscalMatrixMonthCell[];
  yearTotal: number;
  averageMonthly: number;
  recordedCount: number;
  isComplete: boolean;
  q1Total: number;
  q2Total: number;
  q3Total: number;
  q4Total: number;
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
