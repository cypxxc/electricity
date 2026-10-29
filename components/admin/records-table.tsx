'use client';

import { useState, useTransition, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
import { RecordModal } from './record-modal';
import { DeleteDialog } from './delete-dialog';
import type {
  RecordsTableProps,
  YearCompletenessInfo,
  FilteredSummary,
} from './records/records-types';
import { RecordsYearPills } from './records/records-year-pills';
import { RecordsFilterToolbar } from './records/records-filter-toolbar';
import { RecordsTableView } from './records/records-table-view';
import { RecordsPagination } from './records/records-pagination';

export type { RecordsTableProps };

export function RecordsTable({ initialRecords, distinctYears }: RecordsTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Dismissed years state
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
    const map = new Map<number, YearCompletenessInfo>();

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
  const filteredSummary: FilteredSummary = useMemo(() => {
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
      <RecordsYearPills
        pillsRef={pillsRef}
        totalRecordsCount={initialRecords.length}
        distinctYears={distinctYears}
        selectedYear={selectedYear}
        onSelectYear={(y) => {
          setSelectedYear(y);
          setCurrentPage(1);
        }}
        yearCompletenessMap={yearCompletenessMap}
        dismissedYears={dismissedYears}
        activePopoverYear={activePopoverYear}
        setActivePopoverYear={setActivePopoverYear}
        onDismiss={handleDismiss}
        onRestoreDismissed={handleRestoreDismissed}
        onOpenCreate={handleOpenCreate}
      />

      {/* 2. Controls & Table */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        {/* Controls Header */}
        <RecordsFilterToolbar
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          selectedMonth={selectedMonth}
          setSelectedMonth={(month) => {
            setSelectedMonth(month);
            setCurrentPage(1);
          }}
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          filteredCount={filteredRecords.length}
          filteredSummary={filteredSummary}
        />

        {/* Table View */}
        <RecordsTableView
          records={paginatedRecords}
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />

        {/* Pagination Footer */}
        <RecordsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalFilteredRecords={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
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
