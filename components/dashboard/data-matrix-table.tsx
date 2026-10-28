import { MatrixRow } from '@/lib/services/analytics';
import { THAI_MONTHS } from '@/lib/validations/record';
import { Table, Calendar } from 'lucide-react';

interface DataMatrixTableProps {
  rows: MatrixRow[];
}

export function DataMatrixTable({ rows }: DataMatrixTableProps) {
  // Calculate total of all years
  const grandTotal = rows.reduce((acc, row) => acc + row.yearTotal, 0);

  // Calculate monthly totals across all years
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
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
            ตารางสรุปข้อมูลค่าไฟฟ้ารายเดือนและรายปี (Data Matrix Breakdown)
          </h2>
        </div>
        <div className="flex items-center text-[11px] text-slate-500">
          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
          หน่วย: บาท (THB)
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2 px-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[70px]">
                ปี พ.ศ.
              </th>
              {THAI_MONTHS.map((m) => (
                <th key={m} className="py-2 px-2 text-right min-w-[65px]">
                  {m}
                </th>
              ))}
              <th className="py-2 px-3 text-right bg-slate-100/70 border-l border-slate-200 min-w-[100px] font-bold text-slate-900">
                รวมทั้งปี
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.yearBe} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/80 z-10 border-r border-slate-200 font-mono text-[11px]">
                  {row.yearBe}
                </td>
                {row.months.map((amt, idx) => (
                  <td
                    key={idx}
                    className={`py-2 px-2 text-right font-mono tabular-nums text-[11px] ${
                      amt === null
                        ? 'text-slate-300'
                        : amt > 60000
                        ? 'text-amber-700 font-medium'
                        : 'text-slate-700'
                    }`}
                  >
                    {amt !== null
                      ? amt.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '-'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50 border-l border-slate-200 tabular-nums text-[11px]">
                  ฿{row.yearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
              <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 font-mono text-[11px]">
                รวมทั้งหมด
              </td>
              {monthlyTotals.map((sum, idx) => (
                <td key={idx} className="py-2 px-2 text-right font-mono tabular-nums text-slate-800 text-[10px]">
                  {sum > 0
                    ? sum.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                    : '-'}
                </td>
              ))}
              <td className="py-2 px-3 text-right font-mono text-xs text-blue-700 bg-blue-50/50 border-l border-slate-200 tabular-nums font-bold">
                ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>หมายเหตุ: ยอดที่มีตัวเลขสีส้มเข้มคือเดือนที่ค่าไฟฟ้าเกิน 60,000 บาท</span>
        <span>สำนักงานเขตสุขภาพที่ 7</span>
      </div>
    </div>
  );
}
