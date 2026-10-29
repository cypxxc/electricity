'use client';

import { Calendar, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
import { getFiscalYear, getFiscalQuarter } from '@/lib/utils/math';

interface RecordsTableViewProps {
  records: ElectricityRecord[];
  isFilterActive: boolean;
  onResetFilters: () => void;
  onOpenEdit: (record: ElectricityRecord) => void;
  onOpenDelete: (record: ElectricityRecord) => void;
}

export function RecordsTableView({
  records,
  isFilterActive,
  onResetFilters,
  onOpenEdit,
  onOpenDelete,
}: RecordsTableViewProps) {
  return (
    <div className="overflow-x-auto table-scrollbar">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
            <th className="py-2.5 px-3">ปี พ.ศ.</th>
            <th className="py-2.5 px-3">เดือน</th>
            <th className="py-2.5 px-3">รอบปีงบประมาณ</th>
            <th className="py-2.5 px-3 text-right">ยอดค่าไฟฟ้า (บาท)</th>
            <th className="py-2.5 px-3">หมายเหตุ</th>
            <th className="py-2.5 px-3">อัปเดตเมื่อ</th>
            <th className="py-2.5 px-3 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-[11px]">
          {records.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                <p className="font-medium text-slate-700">ไม่พบระเบียนข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>ล้างตัวกรองทั้งหมด</span>
                  </button>
                )}
              </td>
            </tr>
          ) : (
            records.map((r) => {
              const monthName = THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`;
              const fy = getFiscalYear(r.yearBe, r.month);
              const fq = getFiscalQuarter(r.month);
              const numAmount = parseFloat(r.amount);
              const amountFormatted = numAmount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const updatedDate = new Date(r.updatedAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-900 font-mono">
                    {r.yearBe}
                  </td>
                  <td className="py-2 px-3 text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {monthName}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[10.5px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-2xs text-slate-700">
                      ปีงบ {fy} &bull; {fq.shortLabel}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ฿{amountFormatted}
                  </td>
                  <td className="py-2 px-3 text-slate-500 max-w-xs truncate">
                    {r.note || '-'}
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono text-[10.5px]">
                    {updatedDate}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenEdit(r)}
                        title="แก้ไขข้อมูล"
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDelete(r)}
                        title="ลบข้อมูล"
                        className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
