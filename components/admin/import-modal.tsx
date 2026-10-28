'use client';

import { useState, useRef } from 'react';
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

  function handleClose() {
    setFile(null);
    setError(null);
    setResult(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              นำเข้าข้อมูลจากไฟล์ Excel (.xlsx)
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                นำเข้าข้อมูลเสร็จสิ้น
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700">
                <li>พบข้อมูลทั้งหมด: <strong className="font-mono">{result.totalParsed}</strong> รายการ</li>
                <li>เพิ่มข้อมูลใหม่: <strong className="font-mono text-emerald-700">{result.inserted}</strong> รายการ</li>
                <li>เขียนทับข้อมูลเดิม: <strong className="font-mono text-blue-700">{result.updated}</strong> รายการ</li>
                <li>ข้ามรายการที่ซ้ำ: <strong className="font-mono text-amber-700">{result.skipped}</strong> รายการ</li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
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
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  file
                    ? 'border-blue-400 bg-blue-50/30'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                {file ? (
                  <div>
                    <span className="text-xs font-semibold text-blue-700">{file.name}</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ขนาด: {(file.size / 1024).toFixed(1)} KB (คลิกเพื่อเปลี่ยนไฟล์)
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-slate-700">
                      คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ Excel มาวางที่นี่
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      รองรับไฟล์ .xlsx เช่น &quot;สรุปค่าไฟฟ้า 62-69.xlsx&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Duplicate Strategy Option */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  กรณีพบข้อมูลประจำปีและเดือนที่ซ้ำกับในระบบ:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value="skip"
                      checked={strategy === 'skip'}
                      onChange={() => setStrategy('skip')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <strong className="font-medium text-slate-900">ข้ามรายการที่ซ้ำ (Skip duplicates)</strong> — แนะนำ เพื่อคงข้อมูลเดิมไว้
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value="overwrite"
                      checked={strategy === 'overwrite'}
                      onChange={() => setStrategy('overwrite')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <strong className="font-medium text-slate-900">เขียนทับข้อมูลเดิม (Overwrite)</strong> — อัปเดตยอดเงินตามไฟล์ที่นำเข้า
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || !file}
                  className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs disabled:opacity-50"
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
