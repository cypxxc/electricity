'use client';

import { useMemo } from 'react';
import { FiscalYearComparisonItem } from '@/lib/services/analytics';
import { CalendarDays, RotateCcw, Filter } from 'lucide-react';

interface PeriodSelectorProps {
  fiscalYears: FiscalYearComparisonItem[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  onReset: () => void;
  totalRecordsCount: number;
}

export function PeriodSelector({
  fiscalYears,
  selectedYear,
  onSelectYear,
  onReset,
  totalRecordsCount,
}: PeriodSelectorProps) {
  // Sort fiscal years descending (newest first: 2569 -> 2563) to match executive reporting standards
  const sortedFiscalYears = useMemo(() => {
    return [...fiscalYears].sort((a, b) => b.fyBe - a.fyBe);
  }, [fiscalYears]);

  const maxFY = useMemo(() => {
    return fiscalYears.length > 0 ? Math.max(...fiscalYears.map((f) => f.fyBe)) : 2569;
  }, [fiscalYears]);

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs space-y-2.5">
      {/* Label and Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-800">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold tracking-tight">
              เลือกช่วงเวลาวิเคราะห์:
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedYear === 'all' ? (
              <span className="inline-flex items-center gap-1">
                <span>(แสดงภาพรวมสะสม {fiscalYears.length} ปีงบประมาณ รวม {totalRecordsCount} งวด)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-2xs border border-teal-200">
                <Filter className="w-3 h-3 text-teal-600" />
                <span>กำลังคำนวณเฉพาะ: ปีงบประมาณ {selectedYear}</span>
              </span>
            )}
          </span>
        </div>

        {selectedYear !== 'all' && (
          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 rounded-xs transition-colors self-start sm:self-auto cursor-pointer"
            title="ล้างตัวกรองและแสดงภาพรวมทั้งหมด"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>ล้างตัวกรอง (ดูภาพรวม)</span>
          </button>
        )}
      </div>

      {/* Segmented Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        {/* Option 1: ภาพรวมทั้งหมด */}
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
            {fiscalYears.length} ปี ({totalRecordsCount} งวด)
          </span>
        </button>

        {/* Options 2..N: Fiscal Years (sorted descending: 2569 down to 2563) */}
        {sortedFiscalYears.map((fy) => {
          const isSelected = selectedYear === fy.fyBe.toString();
          const isLatest = fy.fyBe === maxFY;

          return (
            <button
              key={fy.fyBe}
              type="button"
              onClick={() => onSelectYear(fy.fyBe.toString())}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#0f2744] text-white border-[#0f2744] font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>ปีงบ {fy.fyBe}</span>
              {isLatest ? (
                <span
                  className={`px-1.5 py-0.2 rounded-2xs text-[10px] font-mono font-medium ${
                    isSelected
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  ล่าสุด
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
