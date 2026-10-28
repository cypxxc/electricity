'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-red-600 mb-3">
          <div className="p-2 bg-red-50 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            ยืนยันการลบข้อมูล
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลค่าไฟฟ้าประจำเดือน{' '}
          <strong className="text-slate-900 font-semibold">{monthName} พ.ศ. {recordToDelete.yearBe}</strong>{' '}
          (ยอดเงิน{' '}
          <span className="font-mono font-semibold text-slate-900">
            ฿{parseFloat(recordToDelete.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
          ) ?
        </p>
        <p className="text-[11px] text-red-500 mt-2">
          * การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>

        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-2xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              'ยืนยันการลบ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
