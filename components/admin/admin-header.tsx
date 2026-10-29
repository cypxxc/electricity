'use client';

import { useState } from 'react';
import { ImportModal } from './import-modal';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { ExportDropdown } from '@/components/dashboard/export-dropdown';

interface AdminHeaderProps {
  totalRecords: number;
}

export function AdminHeader({ totalRecords }: AdminHeaderProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);

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
          type="button"
          onClick={() => setIsImportOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744]"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#0f2744]" />
          <span>นำเข้า Excel (.xlsx)</span>
        </button>

        {/* Export Dropdown (Unified with Dashboard) */}
        <ExportDropdown />
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
