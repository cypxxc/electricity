'use client';

import { MatrixRow, AnomalyRecord } from '@/lib/services/analytics';
import { THAI_MONTHS } from '@/lib/validations/record';

interface CalendarMatrixViewProps {
  rows: MatrixRow[];
  selectedYear: string;
  selectedMonth: number | null;
  maxYear: number;
  maxMonthIndex: number;
  statisticalOutlierThreshold: number;
  anomalyMap: Map<string, AnomalyRecord>;
  calMonthlyTotals: number[];
  empiricalMean: number;
  totalDataCount: number;
  onSelectYear: (year: string) => void;
  onSelectMonth: (month: number | null) => void;
  onInspectAnomaly: (anomaly: AnomalyRecord) => void;
}

export function CalendarMatrixView({
  rows,
  selectedYear,
  selectedMonth,
  maxYear,
  maxMonthIndex,
  statisticalOutlierThreshold,
  anomalyMap,
  calMonthlyTotals,
  empiricalMean,
  totalDataCount,
  onSelectYear,
  onSelectMonth,
  onInspectAnomaly,
}: CalendarMatrixViewProps) {
  const displayedCalendarRows =
    selectedYear === 'all'
      ? rows
      : rows.filter((r) => r.yearBe.toString() === selectedYear);

  return (
    <table className="w-full text-xs text-left border-collapse">
      <thead>
        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
          <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 border-r border-slate-300 min-w-[70px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            ปี พ.ศ.
          </th>
          {THAI_MONTHS.map((m, idx) => {
            const monthNum = idx + 1;
            const isSelected = selectedMonth === monthNum;
            return (
              <th
                key={m}
                onClick={() => onSelectMonth(isSelected ? null : monthNum)}
                className={`py-2.5 px-2 text-right min-w-[76px] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-teal-100 text-teal-950 font-bold border-b-2 border-teal-700'
                    : 'font-medium text-slate-600 hover:bg-slate-200/80'
                }`}
                title={`คลิกเพื่อเน้นเฉพาะเดือน ${m}`}
              >
                {m}
              </th>
            );
          })}
          <th className="py-2.5 px-2 text-center border-l border-slate-300 min-w-[48px] font-medium text-slate-600">
            งวด
          </th>
          <th className="py-2.5 px-3 text-right bg-slate-200/60 border-l border-slate-300 min-w-[105px] font-bold text-slate-900">
            รวมทั้งปี
          </th>
          <th className="py-2.5 px-3 text-right bg-slate-100 border-l border-slate-300 min-w-[95px] font-semibold text-slate-700">
            เฉลี่ย/งวด
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 text-[11px]">
        {displayedCalendarRows.length === 0 ? (
          <tr>
            <td colSpan={15} className="py-8 text-center text-slate-500 font-medium">
              ไม่พบข้อมูลตามตัวกรองที่เลือก
            </td>
          </tr>
        ) : (
          displayedCalendarRows.map((row) => {
            const activeCount = row.recordedCount;
            const yearAvg = activeCount > 0 ? row.yearTotal / activeCount : 0;
            const isRowSelected = selectedYear === row.yearBe.toString();

            return (
              <tr
                key={row.yearBe}
                className={`transition-colors ${
                  isRowSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <td
                  onClick={() => onSelectYear(isRowSelected ? 'all' : row.yearBe.toString())}
                  className="py-2 px-3 font-bold font-mono text-slate-900 sticky left-0 bg-white hover:bg-slate-100 z-10 border-r border-slate-300 cursor-pointer shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
                  title="คลิกเพื่อกรองเฉพาะปีนี้"
                >
                  {row.yearBe}
                </td>

                {row.months.map((amt, idx) => {
                  const monthNum = idx + 1;
                  const isColSelected = selectedMonth === monthNum;

                  if (amt === null) {
                    return (
                      <td
                        key={idx}
                        className={`py-2 px-2 text-right font-mono text-slate-300 ${
                          isColSelected ? 'bg-teal-50/60' : ''
                        }`}
                      >
                        -
                      </td>
                    );
                  }

                  const isPeak = row.yearBe === maxYear && idx === maxMonthIndex;
                  const anomalyObj = anomalyMap.get(`${row.yearBe}-${monthNum}`);
                  const isStatOutlier = !!anomalyObj || amt >= statisticalOutlierThreshold;

                  let cellStyle = 'text-slate-800';
                  let badge = null;

                  if (isPeak) {
                    cellStyle = 'font-bold text-slate-950 bg-amber-100/90 cursor-pointer ring-1 ring-amber-400 inset-0';
                    badge = (
                      <span
                        title="ยอดสูงสุดในประวัติศาสตร์ (คลิกดูรายละเอียด)"
                        className="ml-1 text-[10px] text-amber-900 font-bold"
                      >
                        ⯁
                      </span>
                    );
                  } else if (isStatOutlier) {
                    cellStyle = 'font-semibold text-slate-900 bg-amber-50/80 cursor-pointer border-b border-amber-300';
                    badge = (
                      <span
                        title="ค่าเบี่ยงเบนทางสถิติ > 2 SD (คลิกดูรายละเอียด)"
                        className="ml-0.5 text-[9px] text-amber-800"
                      >
                        ⯁
                      </span>
                    );
                  } else if (isColSelected) {
                    cellStyle = 'bg-teal-50 font-semibold text-teal-950';
                  }

                  return (
                    <td
                      key={idx}
                      onClick={() => {
                        if (anomalyObj) {
                          onInspectAnomaly(anomalyObj);
                        } else {
                          onSelectMonth(isColSelected ? null : monthNum);
                        }
                      }}
                      className={`py-2 px-2 text-right font-mono tabular-nums transition-colors ${cellStyle}`}
                      title={anomalyObj ? 'คลิกเพื่อดูรายละเอียดการเบี่ยงเบนทางสถิติ' : 'คลิกเพื่อเน้นเดือนนี้'}
                    >
                      <span>{amt.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {badge}
                    </td>
                  );
                })}

                <td className="py-2 px-2 text-center font-mono text-slate-500 border-l border-slate-200">
                  {activeCount}
                </td>

                <td className="py-2 px-3 text-right font-mono font-bold text-slate-950 bg-slate-50/80 border-l border-slate-200 tabular-nums">
                  ฿{row.yearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                <td className="py-2 px-3 text-right font-mono font-medium text-slate-700 bg-slate-50/40 border-l border-slate-200 tabular-nums">
                  ฿{yearAvg.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })
        )}
      </tbody>

      <tfoot>
        <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900 text-[11px]">
          <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-mono shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            รวมทุกปี
          </td>
          {calMonthlyTotals.map((sum, idx) => (
            <td key={idx} className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-800">
              {sum > 0
                ? sum.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : '-'}
            </td>
          ))}
          <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-l border-slate-300">
            {totalDataCount}
          </td>
          <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-950 bg-slate-200/80 border-l border-slate-300 tabular-nums font-bold">
            ฿{rows.reduce((s, r) => s + r.yearTotal, 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-800 bg-slate-100 border-l border-slate-300 tabular-nums font-semibold">
            ฿{empiricalMean.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
