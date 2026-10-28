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

      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Header / Sub-nav - Compact & Dense */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              แดชบอร์ดติดตามและวิเคราะห์ค่าไฟฟ้า
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              สำนักงานเขตสุขภาพที่ 7 ข้อมูลสะสมปี พ.ศ. 2562 ถึง ปัจจุบัน (2569)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export?format=xlsx"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              ส่งออก Excel (.xlsx)
            </a>
            <a
              href="/api/export?format=csv"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              ส่งออก CSV
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              จัดการข้อมูล
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Summary Cards (Compact 1 Row) */}
        <KPICards kpis={kpis} />

        {/* Section 2: Visual Charts (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MonthlyTrendChart data={monthlyTrends} />
          <YearlyComparisonChart data={yearlyComparison} />
        </div>

        {/* Section 3: Data Matrix Table */}
        <DataMatrixTable rows={matrixRows} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        ระบบติดตามและจัดการข้อมูลค่าไฟฟ้า สำนักงานเขตสุขภาพที่ 7 &bull; ข้อมูลจริงจากระบบฐานข้อมูล PostgreSQL
      </footer>
    </div>
  );
}
