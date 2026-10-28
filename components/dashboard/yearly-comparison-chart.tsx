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
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
              เปรียบเทียบค่าไฟฟ้ารายปี (Yearly Comparison)
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            เปรียบเทียบยอดรวมค่าไฟฟ้าและค่าเฉลี่ยต่อเดือนในแต่ละปี พ.ศ.
          </p>
        </div>
      </div>

      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded p-2.5 shadow-lg border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-200 text-xs">{label}</div>
                      <div className="text-[10px] text-slate-400">
                        บันทึก {item.months} เดือน
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-0.5">
                        <div className="flex justify-between gap-3 text-[11px]">
                          <span className="text-slate-400">ยอดรวมทั้งปี:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            ฿{item.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 text-[11px]">
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
              wrapperStyle={{ paddingBottom: 6, fontSize: 10 }}
            />
            <Bar
              dataKey="total"
              name="ยอดรวมรายปี"
              fill="#0ea5e9"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
