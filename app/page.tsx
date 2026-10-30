import { Navbar } from '@/components/navbar';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { getCachedDashboardAnalytics } from '@/lib/services/analytics';
import { getSession } from '@/lib/auth/session';

export default async function DashboardPage() {
  const [session, analytics] = await Promise.all([
    getSession(),
    getCachedDashboardAnalytics(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 print:bg-white">
      <Navbar user={session} />

      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 print:p-0 print:max-w-none print:w-full">
        {/* Coordinated Interactive Dashboard (KPIs, Narrative, Linked Charts, Audit Ledger, Anomaly Inspector) */}
        <DashboardView analytics={analytics} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-[1640px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>
            สำนักงานเขตสุขภาพที่ 7 &bull; กระทรวงสาธารณสุข
          </span>
          <span className="font-mono text-slate-400">
            ระบบสารสนเทศวิเคราะห์ค่าใช้จ่ายสาธารณูปโภคเฉพาะอาคารสำนักงาน
          </span>
        </div>
      </footer>
    </div>
  );
}
