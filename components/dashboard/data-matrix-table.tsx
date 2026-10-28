import { MatrixRow } from '@/lib/services/analytics';
import { THAI_MONTHS } from '@/lib/validations/record';
import { Table, Calendar, Info } from 'lucide-react';

interface DataMatrixTableProps {
  rows: MatrixRow[];
}

export function DataMatrixTable({ rows }: DataMatrixTableProps) {
  // Calculate total of all years
  const grandTotal = rows.reduce((acc, row) => acc + row.yearTotal, 0);

  // Calculate monthly totals and averages across all years
  const monthlyTotals = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);

  for (const row of rows) {
    row.months.forEach((amt, idx) => {
      if (amt !== null) {
        monthlyTotals[idx] += amt;
        monthlyCounts[idx] += 1;
      }
    });
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              ตารางแจกแจงค่าไฟฟ้ารายเดือนและรายปี (Data Matrix View)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สรุปตาราง 2 มิติ เปรียบเทียบข้อมูลย้อนหลัง 8 ปี (พ.ศ. 2562 – 2569) ครบทุกเดือน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>หน่วย: บาท (THB)</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-100 border border-amber-300" />
              &gt; 55,000฿
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-100 border border-red-300" />
              &gt; 70,000฿ (พีค)
            </span>
          </div>
        </div>
      </div>

      {/* Full-width responsive table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5 sticky left-0 bg-slate-50 z-20 border-r border-slate-200 min-w-[90px] shadow-xs">
                ปี พ.ศ.
              </th>
              {THAI_MONTHS.map((m) => (
                <th key={m} className="py-3 px-2 text-right min-w-[75px]">
                  {m}
                </th>
              ))}
              <th className="py-3 px-4 text-right bg-blue-50/60 border-l border-slate-200 min-w-[130px] font-bold text-blue-900">
                รวมทั้งปี (บาท)
              </th>
              <th className="py-3 px-3.5 text-right bg-slate-100/60 border-l border-slate-200 min-w-[110px] font-bold text-slate-800">
                เฉลี่ย/เดือน
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const avg = row.recordedCount > 0 ? row.yearTotal / row.recordedCount : 0;
              return (
                <tr key={row.yearBe} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-3.5 font-bold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                    <span className="font-mono text-sm">{row.yearBe}</span>
                  </td>
                  {row.months.map((amt, idx) => {
                    let cellStyle = 'text-slate-700';
                    let bgStyle = '';

                    if (amt !== null) {
                      if (amt > 70000) {
                        cellStyle = 'text-red-700 font-bold';
                        bgStyle = 'bg-red-50/40';
                      } else if (amt > 55000) {
                        cellStyle = 'text-amber-800 font-semibold';
                        bgStyle = 'bg-amber-50/30';
                      }
                    }

                    return (
                      <td
                        key={idx}
                        className={`py-3 px-2 text-right font-mono tabular-nums ${cellStyle} ${bgStyle}`}
                      >
                        {amt !== null
                          ? amt.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : <span className="text-slate-300">-</span>}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 bg-blue-50/30 border-l border-slate-200 tabular-nums text-xs">
                    ฿{row.yearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-700 bg-slate-50/30 border-l border-slate-200 tabular-nums">
                    ฿{avg.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
              <td className="py-3 px-3.5 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 font-mono text-sm">
                รวมสะสม
              </td>
              {monthlyTotals.map((sum, idx) => (
                <td key={idx} className="py-3 px-2 text-right font-mono tabular-nums text-slate-800 text-[11px]">
                  {sum > 0
                    ? sum.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                    : '-'}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono text-sm text-blue-700 bg-blue-100/60 border-l border-slate-300 tabular-nums font-bold">
                ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-3.5 text-right font-mono text-slate-800 bg-slate-200/50 border-l border-slate-300 tabular-nums font-bold">
                ฿{(grandTotal / 84).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>ยอดรวมทั้งหมด 84 ระเบียนคำนวณจากฐานข้อมูล PostgreSQL โดยตรง</span>
        </div>
        <span className="font-medium text-slate-600">สำนักงานเขตสุขภาพที่ 7 &bull; กระทรวงสาธารณสุข</span>
      </div>
    </div>
  );
}
