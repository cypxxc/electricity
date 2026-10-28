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
import { Download, Shield, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  const [kpis, monthlyTrends, yearlyComparison, matrixRows] = await Promise.all([
    getDashboardKPIs(),
    getMonthlyTrendData(),
    getYearlyComparisonData(),
    getYearMonthlyMatrix(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar user={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header / Sub-nav */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              แดชบอร์ดติดตามและวิเคราะห์ค่าไฟฟ้า
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              สำนักงานเขตสุขภาพที่ 7 ข้อมูลสะสมปี พ.ศ. 2562 ถึง ปัจจุบัน (2569)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/api/export?format=xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              ส่งออก Excel (.xlsx)
            </a>
            <a
              href="/api/export?format=csv"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              ส่งออก CSV
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              จัดการข้อมูล
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Summary Cards */}
        <KPICards kpis={kpis} />

        {/* Section 2: Visual Charts (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendChart data={monthlyTrends} />
          <YearlyComparisonChart data={yearlyComparison} />
        </div>

        {/* Section 3: Data Matrix Table */}
        <DataMatrixTable rows={matrixRows} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 &bull; ข้อมูลจริงจากระบบฐานข้อมูล PostgreSQL
      </footer>
    </div>
  );
}
