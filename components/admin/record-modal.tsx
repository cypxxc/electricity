'use client';

import { useState, useEffect } from 'react';
import { THAI_MONTHS } from '@/lib/validations/record';
import { ElectricityRecord } from '@/lib/db/schema';
import { createRecordAction, updateRecordAction } from '@/app/admin/actions';
import { getFiscalYear, getFiscalQuarter } from '@/lib/utils/math';
import { X, Loader2, AlertCircle, Building2 } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: ElectricityRecord | null;
  defaultYear?: number;
  defaultMonth?: number;
  onSuccess: () => void;
}

export function RecordModal({
  isOpen,
  onClose,
  recordToEdit,
  defaultYear,
  defaultMonth,
  onSuccess,
}: RecordModalProps) {
  const isEditing = !!recordToEdit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialYear = recordToEdit?.yearBe || defaultYear || (new Date().getFullYear() + 543);
  const initialMonth = recordToEdit?.month || defaultMonth || 1;

  const [inputYear, setInputYear] = useState<number>(initialYear);
  const [inputMonth, setInputMonth] = useState<number>(initialMonth);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fiscalYear = getFiscalYear(inputYear, inputMonth);
  const fiscalQuarter = getFiscalQuarter(inputMonth);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-xs shadow-lg border border-slate-300 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 id="record-modal-title" className="text-xs sm:text-sm font-bold text-slate-900">
              {isEditing ? 'แก้ไขระเบียนข้อมูลค่าไฟฟ้า' : 'เพิ่มระเบียนข้อมูลค่าไฟฟ้า'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isEditing ? `แก้ไขข้อมูลประจำปี พ.ศ. ${recordToEdit.yearBe}` : 'บันทึกยอดการใช้จ่ายค่าไฟฟ้ารายเดือน'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปี พ.ศ. (ปฏิทิน) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                name="yearBe"
                required
                min={2500}
                max={2650}
                value={inputYear}
                onChange={(e) => setInputYear(parseInt(e.target.value, 10) || initialYear)}
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เดือน <span className="text-rose-600">*</span>
              </label>
              <select
                name="month"
                required
                value={inputMonth}
                onChange={(e) => setInputMonth(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] shadow-2xs font-medium"
              >
                {THAI_MONTHS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1}. {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thai Fiscal Year Attribution Notification */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-semibold text-slate-900">การจัดสรรปีงบประมาณไทย:</span>
            </div>
            <div className="font-mono bg-white px-2 py-0.5 rounded-2xs border border-slate-300 text-teal-900 font-bold">
              ปีงบประมาณ {fiscalYear} ({fiscalQuarter.shortLabel})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยอดค่าไฟฟ้า (บาท) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              required
              placeholder="เช่น 45200.75"
              defaultValue={recordToEdit?.amount || ''}
              className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุประกอบรายการ
            </label>
            <input
              type="text"
              name="note"
              placeholder="ระบุข้อสังเกตหรือสาเหตุการใช้จ่าย (ถ้ามี)"
              defaultValue={recordToEdit?.note || ''}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0f2744] focus:border-[#0f2744] shadow-2xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xs border border-slate-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-[#0f2744] hover:bg-[#1e3a5f] rounded-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : isEditing ? (
                'บันทึกการแก้ไข'
              ) : (
                'บันทึกข้อมูล'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
