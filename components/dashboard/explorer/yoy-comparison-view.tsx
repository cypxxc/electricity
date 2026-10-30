'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import type { YoYComparisonRow } from './explorer-types';
import { THEME_COLORS } from '@/lib/constants/theme';

interface YoYComparisonViewProps {
  data: YoYComparisonRow[];
  yoyChartType: 'bar' | 'line';
  yoyPrimaryYear: number;
  yoyBenchmarkYear: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onElementClick?: (e: any) => void;
}

export function YoYComparisonView({
  data,
  yoyChartType,
  yoyPrimaryYear,
  yoyBenchmarkYear,
  onElementClick,
}: YoYComparisonViewProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {yoyChartType === 'bar' ? (
        <BarChart
          data={data}
          onClick={onElementClick}
          margin={{ top: 24, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={THEME_COLORS.gridLine} />
          <XAxis
            dataKey="monthName"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={{ stroke: THEME_COLORS.axisLine }}
            axisLine={{ stroke: THEME_COLORS.axisLine }}
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
                      <span className="text-brand-navy font-bold">เดือน{item.monthName}</span>
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
            fill={THEME_COLORS.brandNavy}
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          >
            <LabelList
              dataKey="primaryAmount"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => (val ? `${(Number(val) / 1000).toFixed(0)}k` : '')}
              fill={THEME_COLORS.brandNavy}
              fontSize={9}
              fontWeight={600}
              fontFamily="ui-monospace, monospace"
              offset={4}
            />
          </Bar>
          <Bar
            dataKey="benchmarkAmount"
            name={`ปี พ.ศ. ${yoyBenchmarkYear} (ปีเทียบ)`}
            fill={THEME_COLORS.brandTealLight}
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          >
            <LabelList
              dataKey="benchmarkAmount"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => (val ? `${(Number(val) / 1000).toFixed(0)}k` : '')}
              fill={THEME_COLORS.brandTealLight}
              fontSize={9}
              fontWeight={600}
              fontFamily="ui-monospace, monospace"
              offset={4}
            />
          </Bar>
        </BarChart>
      ) : (
        <LineChart
          data={data}
          onClick={onElementClick}
          margin={{ top: 24, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={THEME_COLORS.gridLine} />
          <XAxis
            dataKey="monthName"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={{ stroke: THEME_COLORS.axisLine }}
            axisLine={{ stroke: THEME_COLORS.axisLine }}
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
                      <span className="text-brand-navy font-bold">เดือน{item.monthName}</span>
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
            stroke={THEME_COLORS.brandNavy}
            strokeWidth={2}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              const { cx, cy, value } = props;
              if (cx === undefined || cy === undefined || !value) return null;
              return (
                <g key={`yoy-primary-${cx}`}>
                  <circle cx={cx} cy={cy} r={3.5} fill={THEME_COLORS.brandNavy} stroke="#ffffff" strokeWidth={1.5} />
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    fill={THEME_COLORS.brandNavy}
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
            stroke={THEME_COLORS.brandTealLight}
            strokeWidth={2}
            strokeDasharray="3 3"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(props: any) => {
              const { cx, cy, value } = props;
              if (cx === undefined || cy === undefined || !value) return null;
              return (
                <g key={`yoy-bench-${cx}`}>
                  <circle cx={cx} cy={cy} r={3.5} fill={THEME_COLORS.brandTealLight} stroke="#ffffff" strokeWidth={1.5} />
                  <text
                    x={cx}
                    y={cy + 14}
                    textAnchor="middle"
                    fill={THEME_COLORS.brandTealLight}
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
  );
}
