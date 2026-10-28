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

  // Overall statistics
  const totalAllYears = data.reduce((sum, d) => sum + d.totalAmount, 0);
  const maxYear = [...data].sort((a, b) => b.totalAmount - a.totalAmount)[0];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                เปรียบเทียบค่าไฟฟ้ารายปี (Yearly Expenditure Comparison)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              เปรียบเทียบยอดรวมค่าไฟฟ้าและค่าเฉลี่ยต่อเดือนในแต่ละปี พ.ศ. 2562 – 2569
            </p>
          </div>
        </div>

        {/* Quick Mini stats bar */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ช่วงปีบันทึก:</span>
            <strong className="font-mono text-slate-800">{data.length} ปี (62-69)</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ปีที่ใช้สูงสุด:</span>
            <strong className="font-mono text-emerald-700">
              ปี {maxYear?.yearBe} (฿{maxYear?.totalAmount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">รวมทุกปี:</span>
            <strong className="font-mono text-slate-800">
              ฿{totalAllYears.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-6 h-80 sm:h-92 w-full">
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
                    <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs min-w-[200px]">
                      <div className="font-bold text-slate-100 text-sm">{label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        บันทึกข้อมูล {item.months} เดือน
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-slate-400">ยอดรวมทั้งปี:</span>
                          <span className="font-bold text-emerald-400 font-mono text-xs">
                            ฿{item.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-slate-400">เฉลี่ยต่อเดือน:</span>
                          <span className="font-bold text-blue-400 font-mono text-xs">
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
              name="ยอดรวมรายปี (บาท)"
              fill="#0ea5e9"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
