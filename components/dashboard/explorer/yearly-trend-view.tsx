'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import type { YearlyViewDataItem } from './explorer-types';

interface YearlyTrendViewProps {
  data: YearlyViewDataItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onElementClick?: (e: any) => void;
}

export function YearlyTrendView({ data, onElementClick }: YearlyTrendViewProps) {
  // If data length exceeds 8 bars, enable smooth horizontal scrolling so bars and labels stay legible
  const isScrollable = data.length > 8;
  const containerWidth = isScrollable ? `${Math.max(100, data.length * 72)}px` : '100%';

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-thin">
      <div style={{ width: containerWidth, minWidth: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onClick={onElementClick}
            margin={{ top: 24, right: 16, left: 6, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#475569' }}
              tickLine={{ stroke: '#cbd5e1' }}
              axisLine={{ stroke: '#cbd5e1' }}
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
                  return (
                    <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[210px]">
                      <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>รอบปีงบประมาณ</span>
                        <span className="text-[#0f2744] font-bold">ปีงบ {item.fyBe}</span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">ค่าไฟฟ้ารวมทั้งปี:</span>
                          <span className="font-bold font-mono text-slate-900">
                            ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">เฉลี่ยต่อเดือน:</span>
                          <span className="font-mono text-slate-700">
                            ฿{item.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">จำนวนงวดที่บันทึก:</span>
                          <span className="font-mono text-slate-700">{item.recordedMonths}/12 เดือน</span>
                        </div>
                        {item.yoyChangeRate !== null && (
                          <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">เทียบปีงบก่อนหน้า:</span>
                            <span className={`font-mono font-semibold ${item.yoyChangeRate > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                              {item.yoyChangeRate > 0 ? '+' : ''}{item.yoyChangeRate.toFixed(1)}%
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
            <Bar
              dataKey="metricValue"
              fill="#0f2744"
              radius={[2, 2, 0, 0]}
              maxBarSize={48}
            >
              <LabelList
                dataKey="metricValue"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => `฿${Math.round(Number(val)).toLocaleString('th-TH')}`}
                fill="#0f2744"
                fontSize={10}
                fontWeight={600}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
