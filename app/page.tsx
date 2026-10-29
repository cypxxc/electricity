import { Navbar } from '@/components/navbar';
import { ExportDropdown } from '@/components/dashboard/export-dropdown';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { getCachedDashboardAnalytics } from '@/lib/services/analytics';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';
import { Database } from 'lucide-react';

export default async function DashboardPage() {
  const [session, analytics] = await Promise.all([
    getSession(),
    getCachedDashboardAnalytics(),
  ]);

  const { kpis } = analytics;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar user={session} />

      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Page Heading & Scope Bar */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                รายงานสรุปและวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10.5px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300">
                รอบปีงบประมาณ {kpis.firstFiscalYearBe || 2563} – {kpis.latestFiscalYearBe || 2569} ({kpis.totalRecordsCount} งวดบันทึก รวม {kpis.totalFiscalYearsCount || analytics.fiscalYearComparison.length} ปีงบประมาณ)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ข้อมูลการเบิกจ่ายค่าไฟฟ้าเฉพาะอาคารสำนักงานเขตสุขภาพที่ 7 ตามระบบปีงบประมาณไทย (1 ต.ค. – 30 ก.ย.)
            </p>
          </div>

          {/* Grouped Data Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <ExportDropdown />
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0f2744] hover:bg-[#1e3a5f] rounded-xs border border-[#0f2744] shadow-2xs transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>จัดการข้อมูล (Admin)</span>
            </Link>
          </div>
        </div>

        {/* Coordinated Interactive Dashboard (KPIs, Narrative, Linked Charts, Audit Ledger, Anomaly Inspector) */}
        <DashboardView analytics={analytics} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
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
