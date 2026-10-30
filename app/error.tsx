'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-xs p-6 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">เกิดข้อผิดพลาดในการประมวลผล</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            ระบบพบปัญหาชั่วคราวในการเรียกข้อมูล กรุณากดปุ่มลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-slate-400 mt-2">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navy-dark rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
}
