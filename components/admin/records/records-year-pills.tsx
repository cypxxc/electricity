'use client';

import { RefObject } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { THAI_MONTHS } from '@/lib/validations/record';
import { getFiscalYear } from '@/lib/utils/math';
import type { YearCompletenessInfo } from './records-types';

interface RecordsYearPillsProps {
  pillsRef: RefObject<HTMLDivElement | null>;
  totalRecordsCount: number;
  distinctYears: number[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  yearCompletenessMap: Map<number, YearCompletenessInfo>;
  dismissedYears: number[];
  activePopoverYear: number | null;
  setActivePopoverYear: (year: number | null) => void;
  onDismiss: (year: number) => void;
  onRestoreDismissed: () => void;
  onOpenCreate: (year?: number, month?: number) => void;
}

export function RecordsYearPills({
  pillsRef,
  totalRecordsCount,
  distinctYears,
  selectedYear,
  onSelectYear,
  yearCompletenessMap,
  dismissedYears,
  activePopoverYear,
  setActivePopoverYear,
  onDismiss,
  onRestoreDismissed,
  onOpenCreate,
}: RecordsYearPillsProps) {
  return (
    <div
      ref={pillsRef}
      className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 relative overflow-visible"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
          รอบปี:
        </span>

        {/* All Years Pill */}
        <button
          type="button"
          onClick={() => onSelectYear('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
            selectedYear === 'all'
              ? 'bg-[#0f2744] text-white border-[#0f2744] font-semibold shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>ภาพรวมทั้งหมด</span>
          <span
            className={`px-1.5 py-0.2 rounded-2xs text-[10px] font-mono ${
              selectedYear === 'all'
                ? 'bg-white/20 text-teal-200'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {totalRecordsCount} งวด
          </span>
        </button>

        {/* Specific Year Pills */}
        {distinctYears.map((y) => {
          const info = yearCompletenessMap.get(y);
          const isSelected = selectedYear === y.toString();
          const isIncomplete = info && !info.isComplete;
          const isDismissed = dismissedYears.includes(y);
          const showBadge = isIncomplete && !isDismissed;
          const isPopoverOpen = activePopoverYear === y;

          return (
            <div key={y} className="relative inline-flex items-center">
              <div
                className={`inline-flex items-center rounded-xs text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#0f2744] text-white border-[#0f2744] font-semibold shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectYear(y.toString())}
                  className={`px-3 py-1.5 cursor-pointer flex items-center gap-1.5 ${showBadge ? 'pr-1' : ''}`}
                >
                  <span>ปี {y}</span>
                </button>

                {/* Warning Trigger */}
                {showBadge && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopoverYear(isPopoverOpen ? null : y);
                    }}
                    onMouseEnter={() => setActivePopoverYear(y)}
                    className={`py-1.5 pr-2 pl-0.5 transition-colors flex items-center cursor-pointer ${
                      isSelected
                        ? 'text-amber-300 hover:text-white'
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                    title={`ปี ${y} ข้อมูลไม่ครบ 12 เดือน (คลิกดูรายละเอียด)`}
                    aria-label={`ข้อมูลปี ${y} ไม่ครบ`}
                  >
                    <span
                      className={`px-1 py-0.2 rounded-2xs text-[10px] font-mono flex items-center gap-0.5 ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{info?.recordedCount}/12</span>
                    </span>
                  </button>
                )}
              </div>

              {/* Popover */}
              {isPopoverOpen && info && (
                <div
                  onMouseEnter={() => setActivePopoverYear(y)}
                  onMouseLeave={() => setActivePopoverYear(null)}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 bg-white text-slate-900 rounded-xs p-3 shadow-lg border border-slate-300 z-50 text-left"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>ปี {y} ขาด {info.missingMonths.length} เดือน</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(y);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded-xs hover:bg-slate-100 font-medium transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="ซ่อนการแจ้งเตือนของปีนี้"
                    >
                      <X className="w-3 h-3" /> ซ่อน
                    </button>
                  </div>

                  <div className="py-2 text-[11px] text-slate-600 space-y-1">
                    <p>
                      สถานะ: บันทึกแล้ว <strong className="text-slate-900 font-mono">{info.recordedCount}/12</strong> เดือน
                    </p>
                    <p>
                      ยังขาด:{' '}
                      <span className="text-amber-800 font-medium">
                        {info.missingMonths.map((m) => THAI_MONTHS[m - 1]).join(', ')}
                      </span>
                    </p>
                    {info.recordedMonthsList && info.recordedMonthsList.length > 0 && (
                      <p className="text-[10px] text-teal-800 bg-teal-50 p-1.5 rounded-2xs border border-teal-200">
                        ℹ️ ข้อมูลที่บันทึก ({info.recordedCount} เดือน) สอดคล้องกับ{' '}
                        {Array.from(new Set(info.recordedMonthsList.map((m) => getFiscalYear(y, m))))
                          .map((fy) => `ปีงบประมาณ ${fy}`)
                          .join(' และ ')}
                      </p>
                    )}
                  </div>

                  {info.nextMissingMonth && (
                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopoverYear(null);
                          onOpenCreate(y, info.nextMissingMonth!);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0f2744] hover:bg-[#1e3a5f] border border-[#0f2744] rounded-xs transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
                      >
                        <Plus className="w-3 h-3" />
                        บันทึก {THAI_MONTHS[info.nextMissingMonth - 1]}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {dismissedYears.length > 0 && (
          <button
            type="button"
            onClick={onRestoreDismissed}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xs border border-slate-300 transition-colors ml-1 cursor-pointer"
            title="แสดงการแจ้งเตือนที่เคยถูกซ่อนไว้ทั้งหมด"
          >
            แสดงเตือน ({dismissedYears.length})
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenCreate()}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0f2744] hover:bg-[#1e3a5f] border border-[#0f2744] rounded-xs shadow-2xs transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
      >
        <Plus className="w-3.5 h-3.5 text-teal-400" />
        <span>เพิ่มข้อมูลใหม่</span>
      </button>
    </div>
  );
}
