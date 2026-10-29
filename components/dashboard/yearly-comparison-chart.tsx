'use client';

import { useState } from 'react';
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
import { YearlyComparisonItem, FiscalYearComparisonItem } from '@/lib/services/analytics';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type ComparisonMode = 'fiscal' | 'calendar';

interface YearlyComparisonChartProps {
  calendarData: YearlyComparisonItem[];
  fiscalData: FiscalYearComparisonItem[];
  onSelectYear?: (yearBe: string) => void;
}

export function YearlyComparisonChart({
  calendarData,
  fiscalData,
  onSelectYear,
}: YearlyComparisonChartProps) {
  const [periodMode, setPeriodMode] = useState<ComparisonMode>('fiscal');

  const incompleteCalYears = calendarData.filter((d) => !d.isComplete);
  const completeFYCount = fiscalData.filter((d) => d.isComplete).length;
  const totalFYCount = fiscalData.length;
  const minFY = fiscalData[0]?.fyBe;
  const maxFY = fiscalData[fiscalData.length - 1]?.fyBe;

  const chartData = periodMode === 'fiscal'
    ? fiscalData.map((d) => ({
        label: `ปีงบ ${d.fyBe}`,
        yearNum: d.fyBe,
        total: d.totalAmount,
        average: Math.round(d.averageMonthly),
        months: d.recordedMonths,
        isComplete: d.isComplete,
        coverageNote: d.isComplete ? '12 เดือนเต็ม (ต.ค. - ก.ย.)' : `บันทึก ${d.recordedMonths}/12 เดือน`,
        yoyRate: d.yoyChangeRate,
        yoyAmount: d.yoyChangeAmount,
      }))
    : calendarData.map((d) => ({
        label: `ปี ${d.yearBe}`,
        yearNum: d.yearBe,
        total: d.totalAmount,
        average: Math.round(d.averageMonthly),
        months: d.recordedMonths,
        isComplete: d.isComplete,
        coverageNote: d.coverageNote,
        yoyRate: null,
        yoyAmount: null,
      }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleBarClick(dataPoint: any) {
    if (dataPoint && dataPoint.activePayload && dataPoint.activePayload.length > 0) {
      const p = dataPoint.activePayload[0].payload;
      if (onSelectYear) {
        onSelectYear(p.yearNum.toString());
      }
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs flex flex-col justify-between">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              เปรียบเทียบค่าไฟฟ้ารายปี (Periodic Comparison)
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">หน่วย: บาท (THB)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {periodMode === 'fiscal'
              ? 'มุมมองปีงบประมาณไทย (ต.ค. - ก.ย.) ข้อมูลจัดกลุ่มตามรอบงบประมาณภาครัฐ'
              : incompleteCalYears.length > 0
              ? `มุมมองปีปฏิทิน (ม.ค. - ธ.ค.) หมายเหตุ: ปี ${incompleteCalYears.map((y) => `${y.yearBe} (${y.recordedMonths} เดือน)`).join(', ')}`
              : 'มุมมองปีปฏิทิน (ม.ค. - ธ.ค.) ข้อมูลครบถ้วน 12 เดือนทุกปี'}
          </p>
        </div>

        {/* Period Mode Toggle */}
        <div className="inline-flex rounded-xs border border-slate-300 p-0.5 bg-slate-50 text-[11px] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriodMode('fiscal')}
            className={`px-2.5 py-0.5 rounded-2xs font-medium transition-colors ${
              periodMode === 'fiscal'
                ? 'bg-[#0f2744] text-white shadow-2xs font-semibold'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ปีงบประมาณ (แนะนำ)
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode('calendar')}
            className={`px-2.5 py-0.5 rounded-2xs font-medium transition-colors ${
              periodMode === 'calendar'
                ? 'bg-[#0f2744] text-white shadow-2xs font-semibold'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ปีปฏิทิน
          </button>
        </div>
      </div>

      {/* Scope Strip with Audit Warning */}
      <div className="mt-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-xs flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-2">
          {periodMode === 'fiscal' ? (
            <span className="text-teal-800 flex items-center gap-1 font-sans font-medium text-[10.5px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> ข้อมูลปีงบประมาณ {minFY} – {maxFY} ({completeFYCount === totalFYCount ? `มีความสมบูรณ์ 100% (${totalFYCount} ปีงบ)` : `สมบูรณ์ ${completeFYCount}/${totalFYCount} ปีงบ`})
            </span>
          ) : (
            <span className="text-amber-800 flex items-center gap-1 font-sans font-medium text-[10.5px]">
              {incompleteCalYears.length > 0 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> ระวัง: ปี {incompleteCalYears.map((y) => y.yearBe).join(', ')} บันทึกไม่เต็ม 12 เดือน ควรพิจารณาจากค่าเฉลี่ยต่องวด
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-800" /> ข้อมูลปีปฏิทินทุกปีมีความสมบูรณ์ 100%
                </>
              )}
            </span>
          )}
        </div>
        <span>{chartData.length} รอบระยะเวลา</span>
      </div>

      {/* Chart Canvas */}
      <div className="mt-3 h-64 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            onClick={handleBarClick}
            margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-300 rounded-xs p-2.5 shadow-md text-xs min-w-[220px]">
                      <div className="font-semibold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>รอบระยะเวลา</span>
                        <span className="text-[#0f2744] font-bold">{label}</span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">ยอดรวมทั้งปี:</span>
                          <span className="font-bold font-mono text-slate-900">
                            ฿{item.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">จำนวนงวดที่บันทึก:</span>
                          <span className="font-medium font-mono text-slate-700">
                            {item.months} เดือน ({item.isComplete ? 'ครบสมบูรณ์' : 'ไม่เต็มปี'})
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
                          <span className="text-slate-500">เฉลี่ยต่องวด:</span>
                          <span className="font-bold font-mono text-teal-800">
                            ฿{item.average.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {item.yoyRate !== null && (
                          <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500">&Delta; เทียบปีงบก่อน:</span>
                            <span className={`font-bold font-mono ${item.yoyRate > 0 ? 'text-amber-800' : 'text-teal-800'}`}>
                              {item.yoyRate > 0 ? '+' : ''}{item.yoyRate.toFixed(1)}% ({item.yoyAmount > 0 ? '+' : ''}฿{Math.abs(item.yoyAmount).toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                            </span>
                          </div>
                        )}
                        {!item.isComplete && (
                          <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-2xs">
                            {item.coverageNote}
                          </div>
                        )}
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
              wrapperStyle={{ paddingBottom: 6, fontSize: 11 }}
            />
            <Bar
              dataKey="total"
              name="ยอดรวมค่าไฟฟ้า (THB)"
              fill="#1e3a5f"
              radius={[2, 2, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
