'use client';

import { Calendar, Pencil, Trash2, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
import { getFiscalYear, getFiscalQuarter } from '@/lib/utils/math';
import type { SortField, SortOrder } from './records-types';

interface RecordsTableViewProps {
  records: ElectricityRecord[];
  isFilterActive: boolean;
  onResetFilters: () => void;
  onOpenEdit: (record: ElectricityRecord) => void;
  onOpenDelete: (record: ElectricityRecord) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function RecordsTableView({
  records,
  isFilterActive,
  onResetFilters,
  onOpenEdit,
  onOpenDelete,
  sortField,
  sortOrder,
  onSort,
}: RecordsTableViewProps) {
  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-brand-navy shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-brand-navy shrink-0 font-bold" />
    );
  }

  function getAriaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    if (sortField !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  }

  return (
    <div className="overflow-x-auto table-scrollbar">
      <table className="w-full text-xs text-left border-collapse">
        <caption className="sr-only">ตารางข้อมูลค่าไฟฟ้าและรายการจัดการ</caption>
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
            <th scope="col" aria-sort={getAriaSort('period')} className="py-2.5 px-3">
              <button
                type="button"
                onClick={() => onSort('period')}
                className="group inline-flex items-center gap-1.5 hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-navy rounded-2xs"
                title="คลิกเพื่อเรียงลำดับตามงวดเวลา (ปี/เดือน)"
              >
                <span>งวดเวลา (ปี / เดือน)</span>
                {renderSortIcon('period')}
              </button>
            </th>
            <th scope="col" className="py-2.5 px-3">
              รอบปีงบประมาณ
            </th>
            <th scope="col" aria-sort={getAriaSort('amount')} className="py-2.5 px-3 text-right">
              <button
                type="button"
                onClick={() => onSort('amount')}
                className="group inline-flex items-center gap-1.5 ml-auto hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-navy rounded-2xs"
                title="คลิกเพื่อเรียงลำดับตามยอดเงิน"
              >
                <span>ยอดค่าไฟฟ้า (บาท)</span>
                {renderSortIcon('amount')}
              </button>
            </th>
            <th scope="col" className="py-2.5 px-3">
              หมายเหตุ
            </th>
            <th scope="col" aria-sort={getAriaSort('updatedAt')} className="py-2.5 px-3">
              <button
                type="button"
                onClick={() => onSort('updatedAt')}
                className="group inline-flex items-center gap-1.5 hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-navy rounded-2xs"
                title="คลิกเพื่อเรียงลำดับตามวันที่อัปเดต"
              >
                <span>อัปเดตเมื่อ</span>
                {renderSortIcon('updatedAt')}
              </button>
            </th>
            <th scope="col" className="py-2.5 px-3 text-center">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-[11px]">
          {records.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                <p className="font-medium text-slate-700">ไม่พบระเบียนข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
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
                  <td className="py-2 px-3 text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 font-mono w-10">
                        {r.yearBe}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {monthName}
                      </span>
                    </div>
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
                        aria-label={`แก้ไขข้อมูลค่าไฟเดือน ${monthName} พ.ศ. ${r.yearBe}`}
                        title={`แก้ไขข้อมูลเดือน ${monthName} ${r.yearBe}`}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-navy"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDelete(r)}
                        aria-label={`ลบข้อมูลค่าไฟเดือน ${monthName} พ.ศ. ${r.yearBe}`}
                        title={`ลบข้อมูลเดือน ${monthName} ${r.yearBe}`}
                        className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
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
