import { DashboardKPIs } from '@/lib/services/analytics';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Zap, DollarSign } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const isYoYPositive = (kpis.yoyChangeRate || 0) > 0;
  const yoyFormatted = kpis.yoyChangeRate !== null
    ? `${Math.abs(kpis.yoyChangeRate).toFixed(1)}%`
    : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {/* Card 1: Total Cost */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ค่าไฟฟ้ารวมสะสม
          </span>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500">
            <Calendar className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
            <span className="truncate">ข้อมูลสะสม {kpis.totalRecordsCount} เดือน (ปี 2562 - {kpis.latestYearBe})</span>
          </div>
        </div>
      </div>

      {/* Card 2: Latest Year Total */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ยอดรวมปี {kpis.latestYearBe} (ล่าสุด)
          </span>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.latestYearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-[11px] truncate">
            {yoyFormatted ? (
              <span
                className={`inline-flex items-center font-medium mr-1.5 shrink-0 ${
                  isYoYPositive ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {isYoYPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {yoyFormatted}
              </span>
            ) : null}
            <span className="text-slate-500 truncate">เทียบปี {kpis.previousYearBe}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Monthly Average */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ค่าเฉลี่ยต่อเดือน
          </span>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 truncate">
            คำนวณจากทุกระเบียนที่มีการบันทึก
          </div>
        </div>
      </div>

      {/* Card 4: Peak Month */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ยอดสูงสุดในประวัติศาสตร์
          </span>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ฿{(kpis.maxRecord?.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-600 font-medium truncate">
            ประจำเดือน {kpis.maxRecord?.monthName} พ.ศ. {kpis.maxRecord?.yearBe}
          </div>
        </div>
      </div>
    </div>
  );
}
