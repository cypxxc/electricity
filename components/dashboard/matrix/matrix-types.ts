import type { MatrixRow, FiscalMatrixRow, AnomalyRecord } from '@/lib/services/analytics';

export type MatrixMode = 'fiscal' | 'calendar';

export interface DataMatrixTableProps {
  rows: MatrixRow[];
  fiscalRows?: FiscalMatrixRow[];
  selectedYear: string;
  selectedMonth: number | null;
  anomalies: AnomalyRecord[];
  onSelectYear: (year: string) => void;
  onSelectMonth: (month: number | null) => void;
  onInspectAnomaly: (anomaly: AnomalyRecord) => void;
  onResetFilters: () => void;
}
