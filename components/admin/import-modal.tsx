'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  totalParsed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors?: string[];
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setFile(null);
    setError(null);
    setResult(null);
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  }

  async function handleImport() {
    if (!file) {
      setError('กรุณาเลือกไฟล์ Excel (.xlsx)');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('strategy', strategy);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }

      setResult(data);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการนำเข้า';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-xs shadow-lg border border-slate-300 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <h3 id="import-modal-title" className="text-xs sm:text-sm font-bold text-slate-900">
              นำเข้าข้อมูลจากไฟล์สเปรดชีต Excel (.xlsx)
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="p-3.5 bg-slate-50 border border-slate-300 text-slate-800 rounded-xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-sm text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                นำเข้าข้อมูลเสร็จสิ้น
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 font-mono text-[11px]">
                <li>พบข้อมูลทั้งหมด: <strong className="text-slate-900">{result.totalParsed}</strong> รายการ</li>
                <li>เพิ่มข้อมูลใหม่: <strong className="text-teal-800">{result.inserted}</strong> รายการ</li>
                <li>เขียนทับข้อมูลเดิม: <strong className="text-slate-800">{result.updated}</strong> รายการ</li>
                <li>ข้ามรายการที่ซ้ำ: <strong className="text-amber-800">{result.skipped}</strong> รายการ</li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 bg-[#0f2744] hover:bg-[#1e3a5f] border border-[#0f2744] text-white rounded-xs text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xs p-5 text-center cursor-pointer transition-colors ${
                  file
                    ? 'border-[#0f2744] bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-7 h-7 mx-auto text-slate-500 mb-1.5" />
                {file ? (
                  <div>
                    <span className="text-xs font-semibold text-slate-900 font-mono">{file.name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ขนาด: {(file.size / 1024).toFixed(1)} KB (คลิกเพื่อเปลี่ยนไฟล์)
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-slate-700">
                      คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel มาวางที่นี่
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      รองรับไฟล์ .xlsx เช่น แบบสรุปค่าไฟฟ้า 62-69.xlsx
                    </p>
                  </div>
                )}
              </div>

              {/* Duplicate Strategy Option */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  กรณีพบข้อมูลประจำปีและเดือนที่ตรงกับระเบียนเดิม:
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value="skip"
                      checked={strategy === 'skip'}
                      onChange={() => setStrategy('skip')}
                      className="text-[#0f2744]"
                    />
                    <span>
                      <strong className="font-medium text-slate-900">ข้ามรายการที่ซ้ำ (Skip duplicates)</strong> — คงข้อมูลเดิมไว้
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value="overwrite"
                      checked={strategy === 'overwrite'}
                      onChange={() => setStrategy('overwrite')}
                      className="text-[#0f2744]"
                    />
                    <span>
                      <strong className="font-medium text-slate-900">เขียนทับข้อมูลเดิม (Overwrite)</strong> — ปรับปรุงยอดตามไฟล์นำเข้า
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xs border border-slate-300 hover:border-slate-400 shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || !file}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0f2744] hover:bg-[#1e3a5f] border border-[#0f2744] rounded-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      กำลังนำเข้าข้อมูล...
                    </>
                  ) : (
                    'เริ่มนำเข้าข้อมูล'
                  )}
                </button>
              </div>
        </>
      )}
    </div>
  </div>
</div>
);
}
