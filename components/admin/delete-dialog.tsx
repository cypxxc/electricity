'use client';

import { useState, useEffect } from 'react';
import { ElectricityRecord } from '@/lib/db/schema';
import { THAI_MONTHS } from '@/lib/validations/record';
import { deleteRecordAction } from '@/app/admin/actions';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordToDelete: ElectricityRecord | null;
  onSuccess: () => void;
}

export function DeleteDialog({
  isOpen,
  onClose,
  recordToDelete,
  onSuccess,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !recordToDelete) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, recordToDelete, onClose]);

  if (!isOpen || !recordToDelete) return null;

  const monthName = THAI_MONTHS[recordToDelete.month - 1] || `เดือน ${recordToDelete.month}`;

  async function handleDelete() {
    if (!recordToDelete) return;
    setLoading(true);
    setError(null);

    try {
      const res = await deleteRecordAction(recordToDelete.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-sm bg-white rounded-xs shadow-lg border border-slate-300 p-5">
        <div className="flex items-center gap-2.5 text-rose-700 mb-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 id="delete-dialog-title" className="text-sm font-bold text-slate-900">
            ยืนยันการลบระเบียนข้อมูล
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ต้องการลบข้อมูลค่าไฟฟ้าประจำเดือน{' '}
          <strong className="text-slate-900 font-semibold">{monthName} พ.ศ. {recordToDelete.yearBe}</strong>{' '}
          (ยอดเงิน{' '}
          <span className="font-mono font-semibold text-slate-900">
            ฿{parseFloat(recordToDelete.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
          ) หรือไม่?
        </p>
        <p className="text-[11px] text-rose-700 font-medium mt-2">
          * การดำเนินการนี้จะลบระเบียนออกจากฐานข้อมูลอย่างถาวร
        </p>

        {error && (
          <div className="mt-2.5 p-2 bg-rose-50 text-rose-700 text-xs rounded-xs border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xs border border-slate-300 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              'ยืนยันลบข้อมูล'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
