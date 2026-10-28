'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
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
  const pageSize = 15;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ElectricityRecord | null>(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<ElectricityRecord | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return initialRecords.filter((r) => {
      // Year filter
      if (selectedYear !== 'all' && r.yearBe !== parseInt(selectedYear, 10)) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'all' && r.month !== parseInt(selectedMonth, 10)) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const yearStr = r.yearBe.toString();
        const monthName = (THAI_MONTHS[r.month - 1] || '').toLowerCase();
        const amountStr = r.amount.toString();
        const noteStr = (r.note || '').toLowerCase();

        return (
          yearStr.includes(q) ||
          monthName.includes(q) ||
          amountStr.includes(q) ||
          noteStr.includes(q)
        );
      }
      return true;
    });
  }, [initialRecords, selectedYear, selectedMonth, searchTerm]);

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

  function handleOpenCreate() {
    setEditingRecord(null);
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

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาตามปี, เดือน, ยอดเงิน, หมายเหตุ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">ทุกปี พ.ศ.</option>
              {distinctYears.map((y) => (
                <option key={y} value={y.toString()}>
                  พ.ศ. {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">ทุกเดือน</option>
            {THAI_MONTHS.map((m, idx) => (
              <option key={idx + 1} value={(idx + 1).toString()}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มข้อมูลใหม่
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">ปี พ.ศ.</th>
              <th className="py-3 px-4">เดือน</th>
              <th className="py-3 px-4 text-right">ยอดค่าไฟฟ้า (บาท)</th>
              <th className="py-3 px-4">หมายเหตุ</th>
              <th className="py-3 px-4">บันทึก/อัปเดตเมื่อ</th>
              <th className="py-3 px-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => {
                const monthName = THAI_MONTHS[r.month - 1] || `เดือน ${r.month}`;
                const amountFormatted = parseFloat(r.amount).toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const updatedDate = new Date(r.updatedAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 font-mono">
                      {r.yearBe}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {monthName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                      ฿{amountFormatted}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {r.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {updatedDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          title="แก้ไข"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(r)}
                          title="ลบ"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 bg-white">
        <div>
          แสดง{' '}
          <strong className="text-slate-800">
            {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          ถึง{' '}
          <strong className="text-slate-800">
            {Math.min(currentPage * pageSize, filteredRecords.length)}
          </strong>{' '}
          จากทั้งหมด <strong className="text-slate-800">{filteredRecords.length}</strong> รายการ
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-xs">
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={editingRecord}
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
