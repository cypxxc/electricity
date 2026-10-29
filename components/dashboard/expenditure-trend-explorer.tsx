'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  LabelList,
} from 'recharts';
import type {
  MonthlyTrendItem,
  FiscalYearComparisonItem,
} from '@/lib/services/analytics';
import { calculatePercentageChange } from '@/lib/utils/math';
import { THAI_MONTHS } from '@/lib/validations/record';
import {
  BarChart3,
  Calendar,
  Layers,
  RotateCcw,
} from 'lucide-react';

export type ChartViewMode = 'monthly' | 'yearly' | 'yoy';

interface ExpenditureTrendExplorerProps {
  monthlyTrends: MonthlyTrendItem[];
  fiscalYearComparison: FiscalYearComparisonItem[];
  selectedYear: string;
  selectedMonth: number | null;
  onSelectPoint?: (yearBe: number, month: number) => void;
  onSelectYear?: (yearBe: string) => void;
  onResetFilters?: () => void;
}

export function ExpenditureTrendExplorer({
  monthlyTrends,
  fiscalYearComparison,
  selectedYear,
  selectedMonth,
  onSelectPoint,
  onSelectYear,
  onResetFilters,
}: ExpenditureTrendExplorerProps) {
  // 1. Chart View Mode
  const [viewMode, setViewMode] = useState<ChartViewMode>('monthly');

  // Distinct Calendar Years (ปี พ.ศ. ที่มีข้อมูลในระบบ: 2569, 2568, ... 2562)
  const availableYears = useMemo(() => {
    return Array.from(new Set(monthlyTrends.map((r) => r.yearBe))).sort((a, b) => b - a);
  }, [monthlyTrends]);

  // 2. Monthly Trend Controls
  // Default to the latest calendar year (2569) or 'all'
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<string>(
    availableYears[0]?.toString() || 'all'
  );
  const [monthlyMetric, setMonthlyMetric] = useState<'amount' | 'cumulative'>('amount');

  // 3. Yearly Trend Controls
  const [yearlyRange, setYearlyRange] = useState<'5' | 'all'>('all');
  const [yearlyMetric, setYearlyMetric] = useState<'total' | 'average'>('total');

  // 4. YoY Comparison Controls (เปรียบเทียบรายเดือนระหว่างปี พ.ศ. นั้นๆ: ล่าสุด 2569 เทียบกับปีก่อนหน้า 2568)
  const [yoyPrimaryYear, setYoyPrimaryYear] = useState<number>(
    availableYears[0] || 2569
  );
  const [yoyBenchmarkYear, setYoyBenchmarkYear] = useState<number>(
    availableYears[1] || 2568
  );
  const [yoyChartType, setYoyChartType] = useState<'bar' | 'line'>('bar');

  // Synchronize with external selectedYear filter (from top PeriodSelector) without cascading effect
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

  // -------------------------------------------------------------
  // Data for View 1: Monthly Trend (รายเดือนของปี พ.ศ. นั้นๆ)
  // -------------------------------------------------------------
  const monthlyViewData = useMemo(() => {
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

  const monthlyStats = useMemo(() => {
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

  // -------------------------------------------------------------
  // Data for View 2: Yearly Trend
  // -------------------------------------------------------------
  const yearlyViewData = useMemo(() => {
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

  const yearlyStats = useMemo(() => {
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

  // -------------------------------------------------------------
  // Data for View 3: Year-over-Year Comparison (รายเดือนของปีนั้นๆ ม.ค. - ธ.ค.)
  // -------------------------------------------------------------
  const yoyComparisonData = useMemo(() => {
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

    // 12 calendar months: ม.ค. ถึง ธ.ค. ของปีนั้นๆ เลย
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

  const yoyStats = useMemo(() => {
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

  // -------------------------------------------------------------
  // Dynamic Analytical Summary Formulation
  // -------------------------------------------------------------
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
      {/* 1. Header Toolbar with Chart View Selector Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              ระบบกราฟวิเคราะห์แนวโน้มค่าใช้จ่ายไฟฟ้า (Electricity Expenditure Explorer)
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">หน่วย: บาท (THB)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            เลือกดูข้อมูลรายเดือนของปีที่ต้องการ เปรียบเทียบรายเดือนระหว่างปี หรือวิเคราะห์แนวโน้มรายปี
          </p>
        </div>

        {/* Dynamic Controls based on active mode */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Main Chart View Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="chart-view-mode" className="text-xs font-semibold text-slate-700">
              โหมดกราฟ:
            </label>
            <select
              id="chart-view-mode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ChartViewMode)}
              className="text-xs font-semibold border border-[#0f2744] bg-[#0f2744] text-white rounded-xs px-2.5 py-1 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="monthly">รายเดือน (Monthly Trend)</option>
              <option value="yoy">เปรียบเทียบรายเดือนระหว่างปี (Year-over-Year Comparison)</option>
              <option value="yearly">รายปี (Yearly Trend)</option>
            </select>
          </div>

          {/* Contextual Sub-controls: Mode 1 (Monthly) */}
          {viewMode === 'monthly' && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedCalendarYear}
                onChange={(e) => setSelectedCalendarYear(e.target.value)}
                className="text-xs border border-slate-300 rounded-xs px-2 py-1 bg-white text-slate-800 font-medium focus:outline-none shadow-2xs"
              >
                <option value="all">
                  แสดงต่อเนื่องทุกปี ({availableYears[availableYears.length - 1] || 2562} - {availableYears[0] || 2569})
                </option>
                {availableYears.map((y) => (
                  <option key={y} value={y.toString()}>
                    ปี พ.ศ. {y}
                  </option>
                ))}
              </select>

              <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-50 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMonthlyMetric('amount')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    monthlyMetric === 'amount'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  รายงวด
                </button>
                <button
                  type="button"
                  onClick={() => setMonthlyMetric('cumulative')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    monthlyMetric === 'cumulative'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  ยอดสะสมในรอบปี
                </button>
              </div>
            </div>
          )}

          {/* Contextual Sub-controls: Mode 3 (YoY Comparison) */}
          {viewMode === 'yoy' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-500 font-medium">ปีหลัก:</span>
                <select
                  value={yoyPrimaryYear}
                  onChange={(e) => setYoyPrimaryYear(parseInt(e.target.value, 10))}
                  className="text-xs border border-slate-300 rounded-xs px-1.5 py-1 bg-white text-slate-900 font-semibold focus:outline-none shadow-2xs"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      ปี {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-500 font-medium">ปีเทียบ:</span>
                <select
                  value={yoyBenchmarkYear}
                  onChange={(e) => setYoyBenchmarkYear(parseInt(e.target.value, 10))}
                  className="text-xs border border-slate-300 rounded-xs px-1.5 py-1 bg-white text-slate-900 font-semibold focus:outline-none shadow-2xs"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y} disabled={y === yoyPrimaryYear}>
                      ปี {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-50 text-[11px]">
                <button
                  type="button"
                  onClick={() => setYoyChartType('bar')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    yoyChartType === 'bar'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  แท่งคู่
                </button>
                <button
                  type="button"
                  onClick={() => setYoyChartType('line')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    yoyChartType === 'line'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  เส้นคู่
                </button>
              </div>
            </div>
          )}

          {/* Contextual Sub-controls: Mode 2 (Yearly) */}
          {viewMode === 'yearly' && (
            <div className="flex items-center gap-1.5">
              <select
                value={yearlyRange}
                onChange={(e) => setYearlyRange(e.target.value as '5' | 'all')}
                className="text-xs border border-slate-300 rounded-xs px-2 py-1 bg-white text-slate-800 font-medium focus:outline-none shadow-2xs"
              >
                <option value="all">ทุกปีงบประมาณ ({fiscalYearComparison.length} ปี)</option>
                <option value="5">5 ปีงบประมาณล่าสุด</option>
              </select>

              <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-50 text-[11px]">
                <button
                  type="button"
                  onClick={() => setYearlyMetric('total')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    yearlyMetric === 'total'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  ยอดรวมทั้งปี
                </button>
                <button
                  type="button"
                  onClick={() => setYearlyMetric('average')}
                  className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                    yearlyMetric === 'average'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  เฉลี่ย/งวด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Dynamic Analytical Summary Card */}
      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            {viewMode === 'monthly' ? (
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
            ) : viewMode === 'yearly' ? (
              <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-teal-700" />
            )}
            <span>บทสรุปแนวโน้มจากการคำนวณจริง (Analytical Summary)</span>
          </div>

          {/* Quick Metrics Badge Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            {viewMode === 'monthly' && (
              <>
                <span className="text-slate-600">
                  ยอดรวม: <strong className="text-slate-900">฿{monthlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  เฉลี่ย: <strong className="text-slate-900">฿{monthlyStats.avg.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</strong>
                </span>
                {monthlyStats.maxMonth && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-800 font-sans">
                      สูงสุด: <strong>{monthlyStats.maxMonth.name}</strong> (฿{monthlyStats.maxMonth.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                    </span>
                  </>
                )}
              </>
            )}

            {viewMode === 'yearly' && (
              <>
                <span className="text-slate-600">
                  ยอดรวมทุกปี: <strong className="text-slate-900">฿{yearlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  ปีสูงสุด: <strong className="text-amber-800">ปีงบ {yearlyStats.maxYear?.year}</strong> (฿{yearlyStats.maxYear?.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  ปีต่ำสุด: <strong className="text-slate-800">ปีงบ {yearlyStats.minYear?.year}</strong> (฿{yearlyStats.minYear?.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                </span>
              </>
            )}

            {viewMode === 'yoy' && (
              <>
                <span className="text-slate-600">
                  ผลต่างรวม: <strong className={(yoyStats.netDiff || 0) > 0 ? 'text-amber-800' : 'text-teal-800'}>
                    {(yoyStats.netDiff || 0) > 0 ? '+' : ''}฿{Math.abs(yoyStats.netDiff || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({(yoyStats.netPct || 0) > 0 ? '+' : ''}{(yoyStats.netPct || 0).toFixed(1)}%)
                  </strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-sans">
                  เทียบ {yoyStats.comparedMonthsCount} เดือนตรงกัน
                </span>
              </>
            )}
          </div>
        </div>

        {/* Narrative Text Paragraph */}
        <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1 border-t border-slate-200/70">
          {analyticalNarrativeText}
        </p>
      </div>

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
        {/* MODE 1: MONTHLY TREND */}
        {viewMode === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyViewData}
              onClick={handleElementClick}
              margin={{ top: 28, right: 16, left: 6, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="displayLabel"
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={selectedCalendarYear === 'all' ? Math.floor(monthlyViewData.length / 10) : 0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.88)),
                  (dataMax: number) => Math.ceil(dataMax * 1.15),
                ]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlyTrendItem & { displayLabel: string; metricValue: number };
                    return (
                      <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[210px]">
                        <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                          <span>งวดประจำเดือน</span>
                          <span className="text-[#0f2744] font-bold">{item.fullLabel}</span>
                        </div>
                        <div className="mt-2 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">ค่าไฟฟ้า:</span>
                            <span className="font-bold font-mono text-slate-900">
                              ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {item.momChangeRate !== null && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">เทียบเดือนก่อน (MoM):</span>
                              <span className={`font-mono font-semibold ${item.momChangeRate > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                                {item.momChangeRate > 0 ? '+' : ''}{item.momChangeRate.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {item.yoyChangeRate !== null && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">เทียบปีก่อน (YoY):</span>
                              <span className={`font-mono font-semibold ${item.yoyChangeRate > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                                {item.yoyChangeRate > 0 ? '+' : ''}{item.yoyChangeRate.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {monthlyMetric === 'cumulative' && (
                            <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                              <span className="text-slate-500">ยอดสะสมตั้งแต่ต้นปี:</span>
                              <span className="font-mono font-bold text-slate-900">
                                ฿{item.metricValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-500">เกณฑ์เฉลี่ย ({monthlyTrends.length} ด.):</span>
                            <span className="font-mono text-slate-700">
                              ฿{overallHistoricalAverage.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          {item.isAnomaly && (
                            <div className="mt-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded-2xs text-center font-semibold">
                              ⯁ ค่าเบี่ยงเบนทางสถิติ (+2&sigma;)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={monthlyMetric === 'amount' ? overallHistoricalAverage : undefined}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `เฉลี่ยระบบ (${monthlyTrends.length} ด.)`,
                  position: 'right',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="metricValue"
                stroke="#0f2744"
                strokeWidth={2}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (cx === undefined || cy === undefined || !payload) return null;

                  const isSelected = selectedMonth === payload.month;
                  const isAnomaly = Boolean(payload.isAnomaly);
                  const isAll = selectedCalendarYear === 'all';
                  const val = payload.metricValue ?? payload.amount;

                  const fullText = `฿${Math.round(val).toLocaleString('th-TH')}`;
                  const compactText = `${(val / 1000).toFixed(val >= 100000 ? 0 : 1)}k`;

                  let shouldShowLabel = true;
                  if (isAll) {
                    const isPeak = payload.amount === monthlyStats.maxMonth?.amount;
                    const isMin = payload.amount === monthlyStats.minMonth?.amount;
                    const isInterval = index % 6 === 0;
                    shouldShowLabel = (isSelected || isAnomaly || isPeak || isMin || isInterval);
                  }

                  const labelText = isAll && !isSelected ? compactText : fullText;
                  const badgeWidth = Math.max(44, labelText.length * 6.8 + 12);
                  const badgeHeight = 16;
                  const badgeY = cy - 20;

                  return (
                    <g key={`dot-node-${payload.yearBe}-${payload.month}-${index}`} className="transition-all">
                      {/* Circle dot on line */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : isAnomaly ? 5 : 3.5}
                        fill={isAnomaly ? '#b45309' : isSelected ? '#0f2744' : '#0f2744'}
                        stroke="#ffffff"
                        strokeWidth={isSelected || isAnomaly ? 2 : 1.5}
                      />

                      {/* Label Badge Pill directly above point */}
                      {shouldShowLabel && (
                        <g
                          transform={`translate(${cx}, ${badgeY})`}
                          className="pointer-events-none select-none"
                        >
                          {/* Connector stem */}
                          <line
                            x1={0}
                            y1={badgeHeight / 2}
                            x2={0}
                            y2={badgeHeight / 2 + 4}
                            stroke={isSelected ? '#0f2744' : isAnomaly ? '#b45309' : '#94a3b8'}
                            strokeWidth={1}
                          />
                          {/* Background Pill */}
                          <rect
                            x={-badgeWidth / 2}
                            y={-badgeHeight / 2}
                            width={badgeWidth}
                            height={badgeHeight}
                            rx={3}
                            fill={isSelected ? '#0f2744' : isAnomaly ? '#fef3c7' : '#ffffff'}
                            stroke={isSelected ? '#0f2744' : isAnomaly ? '#f59e0b' : '#cbd5e1'}
                            strokeWidth={1}
                            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                          />
                          {/* Amount Text */}
                          <text
                            x={0}
                            y={3.2}
                            textAnchor="middle"
                            fill={isSelected ? '#ffffff' : isAnomaly ? '#92400e' : '#0f2744'}
                            fontSize={isAll && !isSelected ? 8.5 : 9.5}
                            fontWeight={isSelected || isAnomaly ? 700 : 600}
                            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                          >
                            {labelText}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }}
                activeDot={{ r: 5, fill: '#0f2744', stroke: '#ffffff', strokeWidth: 1.5 }}
                fill="#0f2744"
                fillOpacity={0.06}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* MODE 2: YEARLY TREND */}
        {viewMode === 'yearly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={yearlyViewData}
              onClick={handleElementClick}
              margin={{ top: 24, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const item = payload[0].payload as any;
                    return (
                      <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[210px]">
                        <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                          <span>รอบปีงบประมาณ</span>
                          <span className="text-[#0f2744] font-bold">ปีงบ {item.fyBe}</span>
                        </div>
                        <div className="mt-2 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-600">ค่าไฟฟ้ารวมทั้งปี:</span>
                            <span className="font-bold font-mono text-slate-900">
                              ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">เฉลี่ยต่อเดือน:</span>
                            <span className="font-mono text-slate-700">
                              ฿{item.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">จำนวนงวดที่บันทึก:</span>
                            <span className="font-mono text-slate-700">{item.recordedMonths}/12 เดือน</span>
                          </div>
                          {item.yoyChangeRate !== null && (
                            <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                              <span className="text-slate-500">เทียบปีงบก่อนหน้า:</span>
                              <span className={`font-mono font-semibold ${item.yoyChangeRate > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                                {item.yoyChangeRate > 0 ? '+' : ''}{item.yoyChangeRate.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="metricValue"
                fill="#0f2744"
                radius={[2, 2, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="metricValue"
                  position="top"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => `฿${Math.round(Number(val)).toLocaleString('th-TH')}`}
                  fill="#0f2744"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* MODE 3: YEAR-OVER-YEAR COMPARISON (เปรียบเทียบรายเดือนระหว่างปี ม.ค. - ธ.ค. ของปีนั้นๆ) */}
        {viewMode === 'yoy' && (
          <ResponsiveContainer width="100%" height="100%">
            {yoyChartType === 'bar' ? (
              <BarChart
                data={yoyComparisonData}
                onClick={handleElementClick}
                margin={{ top: 24, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="monthName"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#475569' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const item = payload[0].payload as any;
                      const hasBoth = item.primaryAmount !== null && item.benchmarkAmount !== null;

                      return (
                        <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[220px]">
                          <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                            <span>งวดเดือน</span>
                            <span className="text-[#0f2744] font-bold">เดือน{item.monthName}</span>
                          </div>
                          <div className="mt-2 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">ปี พ.ศ. {yoyPrimaryYear} (ปีหลัก):</span>
                              <span className="font-bold font-mono text-slate-900">
                                {item.primaryAmount !== null ? `฿${item.primaryAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">ปี พ.ศ. {yoyBenchmarkYear} (ปีเทียบ):</span>
                              <span className="font-bold font-mono text-slate-700">
                                {item.benchmarkAmount !== null ? `฿${item.benchmarkAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                              </span>
                            </div>
                            {hasBoth && item.diff !== null && item.pct !== null && (
                              <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-500">ผลต่าง (ปีหลัก - ปีเทียบ):</span>
                                <span className={`font-bold font-mono ${item.diff > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                                  {item.diff > 0 ? '+' : ''}฿{Math.abs(item.diff).toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({item.pct > 0 ? '+' : ''}{item.pct.toFixed(1)}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 6, fontSize: 11 }} />
                <Bar
                  dataKey="primaryAmount"
                  name={`ปี พ.ศ. ${yoyPrimaryYear} (ปีหลัก)`}
                  fill="#0f2744"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="primaryAmount"
                    position="top"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => (val ? `${(Number(val) / 1000).toFixed(0)}k` : '')}
                    fill="#0f2744"
                    fontSize={9}
                    fontWeight={600}
                    fontFamily="ui-monospace, monospace"
                    offset={4}
                  />
                </Bar>
                <Bar
                  dataKey="benchmarkAmount"
                  name={`ปี พ.ศ. ${yoyBenchmarkYear} (ปีเทียบ)`}
                  fill="#0d9488"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="benchmarkAmount"
                    position="top"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => (val ? `${(Number(val) / 1000).toFixed(0)}k` : '')}
                    fill="#0d9488"
                    fontSize={9}
                    fontWeight={600}
                    fontFamily="ui-monospace, monospace"
                    offset={4}
                  />
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={yoyComparisonData}
                onClick={handleElementClick}
                margin={{ top: 24, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="monthName"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#475569' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={[
                    (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.88)),
                    (dataMax: number) => Math.ceil(dataMax * 1.15),
                  ]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const item = payload[0].payload as any;
                      const hasBoth = item.primaryAmount !== null && item.benchmarkAmount !== null;

                      return (
                        <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[220px]">
                          <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                            <span>งวดเดือน</span>
                            <span className="text-[#0f2744] font-bold">เดือน{item.monthName}</span>
                          </div>
                          <div className="mt-2 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">ปี พ.ศ. {yoyPrimaryYear}:</span>
                              <span className="font-bold font-mono text-slate-900">
                                {item.primaryAmount !== null ? `฿${item.primaryAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">ปี พ.ศ. {yoyBenchmarkYear}:</span>
                              <span className="font-bold font-mono text-slate-700">
                                {item.benchmarkAmount !== null ? `฿${item.benchmarkAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                              </span>
                            </div>
                            {hasBoth && item.diff !== null && item.pct !== null && (
                              <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-500">ผลต่าง:</span>
                                <span className={`font-bold font-mono ${item.diff > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                                  {item.diff > 0 ? '+' : ''}฿{Math.abs(item.diff).toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({item.pct > 0 ? '+' : ''}{item.pct.toFixed(1)}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 6, fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="primaryAmount"
                  name={`ปี พ.ศ. ${yoyPrimaryYear} (ปีหลัก)`}
                  stroke="#0f2744"
                  strokeWidth={2}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dot={(props: any) => {
                    const { cx, cy, value } = props;
                    if (cx === undefined || cy === undefined || !value) return null;
                    return (
                      <g key={`yoy-primary-${cx}`}>
                        <circle cx={cx} cy={cy} r={3.5} fill="#0f2744" stroke="#ffffff" strokeWidth={1.5} />
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          fill="#0f2744"
                          fontSize={8.5}
                          fontWeight={600}
                          fontFamily="ui-monospace, monospace"
                          className="pointer-events-none select-none"
                        >
                          {(Number(value) / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkAmount"
                  name={`ปี พ.ศ. ${yoyBenchmarkYear} (ปีเทียบ)`}
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dot={(props: any) => {
                    const { cx, cy, value } = props;
                    if (cx === undefined || cy === undefined || !value) return null;
                    return (
                      <g key={`yoy-bench-${cx}`}>
                        <circle cx={cx} cy={cy} r={3.5} fill="#0d9488" stroke="#ffffff" strokeWidth={1.5} />
                        <text
                          x={cx}
                          y={cy + 14}
                          textAnchor="middle"
                          fill="#0d9488"
                          fontSize={8.5}
                          fontWeight={600}
                          fontFamily="ui-monospace, monospace"
                          className="pointer-events-none select-none"
                        >
                          {(Number(value) / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
