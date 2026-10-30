'use client';

import { FiscalMatrixRow, AnomalyRecord } from '@/lib/services/analytics';
import { FISCAL_MONTH_ORDER, THAI_FISCAL_MONTHS } from '@/lib/utils/math';

interface FiscalMatrixViewProps {
  fiscalRows: FiscalMatrixRow[];
  selectedYear: string;
  selectedMonth: number | null;
  maxAmount: number;
  statisticalOutlierThreshold: number;
  anomalyMap: Map<string, AnomalyRecord>;
  fiscalMonthlyTotals: number[];
  grandFiscalTotal: number;
  empiricalMean: number;
  totalDataCount: number;
  onSelectYear: (year: string) => void;
  onSelectMonth: (month: number | null) => void;
  onInspectAnomaly: (anomaly: AnomalyRecord) => void;
}

export function FiscalMatrixView({
  fiscalRows,
  selectedYear,
  selectedMonth,
  maxAmount,
  statisticalOutlierThreshold,
  anomalyMap,
  fiscalMonthlyTotals,
  grandFiscalTotal,
  empiricalMean,
  totalDataCount,
  onSelectYear,
  onSelectMonth,
  onInspectAnomaly,
}: FiscalMatrixViewProps) {
  const displayedFiscalRows =
    selectedYear === 'all'
      ? fiscalRows
      : fiscalRows.filter((r) => r.fyBe.toString() === selectedYear);

  return (
    <table className="w-full text-xs text-left border-collapse">
      <thead>
        {/* Quarter Super-Header */}
        <tr className="bg-slate-200/80 border-b border-slate-300 text-slate-800 font-semibold text-[10px] text-center uppercase tracking-wider">
          <th className="py-1 px-3 sticky left-0 bg-slate-200 z-20 border-r border-slate-300 text-left shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            รอบงบประมาณ
          </th>
          <th colSpan={3} className="py-1 px-1 bg-amber-50/70 border-r border-slate-300 text-amber-950 font-bold">
            ไตรมาส 1 (ต.ค.–ธ.ค. ปีก่อน)
          </th>
          <th colSpan={3} className="py-1 px-1 bg-sky-50/70 border-r border-slate-300 text-sky-950 font-bold">
            ไตรมาส 2 (ม.ค.–มี.ค.)
          </th>
          <th colSpan={3} className="py-1 px-1 bg-teal-50/70 border-r border-slate-300 text-teal-950 font-bold">
            ไตรมาส 3 (เม.ย.–มิ.ย.)
          </th>
          <th colSpan={3} className="py-1 px-1 bg-emerald-50/70 border-r border-slate-300 text-emerald-950 font-bold">
            ไตรมาส 4 (ก.ค.–ก.ย.)
          </th>
          <th colSpan={3} className="py-1 px-2 bg-slate-200/80 text-slate-800 font-bold">
            สรุปผลรวมปีงบประมาณ
          </th>
        </tr>

        {/* Month Header Row */}
        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
          <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 border-r border-slate-300 min-w-[110px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            ปีงบประมาณ
          </th>
          {THAI_FISCAL_MONTHS.map((m, idx) => {
            const actualMonthNum = FISCAL_MONTH_ORDER[idx];
            const isSelected = selectedMonth === actualMonthNum;
            return (
              <th
                key={m}
                onClick={() => onSelectMonth(isSelected ? null : actualMonthNum)}
                className={`py-2 px-2 text-right min-w-[76px] cursor-pointer transition-colors ${
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
          <th className="py-2 px-2 text-center border-l border-slate-300 min-w-[48px] font-medium text-slate-600">
            งวด
          </th>
          <th className="py-2 px-3 text-right bg-slate-200/70 border-l border-slate-300 min-w-[110px] font-bold text-slate-950">
            รวมทั้งปีงบ
          </th>
          <th className="py-2 px-3 text-right bg-slate-100 border-l border-slate-300 min-w-[95px] font-semibold text-slate-700">
            เฉลี่ย/งวด
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 text-[11px]">
        {displayedFiscalRows.length === 0 ? (
          <tr>
            <td colSpan={16} className="py-8 text-center text-slate-500 font-medium">
              ไม่พบข้อมูลปีงบประมาณที่เลือก
            </td>
          </tr>
        ) : (
          displayedFiscalRows.map((row) => {
            const isRowSelected = selectedYear === row.fyBe.toString();

            return (
              <tr
                key={row.fyBe}
                className={`transition-colors ${
                  isRowSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                }`}
              >
                {/* Sticky FY Column */}
                <td
                  onClick={() => onSelectYear(isRowSelected ? 'all' : row.fyBe.toString())}
                  className="py-2 px-3 font-bold font-mono text-slate-900 sticky left-0 bg-white hover:bg-slate-100 z-10 border-r border-slate-300 cursor-pointer shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
                  title="คลิกเพื่อกรองเฉพาะปีงบประมาณนี้"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ปีงบ {row.fyBe}</span>
                  </div>
                </td>

                {/* 12 Fiscal Months (Oct - Sep) */}
                {row.months.map((m) => {
                  const isColSelected = selectedMonth === m.month;

                  if (m.amount === null) {
                    return (
                      <td
                        key={m.month}
                        className={`py-2 px-2 text-right font-mono text-slate-300 ${
                          isColSelected ? 'bg-teal-50/60' : ''
                        }`}
                      >
                        -
                      </td>
                    );
                  }

                  const isPeak = m.amount === maxAmount;
                  const anomalyObj = anomalyMap.get(`${m.yearBe}-${m.month}`);
                  const isStatOutlier = !!anomalyObj || m.amount >= statisticalOutlierThreshold;

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
                      key={m.month}
                      onClick={() => {
                        if (anomalyObj) {
                          onInspectAnomaly(anomalyObj);
                        } else {
                          onSelectMonth(isColSelected ? null : m.month);
                        }
                      }}
                      className={`py-2 px-2 text-right font-mono tabular-nums transition-colors cursor-pointer hover:bg-teal-50/80 ${cellStyle}`}
                      title={
                        anomalyObj
                          ? `ตรวจพบค่าเบี่ยงเบนทางสถิติ ฿${m.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (คลิกเพื่อดูรายละเอียด)`
                          : `${m.monthName} ${m.yearBe} (ปีงบ ${row.fyBe}): ฿${m.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (คลิกเพื่อเน้นงวดนี้)`
                      }
                    >
                      <span>{m.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {badge}
                    </td>
                  );
                })}

                {/* Recorded Months Count */}
                <td className="py-2 px-2 text-center font-mono text-slate-500 border-l border-slate-200">
                  {row.recordedCount}/12
                </td>

                {/* Fiscal Year Total */}
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-950 bg-slate-50/80 border-l border-slate-200 tabular-nums">
                  ฿{row.yearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                {/* Monthly Average */}
                <td className="py-2 px-3 text-right font-mono font-medium text-slate-700 bg-slate-50/40 border-l border-slate-200 tabular-nums">
                  ฿{row.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })
        )}
      </tbody>

      <tfoot>
        <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900 text-[11px]">
          <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-mono shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
            รวมทุกปีงบ
          </td>
          {fiscalMonthlyTotals.map((sum, idx) => (
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
            ฿{grandFiscalTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-800 bg-slate-100 border-l border-slate-300 tabular-nums font-semibold">
            ฿{empiricalMean.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
