'use client';

import { useState } from 'react';
import { MatrixRow, FiscalMatrixRow, AnomalyRecord } from '@/lib/services/analytics';
import { THAI_MONTHS } from '@/lib/validations/record';
import { FISCAL_MONTH_ORDER, THAI_FISCAL_MONTHS } from '@/lib/utils/math';
import { RotateCcw, AlertTriangle, Calendar, Building2 } from 'lucide-react';

interface DataMatrixTableProps {
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
  const [matrixMode, setMatrixMode] = useState<'fiscal' | 'calendar'>('fiscal');

  // Aggregate stats across calendar dataset
  const allAmounts: number[] = [];
  let maxAmount = -Infinity;
  let maxYear = 0;
  let maxMonthIndex = -1;

  for (const row of rows) {
    row.months.forEach((amt, idx) => {
      if (amt !== null) {
        allAmounts.push(amt);
        if (amt > maxAmount) {
          maxAmount = amt;
          maxYear = row.yearBe;
          maxMonthIndex = idx;
        }
      }
    });
  }

  const empiricalMean = allAmounts.length > 0
    ? allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length
    : 0;
  const empiricalVariance = allAmounts.length > 0
    ? allAmounts.reduce((a, b) => a + Math.pow(b - empiricalMean, 2), 0) / allAmounts.length
    : 0;
  const empiricalStdDev = Math.sqrt(empiricalVariance);
  const statisticalOutlierThreshold = empiricalMean + 2 * empiricalStdDev;

  // Anomaly lookup map: key = `${yearBe}-${month}`
  const anomalyMap = new Map<string, AnomalyRecord>();
  for (const a of anomalies) {
    anomalyMap.set(`${a.yearBe}-${a.month}`, a);
  }

  const isFiltered = selectedYear !== 'all' || selectedMonth !== null;

  // CALENDAR VIEW STATS
  const displayedCalendarRows = selectedYear === 'all'
    ? rows
    : rows.filter((r) => r.yearBe.toString() === selectedYear);

  const calMonthlyTotals = new Array(12).fill(0);
  for (const row of rows) {
    row.months.forEach((amt, idx) => {
      if (amt !== null) {
        calMonthlyTotals[idx] += amt;
      }
    });
  }

  // FISCAL VIEW STATS
  const displayedFiscalRows = selectedYear === 'all'
    ? fiscalRows
    : fiscalRows.filter((r) => r.fyBe.toString() === selectedYear);

  const fiscalMonthlyTotals = new Array(12).fill(0);
  for (const row of fiscalRows) {
    row.months.forEach((m, idx) => {
      if (m.amount !== null) {
        fiscalMonthlyTotals[idx] += m.amount;
      }
    });
  }

  const grandFiscalTotal = fiscalRows.reduce((acc, r) => acc + r.yearTotal, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
      {/* Table Section Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-slate-50/70">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              ตารางแจกแจงค่าไฟฟ้ารายเดือนและรอบปี (Expenditure Breakdown Matrix)
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">หน่วย: บาท (THB)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {matrixMode === 'fiscal'
              ? 'รอบปีงบประมาณไทยนับตั้งแต่ 1 ต.ค. (ปีก่อนหน้า) ถึง 30 ก.ย. (ปีงบประมาณ) • ข้อมูลครบถ้วน 12 เดือนทุกปี'
              : 'มุมมองตามปีปฏิทิน พ.ศ. (ม.ค. - ธ.ค.) ตามโครงสร้างไฟล์ Excel ต้นฉบับ'}
          </p>
        </div>

        {/* View Switcher & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          {/* Mode Segmented Button */}
          <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-100 shadow-2xs">
            <button
              type="button"
              onClick={() => setMatrixMode('fiscal')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors ${
                matrixMode === 'fiscal'
                  ? 'bg-[#0f2744] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3 h-3 text-teal-400" />
              <span>ปีงบประมาณ (ต.ค.–ก.ย.)</span>
            </button>
            <button
              type="button"
              onClick={() => setMatrixMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors ${
                matrixMode === 'calendar'
                  ? 'bg-[#0f2744] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>ปีปฏิทิน (ม.ค.–ธ.ค.)</span>
            </button>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xs transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Notification Bar */}
      {isFiltered && (
        <div className="px-4 py-1.5 bg-teal-50 border-b border-teal-200/80 flex items-center justify-between text-[11px] text-teal-900">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold">สถานะการเชื่อมโยง:</span>
            {selectedYear !== 'all' && (
              <span className="bg-teal-100/80 border border-teal-300 px-1.5 rounded-2xs">
                กรองปี: {matrixMode === 'fiscal' ? 'ปีงบ ' : 'พ.ศ. '}{selectedYear}
              </span>
            )}
            {selectedMonth !== null && (
              <span className="bg-teal-100/80 border border-teal-300 px-1.5 rounded-2xs">
                เน้นเดือน: {THAI_MONTHS[selectedMonth - 1]}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-teal-800 hover:text-teal-950 font-semibold underline text-[10.5px]"
          >
            แสดงข้อมูลทั้งหมด
          </button>
        </div>
      )}

      {/* Audit Matrix Table */}
      <div className="overflow-x-auto w-full table-scrollbar">
        {matrixMode === 'fiscal' ? (
          /* =========================================================================
             THAI FISCAL YEAR VIEW (1 Oct - 30 Sep, Named by next year B.E.)
             ========================================================================= */
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              {/* Quarter Super-Header */}
              <tr className="bg-slate-200/80 border-b border-slate-300 text-slate-800 font-semibold text-[10px] text-center uppercase tracking-wider">
                <th className="py-1 px-3 sticky left-0 bg-slate-200 z-20 border-r border-slate-300 text-left">
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
                <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 border-r border-slate-300 min-w-[110px]">
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
                        className="py-2 px-3 font-bold font-mono text-slate-900 sticky left-0 bg-white hover:bg-slate-100 z-10 border-r border-slate-300 cursor-pointer"
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
                            className={`py-2 px-2 text-right font-mono tabular-nums transition-colors ${cellStyle}`}
                            title={
                              anomalyObj
                                ? 'คลิกเพื่อดูรายละเอียดการเบี่ยงเบนทางสถิติ'
                                : `${m.monthName} ${m.yearBe} (ปีงบ ${row.fyBe})`
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
                <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-mono">
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
                  {allAmounts.length}
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
        ) : (
          /* =========================================================================
             CALENDAR YEAR VIEW (1 Jan - 31 Dec, Traditional Matrix)
             ========================================================================= */
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 border-r border-slate-300 min-w-[70px]">
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
                        className="py-2 px-3 font-bold font-mono text-slate-900 sticky left-0 bg-white hover:bg-slate-100 z-10 border-r border-slate-300 cursor-pointer"
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
                <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-mono">
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
                  {allAmounts.length}
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
        )}
      </div>

      {/* Audit Footnote & Provenance */}
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
