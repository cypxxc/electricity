'use client';

import { useState } from 'react';
import { ImportModal } from './import-modal';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Download, UploadCloud, ChevronDown } from 'lucide-react';

interface AdminHeaderProps {
  totalRecords: number;
}

export function AdminHeader({ totalRecords }: AdminHeaderProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ระบบจัดการข้อมูลค่าไฟฟ้า (Admin Management)
          </h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            ทั้งหมด {totalRecords} รายการ
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          เพิ่ม แก้ไข ลบ ค้นหา และนำเข้า/ส่งออกข้อมูลค่าไฟฟ้ารายเดือน
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Import Excel Button */}
        <button
          onClick={() => setIsImportOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
          นำเข้า Excel (.xlsx)
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            ส่งออกข้อมูล
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {isExportMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30"
              onMouseLeave={() => setIsExportMenuOpen(false)}
            >
              <a
                href="/api/export?format=xlsx"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                ส่งออกเป็น Excel (.xlsx)
              </a>
              <a
                href="/api/export?format=csv"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
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
