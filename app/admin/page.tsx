import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { AdminHeader } from '@/components/admin/admin-header';
import { RecordsTable } from '@/components/admin/records-table';
import { getAllRecordsForExport, getDistinctYears } from '@/lib/services/records';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [records, distinctYears] = await Promise.all([
    getAllRecordsForExport(),
    getDistinctYears(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar user={session} />

      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        <AdminHeader totalRecords={records.length} />
        <RecordsTable initialRecords={records} distinctYears={distinctYears} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-[1640px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>
            สำนักงานเขตสุขภาพที่ 7 &bull; ระบบจัดการฐานข้อมูลค่าใช้จ่ายสาธารณูปโภค (เข้าสู่ระบบโดย {session.username} - สิทธิ์: {session.role})
          </span>
          <span className="font-mono text-slate-400">
            Audit-Compliant Government Information System
          </span>
        </div>
      </footer>
    </div>
  );
}
