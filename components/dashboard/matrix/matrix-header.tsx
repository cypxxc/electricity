'use client';

import { Building2, Calendar, RotateCcw } from 'lucide-react';
import { THAI_MONTHS } from '@/lib/validations/record';
import type { MatrixMode } from './matrix-types';

interface MatrixHeaderProps {
  matrixMode: MatrixMode;
  setMatrixMode: (mode: MatrixMode) => void;
  isFiltered: boolean;
  selectedYear: string;
  selectedMonth: number | null;
  onResetFilters: () => void;
}

export function MatrixHeader({
  matrixMode,
  setMatrixMode,
  isFiltered,
  selectedYear,
  selectedMonth,
  onResetFilters,
}: MatrixHeaderProps) {
  return (
    <>
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
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer ${
                matrixMode === 'fiscal'
                  ? 'bg-brand-navy text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3 h-3 text-teal-400" />
              <span>ปีงบประมาณ (ต.ค.–ก.ย.)</span>
            </button>
            <button
              type="button"
              onClick={() => setMatrixMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer ${
                matrixMode === 'calendar'
                  ? 'bg-brand-navy text-white shadow-2xs'
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
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
            className="text-teal-800 hover:text-teal-950 font-semibold underline text-[10.5px] cursor-pointer"
          >
            แสดงข้อมูลทั้งหมด
          </button>
        </div>
      )}
    </>
  );
}
