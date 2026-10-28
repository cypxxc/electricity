'use client';

import { useState } from 'react';
import { THAI_MONTHS } from '@/lib/validations/record';
import { ElectricityRecord } from '@/lib/db/schema';
import { createRecordAction, updateRecordAction } from '@/app/admin/actions';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: ElectricityRecord | null;
  onSuccess: () => void;
}

export function RecordModal({ isOpen, onClose, recordToEdit, onSuccess }: RecordModalProps) {
  const isEditing = !!recordToEdit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      let res;
      if (isEditing && recordToEdit) {
        res = await updateRecordAction(recordToEdit.id, formData);
      } else {
        res = await createRecordAction(formData);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-900">
            {isEditing ? 'แก้ไขข้อมูลค่าไฟฟ้า' : 'เพิ่มข้อมูลค่าไฟฟ้าใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ปี พ.ศ. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="yearBe"
                required
                min={2500}
                max={2650}
                defaultValue={recordToEdit?.yearBe || 2569}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เดือน <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                required
                defaultValue={recordToEdit?.month || 1}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {THAI_MONTHS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1}. {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ยอดค่าไฟฟ้า (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              placeholder="เช่น 45200.75"
              defaultValue={recordToEdit?.amount || ''}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              หมายเหตุ (ถ้ามี)
            </label>
            <input
              type="text"
              name="note"
              placeholder="ระบุรายละเอียดเพิ่มเติม"
              defaultValue={recordToEdit?.note || ''}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : isEditing ? (
                'บันทึกการแก้ไข'
              ) : (
                'เพิ่มข้อมูล'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
