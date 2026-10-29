'use client';

import { DashboardKPIs, FiscalYearComparisonItem } from '@/lib/services/analytics';
import { calculatePercentageChange } from '@/lib/utils/math';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPIs;
  selectedYear?: string;
  selectedFYSummary?: FiscalYearComparisonItem | null;
  fiscalYearComparison?: FiscalYearComparisonItem[];
}

interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  strokeColor?: string;
  peakIndex?: number;
  className?: string;
}

/**
 * Lightweight Zero-dependency SVG Sparkline for Micro-visualizations
 */
function MiniSparkline({
  data,
  height = 28,
  width = 96,
  strokeColor = '#0f2744',
  peakIndex,
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const paddingX = 4;
  const usableHeight = height - paddingY * 2;
  const usableWidth = width - paddingX * 2;

  const points = data.map((val, i) => {
    const x = paddingX + (i / (data.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const polylineStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `M ${points[0].x.toFixed(1)},${(height - 1).toFixed(1)} ${points
    .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')} L ${points[points.length - 1].x.toFixed(1)},${(height - 1).toFixed(1)} Z`;

  const peakPoint =
    peakIndex !== undefined && peakIndex >= 0 && points[peakIndex]
      ? points[peakIndex]
      : null;

  return (
    <div className={`shrink-0 ${className}`} title="เส้นแสดงแนวโน้มมิติเวลา (Trend Trajectory)">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-24 h-7 overflow-visible"
        preserveAspectRatio="none"
      >
        <path d={areaD} fill={strokeColor} fillOpacity="0.08" />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineStr}
        />
        {peakPoint && (
          <circle
            cx={peakPoint.x}
            cy={peakPoint.y}
            r="2.5"
            className="fill-amber-500 stroke-white stroke-[1]"
          />
        )}
      </svg>
    </div>
  );
}

interface ComparisonBadgeProps {
  rate: number | null;
  amount?: number | null;
  baselineLabel?: string;
  reverseTone?: boolean; // For costs: positive = cost increase (rose), negative = cost decrease (emerald)
}

/**
 * Standardized Restrained Comparison Badge (Percentage + Exact Amount)
 */
function ComparisonBadge({
  rate,
  amount,
  baselineLabel = 'ปีฐานอ้างอิง',
  reverseTone = true,
}: ComparisonBadgeProps) {
  if (rate === null || rate === undefined) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10.5px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
        {baselineLabel}
      </span>
    );
  }

  const isPositive = rate > 0;
  const isZero = Math.abs(rate) < 0.05;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  if (!isZero) {
    if (reverseTone) {
      // Cost up -> Rose (expense increase), Cost down -> Emerald (expense savings)
      colorClasses = isPositive
        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    } else {
      colorClasses = isPositive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
        : 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
  }

  const sign = isPositive ? '+' : '';
  const rateText = `${sign}${rate.toFixed(1)}%`;
  const amtText =
    amount !== undefined && amount !== null && !isZero
      ? ` (${amount > 0 ? '+' : ''}฿${Math.round(amount).toLocaleString('th-TH')})`
      : '';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10.5px] font-mono font-medium border ${colorClasses}`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0 stroke-[2.2]" />
      ) : isZero ? null : (
        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0 stroke-[2.2]" />
      )}
      <span>
        {rateText}
        {amtText}
      </span>
    </span>
  );
}

export function KPICards({
  kpis,
  selectedYear = 'all',
  selectedFYSummary,
  fiscalYearComparison = [],
}: KPICardsProps) {
  const isFiltered = selectedYear !== 'all' && selectedFYSummary;

  // Case 1: When a specific fiscal year is selected
  if (isFiltered && selectedFYSummary) {
    const fyNum = selectedFYSummary.fyBe;
    const prevFYNum = fyNum - 1;
    const yoyRate = selectedFYSummary.yoyChangeRate;
    const yoyAmt = selectedFYSummary.yoyChangeAmount;
    const isYoyPositive = (yoyRate || 0) > 0;
    const prevTotal = yoyAmt !== null ? selectedFYSummary.totalAmount - yoyAmt : null;
    const avgVsOverallRate = calculatePercentageChange(selectedFYSummary.averageMonthly, kpis.monthlyAverage);
    const avgVsOverallAmt = selectedFYSummary.averageMonthly - kpis.monthlyAverage;

    const monthlyValues = selectedFYSummary.months.map((m) => m.amount);
    const peakIndex = selectedFYSummary.maxMonth
      ? selectedFYSummary.months.findIndex(
          (m) =>
            m.month === selectedFYSummary.maxMonth?.month &&
            m.yearBe === selectedFYSummary.maxMonth?.yearBe
        )
      : undefined;

    const maxMonthRatio =
      selectedFYSummary.totalAmount > 0 && selectedFYSummary.maxMonth?.amount
        ? ((selectedFYSummary.maxMonth.amount / selectedFYSummary.totalAmount) * 100).toFixed(1)
        : null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Selected FY Total with 12-month Sparkline */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ค่าไฟฟ้ารวมปีงบประมาณ {fyNum}
              </span>
              <Zap className="w-4 h-4 text-[#0f2744]" />
            </div>
            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                ฿{selectedFYSummary.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <MiniSparkline
                data={monthlyValues}
                peakIndex={peakIndex}
                strokeColor="#0f2744"
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded-xs font-medium font-mono">
                รอบ 1 ต.ค.–30 ก.ย.
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                12 งวดเดือน
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ความครอบคลุมข้อมูล</span>
            <span className="font-mono font-medium text-slate-700">
              {selectedFYSummary.recordedMonths} เดือน (ครบ 12 งวด)
            </span>
          </div>
        </div>

        {/* Metric 2: YoY Comparison with Previous FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                เทียบปีงบประมาณ {prevFYNum} (YoY)
              </span>
              {isYoyPositive ? (
                <TrendingUp className="w-4 h-4 text-slate-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <div className="mt-2.5">
              {yoyRate !== null ? (
                <div
                  className={`text-2xl font-bold font-mono tracking-tight ${
                    isYoyPositive ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {isYoyPositive ? '+' : ''}{yoyRate.toFixed(1)}%
                </div>
              ) : (
                <div className="text-2xl font-bold font-mono text-slate-600 tracking-tight">
                  ปีฐานอ้างอิง
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <ComparisonBadge rate={yoyRate} amount={yoyAmt} />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ยอดปีงบ {prevFYNum}</span>
            <span className="font-mono font-medium text-slate-700">
              {prevTotal !== null
                ? `฿${prevTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'ไม่มีข้อมูลงวดก่อนหน้า'}
            </span>
          </div>
        </div>

        {/* Metric 3: Monthly Average for this FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ค่าเฉลี่ยต่องวดปีงบ {fyNum}
              </span>
              <CalendarDays className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2.5 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{selectedFYSummary.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <ComparisonBadge
                rate={avgVsOverallRate}
                amount={avgVsOverallAmt}
                baselineLabel="เท่าเกณฑ์เฉลี่ย"
              />
              <span className="text-[10px] text-slate-400 font-mono">
                เทียบเฉลี่ยระบบ
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ฐานเฉลี่ยสะสมทั้งระบบ</span>
            <span className="font-mono font-medium text-slate-700">
              ฿{Math.round(kpis.monthlyAverage).toLocaleString('th-TH')} / เดือน
            </span>
          </div>
        </div>

        {/* Metric 4: Peak Month for this FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                งวดสูงสุดของปีงบ {fyNum}
              </span>
              <Flame className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2.5 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{(selectedFYSummary.maxMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10.5px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                PEAK: {selectedFYSummary.maxMonth?.monthName} {selectedFYSummary.maxMonth?.yearBe}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>สัดส่วนต่องบทั้งปี</span>
            <span className="font-semibold text-slate-800 font-mono">
              {maxMonthRatio ? `${maxMonthRatio}% ของยอดรวมปี` : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: All Time (Default view)
  const currentFY = kpis.latestFiscalYearBe || kpis.latestYearBe;
  const prevFY = kpis.previousFiscalYearBe || (currentFY - 1);
  const currentFYTotal = kpis.latestFiscalYearTotal || kpis.latestYearTotal;

  // Fiscal YoY rate comparison (Thai Fiscal Year Standard)
  const fyRate = kpis.fiscalYoyChangeRate !== null ? kpis.fiscalYoyChangeRate : kpis.yoyChangeRate;
  const fyDiff =
    kpis.previousFiscalYearTotal > 0
      ? currentFYTotal - kpis.previousFiscalYearTotal
      : null;

  // 7 fiscal years trend sparkline data
  const yearlyTotals = fiscalYearComparison.map((f) => f.totalAmount);
  const peakFYIndex =
    yearlyTotals.length > 0 ? yearlyTotals.indexOf(Math.max(...yearlyTotals)) : undefined;

  const peakDiffVsAvgRate =
    kpis.maxRecord?.amount && kpis.monthlyAverage > 0
      ? calculatePercentageChange(kpis.maxRecord.amount, kpis.monthlyAverage)
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Metric 1: Cumulative Expenditure with Multi-Year Sparkline */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ค่าไฟฟ้ารวมสะสมทั้งหมด
            </span>
            <Building2 className="w-4 h-4 text-[#0f2744]" />
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {yearlyTotals.length >= 2 && (
              <MiniSparkline
                data={yearlyTotals}
                peakIndex={peakFYIndex}
                strokeColor="#0f2744"
              />
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
              สะสมต่อเนื่อง {kpis.totalFiscalYearsCount || fiscalYearComparison.length || 7} ปีงบ
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>ความครอบคลุมข้อมูล</span>
          <span className="font-mono font-medium text-slate-700">
            {kpis.totalRecordsCount} งวด (ปีงบ {kpis.firstFiscalYearBe || 2563}–{currentFY})
          </span>
        </div>
      </div>

      {/* Metric 2: Current Fiscal Year Total with Comparison Badge */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ค่าไฟฟ้ารวมปีงบประมาณ {currentFY}
            </span>
            <Zap className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2.5 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{currentFYTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <ComparisonBadge rate={fyRate} amount={fyDiff} />
            <span className="text-[10px] text-slate-400 font-mono">
              เทียบปีงบ {prevFY}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>ยอดปีงบประมาณ {prevFY}</span>
          <span className="font-mono font-medium text-slate-700">
            ฿{(kpis.previousFiscalYearTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Metric 3: Monthly Average */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ค่าเฉลี่ยต่องวดเดือน
            </span>
            <CalendarDays className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2.5 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
              เกณฑ์ฐานสะสม {kpis.totalRecordsCount} งวดบันทึก
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>งวดต่ำสุดในระบบ</span>
          <span className="text-slate-700 font-medium font-mono">
            {kpis.minRecord?.monthName} {kpis.minRecord?.yearBe} (฿{(kpis.minRecord?.amount || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })})
          </span>
        </div>
      </div>

      {/* Metric 4: Historical Peak */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ยอดสูงสุดในประวัติศาสตร์
            </span>
            <Flame className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2.5 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{(kpis.maxRecord?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10.5px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              PEAK: {kpis.maxRecord?.monthName} {kpis.maxRecord?.yearBe} {kpis.maxRecord?.fyBe ? `(ปีงบ ${kpis.maxRecord.fyBe})` : ''}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>สูงกว่าเกณฑ์เฉลี่ยสะสม</span>
          <span className="font-semibold text-amber-800 font-mono">
            {peakDiffVsAvgRate !== null ? `+${peakDiffVsAvgRate.toFixed(1)}%` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
