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
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-900 antialiased">
      <Navbar user={session} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AdminHeader totalRecords={records.length} />
        <RecordsTable initialRecords={records} distinctYears={distinctYears} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>ระบบจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 &bull; เข้าสู่ระบบในฐานะ {session.username} ({session.role})</span>
        <span className="text-slate-400">PostgreSQL Container &bull; Drizzle ORM</span>
      </footer>
    </div>
  );
}
