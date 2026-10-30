'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xs shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/20 cursor-pointer print:hidden"
      title="พิมพ์รายงานหรือบันทึกเป็น PDF (A4 แนวนอน)"
    >
      <Printer className="w-3.5 h-3.5 text-slate-600" />
      <span className="hidden sm:inline">พิมพ์รายงาน (Print)</span>
    </button>
  );
}
