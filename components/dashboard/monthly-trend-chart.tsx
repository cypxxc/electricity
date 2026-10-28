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

  // Compute stats for current view
  const currentViewTotal = useMemo(() => {
    return filteredData.reduce((sum, d) => sum + d.amount, 0);
  }, [filteredData]);

  const currentViewAvg = useMemo(() => {
    return filteredData.length > 0 ? currentViewTotal / filteredData.length : 0;
  }, [filteredData, currentViewTotal]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                แนวโน้มค่าไฟฟ้ารายเดือน (Monthly Expenditure Trend)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              กราฟแสดงเส้นทางการใช้จ่ายค่าไฟฟ้ารายเดือน (หน่วย: บาท)
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
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
        </div>

        {/* Quick Mini stats bar for the chart */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">จำนวนเดือน:</span>
            <strong className="font-mono text-slate-800">{filteredData.length} เดือน</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ยอดรวมช่วงนี้:</span>
            <strong className="font-mono text-blue-700">
              ฿{currentViewTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">เฉลี่ยต่อเดือน:</span>
            <strong className="font-mono text-slate-800">
              ฿{currentViewAvg.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-6 h-80 sm:h-92 w-full">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            ไม่มีข้อมูลสำหรับช่วงเวลานี้
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="periodLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                interval={selectedYear === 'all' ? Math.floor(filteredData.length / 10) : 0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
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
                      <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs min-w-[160px]">
                        <div className="font-semibold text-slate-300 flex items-center justify-between">
                          <span>{item.fullLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#{item.id}</span>
                        </div>
                        <div className="text-base font-bold text-blue-400 font-mono mt-1.5">
                          ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          ค่าไฟฟ้าหน่วยปกติ
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
                strokeWidth={2.5}
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
