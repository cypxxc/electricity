'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MonthlyTrendItem } from '@/lib/services/analytics';
import { MousePointerClick, AlertCircle } from 'lucide-react';

export type TrendMetricMode = 'amount' | 'mom' | 'yoy';

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedMonth: number | null;
  onSelectPoint?: (yearBe: number, month: number) => void;
}

export function MonthlyTrendChart({
  data,
  selectedYear,
  onYearChange,
  selectedMonth,
  onSelectPoint,
}: MonthlyTrendChartProps) {
  const [metricMode, setMetricMode] = useState<TrendMetricMode>('amount');

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(data.map((d) => d.yearBe))).sort((a, b) => b - a);
    return years;
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedYear === 'all') {
      return data;
    }
    const yearNum = parseInt(selectedYear, 10);
    return data.filter((d) => d.yearBe === yearNum);
  }, [data, selectedYear]);

  // Overall and filtered averages for reference lines
  const overallAverage = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.amount, 0);
    return sum / data.length;
  }, [data]);

  const filteredStats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, max: 0, min: 0 };
    let sum = 0;
    let max = -Infinity;
    let min = Infinity;
    for (const d of filteredData) {
      sum += d.amount;
      if (d.amount > max) max = d.amount;
      if (d.amount < min) min = d.amount;
    }
    return {
      avg: sum / filteredData.length,
      max,
      min,
    };
  }, [filteredData]);

  // Handle data point click
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleChartClick(state: any) {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload as MonthlyTrendItem;
      if (onSelectPoint) {
        onSelectPoint(payload.yearBe, payload.month);
      }
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              แนวโน้มค่าไฟฟ้ารายเดือน (Monthly Expenditure Trend Explorer)
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              {metricMode === 'amount' ? 'หน่วย: บาท (THB)' : 'หน่วย: ร้อยละ (%)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {metricMode === 'amount'
              ? `เส้นอ้างอิง: ค่าเฉลี่ยระบบ ${data.length} เดือน (฿${overallAverage.toLocaleString('th-TH', { maximumFractionDigits: 0 })}/งวด)`
              : metricMode === 'mom'
              ? 'เปรียบเทียบอัตราการเปลี่ยนแปลงจากเดือนก่อนหน้า (MoM Baseline: 0.0%)'
              : 'เปรียบเทียบอัตราการเปลี่ยนแปลงจากช่วงเดียวกันของปีก่อนหน้า (YoY Baseline: 0.0%)'}
          </p>
        </div>

        {/* Metric Selector & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Supported Metrics Switcher */}
          <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-50 text-[11px]">
            <button
              type="button"
              onClick={() => setMetricMode('amount')}
              className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                metricMode === 'amount'
                  ? 'bg-[#0f2744] text-white shadow-2xs font-semibold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ยอดเงิน (THB)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('mom')}
              className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                metricMode === 'mom'
                  ? 'bg-[#0f2744] text-white shadow-2xs font-semibold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              &Delta; MoM (%)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('yoy')}
              className={`px-2 py-0.5 rounded-2xs font-medium transition-colors ${
                metricMode === 'yoy'
                  ? 'bg-[#0f2744] text-white shadow-2xs font-semibold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              &Delta; YoY (%)
            </button>
            <button
              type="button"
              disabled
              title="ไม่มีข้อมูลหน่วยไฟฟ้า (kWh) ในแหล่งข้อมูล Excel บัญชีรายรับ-รายจ่ายปัจจุบัน"
              className="px-2 py-0.5 rounded-2xs text-slate-400 cursor-not-allowed flex items-center gap-1 opacity-60"
            >
              <span>kWh</span>
              <AlertCircle className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <select
              id="trend-year-filter"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="text-xs border border-slate-300 rounded-xs px-2 py-1 bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0f2744] shadow-2xs"
            >
              <option value="all">ทุกปี ({data.length} เดือน)</option>
              {availableYears.map((y) => (
                <option key={y} value={y.toString()}>
                  พ.ศ. {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scope Stats Strip & Interactive Prompt */}
      <div className="mt-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-xs flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-2">
          <span>ช่วงที่แสดง: </span>
          <strong className="text-slate-800">
            {selectedYear === 'all' ? `ทั้งหมด (${filteredData.length} งวด)` : `ปี พ.ศ. ${selectedYear} (${filteredData.length} งวด)`}
          </strong>
          {selectedMonth && (
            <span className="text-teal-800 bg-teal-50 border border-teal-200 px-1.5 rounded-2xs font-semibold">
              เลือกเดือนที่: {selectedMonth}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
            <MousePointerClick className="w-3 h-3" /> คลิกจุดบนกราฟเพื่อเน้นตรวจสอบ
          </span>
          {metricMode === 'amount' && (
            <span>เฉลี่ย: <strong className="text-slate-800">฿{filteredStats.avg.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</strong></span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-3 h-64 w-full cursor-pointer">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            ไม่มีข้อมูลสำหรับรอบระยะเวลาที่เลือก
          </div>
        ) : metricMode === 'amount' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              onClick={handleChartClick}
              margin={{ top: 28, right: 16, left: 6, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={selectedYear === 'all' ? Math.floor(filteredData.length / 10) : 0}
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
                    const item = payload[0].payload as MonthlyTrendItem;
                    const diff = item.amount - overallAverage;
                    const pctDiff = overallAverage > 0 ? (diff / overallAverage) * 100 : 0;
                    const isHigher = diff > 0;

                    return (
                      <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[210px]">
                        <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                          <span>งวดประจำเดือน</span>
                          <span className="text-[#0f2744] font-bold">{item.fullLabel}</span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-slate-500 text-[11px]">ค่าใช้จ่ายจริง:</span>
                          <span className="text-sm font-bold font-mono text-slate-900">
                            ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-500">เทียบเฉลี่ยรวม ({data.length} ด.):</span>
                          <span className={`font-mono font-medium ${isHigher ? 'text-amber-800' : 'text-teal-800'}`}>
                            {isHigher ? '+' : ''}฿{diff.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({isHigher ? '+' : ''}{pctDiff.toFixed(1)}%)
                          </span>
                        </div>
                        {item.isAnomaly && (
                          <div className="mt-1 text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-1 py-0.5 rounded-2xs text-center">
                            ⯁ ตรวจพบค่าเบี่ยงเบนทางสถิติ (+2&sigma;)
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={overallAverage}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `เฉลี่ย ${data.length} เดือน`,
                  position: 'right',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#1e3a5f"
                strokeWidth={2}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (cx === undefined || cy === undefined || !payload) return null;

                  const isSelected = selectedMonth === payload.month && (selectedYear === 'all' || selectedYear === payload.yearBe.toString());
                  const isAnomaly = Boolean(payload.isAnomaly);
                  const isAll = selectedYear === 'all';
                  const val = payload.amount;

                  const fullText = `฿${Math.round(val).toLocaleString('th-TH')}`;
                  const compactText = `${(val / 1000).toFixed(val >= 100000 ? 0 : 1)}k`;

                  const shouldShowLabel = !isAll || isSelected || isAnomaly || index % 6 === 0;
                  const labelText = isAll && !isSelected ? compactText : fullText;
                  const badgeWidth = Math.max(44, labelText.length * 6.8 + 12);
                  const badgeHeight = 16;
                  const badgeY = cy - 20;

                  return (
                    <g key={`monthly-dot-${payload.id || index}`} className="transition-all">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : isAnomaly ? 5 : 3.5}
                        fill={isAnomaly ? '#b45309' : isSelected ? '#0f2744' : '#1e3a5f'}
                        stroke="#ffffff"
                        strokeWidth={isSelected || isAnomaly ? 2 : 1.5}
                      />
                      {shouldShowLabel && (
                        <g transform={`translate(${cx}, ${badgeY})`} className="pointer-events-none select-none">
                          <line
                            x1={0}
                            y1={badgeHeight / 2}
                            x2={0}
                            y2={badgeHeight / 2 + 4}
                            stroke={isSelected ? '#0f2744' : isAnomaly ? '#b45309' : '#94a3b8'}
                            strokeWidth={1}
                          />
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
                          <text
                            x={0}
                            y={3.2}
                            textAnchor="middle"
                            fill={isSelected ? '#ffffff' : isAnomaly ? '#92400e' : '#0f2744'}
                            fontSize={isAll && !isSelected ? 8.5 : 9.5}
                            fontWeight={isSelected || isAnomaly ? 700 : 600}
                            fontFamily="ui-monospace, monospace"
                          >
                            {labelText}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }}
                activeDot={{ r: 5, fill: '#0f2744', stroke: '#ffffff', strokeWidth: 1.5 }}
                fill="#1e3a5f"
                fillOpacity={0.06}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              onClick={handleChartClick}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={selectedYear === 'all' ? Math.floor(filteredData.length / 10) : 0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlyTrendItem;
                    const val = metricMode === 'mom' ? item.momChangeRate : item.yoyChangeRate;
                    const diffAmt = metricMode === 'mom' ? item.momChangeAmount : item.yoyChangeAmount;

                    return (
                      <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[210px]">
                        <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                          <span>งวดประจำเดือน</span>
                          <span className="text-[#0f2744] font-bold">{item.fullLabel}</span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-slate-500 text-[11px]">
                            {metricMode === 'mom' ? 'อัตราเปลี่ยนแปลง MoM:' : 'อัตราเปลี่ยนแปลง YoY:'}
                          </span>
                          <span className={`text-sm font-bold font-mono ${(val || 0) > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                            {val !== null ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '-'}
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-500">ส่วนต่างตัวเงิน:</span>
                          <span className="font-mono font-medium text-slate-800">
                            {diffAmt !== null ? `${diffAmt > 0 ? '+' : ''}฿${diffAmt.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'เส้นฐาน 0.0%',
                  position: 'right',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey={metricMode === 'mom' ? 'momChangeRate' : 'yoyChangeRate'}
                stroke="#0f766e"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isSelected = selectedMonth === payload.month;
                  return isSelected ? (
                    <circle key={`line-dot-${payload.id}`} cx={cx} cy={cy} r={5} fill="#0f766e" stroke="#ffffff" strokeWidth={2} />
                  ) : (
                    <circle key={`line-dot-${payload.id}`} cx={cx} cy={cy} r={2.5} fill="#0f766e" />
                  );
                }}
                activeDot={{ r: 5, fill: '#115e59', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
