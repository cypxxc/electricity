'use client';

import { useEffect } from 'react';
import { AnomalyRecord } from '@/lib/services/analytics';
import { X, ShieldAlert, Info, ArrowUpRight } from 'lucide-react';

interface AnomalyModalProps {
  anomaly: AnomalyRecord | null;
  onClose: () => void;
  onFilterMonth?: (yearBe: number, month: number) => void;
}

export function AnomalyModal({ anomaly, onClose, onFilterMonth }: AnomalyModalProps) {
  useEffect(() => {
    if (!anomaly) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anomaly, onClose]);

  if (!anomaly) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anomaly-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-xs shadow-xl border border-slate-300 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-900 rounded-xs border border-amber-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="anomaly-modal-title" className="text-xs sm:text-sm font-bold text-slate-900">
                รายละเอียดการตรวจพบค่าเบี่ยงเบนทางสถิติ (Statistical Anomaly Inspection)
              </h3>
              <p className="text-[10.5px] text-slate-500 font-mono">
                งวดประจำเดือน {anomaly.monthName} พ.ศ. {anomaly.yearBe}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                ยอดที่บันทึกจริง
              </span>
              <span className="text-base font-bold font-mono text-slate-950 tabular-nums">
                ฿{anomaly.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {anomaly.isPeak && (
                <span className="inline-block mt-1 text-[9.5px] font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-1 rounded-2xs">
                  ★ ยอดสูงสุดในประวัติศาสตร์
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                ค่าเฉลี่ยฐานข้อมูล (Mean)
              </span>
              <span className="text-base font-bold font-mono text-slate-800 tabular-nums">
                ฿{anomaly.baselineMean.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                SD: ฿{anomaly.baselineStdDev.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                เกณฑ์ตรวจจับ (+2&sigma;)
              </span>
              <span className="text-base font-bold font-mono text-amber-800 tabular-nums">
                ฿{anomaly.threshold.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                Z-Score: +{anomaly.zScore.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Variance Breakdown */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xs p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">ส่วนเบี่ยงเบนจากค่าเฉลี่ยระบบ:</span>
              <span className="font-mono font-bold text-amber-800 inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +฿{anomaly.deviationAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+{anomaly.deviationPct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
              <span className="text-slate-600">เกณฑ์การพิจารณาความผิดปกติ:</span>
              <span className="font-medium text-slate-800">{anomaly.reason}</span>
            </div>
          </div>

          {/* Operational Context & Disclaimer */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xs text-[11px] space-y-1.5 text-amber-950">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>บริบทการวิเคราะห์เชิงปฏิบัติการ (Operational Context):</span>
            </div>
            <p className="leading-relaxed">
              {anomaly.operationalContext}
            </p>
            <p className="text-[10.5px] text-amber-800/90 italic pt-1 border-t border-amber-200/50">
              * ข้อควรระวัง: การจำแนกเป็นค่าเบี่ยงเบนทางสถิติ (Statistical Outlier) คำนวณจากเกณฑ์การกระจายตัวของข้อมูลเท่านั้น ไม่ถือเป็นหลักฐานความบกพร่องในการปฏิบัติงานหรือข้อผิดพลาดทางการเงินโดยอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onFilterMonth ? (
            <button
              type="button"
              onClick={() => {
                onFilterMonth(anomaly.yearBe, anomaly.month);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#0f2744] hover:bg-[#1e3a5f] rounded-xs transition-colors shadow-2xs"
            >
              <span>กรองดูเฉพาะงวดนี้</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xs border border-slate-300 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
