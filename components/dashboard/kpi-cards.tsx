import { DashboardKPIs } from '@/lib/services/analytics';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Zap, DollarSign, Award } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const isYoYPositive = (kpis.yoyChangeRate || 0) > 0;
  const yoyFormatted = kpis.yoyChangeRate !== null
    ? `${Math.abs(kpis.yoyChangeRate).toFixed(1)}%`
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: Total Cost */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-blue-600 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ค่าไฟฟ้ารวมสะสม
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>สะสม <strong className="text-slate-700 font-semibold">{kpis.totalRecordsCount}</strong> เดือน (ปี 2562 – {kpis.latestYearBe})</span>
          </div>
        </div>
      </div>

      {/* Card 2: Latest Year Total */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-emerald-600 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ยอดรวมปี พ.ศ. {kpis.latestYearBe} (ล่าสุด)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.latestYearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs">
            {yoyFormatted ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] mr-2 ${
                  isYoYPositive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isYoYPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {yoyFormatted}
              </span>
            ) : null}
            <span className="text-slate-500 truncate">เทียบช่วงเดียวกันปี {kpis.previousYearBe}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Monthly Average */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-indigo-600 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ค่าเฉลี่ยต่อเดือน
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1.5" />
            คำนวณจากยอดรวมทุกเดือนที่มีการบันทึก
          </div>
        </div>
      </div>

      {/* Card 4: Historical Peak */}
      <div className="bg-white border border-slate-200/90 border-t-4 border-t-amber-500 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ยอดสูงสุดในประวัติศาสตร์
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{(kpis.maxRecord?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-slate-700">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
              ประจำเดือน {kpis.maxRecord?.monthName} {kpis.maxRecord?.yearBe}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
