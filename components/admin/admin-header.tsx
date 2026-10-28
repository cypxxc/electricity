'use client';

import { useState } from 'react';
import { ImportModal } from './import-modal';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Download, UploadCloud, ChevronDown, ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  totalRecords: number;
}

export function AdminHeader({ totalRecords }: AdminHeaderProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            ระบบจัดการข้อมูล (Admin Management)
          </div>
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            ทั้งหมด {totalRecords} รายการ
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
          จัดการฐานข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          เพิ่ม แก้ไข ลบ ค้นหา และนำเข้า/ส่งออกข้อมูลค่าไฟฟ้ารายเดือนอย่างเป็นระบบ
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Import Excel Button */}
        <button
          onClick={() => setIsImportOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-all"
        >
          <UploadCloud className="w-4 h-4 text-blue-600" />
          นำเข้า Excel (.xlsx)
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            ส่งออกข้อมูล
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isExportMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-30"
              onMouseLeave={() => setIsExportMenuOpen(false)}
            >
              <a
                href="/api/export?format=xlsx"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                ส่งออกเป็น Excel (.xlsx)
              </a>
              <a
                href="/api/export?format=csv"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4 text-blue-600" />
                ส่งออกเป็น CSV (.csv)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
