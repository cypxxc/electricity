'use client';

import { useState, useTransition, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
import { getFiscalYear, getFiscalQuarter } from '@/lib/utils/math';
import { RecordModal } from './record-modal';
import { DeleteDialog } from './delete-dialog';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  RotateCcw,
  X,
} from 'lucide-react';

interface RecordsTableProps {
  initialRecords: ElectricityRecord[];
  distinctYears: number[];
}

export function RecordsTable({ initialRecords, distinctYears }: RecordsTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Dismissed years state (which years the user chose to hide alerts for)
  const [dismissedYears, setDismissedYears] = useState<number[]>([]);
  const [activePopoverYear, setActivePopoverYear] = useState<number | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ElectricityRecord | null>(null);
  const [defaultYearToCreate, setDefaultYearToCreate] = useState<number | undefined>(undefined);
  const [defaultMonthToCreate, setDefaultMonthToCreate] = useState<number | undefined>(undefined);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<ElectricityRecord | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pillsRef.current && !pillsRef.current.contains(event.target as Node)) {
        setActivePopoverYear(null);
      }
    }
    if (activePopoverYear !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopoverYear]);

  // Completeness analysis for each distinct year
  const yearCompletenessMap = useMemo(() => {
    const map = new Map<
      number,
      {
        year: number;
        recordedCount: number;
        recordedMonthsList: number[];
        missingMonths: number[];
        nextMissingMonth: number | null;
        isComplete: boolean;
      }
    >();

    for (const y of distinctYears) {
      const yearRecords = initialRecords.filter((r) => r.yearBe === y);
      const recordedMonths = new Set(yearRecords.map((r) => r.month));
      const missingMonths: number[] = [];

      for (let m = 1; m <= 12; m++) {
        if (!recordedMonths.has(m)) {
          missingMonths.push(m);
        }
      }

      map.set(y, {
        year: y,
        recordedCount: recordedMonths.size,
        recordedMonthsList: Array.from(recordedMonths).sort((a, b) => a - b),
        missingMonths,
        nextMissingMonth: missingMonths.length > 0 ? missingMonths[0] : null,
        isComplete: missingMonths.length === 0,
      });
    }

    return map;
  }, [initialRecords, distinctYears]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return initialRecords.filter((rec) => {
      if (selectedYear !== 'all' && rec.yearBe.toString() !== selectedYear) {
        return false;
      }
      if (selectedMonth !== 'all' && rec.month.toString() !== selectedMonth) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const monthName = (THAI_MONTHS[rec.month - 1] || '').toLowerCase();
        const yearStr = rec.yearBe.toString();
        const amountStr = rec.amount.toString();
        const noteStr = (rec.note || '').toLowerCase();

        return (
          yearStr.includes(term) ||
          monthName.includes(term) ||
          amountStr.includes(term) ||
          noteStr.includes(term)
        );
      }
      return true;
    });
  }, [initialRecords, selectedYear, selectedMonth, searchTerm]);

  // Summary of filtered dataset
  const filteredSummary = useMemo(() => {
    let total = 0;
    let maxAmount = -Infinity;
    let maxMonth = '';

    for (const r of filteredRecords) {
      const amt = parseFloat(r.amount);
      total += amt;
      if (amt > maxAmount) {
        maxAmount = amt;
        maxMonth = `${THAI_MONTHS[r.month - 1]} ${r.yearBe}`;
      }
    }

    return {
      total,
      average: filteredRecords.length > 0 ? total / filteredRecords.length : 0,
      maxAmount,
      maxMonth,
    };
  }, [filteredRecords]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleOpenCreate(year?: number, month?: number) {
    setEditingRecord(null);
    setDefaultYearToCreate(year || (distinctYears[0] || new Date().getFullYear() + 543));
    setDefaultMonthToCreate(month || 1);
    setIsModalOpen(true);
  }

  function handleOpenEdit(rec: ElectricityRecord) {
    setEditingRecord(rec);
    setIsModalOpen(true);
  }

  function handleOpenDelete(rec: ElectricityRecord) {
    setDeletingRecord(rec);
    setIsDeleteDialogOpen(true);
  }

  const isFilterActive = searchTerm !== '' || selectedYear !== 'all' || selectedMonth !== 'all';

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedMonth('all');
    setCurrentPage(1);
  }

  function handleDismiss(year: number) {
    setDismissedYears((prev) => (prev.includes(year) ? prev : [...prev, year]));
    setActivePopoverYear(null);
  }

  function handleRestoreDismissed() {
    setDismissedYears([]);
  }

  return (
    <div className="space-y-3">
      {/* 1. Quick Year Pills */}
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
            onClick={() => {
              setSelectedYear('all');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-xs text-xs font-medium transition-colors shrink-0 ${
              selectedYear === 'all'
                ? 'bg-[#0f2744] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({initialRecords.length})
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
                  className={`inline-flex items-center rounded-xs text-xs font-medium transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#0f2744] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedYear(y.toString());
                      setCurrentPage(1);
                    }}
                    className={`pl-2.5 ${showBadge ? 'pr-1' : 'pr-2.5'} py-1`}
                  >
                    {y}
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
                      className={`p-1 pr-1.5 transition-colors flex items-center ${
                        isSelected
                          ? 'text-amber-300 hover:text-white'
                          : 'text-amber-600 hover:text-amber-800'
                      }`}
                      title={`ปี ${y} ข้อมูลไม่ครบ 12 เดือน (คลิกดูรายละเอียด)`}
                      aria-label={`ข้อมูลปี ${y} ไม่ครบ`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
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
                          handleDismiss(y);
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded-xs hover:bg-slate-100 font-medium transition-colors flex items-center gap-0.5"
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
                          ℹ️ ข้อมูลที่บันทึก ({info.recordedCount} เดือน) สอดคล้องกับ {Array.from(new Set(info.recordedMonthsList.map((m) => getFiscalYear(y, m)))).map((fy) => `ปีงบประมาณ ${fy}`).join(' และ ')}
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
                            handleOpenCreate(y, info.nextMissingMonth!);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#0f2744] hover:bg-[#1e3a5f] rounded-xs transition-colors shadow-2xs"
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
              onClick={handleRestoreDismissed}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline transition-colors ml-1"
              title="แสดงการแจ้งเตือนที่เคยถูกซ่อนไว้ทั้งหมด"
            >
              แสดงเตือน ({dismissedYears.length})
            </button>
          )}
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0f2744] hover:bg-[#1e3a5f] rounded-xs shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>เพิ่มข้อมูลใหม่</span>
        </button>
      </div>

      {/* 2. Controls & Table */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        {/* Controls Header */}
        <div className="p-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาตามปี, เดือน, จำนวนเงิน, หมายเหตุ..."
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors shadow-2xs"
              />
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-300 rounded-xs px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] transition-colors shadow-2xs"
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
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Inline Summary */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600 shrink-0 self-start lg:self-center font-mono bg-white px-2.5 py-1 rounded-xs border border-slate-300">
            <span>
              พบ <strong className="text-slate-900 font-bold">{filteredRecords.length}</strong> รายการ
            </span>
            <span className="text-slate-300">|</span>
            <span>
              ยอดรวม:{' '}
              <strong className="text-slate-900 font-bold">
                ฿{filteredSummary.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
            {filteredRecords.length > 0 && (
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

        {/* Table */}
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
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                    <p className="font-medium text-slate-700">ไม่พบระเบียนข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                    {isFilterActive && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0f2744] hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
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
                            onClick={() => handleOpenEdit(r)}
                            title="แก้ไขข้อมูล"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xs transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(r)}
                            title="ลบข้อมูล"
                            className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors"
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

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 bg-slate-50/70">
          <div>
            แสดง{' '}
            <strong className="text-slate-900 font-mono">
              {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            ถึง{' '}
            <strong className="text-slate-900 font-mono">
              {Math.min(currentPage * pageSize, filteredRecords.length)}
            </strong>{' '}
            จากทั้งหมด <strong className="text-slate-900 font-mono">{filteredRecords.length}</strong> รายการ
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-xs border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-xs font-semibold text-slate-800">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-xs border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={editingRecord}
        defaultYear={defaultYearToCreate}
        defaultMonth={defaultMonthToCreate}
        onSuccess={handleRefresh}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        recordToDelete={deletingRecord}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
