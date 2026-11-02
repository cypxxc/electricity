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
  variant?: 'card' | 'embedded';
}

export function PeriodSelector({
  fiscalYears,
  selectedYear,
  onSelectYear,
  onReset,
  totalRecordsCount,
  variant = 'card',
}: PeriodSelectorProps) {
  // Sort fiscal years descending (newest first: 2571 -> 2563) to match executive reporting standards
  const sortedFiscalYears = useMemo(() => {
    return [...fiscalYears].sort((a, b) => b.fyBe - a.fyBe);
  }, [fiscalYears]);

  const maxFY = useMemo(() => {
    return fiscalYears.length > 0 ? Math.max(...fiscalYears.map((f) => f.fyBe)) : 2569;
  }, [fiscalYears]);

  const content = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Label and Dropdown Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-800">
          <CalendarDays className="w-4 h-4 text-teal-600" />
          <label htmlFor="period-selector-year" className="text-xs font-bold tracking-tight text-slate-800">
            เลือกปีงบประมาณ:
          </label>
        </div>

        <div className="relative">
          <select
            id="period-selector-year"
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="text-xs font-semibold border border-slate-300 hover:border-slate-400 bg-white text-slate-800 rounded-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 shadow-2xs cursor-pointer transition-colors"
          >
            <option value="all">
              ทุกปีงบประมาณ ({fiscalYears.length} ปี • {totalRecordsCount} เดือน)
            </option>
            {sortedFiscalYears.map((fy) => {
              const isLatest = fy.fyBe === maxFY;
              return (
                <option key={fy.fyBe} value={fy.fyBe.toString()}>
                  ปีงบประมาณ {fy.fyBe} {isLatest ? '(ล่าสุด)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Indicator Badge */}
        {selectedYear === 'all' ? (
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline-flex items-center gap-1">
            (แสดงข้อมูลสะสม {fiscalYears.length} ปีงบประมาณ รวม {totalRecordsCount} เดือน)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-2xs border border-teal-200">
            <Filter className="w-3 h-3 text-teal-600" />
            <span>แสดงเฉพาะ: ปีงบประมาณ {selectedYear}</span>
          </span>
        )}
      </div>

      {/* Reset Filter Action (Visible when specific year is filtered) */}
      {selectedYear !== 'all' && (
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/20 print:hidden"
          title="แสดงข้อมูลทุกปีงบประมาณ"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>แสดงทุกปี (ดูภาพรวม)</span>
        </button>
      )}
    </div>
  );

  if (variant === 'embedded') {
    return content;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-3 shadow-2xs">
      {content}
    </div>
  );
}
