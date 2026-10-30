import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xs p-6 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
          <FileQuestion className="w-6 h-6 text-brand-navy" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">404 - ไม่พบหน้าที่ท่านค้นหา</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            หน้าเอกสารหรือรายงานที่ท่านต้องการเข้าถึงอาจถูกย้าย หรือไม่มีอยู่ในระบบสารสนเทศค่าใช้จ่ายสาธารณูปโภค
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navy-dark rounded-xs shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับสู่แดชบอร์ดหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
