'use client';

import { Search, Filter, RotateCcw } from 'lucide-react';
import { THAI_MONTHS } from '@/lib/validations/record';
import type { FilteredSummary } from './records-types';

interface RecordsFilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFilterActive: boolean;
  onResetFilters: () => void;
  filteredCount: number;
  filteredSummary: FilteredSummary;
}

export function RecordsFilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  isFilterActive,
  onResetFilters,
  filteredCount,
  filteredSummary,
}: RecordsFilterToolbarProps) {
  return (
    <div className="p-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 bg-slate-50/70">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามปี, เดือน, จำนวนเงิน, หมายเหตุ..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors shadow-2xs"
          />
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs border border-slate-300 rounded-xs px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors shadow-2xs cursor-pointer"
          >
            <option value="all">ทุกเดือน (ม.ค. - ธ.ค.)</option>
            {THAI_MONTHS.map((m, idx) => (
              <option key={idx + 1} value={(idx + 1).toString()}>
                {idx + 1}. {m}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {isFilterActive && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Inline Summary */}
      <div className="flex items-center gap-2.5 text-xs text-slate-600 shrink-0 self-start lg:self-center font-mono bg-white px-2.5 py-1 rounded-xs border border-slate-300">
        <span>
          พบ <strong className="text-slate-900 font-bold">{filteredCount}</strong> รายการ
        </span>
        <span className="text-slate-300">|</span>
        <span>
          ยอดรวม:{' '}
          <strong className="text-slate-900 font-bold">
            ฿{filteredSummary.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </span>
        {filteredCount > 0 && (
          <>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              เฉลี่ย:{' '}
              <strong className="text-slate-800">
                ฿{filteredSummary.average.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
