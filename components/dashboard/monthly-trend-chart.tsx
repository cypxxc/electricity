'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyTrendItem } from '@/lib/services/analytics';
import { TrendingUp, Filter } from 'lucide-react';

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
              แนวโน้มค่าไฟฟ้ารายเดือน (Monthly Expenditure Trend)
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            แสดงการเปลี่ยนแปลงค่าไฟฟ้ารายเดือนตั้งแต่เริ่มบันทึก (หน่วย: บาท)
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-[11px] border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">แสดงทั้งหมด ({data.length} เดือน)</option>
            {availableYears.map((y) => (
              <option key={y} value={y.toString()}>
                เฉพาะปี พ.ศ. {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 h-64 w-full">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            ไม่มีข้อมูลสำหรับช่วงเวลานี้
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="periodLabel"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={selectedYear === 'all' ? Math.floor(filteredData.length / 10) : 0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlyTrendItem;
                    return (
                      <div className="bg-slate-900 text-white rounded p-2 shadow-lg border border-slate-800 text-xs">
                        <div className="font-semibold text-slate-300 text-[11px]">{item.fullLabel}</div>
                        <div className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                          ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
