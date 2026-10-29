import type { ElectricityRecord } from '@/lib/db/schema';

export interface RecordsTableProps {
  initialRecords: ElectricityRecord[];
  distinctYears: number[];
}

export interface YearCompletenessInfo {
  year: number;
  recordedCount: number;
  recordedMonthsList: number[];
  missingMonths: number[];
  nextMissingMonth: number | null;
  isComplete: boolean;
}

export interface FilteredSummary {
  total: number;
  average: number;
  maxAmount: number;
  maxMonth: string;
}
