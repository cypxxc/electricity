'use client';

import { useState, useMemo } from 'react';
import { calculatePercentageChange } from '@/lib/utils/math';
import { THAI_MONTHS } from '@/lib/validations/record';
import { RotateCcw } from 'lucide-react';
import type {
  ChartViewMode,
  ExpenditureTrendExplorerProps,
  MonthlyStats,
  YearlyStats,
  YoYStats,
  YoYComparisonRow,
  MonthlyViewDataItem,
  YearlyViewDataItem,
} from './explorer/explorer-types';
import { ExplorerToolbar } from './explorer/explorer-toolbar';
import { ExplorerSummaryCard } from './explorer/explorer-summary-card';
import { MonthlyTrendView } from './explorer/monthly-trend-view';
import { YearlyTrendView } from './explorer/yearly-trend-view';
import { YoYComparisonView } from './explorer/yoy-comparison-view';

export type { ChartViewMode };

export function ExpenditureTrendExplorer({
  monthlyTrends,
  fiscalYearComparison,
  selectedYear,
  selectedMonth,
  onSelectPoint,
  onSelectYear,
  onResetFilters,
}: ExpenditureTrendExplorerProps) {
  // 1. Chart View Mode (Default: Yearly Trend as requested)
  const [viewMode, setViewMode] = useState<ChartViewMode>('yearly');

  // Distinct Calendar Years (2569, 2568, ... 2562)
  const availableYears = useMemo(() => {
    return Array.from(new Set(monthlyTrends.map((r) => r.yearBe))).sort((a, b) => b - a);
  }, [monthlyTrends]);

  // 2. Monthly Trend Controls
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<string>(
    availableYears[0]?.toString() || 'all'
  );
  const [monthlyMetric, setMonthlyMetric] = useState<'amount' | 'cumulative'>('amount');

  // 3. Yearly Trend Controls
  const [yearlyRange, setYearlyRange] = useState<'5' | 'all'>('all');
  const [yearlyMetric, setYearlyMetric] = useState<'total' | 'average'>('total');

  // 4. YoY Comparison Controls
  const [yoyPrimaryYear, setYoyPrimaryYear] = useState<number>(availableYears[0] || 2569);
  const [yoyBenchmarkYear, setYoyBenchmarkYear] = useState<number>(availableYears[1] || 2568);
  const [yoyChartType, setYoyChartType] = useState<'bar' | 'line'>('bar');

  // Synchronize with external selectedYear filter
  const [prevSelectedYear, setPrevSelectedYear] = useState<string>(selectedYear);
  if (selectedYear !== prevSelectedYear) {
    setPrevSelectedYear(selectedYear);
    if (selectedYear !== 'all') {
      const yrNum = parseInt(selectedYear, 10);
      if (availableYears.includes(yrNum)) {
        setSelectedCalendarYear(selectedYear);
        setYoyPrimaryYear(yrNum);
        if (availableYears.includes(yrNum - 1)) {
          setYoyBenchmarkYear(yrNum - 1);
        }
      }
    }
  }

  // System Historical Mean across all records
  const overallHistoricalAverage = useMemo(() => {
    if (monthlyTrends.length === 0) return 0;
    return monthlyTrends.reduce((s, r) => s + r.amount, 0) / monthlyTrends.length;
  }, [monthlyTrends]);

  // View 1: Monthly Trend Data
  const monthlyViewData: MonthlyViewDataItem[] = useMemo(() => {
    if (selectedCalendarYear === 'all') {
      return monthlyTrends.map((r) => ({
        ...r,
        displayLabel: r.periodLabel,
        metricValue: monthlyMetric === 'amount' ? r.amount : r.cumulativeFiscalAmount,
      }));
    }

    const yearNum = parseInt(selectedCalendarYear, 10);
    const items = monthlyTrends
      .filter((r) => r.yearBe === yearNum)
      .sort((a, b) => a.month - b.month);

    let runningSum = 0;
    return items.map((r) => {
      runningSum += r.amount;
      return {
        ...r,
        displayLabel: THAI_MONTHS[r.month - 1],
        metricValue: monthlyMetric === 'amount' ? r.amount : runningSum,
      };
    });
  }, [monthlyTrends, selectedCalendarYear, monthlyMetric]);

  const monthlyStats: MonthlyStats = useMemo(() => {
    if (monthlyViewData.length === 0) {
      return { total: 0, avg: 0, maxMonth: null, minMonth: null, count: 0 };
    }

    let total = 0;
    let maxAmt = -Infinity;
    let minAmt = Infinity;
    let maxMonthName = '';
    let minMonthName = '';

    for (const m of monthlyViewData) {
      const amt = m.amount;
      total += amt;
      if (amt > maxAmt) {
        maxAmt = amt;
        maxMonthName = m.fullLabel;
      }
      if (amt < minAmt) {
        minAmt = amt;
        minMonthName = m.fullLabel;
      }
    }

    return {
      total,
      avg: total / monthlyViewData.length,
      maxMonth: { name: maxMonthName, amount: maxAmt },
      minMonth: { name: minMonthName, amount: minAmt },
      count: monthlyViewData.length,
    };
  }, [monthlyViewData]);

  // View 2: Yearly Trend Data
  const yearlyViewData: YearlyViewDataItem[] = useMemo(() => {
    let list = [...fiscalYearComparison];
    if (yearlyRange === '5') {
      list = list.slice(-5);
    }
    return list.map((f) => ({
      ...f,
      label: `ปีงบ ${f.fyBe}`,
      metricValue: yearlyMetric === 'total' ? f.totalAmount : Math.round(f.averageMonthly),
    }));
  }, [fiscalYearComparison, yearlyRange, yearlyMetric]);

  const yearlyStats: YearlyStats = useMemo(() => {
    if (fiscalYearComparison.length === 0) {
      return { total: 0, avg: 0, maxYear: null, minYear: null, latestYoY: null };
    }

    let grand = 0;
    let maxTotal = -Infinity;
    let minTotal = Infinity;
    let maxYearNum = 0;
    let minYearNum = 0;

    for (const f of fiscalYearComparison) {
      grand += f.totalAmount;
      if (f.totalAmount > maxTotal) {
        maxTotal = f.totalAmount;
        maxYearNum = f.fyBe;
      }
      if (f.totalAmount < minTotal) {
        minTotal = f.totalAmount;
        minYearNum = f.fyBe;
      }
    }

    const latest = fiscalYearComparison[fiscalYearComparison.length - 1];

    return {
      total: grand,
      avg: grand / fiscalYearComparison.length,
      maxYear: { year: maxYearNum, amount: maxTotal },
      minYear: { year: minYearNum, amount: minTotal },
      latestYoY: latest ? { rate: latest.yoyChangeRate, amount: latest.yoyChangeAmount, year: latest.fyBe } : null,
    };
  }, [fiscalYearComparison]);

  // View 3: YoY Comparison Data
  const yoyComparisonData: YoYComparisonRow[] = useMemo(() => {
    const primaryYearRecords = monthlyTrends.filter((r) => r.yearBe === yoyPrimaryYear);
    const benchmarkYearRecords = monthlyTrends.filter((r) => r.yearBe === yoyBenchmarkYear);

    const primaryMap = new Map<number, number>();
    for (const r of primaryYearRecords) {
      primaryMap.set(r.month, r.amount);
    }

    const benchmarkMap = new Map<number, number>();
    for (const r of benchmarkYearRecords) {
      benchmarkMap.set(r.month, r.amount);
    }

    return Array.from({ length: 12 }, (_, idx) => {
      const monthNum = idx + 1;
      const monthShort = THAI_MONTHS[idx];
      const primaryAmt = primaryMap.get(monthNum) ?? null;
      const benchmarkAmt = benchmarkMap.get(monthNum) ?? null;

      let diff: number | null = null;
      let pct: number | null = null;

      if (primaryAmt !== null && benchmarkAmt !== null) {
        diff = primaryAmt - benchmarkAmt;
        pct = calculatePercentageChange(primaryAmt, benchmarkAmt);
      }

      return {
        month: monthNum,
        monthName: monthShort,
        primaryAmount: primaryAmt,
        benchmarkAmount: benchmarkAmt,
        diff,
        pct,
      };
    });
  }, [monthlyTrends, yoyPrimaryYear, yoyBenchmarkYear]);

  const yoyStats: YoYStats = useMemo(() => {
    let primarySum = 0;
    let benchmarkSum = 0;
    let comparedMonthsCount = 0;
    let maxIncrease: { monthName: string; diff: number; pct: number } | null = null;
    let maxDecrease: { monthName: string; diff: number; pct: number } | null = null;

    let maxIncVal = -Infinity;
    let maxDecVal = Infinity;

    for (const row of yoyComparisonData) {
      if (row.primaryAmount !== null && row.benchmarkAmount !== null) {
        primarySum += row.primaryAmount;
        benchmarkSum += row.benchmarkAmount;
        comparedMonthsCount += 1;

        if (row.diff !== null && row.pct !== null) {
          if (row.diff > maxIncVal) {
            maxIncVal = row.diff;
            maxIncrease = { monthName: row.monthName, diff: row.diff, pct: row.pct };
          }
          if (row.diff < maxDecVal) {
            maxDecVal = row.diff;
            maxDecrease = { monthName: row.monthName, diff: row.diff, pct: row.pct };
          }
        }
      }
    }

    const netDiff = primarySum - benchmarkSum;
    const netPct = calculatePercentageChange(primarySum, benchmarkSum);

    return {
      primarySum,
      benchmarkSum,
      comparedMonthsCount,
      netDiff,
      netPct,
      maxIncrease,
      maxDecrease,
    };
  }, [yoyComparisonData]);

  // Dynamic Analytical Summary Formulation
  const analyticalNarrativeText = useMemo(() => {
    const minCalYear = availableYears[availableYears.length - 1] || 2562;
    const maxCalYear = availableYears[0] || 2569;
    const minFY = fiscalYearComparison[0]?.fyBe || 2563;
    const maxFY = fiscalYearComparison[fiscalYearComparison.length - 1]?.fyBe || 2569;

    if (viewMode === 'monthly') {
      if (selectedCalendarYear === 'all') {
        return `แสดงข้อมูลค่าใช้จ่ายไฟฟ้ารายเดือนต่อเนื่อง ${monthlyTrends.length} งวดบันทึก (ปี พ.ศ. ${minCalYear} – ${maxCalYear}) ยอดรวมสะสม ฿${monthlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ค่าเฉลี่ยระบบอยู่ที่ ฿${overallHistoricalAverage.toLocaleString('th-TH', { maximumFractionDigits: 0 })}/งวด`;
      }
      return `ปี พ.ศ. ${selectedCalendarYear}: แสดงรายเดือน (ม.ค. - ธ.ค. ของปีนั้นๆ) รวม ${monthlyStats.count} เดือน ยอดค่าใช้จ่ายรวม ฿${monthlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (เฉลี่ย ฿${monthlyStats.avg.toLocaleString('th-TH', { maximumFractionDigits: 0 })}/เดือน) โดยเดือนที่ใช้จ่ายสูงสุดคือ ${monthlyStats.maxMonth?.name} (฿${(monthlyStats.maxMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}) และต่ำสุดคือ ${monthlyStats.minMonth?.name} (฿${(monthlyStats.minMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })})`;
    }

    if (viewMode === 'yearly') {
      const dirText = (yearlyStats.latestYoY?.rate || 0) < 0 ? 'ปรับลดลงต่อเนื่อง' : 'ปรับตัวเพิ่มขึ้น';
      return `ภาพรวมค่าใช้จ่ายไฟฟ้ารายปีงบประมาณ (${yearlyRange === '5' ? '5 ปีล่าสุด' : `ทุกปีงบ ${minFY} - ${maxFY}`}): มียอดเบิกจ่ายรวม ฿${yearlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} โดยปีงบประมาณ ${yearlyStats.maxYear?.year} มียอดสูงสุด (฿${(yearlyStats.maxYear?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}) และปีงบประมาณ ${yearlyStats.latestYoY?.year} ล่าสุดมียอด ${dirText} ${Math.abs(yearlyStats.latestYoY?.rate || 0).toFixed(1)}% เมื่อเทียบกับปีงบก่อนหน้า`;
    }

    // YoY Mode
    const netDir = (yoyStats.netDiff || 0) > 0 ? 'เพิ่มขึ้น' : 'ลดลง';
    const decText = yoyStats.maxDecrease
      ? `เดือน ${yoyStats.maxDecrease.monthName} ลดลงมากที่สุด (${Math.abs(yoyStats.maxDecrease.pct).toFixed(1)}% / -฿${Math.abs(yoyStats.maxDecrease.diff).toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
      : '';
    const incText = yoyStats.maxIncrease && yoyStats.maxIncrease.diff > 0
      ? `เดือน ${yoyStats.maxIncrease.monthName} เพิ่มขึ้นมากที่สุด (+${yoyStats.maxIncrease.pct.toFixed(1)}% / +฿${yoyStats.maxIncrease.diff.toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
      : '';

    return `เปรียบเทียบรายเดือน (ม.ค. - ธ.ค. ของปีนั้นๆ) ระหว่างปี พ.ศ. ${yoyPrimaryYear} กับปี พ.ศ. ${yoyBenchmarkYear}: ยอดรวม${netDir} ${Math.abs(yoyStats.netPct || 0).toFixed(1)}% (${(yoyStats.netDiff || 0) > 0 ? '+' : '-'}฿${Math.abs(yoyStats.netDiff || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })}) ในช่วง ${yoyStats.comparedMonthsCount} เดือนที่มีข้อมูลตรงกัน โดย ${decText} ${incText ? `และ ${incText}` : ''}`;
  }, [
    viewMode,
    selectedCalendarYear,
    monthlyStats,
    overallHistoricalAverage,
    yearlyStats,
    yearlyRange,
    yoyPrimaryYear,
    yoyBenchmarkYear,
    yoyStats,
    availableYears,
    fiscalYearComparison,
    monthlyTrends.length,
  ]);

  // Click handler on chart elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleElementClick(e: any) {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const payload = e.activePayload[0].payload;
      if (viewMode === 'monthly') {
        if (onSelectPoint && payload.yearBe && payload.month) {
          onSelectPoint(payload.yearBe, payload.month);
        }
      } else if (viewMode === 'yearly') {
        if (onSelectYear && payload.fyBe) {
          onSelectYear(payload.fyBe.toString());
        }
      } else if (viewMode === 'yoy') {
        if (onSelectPoint && payload.month) {
          onSelectPoint(yoyPrimaryYear, payload.month);
        }
      }
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3.5">
      {/* 1. Header Toolbar */}
      <ExplorerToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        availableYears={availableYears}
        selectedCalendarYear={selectedCalendarYear}
        setSelectedCalendarYear={setSelectedCalendarYear}
        monthlyMetric={monthlyMetric}
        setMonthlyMetric={setMonthlyMetric}
        yearlyRange={yearlyRange}
        setYearlyRange={setYearlyRange}
        yearlyMetric={yearlyMetric}
        setYearlyMetric={setYearlyMetric}
        yoyPrimaryYear={yoyPrimaryYear}
        setYoyPrimaryYear={setYoyPrimaryYear}
        yoyBenchmarkYear={yoyBenchmarkYear}
        setYoyBenchmarkYear={setYoyBenchmarkYear}
        yoyChartType={yoyChartType}
        setYoyChartType={setYoyChartType}
        totalFiscalYearsCount={fiscalYearComparison.length}
      />

      {/* 2. Dynamic Analytical Summary Card */}
      <ExplorerSummaryCard
        viewMode={viewMode}
        monthlyStats={monthlyStats}
        yearlyStats={yearlyStats}
        yoyStats={yoyStats}
        analyticalNarrativeText={analyticalNarrativeText}
      />

      {/* 3. Filter State / Linking Indicator Bar */}
      {(selectedYear !== 'all' || selectedMonth !== null) && (
        <div className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xs flex items-center justify-between text-[11px] text-teal-900 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold">ตัวกรองตารางที่เลือก:</span>
            {selectedYear !== 'all' && (
              <span className="bg-teal-100 border border-teal-300 px-1.5 rounded-2xs">
                ปี {selectedYear}
              </span>
            )}
            {selectedMonth !== null && (
              <span className="bg-teal-100 border border-teal-300 px-1.5 rounded-2xs">
                เดือน {THAI_MONTHS[selectedMonth - 1]}
              </span>
            )}
          </div>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-semibold underline text-[10.5px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      )}

      {/* 4. Chart Display Area */}
      <div className="h-80 w-full cursor-pointer">
        {viewMode === 'monthly' && (
          <MonthlyTrendView
            data={monthlyViewData}
            monthlyMetric={monthlyMetric}
            selectedCalendarYear={selectedCalendarYear}
            selectedMonth={selectedMonth}
            overallHistoricalAverage={overallHistoricalAverage}
            totalMonthsCount={monthlyTrends.length}
            monthlyStats={monthlyStats}
            onElementClick={handleElementClick}
          />
        )}

        {viewMode === 'yearly' && (
          <YearlyTrendView
            data={yearlyViewData}
            onElementClick={handleElementClick}
          />
        )}

        {viewMode === 'yoy' && (
          <YoYComparisonView
            data={yoyComparisonData}
            yoyChartType={yoyChartType}
            yoyPrimaryYear={yoyPrimaryYear}
            yoyBenchmarkYear={yoyBenchmarkYear}
            onElementClick={handleElementClick}
          />
        )}
      </div>
    </div>
  );
}
