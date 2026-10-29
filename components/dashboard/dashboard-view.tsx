'use client';

import { useState } from 'react';
import { DashboardAnalyticsData, AnomalyRecord } from '@/lib/services/analytics';
import { PeriodSelector } from './period-selector';
import { KPICards } from './kpi-cards';
import { TrendNarrativeBanner } from './trend-narrative';
import { ExpenditureTrendExplorer } from './expenditure-trend-explorer';
import { DataMatrixTable } from './data-matrix-table';
import { AnomalyModal } from './anomaly-modal';

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
      {/* 1. Master Period Selector (Segmented Pills Above Summary Cards) */}
      <PeriodSelector
        fiscalYears={fiscalYearComparison}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onReset={handleResetFilters}
        totalRecordsCount={kpis.totalRecordsCount}
      />

      {/* 2. Restrained Institutional KPI Summary (Synchronized with selected period) */}
      <KPICards
        kpis={kpis}
        selectedYear={selectedYear}
        selectedFYSummary={selectedFYSummary}
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
