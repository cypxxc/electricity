'use client';

import { TrendNarrative, FiscalYearComparisonItem } from '@/lib/services/analytics';
import { TrendingDown, TrendingUp, Minus, ArrowUpRight, ArrowDownRight, ShieldCheck, Filter } from 'lucide-react';

interface TrendNarrativeBannerProps {
  narrative: TrendNarrative;
  selectedYear?: string;
  selectedFYSummary?: FiscalYearComparisonItem | null;
}

export function TrendNarrativeBanner({
  narrative,
  selectedYear = 'all',
  selectedFYSummary,
}: TrendNarrativeBannerProps) {
  if (!narrative || !narrative.latestMonth) {
    return null;
  }

  const isFiltered = selectedYear !== 'all' && selectedFYSummary;

  // Render for specific selected Fiscal Year
  if (isFiltered && selectedFYSummary) {
    const fyNum = selectedFYSummary.fyBe;
    const prevFYNum = fyNum - 1;
    const yoyRate = selectedFYSummary.yoyChangeRate;
    const yoyAmt = selectedFYSummary.yoyChangeAmount;
    const isYoyPositive = (yoyRate || 0) > 0;

    let trendDir: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trendDirTh = 'แนวโน้มคงที่ใกล้เคียงปีก่อนหน้า';
    if (yoyRate !== null) {
      if (yoyRate < -1.0) {
        trendDir = 'decreasing';
        trendDirTh = 'แนวโน้มลดลงจากปีก่อนหน้า';
      } else if (yoyRate > 1.0) {
        trendDir = 'increasing';
        trendDirTh = 'แนวโน้มเพิ่มขึ้นจากปีก่อนหน้า';
      }
    } else {
      trendDirTh = 'ปีฐานเริ่มต้นในระบบ';
    }

    const yoySummaryText =
      yoyRate !== null
        ? `เปรียบเทียบกับปีงบประมาณ ${prevFYNum} มียอดเปลี่ยนแปลง ${yoyRate > 0 ? '+' : ''}${yoyRate.toFixed(1)}% (${yoyAmt && yoyAmt > 0 ? '+' : ''}฿${yoyAmt?.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท)`
        : `เป็นปีแรกสุดในฐานข้อมูลที่บันทึกครบถ้วน (ปีฐานเริ่มต้น)`;

    const maxMonthStr = selectedFYSummary.maxMonth
      ? `${selectedFYSummary.maxMonth.monthName} ${selectedFYSummary.maxMonth.yearBe} (฿${selectedFYSummary.maxMonth.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
      : '-';

    const minMonthStr = selectedFYSummary.minMonth
      ? `${selectedFYSummary.minMonth.monthName} ${selectedFYSummary.minMonth.yearBe} (฿${selectedFYSummary.minMonth.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
      : '-';

    return (
      <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3">
        {/* Header & Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              บทวิเคราะห์แนวโน้มและทิศทางการใช้จ่าย (Expenditure Trend Intelligence)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Trend Direction Tag */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[11px] font-semibold font-mono border ${
                trendDir === 'decreasing'
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : trendDir === 'increasing'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {trendDir === 'decreasing' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : trendDir === 'increasing' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{trendDirTh}</span>
            </span>

            {/* Selected FY Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10.5px] font-mono text-teal-900 bg-teal-50 border border-teal-200">
              <Filter className="w-3 h-3 text-teal-600" />
              <span>โฟกัส: ปีงบประมาณ {fyNum} (ครบ {selectedFYSummary.recordedMonths} งวด)</span>
            </span>
          </div>
        </div>

        {/* 4 Quantitative Analytical KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Tile 1: Total for FY */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              ยอดรวมปีงบ {fyNum}
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
              ฿{selectedFYSummary.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              1 ต.ค. {prevFYNum} – 30 ก.ย. {fyNum}
            </div>
          </div>

          {/* Tile 2: YoY Change */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              เทียบปีงบ {prevFYNum} (YoY)
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              {yoyRate !== null ? (
                <span
                  className={`text-base sm:text-lg font-bold font-mono tabular-nums inline-flex items-center ${
                    isYoyPositive ? 'text-amber-800' : 'text-teal-800'
                  }`}
                >
                  {isYoyPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {yoyRate > 0 ? '+' : ''}{yoyRate.toFixed(1)}%
                </span>
              ) : (
                <span className="text-base font-bold font-mono text-slate-600">ปีฐาน</span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {yoyAmt !== null ? `${yoyAmt > 0 ? '+' : ''}฿${Math.abs(yoyAmt).toLocaleString('th-TH', { maximumFractionDigits: 0 })}` : 'งวดเริ่มแรก'}
            </div>
          </div>

          {/* Tile 3: Peak Month */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
              งวดสูงสุด (Peak Month)
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums truncate">
              ฿{(selectedFYSummary.maxMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">
              {selectedFYSummary.maxMonth?.monthName} {selectedFYSummary.maxMonth?.yearBe}
            </div>
          </div>

          {/* Tile 4: Min Month */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
              งวดประหยัดสุด (Lowest)
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums truncate">
              ฿{(selectedFYSummary.minMonth?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">
              {selectedFYSummary.minMonth?.monthName} {selectedFYSummary.minMonth?.yearBe}
            </div>
          </div>
        </div>

        {/* Factual Narrative Paragraph */}
        <div className="px-3 py-2 bg-slate-100/70 border border-slate-200 rounded-xs text-[11.5px] text-slate-700 leading-relaxed font-sans">
          <strong className="text-slate-900 font-semibold mr-1.5">สรุปภาพรวมปีงบประมาณ {fyNum}:</strong>
          บันทึกข้อมูลค่าไฟฟ้าครบ 12 งวดเดือน ยอดใช้จ่ายรวม ฿{selectedFYSummary.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท เฉลี่ยเดือนละ ฿{selectedFYSummary.averageMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท {yoySummaryText} โดยงวดที่มีค่าใช้จ่ายสูงสุดคือ {maxMonthStr} และงวดที่ประหยัดที่สุดคือ {minMonthStr}
        </div>
      </div>
    );
  }

  // Default view: All Time Narrative
  const {
    latestMonth,
    momChangeAmount,
    momChangeRate,
    yoySameMonthChangeAmount,
    yoySameMonthChangeRate,
    currentFiscalYear,
    previousFiscalYear,
    fyYoyChangeAmount,
    fyYoyChangeRate,
    trendDirection,
    trendDirectionTh,
    trendSummaryTh,
    dataCoverage,
  } = narrative;

  const isMomPositive = (momChangeRate || 0) > 0;
  const isYoyPositive = (yoySameMonthChangeRate || 0) > 0;
  const isFyPositive = (fyYoyChangeRate || 0) > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            บทวิเคราะห์แนวโน้มและทิศทางการใช้จ่าย (Expenditure Trend Intelligence)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trend Direction Tag */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[11px] font-semibold font-mono border ${
              trendDirection === 'decreasing'
                ? 'bg-teal-50 text-teal-800 border-teal-300'
                : trendDirection === 'increasing'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {trendDirection === 'decreasing' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : trendDirection === 'increasing' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{trendDirectionTh}</span>
          </span>

          {/* Coverage Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10.5px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <span>ฐานข้อมูลสะสม {dataCoverage.totalRecords} งวด ({dataCoverage.startLabel} – {dataCoverage.endLabel})</span>
          </span>
        </div>
      </div>

      {/* 4 Quantitative Analytical KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Tile 1: Latest Month */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            งวดล่าสุด ({latestMonth.periodLabel})
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
            ฿{latestMonth.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            ค่าใช้จ่ายจริงประจำเดือน
          </div>
        </div>

        {/* Tile 2: Month-over-Month (MoM) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            เทียบเดือนก่อนหน้า (MoM)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-base sm:text-lg font-bold font-mono tabular-nums inline-flex items-center ${
                isMomPositive ? 'text-amber-800' : 'text-teal-800'
              }`}
            >
              {isMomPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {momChangeRate !== null ? `${momChangeRate > 0 ? '+' : ''}${momChangeRate.toFixed(1)}%` : '-'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {momChangeAmount !== null ? `${momChangeAmount > 0 ? '+' : ''}฿${Math.abs(momChangeAmount).toLocaleString('th-TH', { maximumFractionDigits: 0 })}` : '-'}
          </div>
        </div>

        {/* Tile 3: Same-Month Year-over-Year (YoY) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            เทียบช่วงเดียวกันปีก่อน (YoY)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-base sm:text-lg font-bold font-mono tabular-nums inline-flex items-center ${
                isYoyPositive ? 'text-amber-800' : 'text-teal-800'
              }`}
            >
              {isYoyPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {yoySameMonthChangeRate !== null ? `${yoySameMonthChangeRate > 0 ? '+' : ''}${yoySameMonthChangeRate.toFixed(1)}%` : '-'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {yoySameMonthChangeAmount !== null ? `${yoySameMonthChangeAmount > 0 ? '+' : ''}฿${Math.abs(yoySameMonthChangeAmount).toLocaleString('th-TH', { maximumFractionDigits: 0 })}` : '-'}
          </div>
        </div>

        {/* Tile 4: Fiscal Year Cumulative */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xs p-2.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            ปีงบ {currentFiscalYear.fyBe} เทียบ {previousFiscalYear.fyBe}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-base sm:text-lg font-bold font-mono tabular-nums inline-flex items-center ${
                isFyPositive ? 'text-amber-800' : 'text-teal-800'
              }`}
            >
              {isFyPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {fyYoyChangeRate !== null ? `${fyYoyChangeRate > 0 ? '+' : ''}${fyYoyChangeRate.toFixed(1)}%` : '-'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
            {fyYoyChangeAmount !== null ? `${fyYoyChangeAmount > 0 ? '+' : ''}฿${Math.abs(fyYoyChangeAmount).toLocaleString('th-TH', { maximumFractionDigits: 0 })}` : '-'}
          </div>
        </div>
      </div>

      {/* Factual Narrative Paragraph */}
      <div className="px-3 py-2 bg-slate-100/70 border border-slate-200 rounded-xs text-[11.5px] text-slate-700 leading-relaxed font-sans">
        <strong className="text-slate-900 font-semibold mr-1.5">ข้อสรุปการวิเคราะห์เชิงตัวเลข:</strong>
        {trendSummaryTh}
      </div>
    </div>
  );
}
