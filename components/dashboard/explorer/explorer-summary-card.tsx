'use client';

import { Calendar, BarChart3, Layers } from 'lucide-react';
import { ChartViewMode, MonthlyStats, YearlyStats, YoYStats } from './explorer-types';

interface ExplorerSummaryCardProps {
  viewMode: ChartViewMode;
  monthlyStats: MonthlyStats;
  yearlyStats: YearlyStats;
  yoyStats: YoYStats;
  analyticalNarrativeText: string;
}

export function ExplorerSummaryCard({
  viewMode,
  monthlyStats,
  yearlyStats,
  yoyStats,
  analyticalNarrativeText,
}: ExplorerSummaryCardProps) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          {viewMode === 'monthly' ? (
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
          ) : viewMode === 'yearly' ? (
            <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-teal-700" />
          )}
          <span>บทสรุปแนวโน้มจากการคำนวณจริง (Analytical Summary)</span>
        </div>

        {/* Quick Metrics Badge Row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {viewMode === 'monthly' && (
            <>
              <span className="text-slate-600">
                ยอดรวม: <strong className="text-slate-900">฿{monthlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                เฉลี่ย: <strong className="text-slate-900">฿{monthlyStats.avg.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</strong>
              </span>
              {monthlyStats.maxMonth && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-amber-800 font-sans">
                    สูงสุด: <strong>{monthlyStats.maxMonth.name}</strong> (฿{monthlyStats.maxMonth.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                  </span>
                </>
              )}
            </>
          )}

          {viewMode === 'yearly' && (
            <>
              <span className="text-slate-600">
                ยอดรวมทุกปี: <strong className="text-slate-900">฿{yearlyStats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                ปีสูงสุด: <strong className="text-amber-800">ปีงบ {yearlyStats.maxYear?.year}</strong> (฿{yearlyStats.maxYear?.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                ปีต่ำสุด: <strong className="text-slate-800">ปีงบ {yearlyStats.minYear?.year}</strong> (฿{yearlyStats.minYear?.amount.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
              </span>
            </>
          )}

          {viewMode === 'yoy' && (
            <>
              <span className="text-slate-600">
                ผลต่างรวม: <strong className={(yoyStats.netDiff || 0) > 0 ? 'text-amber-800' : 'text-teal-800'}>
                  {(yoyStats.netDiff || 0) > 0 ? '+' : ''}฿{Math.abs(yoyStats.netDiff || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({(yoyStats.netPct || 0) > 0 ? '+' : ''}{(yoyStats.netPct || 0).toFixed(1)}%)
                </strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-sans">
                เทียบ {yoyStats.comparedMonthsCount} เดือนตรงกัน
              </span>
            </>
          )}
        </div>
      </div>

      {/* Narrative Text Paragraph */}
      <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1 border-t border-slate-200/70">
        {analyticalNarrativeText}
      </p>
    </div>
  );
}
