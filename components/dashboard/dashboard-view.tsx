'use client';

import { useState } from 'react';
import { DashboardAnalyticsData, AnomalyRecord } from '@/lib/services/analytics';
import { PeriodSelector } from './period-selector';
import { KPICards } from './kpi-cards';
import { TrendNarrativeBanner } from './trend-narrative';
import { ExpenditureTrendExplorer } from './expenditure-trend-explorer';
import { DataMatrixTable } from './data-matrix-table';
import { AnomalyModal } from './anomaly-modal';
import { ExportDropdown } from './export-dropdown';
import { PrintButton } from './print-button';

interface DashboardViewProps {
  analytics: DashboardAnalyticsData;
}

export function DashboardView({ analytics }: DashboardViewProps) {
  const kpis = analytics?.kpis;
  const monthlyTrends = analytics?.monthlyTrends || [];
  const fiscalYearComparison = analytics?.fiscalYearComparison || [];
  const matrixRows = analytics?.matrixRows || [];
  const anomalies = analytics?.anomalies || [];
  const narrative = analytics?.narrative;

  // Shared Interactive State linking Period Selector, KPI Cards, Graph, and Table
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [inspectedAnomaly, setInspectedAnomaly] = useState<AnomalyRecord | null>(null);

  // Active Fiscal Year summary when a specific year is selected
  const selectedFYSummary =
    selectedYear !== 'all'
      ? fiscalYearComparison.find((f) => f.fyBe.toString() === selectedYear) || null
      : null;

  function handleSelectPoint(yearBe: number, month: number) {
    setSelectedYear(yearBe.toString());
    setSelectedMonth(month);
  }

  function handleResetFilters() {
    setSelectedYear('all');
    setSelectedMonth(null);
  }

  function handleFilterMonthFromAnomaly(yearBe: number, month: number) {
    setSelectedYear(yearBe.toString());
    setSelectedMonth(month);
  }

  if (!kpis) return null;

  return (
    <div className="space-y-4">
      {/* 1. Unified Executive Scope Header & Master Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 sm:p-4 shadow-2xs space-y-3 break-inside-avoid">
        {/* Top: Title & Institutional Meta + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                รายงานสรุปและวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300">
                รอบปีงบประมาณ {kpis.firstFiscalYearBe || 2563} – {kpis.latestFiscalYearBe || 2569} ({kpis.totalRecordsCount} งวดบันทึก รวม {kpis.totalFiscalYearsCount || fiscalYearComparison.length} ปีงบประมาณ)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ข้อมูลการเบิกจ่ายค่าไฟฟ้าเฉพาะอาคารสำนักงานเขตสุขภาพที่ 7 ตามระบบปีงบประมาณไทย (1 ต.ค. – 30 ก.ย.)
            </p>
          </div>

          {/* Grouped Actions: Export & Print */}
          <div className="flex items-center gap-2 self-start lg:self-auto print:hidden">
            <ExportDropdown />
            <PrintButton />
          </div>
        </div>

        {/* Integrated Filter Strip */}
        <div className="pt-2.5 border-t border-slate-100">
          <PeriodSelector
            fiscalYears={fiscalYearComparison}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            onReset={handleResetFilters}
            totalRecordsCount={kpis.totalRecordsCount}
            variant="embedded"
          />
        </div>
      </div>

      {/* 2. Restrained Institutional KPI Summary (Synchronized with selected period) */}
      <KPICards
        kpis={kpis}
        selectedYear={selectedYear}
        selectedFYSummary={selectedFYSummary}
        fiscalYearComparison={fiscalYearComparison}
      />

      {/* 3. Compact Data-driven Trend Narrative (Synchronized with selected period) */}
      {narrative && (
        <TrendNarrativeBanner
          narrative={narrative}
          selectedYear={selectedYear}
          selectedFYSummary={selectedFYSummary}
        />
      )}

      {/* 4. Comprehensive Electricity Expenditure Trend Explorer (Monthly, Yearly, YoY Comparison) */}
      <ExpenditureTrendExplorer
        monthlyTrends={monthlyTrends}
        fiscalYearComparison={fiscalYearComparison}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelectPoint={handleSelectPoint}
        onSelectYear={setSelectedYear}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Detailed Linked Monthly & Yearly Expenditure Table */}
      <DataMatrixTable
        rows={matrixRows}
        fiscalRows={analytics?.fiscalMatrixRows || []}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        anomalies={anomalies}
        onSelectYear={setSelectedYear}
        onSelectMonth={setSelectedMonth}
        onInspectAnomaly={setInspectedAnomaly}
        onResetFilters={handleResetFilters}
      />

      {/* 6. Explainable Anomaly Inspector Modal */}
      <AnomalyModal
        anomaly={inspectedAnomaly}
        onClose={() => setInspectedAnomaly(null)}
        onFilterMonth={handleFilterMonthFromAnomaly}
      />
    </div>
  );
}
