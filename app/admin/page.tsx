import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { AdminHeader } from '@/components/admin/admin-header';
import { RecordsTable } from '@/components/admin/records-table';
import { getAllRecordsForExport, getDistinctYears } from '@/lib/services/records';

export const dynamic = 'force-dynamic';

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <AdminHeader totalRecords={records.length} />
        <RecordsTable initialRecords={records} distinctYears={distinctYears} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        ระบบจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 &bull; เข้าสู่ระบบในฐานะ {session.username} ({session.role})
      </footer>
    </div>
  );
}
