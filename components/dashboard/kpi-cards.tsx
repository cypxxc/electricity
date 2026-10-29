'use client';

import { DashboardKPIs, FiscalYearComparisonItem } from '@/lib/services/analytics';
import { calculatePercentageChange } from '@/lib/utils/math';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPIs;
  selectedYear?: string;
  selectedFYSummary?: FiscalYearComparisonItem | null;
}

export function KPICards({ kpis, selectedYear = 'all', selectedFYSummary }: KPICardsProps) {
  const isFiltered = selectedYear !== 'all' && selectedFYSummary;

  // Case 1: When a specific fiscal year is selected
  if (isFiltered && selectedFYSummary) {
    const fyNum = selectedFYSummary.fyBe;
    const prevFYNum = fyNum - 1;
    const yoyRate = selectedFYSummary.yoyChangeRate;
    const yoyAmt = selectedFYSummary.yoyChangeAmount;
    const isYoyPositive = (yoyRate || 0) > 0;
    const prevTotal = yoyAmt !== null ? selectedFYSummary.totalAmount - yoyAmt : null;
    const avgVsOverallRate = calculatePercentageChange(selectedFYSummary.averageMonthly, kpis.monthlyAverage);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Selected FY Total */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ค่าไฟฟ้ารวมปีงบประมาณ {fyNum}
              </span>
              <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded-xs font-medium font-mono">
                1 ต.ค.–30 ก.ย.
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{selectedFYSummary.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ความครอบคลุม</span>
            <span className="font-mono font-medium text-slate-700">
              {selectedFYSummary.recordedMonths} เดือน (ครบ 12 งวด)
            </span>
          </div>
        </div>

        {/* Metric 2: YoY Comparison with Previous FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                เทียบปีงบประมาณ {prevFYNum} (YoY)
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
                ผลต่างรายปี
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {yoyRate !== null ? (
                <>
                  <span
                    className={`inline-flex items-center text-2xl font-bold font-mono tracking-tight ${
                      isYoyPositive ? 'text-rose-700' : 'text-teal-700'
                    }`}
                  >
                    {isYoyPositive ? (
                      <ArrowUpRight className="w-5 h-5 mr-0.5 inline" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 mr-0.5 inline" />
                    )}
                    {isYoyPositive ? '+' : ''}{yoyRate.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({yoyAmt && yoyAmt > 0 ? '+' : ''}฿{yoyAmt?.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                  </span>
                </>
              ) : (
                <div className="text-xl font-bold font-mono text-slate-600">
                  ปีฐานอ้างอิง
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ยอดปีงบ {prevFYNum}</span>
            <span className="font-mono font-medium text-slate-700">
              {prevTotal !== null
                ? `฿${prevTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'ไม่มีข้อมูลงวดก่อนหน้า'}
            </span>
          </div>
        </div>

        {/* Metric 3: Monthly Average for this FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ค่าเฉลี่ยต่องวดปีงบ {fyNum}
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
                เฉลี่ย/เดือน
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{selectedFYSummary.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>เทียบค่าเฉลี่ยสะสมทั้งระบบ</span>
            <span
              className={`font-mono font-medium ${
                (avgVsOverallRate || 0) > 0 ? 'text-amber-700' : 'text-teal-700'
              }`}
            >
              {(avgVsOverallRate || 0) > 0 ? '+' : ''}
              {avgVsOverallRate?.toFixed(1)}% (ฐาน ฿{Math.round(kpis.monthlyAverage).toLocaleString()})
            </span>
          </div>
        </div>

        {/* Metric 4: Peak Month for this FY */}
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                งวดสูงสุดของปีงบ {fyNum}
              </span>
              <span className="text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
                PEAK ของปี
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              ฿{(selectedFYSummary.maxMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>งวดเดือนที่เกิดสถิติ</span>
            <span className="font-semibold text-slate-800 font-mono">
              {selectedFYSummary.maxMonth?.monthName} {selectedFYSummary.maxMonth?.yearBe}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: All Time (Default view)
  const currentFY = kpis.latestFiscalYearBe || kpis.latestYearBe;
  const prevFY = kpis.previousFiscalYearBe || (currentFY - 1);
  const currentFYTotal = kpis.latestFiscalYearTotal || kpis.latestYearTotal;

  // Fiscal YoY rate comparison (Thai Fiscal Year Standard)
  const fyRate = kpis.fiscalYoyChangeRate !== null ? kpis.fiscalYoyChangeRate : kpis.yoyChangeRate;
  const isFYRatePositive = (fyRate || 0) > 0;
  const fyRateFormatted = fyRate !== null
    ? `${Math.abs(fyRate).toFixed(1)}%`
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Metric 1: Cumulative Expenditure */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ค่าไฟฟ้ารวมสะสมทั้งหมด
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>ความครอบคลุมข้อมูล</span>
          <span className="font-mono font-medium text-slate-700">
            {kpis.totalRecordsCount} เดือน (ปีงบ {kpis.firstFiscalYearBe || 2563} – {currentFY} รวม {kpis.totalFiscalYearsCount || 7} ปีงบ)
          </span>
        </div>
      </div>

      {/* Metric 2: Current Fiscal Year Total (Thai Fiscal Year: Oct 1 - Sep 30) */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ค่าไฟฟ้ารวมปีงบประมาณ {currentFY}
            </span>
            <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded-xs font-medium font-mono">
              1 ต.ค.–30 ก.ย.
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{currentFYTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">เทียบปีงบประมาณ {prevFY} (YoY)</span>
          {fyRateFormatted ? (
            <span
              className={`inline-flex items-center font-mono font-semibold text-[11px] ${
                isFYRatePositive ? 'text-rose-700' : 'text-teal-700'
              }`}
            >
              {isFYRatePositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {isFYRatePositive ? '+' : '-'}{fyRateFormatted}
            </span>
          ) : (
            <span className="text-slate-400 font-mono">-</span>
          )}
        </div>
      </div>

      {/* Metric 3: Monthly Average */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ค่าเฉลี่ยต่องวดเดือน
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>เกณฑ์เปรียบเทียบ</span>
          <span className="text-slate-700 font-medium">
            เกณฑ์เฉลี่ยสะสม {kpis.totalRecordsCount} งวด
          </span>
        </div>
      </div>

      {/* Metric 4: Historical Peak */}
      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ยอดสูงสุดในประวัติศาสตร์
            </span>
            <span className="text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs font-medium font-mono">
              PEAK
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ฿{(kpis.maxRecord?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>งวดเดือนที่เกิดสถิติ</span>
          <span className="font-semibold text-slate-800 font-mono">
            {kpis.maxRecord?.monthName} {kpis.maxRecord?.yearBe} {kpis.maxRecord?.fyBe ? `(ปีงบ ${kpis.maxRecord.fyBe})` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
