import { Navbar } from '@/components/navbar';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { MonthlyTrendChart } from '@/components/dashboard/monthly-trend-chart';
import { YearlyComparisonChart } from '@/components/dashboard/yearly-comparison-chart';
import { DataMatrixTable } from '@/components/dashboard/data-matrix-table';
import {
  getDashboardKPIs,
  getMonthlyTrendData,
  getYearlyComparisonData,
  getYearMonthlyMatrix,
} from '@/lib/services/analytics';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';
import { Download, Shield, FileSpreadsheet, Sparkles, Building2 } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  const [kpis, monthlyTrends, yearlyComparison, matrixRows] = await Promise.all([
    getDashboardKPIs(),
    getMonthlyTrendData(),
    getYearlyComparisonData(),
    getYearMonthlyMatrix(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-900 antialiased">
      <Navbar user={session} />

      {/* Main Full-width Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Modern Full-width Header Bar */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/70">
                <Building2 className="w-3.5 h-3.5" />
                สำนักงานเขตสุขภาพที่ 7
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                ข้อมูลปี 2562 – 2569 ({kpis.totalRecordsCount} เดือน)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              แดชบอร์ดสรุปและวิเคราะห์ค่าไฟฟ้า
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              ติดตามสถิติการใช้ไฟฟ้า ค่าใช้จ่ายรายเดือน เปรียบเทียบรายปี และรายงานตารางแจกแจงแบบเต็มระบบ
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/api/export?format=xlsx"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ส่งออก Excel (.xlsx)
            </a>
            <a
              href="/api/export?format=csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-all"
            >
              <Download className="w-4 h-4 text-blue-600" />
              ส่งออก CSV
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow transition-all"
            >
              <Shield className="w-4 h-4" />
              จัดการข้อมูล Admin
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Cards */}
        <KPICards kpis={kpis} />

        {/* Section 2: Visual Charts (Two Wide Panels) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendChart data={monthlyTrends} />
          <YearlyComparisonChart data={yearlyComparison} />
        </div>

        {/* Section 3: Data Matrix Table (Full Width) */}
        <DataMatrixTable rows={matrixRows} />
      </main>

      {/* Modern Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>สำนักงานเขตสุขภาพที่ 7 &bull; ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า</span>
        <span className="text-slate-400">Next.js 16 App Router &bull; PostgreSQL &bull; Drizzle ORM</span>
      </footer>
    </div>
  );
}
