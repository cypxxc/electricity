'use client';

import { ChartViewMode } from './explorer-types';

interface ExplorerToolbarProps {
  viewMode: ChartViewMode;
  setViewMode: (mode: ChartViewMode) => void;
  availableYears: number[];
  selectedCalendarYear: string;
  setSelectedCalendarYear: (year: string) => void;
  monthlyMetric: 'amount' | 'cumulative';
  setMonthlyMetric: (metric: 'amount' | 'cumulative') => void;
  yearlyRange: '5' | 'all';
  setYearlyRange: (range: '5' | 'all') => void;
  yearlyMetric: 'total' | 'average';
  setYearlyMetric: (metric: 'total' | 'average') => void;
  yoyPrimaryYear: number;
  setYoyPrimaryYear: (year: number) => void;
  yoyBenchmarkYear: number;
  setYoyBenchmarkYear: (year: number) => void;
  yoyChartType: 'bar' | 'line';
  setYoyChartType: (type: 'bar' | 'line') => void;
  totalFiscalYearsCount: number;
}

export function ExplorerToolbar({
  viewMode,
  setViewMode,
  availableYears,
  selectedCalendarYear,
  setSelectedCalendarYear,
  monthlyMetric,
  setMonthlyMetric,
  yearlyRange,
  setYearlyRange,
  yearlyMetric,
  setYearlyMetric,
  yoyPrimaryYear,
  setYoyPrimaryYear,
  yoyBenchmarkYear,
  setYoyBenchmarkYear,
  yoyChartType,
  setYoyChartType,
  totalFiscalYearsCount,
}: ExplorerToolbarProps) {
  return (
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
            className="text-xs font-semibold border border-slate-300 hover:border-slate-400 bg-white text-slate-800 rounded-xs px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0f2744] shadow-2xs cursor-pointer transition-colors"
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
              <option value="all">ทุกปีงบประมาณ ({totalFiscalYearsCount} ปี)</option>
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
  );
}
