'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecordsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalFilteredRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function RecordsPagination({
  currentPage,
  totalPages,
  totalFilteredRecords,
  pageSize,
  onPageChange,
}: RecordsPaginationProps) {
  const startIndex = totalFilteredRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalFilteredRecords);

  return (
    <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 bg-slate-50/70">
      <div>
        แสดง <strong className="text-slate-900 font-mono">{startIndex}</strong> ถึง{' '}
        <strong className="text-slate-900 font-mono">{endIndex}</strong> จากทั้งหมด{' '}
        <strong className="text-slate-900 font-mono">{totalFilteredRecords}</strong> รายการ
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-1.5 rounded-xs border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-mono text-xs font-semibold text-slate-800">
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center p-1.5 rounded-xs border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
          title="หน้าถัดไป"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
