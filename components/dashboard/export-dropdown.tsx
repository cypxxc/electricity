'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, ChevronDown, FileText } from 'lucide-react';

export function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 rounded-xs shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2744] cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-slate-600" />
        <span>ส่งออกข้อมูล (Export)</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xs shadow-md py-1 z-30 text-xs"
          role="menu"
        >
          <div className="px-3 py-1 border-b border-slate-100 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            รูปแบบไฟล์รายงาน
          </div>
          <a
            href="/api/export?format=xlsx"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <div className="font-medium text-slate-800">Microsoft Excel (.xlsx)</div>
              <div className="text-[10px] text-slate-500">ตารางแยกปีและสรุปข้อมูล</div>
            </div>
          </a>
          <a
            href="/api/export?format=csv"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-600 shrink-0" />
            <div>
              <div className="font-medium text-slate-800">Comma-Separated (.csv)</div>
              <div className="text-[10px] text-slate-500">ข้อมูลแถวรายระเบียน (Raw data)</div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
