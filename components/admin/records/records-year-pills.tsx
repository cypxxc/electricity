'use client';

import { CalendarDays, Plus, RotateCcw, AlertCircle, Filter } from 'lucide-react';
import { THAI_MONTHS } from '@/lib/validations/record';
import type { YearCompletenessInfo } from './records-types';

interface RecordsYearPillsProps {
  pillsRef?: React.RefObject<HTMLDivElement | null>;
  totalRecordsCount: number;
  distinctYears: number[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  yearCompletenessMap: Map<number, YearCompletenessInfo>;
  dismissedYears?: number[];
  activePopoverYear?: number | null;
  setActivePopoverYear?: (year: number | null) => void;
  onDismiss?: (year: number) => void;
  onRestoreDismissed?: () => void;
  onOpenCreate: (year?: number, month?: number) => void;
}

export function RecordsYearPills({
  totalRecordsCount,
  distinctYears,
  selectedYear,
  onSelectYear,
  yearCompletenessMap,
  onOpenCreate,
}: RecordsYearPillsProps) {
  const selectedInfo = selectedYear !== 'all' ? yearCompletenessMap.get(Number(selectedYear)) : null;
  const isIncomplete = selectedInfo && !selectedInfo.isComplete;

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Label, Dropdown, Status Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-800">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            <label htmlFor="admin-year-selector" className="text-xs font-bold tracking-tight text-slate-800">
              เลือกรอบปี:
            </label>
          </div>

          <div className="relative">
            <select
              id="admin-year-selector"
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="text-xs font-semibold border border-slate-300 hover:border-slate-400 bg-white text-slate-800 rounded-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-navy shadow-2xs cursor-pointer transition-colors"
            >
              <option value="all">
                ภาพรวมทั้งหมด ({distinctYears.length} ปี • {totalRecordsCount} งวด)
              </option>
              {distinctYears.map((y) => {
                const info = yearCompletenessMap.get(y);
                const isComplete = info?.isComplete;
                return (
                  <option key={y} value={y.toString()}>
                    ปี พ.ศ. {y} {isComplete ? '(ครบ 12 งวด)' : `(${info?.recordedCount || 0}/12 งวด)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Badge */}
          {selectedYear === 'all' ? (
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline-flex items-center gap-1">
              (แสดงข้อมูลทั้งหมด {distinctYears.length} ปี รวม {totalRecordsCount} งวด)
            </span>
          ) : isIncomplete ? (
            <div className="inline-flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-2xs border border-amber-300">
              <span className="inline-flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  ปี {selectedYear} ขาด {selectedInfo.missingMonths.length} เดือน (
                  {selectedInfo.missingMonths.map((m) => THAI_MONTHS[m - 1]).join(', ')})
                </span>
              </span>
              {selectedInfo.nextMissingMonth && (
                <button
                  type="button"
                  onClick={() => onOpenCreate(Number(selectedYear), selectedInfo.nextMissingMonth ?? undefined)}
                  className="font-bold underline text-amber-900 hover:text-amber-950 cursor-pointer ml-1"
                >
                  + บันทึก {THAI_MONTHS[selectedInfo.nextMissingMonth - 1]}
                </button>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-2xs border border-teal-200">
              <Filter className="w-3 h-3 text-teal-600" />
              <span>กำลังจัดการข้อมูล: ปี พ.ศ. {selectedYear} (ครบ 12 เดือน)</span>
            </span>
          )}
        </div>

        {/* Right: Reset Action & Add Record Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {selectedYear !== 'all' && (
            <button
              onClick={() => onSelectYear('all')}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
              title="แสดงข้อมูลทุกปีทั้งหมด"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>ล้างตัวกรอง (ดูภาพรวม)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenCreate()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navy-light border border-brand-navy rounded-xs shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>เพิ่มข้อมูลใหม่</span>
          </button>
        </div>
      </div>
    </div>
  );
}
