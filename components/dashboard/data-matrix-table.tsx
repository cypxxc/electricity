'use client';

import { useState, useMemo } from 'react';
import type { AnomalyRecord } from '@/lib/services/analytics';
import { AlertTriangle } from 'lucide-react';
import type { DataMatrixTableProps, MatrixMode } from './matrix/matrix-types';
import { MatrixHeader } from './matrix/matrix-header';
import { FiscalMatrixView } from './matrix/fiscal-matrix-view';
import { CalendarMatrixView } from './matrix/calendar-matrix-view';

export type { DataMatrixTableProps, MatrixMode };

export function DataMatrixTable({
  rows,
  fiscalRows = [],
  selectedYear,
  selectedMonth,
  anomalies,
  onSelectYear,
  onSelectMonth,
  onInspectAnomaly,
  onResetFilters,
}: DataMatrixTableProps) {
  // Table Mode: 'fiscal' (Thai Government Fiscal Year: Oct - Sep, Default) or 'calendar' (Jan - Dec)
  const [matrixMode, setMatrixMode] = useState<MatrixMode>('fiscal');

  // Aggregate stats across calendar dataset
  const { allAmounts, maxAmount, maxYear, maxMonthIndex, empiricalMean, statisticalOutlierThreshold } =
    useMemo(() => {
      const amounts: number[] = [];
      let maxAmt = -Infinity;
      let maxY = 0;
      let maxMIndex = -1;

      for (const row of rows) {
        row.months.forEach((amt, idx) => {
          if (amt !== null) {
            amounts.push(amt);
            if (amt > maxAmt) {
              maxAmt = amt;
              maxY = row.yearBe;
              maxMIndex = idx;
            }
          }
        });
      }

      const mean = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
      const variance =
        amounts.length > 0
          ? amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
          : 0;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + 2 * stdDev;

      return {
        allAmounts: amounts,
        maxAmount: maxAmt,
        maxYear: maxY,
        maxMonthIndex: maxMIndex,
        empiricalMean: mean,
        statisticalOutlierThreshold: threshold,
      };
    }, [rows]);

  // Anomaly lookup map: key = `${yearBe}-${month}`
  const anomalyMap = useMemo(() => {
    const map = new Map<string, AnomalyRecord>();
    for (const a of anomalies) {
      map.set(`${a.yearBe}-${a.month}`, a);
    }
    return map;
  }, [anomalies]);

  const isFiltered = selectedYear !== 'all' || selectedMonth !== null;

  // Totals for columns
  const calMonthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    for (const row of rows) {
      row.months.forEach((amt, idx) => {
        if (amt !== null) {
          totals[idx] += amt;
        }
      });
    }
    return totals;
  }, [rows]);

  const fiscalMonthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    for (const row of fiscalRows) {
      row.months.forEach((m, idx) => {
        if (m.amount !== null) {
          totals[idx] += m.amount;
        }
      });
    }
    return totals;
  }, [fiscalRows]);

  const grandFiscalTotal = useMemo(() => {
    return fiscalRows.reduce((acc, r) => acc + r.yearTotal, 0);
  }, [fiscalRows]);

  return (
    <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
      {/* 1. Matrix Header & Mode Switcher */}
      <MatrixHeader
        matrixMode={matrixMode}
        setMatrixMode={setMatrixMode}
        isFiltered={isFiltered}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onResetFilters={onResetFilters}
      />

      {/* 2. Audit Matrix Table */}
      <div className="overflow-x-auto w-full table-scrollbar">
        {matrixMode === 'fiscal' ? (
          <FiscalMatrixView
            fiscalRows={fiscalRows}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            maxAmount={maxAmount}
            statisticalOutlierThreshold={statisticalOutlierThreshold}
            anomalyMap={anomalyMap}
            fiscalMonthlyTotals={fiscalMonthlyTotals}
            grandFiscalTotal={grandFiscalTotal}
            empiricalMean={empiricalMean}
            totalDataCount={allAmounts.length}
            onSelectYear={onSelectYear}
            onSelectMonth={onSelectMonth}
            onInspectAnomaly={onInspectAnomaly}
          />
        ) : (
          <CalendarMatrixView
            rows={rows}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            maxYear={maxYear}
            maxMonthIndex={maxMonthIndex}
            statisticalOutlierThreshold={statisticalOutlierThreshold}
            anomalyMap={anomalyMap}
            calMonthlyTotals={calMonthlyTotals}
            empiricalMean={empiricalMean}
            totalDataCount={allAmounts.length}
            onSelectYear={onSelectYear}
            onSelectMonth={onSelectMonth}
            onInspectAnomaly={onInspectAnomaly}
          />
        )}
      </div>

      {/* 3. Audit Footnote & Provenance */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold text-slate-700">คำอธิบายทางระเบียบการเงิน:</span>
          <span className="inline-flex items-center gap-1 font-mono text-slate-700">
            <span>📅 ปีงบประมาณไทย = 1 ต.ค. (ปีก่อนหน้า) – 30 ก.ย. (ปีงบประมาณ)</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono">
            <span className="text-amber-800 font-bold">⯁</span> ยอดสูงสุด (฿{maxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} พ.ค. {maxYear})
          </span>
          {anomalies.length > 0 && (
            <button
              type="button"
              onClick={() => onInspectAnomaly(anomalies[0])}
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 underline font-semibold cursor-pointer ml-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>ตรวจสอบความผิดปกติ ({anomalies.length} งวด)</span>
            </button>
          )}
        </div>
        <div className="text-slate-500 font-mono text-[10.5px]">
          สำนักงานเขตสุขภาพที่ 7 &bull; กระทรวงสาธารณสุข
        </div>
      </div>
    </div>
  );
}
