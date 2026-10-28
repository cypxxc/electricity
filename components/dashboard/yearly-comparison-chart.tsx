'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { YearlyComparisonItem } from '@/lib/services/analytics';
import { BarChart3 } from 'lucide-react';

interface YearlyComparisonChartProps {
  data: YearlyComparisonItem[];
}

export function YearlyComparisonChart({ data }: YearlyComparisonChartProps) {
  const chartData = data.map((d) => ({
    year: `ปี ${d.yearBe}`,
    total: d.totalAmount,
    average: Math.round(d.averageMonthly),
    months: d.recordedMonths,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              เปรียบเทียบค่าไฟฟ้ารายปี (Yearly Comparison)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            เปรียบเทียบยอดรวมค่าไฟฟ้าและค่าเฉลี่ยต่อเดือนในแต่ละปี พ.ศ.
          </p>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded-md p-3 shadow-lg border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-200 text-sm">{label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        บันทึก {item.months} เดือน
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">ยอดรวมทั้งปี:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            ฿{item.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">เฉลี่ยต่อเดือน:</span>
                          <span className="font-bold text-blue-400 font-mono">
                            ฿{item.average.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
            />
            <Bar
              dataKey="total"
              name="ยอดรวมรายปี"
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
