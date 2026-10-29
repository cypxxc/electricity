'use client';

import { useState } from 'react';
import { ImportModal } from './import-modal';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Download, UploadCloud, ChevronDown, FileText } from 'lucide-react';

interface AdminHeaderProps {
  totalRecords: number;
}

export function AdminHeader({ totalRecords }: AdminHeaderProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            ระบบจัดการฐานข้อมูลค่าไฟฟ้า (Database Administration)
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-slate-100 text-slate-700 rounded-xs border border-slate-300">
            ทั้งหมด {totalRecords} รายการ
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          บันทึก แก้ไข ตรวจสอบความสมบูรณ์ของงวดเดือน และนำเข้า/ส่งออกข้อมูลค่าไฟฟ้ารายเดือน
        </p>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto">
        {/* Import Excel Button */}
        <button
          onClick={() => setIsImportOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs shadow-2xs transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#0f2744]" />
          <span>นำเข้า Excel (.xlsx)</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออกข้อมูล</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isExportMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xs shadow-md py-1 z-30 text-xs"
              onMouseLeave={() => setIsExportMenuOpen(false)}
            >
              <a
                href="/api/export?format=xlsx"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>ส่งออกเป็น Excel (.xlsx)</span>
              </a>
              <a
                href="/api/export?format=csv"
                onClick={() => setIsExportMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>ส่งออกเป็น CSV (.csv)</span>
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
