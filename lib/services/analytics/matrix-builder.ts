import { THAI_MONTHS } from '../../validations/record';
import {
  FISCAL_MONTH_ORDER,
  getFiscalQuarter,
  getFiscalMonthOrder,
} from '../../utils/math';
import type { MatrixRow, FiscalMatrixRow, FiscalMatrixMonthCell } from './types';

/**
 * Builds standard calendar year matrix rows (sorted descending by year)
 */
export function buildCalendarMatrixRows(
  sortedYearsAsc: number[],
  matrixMap: Map<number, (number | null)[]>
): MatrixRow[] {
  const sortedYearsDesc = [...sortedYearsAsc].reverse();
  return sortedYearsDesc.map((y) => {
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
}

/**
 * Builds Thai Government Fiscal Year matrix rows grouped by 4 Quarters (sorted descending by FY)
 */
export function buildFiscalMatrixRows(
  sortedFYAsc: number[],
  recordLookup: Map<string, { id: number; amount: number; yearBe: number; month: number }>
): FiscalMatrixRow[] {
  const sortedFYDesc = [...sortedFYAsc].reverse();
  return sortedFYDesc.map((fy) => {
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
}
