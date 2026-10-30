'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonthlyTrendItem } from '@/lib/services/analytics';
import type { MonthlyViewDataItem, MonthlyStats } from './explorer-types';
import { THEME_COLORS } from '@/lib/constants/theme';

interface MonthlyTrendViewProps {
  data: MonthlyViewDataItem[];
  monthlyMetric: 'amount' | 'cumulative';
  selectedCalendarYear: string;
  selectedMonth: number | null;
  overallHistoricalAverage: number;
  totalMonthsCount: number;
  monthlyStats: MonthlyStats;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onElementClick?: (e: any) => void;
}

export function MonthlyTrendView({
  data,
  monthlyMetric,
  selectedCalendarYear,
  selectedMonth,
  overallHistoricalAverage,
  totalMonthsCount,
  monthlyStats,
  onElementClick,
}: MonthlyTrendViewProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        onClick={onElementClick}
        margin={{ top: 28, right: 16, left: 6, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={THEME_COLORS.gridLine} />
        <XAxis
          dataKey="displayLabel"
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={{ stroke: THEME_COLORS.axisLine }}
          axisLine={{ stroke: THEME_COLORS.axisLine }}
          interval={
            selectedCalendarYear === 'all'
              ? Math.floor(data.length / 10)
              : selectedCalendarYear === 'recent_24'
              ? 1
              : 0
          }
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
                    <span className="text-brand-navy font-bold">{item.fullLabel}</span>
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
                      <span className="text-slate-500">เกณฑ์เฉลี่ย ({totalMonthsCount} ด.):</span>
                      <span className="font-mono text-slate-700">
                        ฿{overallHistoricalAverage.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    {item.isAnomaly && (
                      <div className="mt-1 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded-2xs text-center font-semibold">
                        ⯁ ค่าเบี่ยงเบนทางสถิติ (+2&sigma;)
                      </div>
                    )}
                    <div className="pt-1.5 mt-1 border-t border-slate-100 text-[10.5px] text-teal-800 font-medium flex items-center gap-1">
                      <span>💡 คลิกจุดกราฟเพื่อเน้นงวดนี้</span>
                    </div>
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
            value: `เฉลี่ยระบบ (${totalMonthsCount} ด.)`,
            position: 'right',
            fill: '#64748b',
            fontSize: 10,
          }}
        />
        <Area
          type="monotone"
          dataKey="metricValue"
          stroke={THEME_COLORS.brandNavy}
          strokeWidth={2}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dot={(props: any) => {
            const { cx, cy, payload, index } = props;
            if (cx === undefined || cy === undefined || !payload) return null;

            const isSelected = selectedMonth === payload.month;
            const isAnomaly = Boolean(payload.isAnomaly);
            const isAll = selectedCalendarYear === 'all' || selectedCalendarYear === 'recent_24';
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
                  fill={isAnomaly ? '#b45309' : THEME_COLORS.brandNavy}
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
                      stroke={isSelected ? THEME_COLORS.brandNavy : isAnomaly ? '#b45309' : '#94a3b8'}
                      strokeWidth={1}
                    />
                    {/* Background Pill */}
                    <rect
                      x={-badgeWidth / 2}
                      y={-badgeHeight / 2}
                      width={badgeWidth}
                      height={badgeHeight}
                      rx={3}
                      fill={isSelected ? THEME_COLORS.brandNavy : isAnomaly ? '#fef3c7' : '#ffffff'}
                      stroke={isSelected ? THEME_COLORS.brandNavy : isAnomaly ? THEME_COLORS.anomalyHighlight : THEME_COLORS.axisLine}
                      strokeWidth={1}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                    />
                    {/* Amount Text */}
                    <text
                      x={0}
                      y={3.2}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : isAnomaly ? '#92400e' : THEME_COLORS.brandNavy}
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
          activeDot={{ r: 5, fill: THEME_COLORS.brandNavy, stroke: '#ffffff', strokeWidth: 1.5 }}
          fill={THEME_COLORS.brandNavy}
          fillOpacity={0.06}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
