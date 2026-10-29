import { THAI_MONTHS } from '../../validations/record';
import { getFiscalQuarter, formatFiscalYearRange, calculatePercentageChange } from '../../utils/math';
import type { MonthlyTrendItem, FiscalYearComparisonItem, TrendNarrative } from './types';

export function generateTrendNarrative(
  monthlyTrends: MonthlyTrendItem[],
  fiscalYearComparison: FiscalYearComparisonItem[],
  sortedFYAsc: number[],
  totalRecordsCount: number
): TrendNarrative {
  const lastIndex = monthlyTrends.length - 1;
  const latestItem = monthlyTrends[lastIndex];
  const prevItem = lastIndex > 0 ? monthlyTrends[lastIndex - 1] : null;

  const sameMonthLastYearItem = monthlyTrends.find(
    (m) => m.yearBe === latestItem.yearBe - 1 && m.month === latestItem.month
  );

  // Latest FY vs Previous FY
  const latestFYNum = sortedFYAsc[sortedFYAsc.length - 1] || 2569;
  const prevFYNum = sortedFYAsc[sortedFYAsc.length - 2] || latestFYNum - 1;
  const latestFYItem = fiscalYearComparison.find((f) => f.fyBe === latestFYNum);
  const prevFYItem = fiscalYearComparison.find((f) => f.fyBe === prevFYNum);

  const fyYoyChangeAmount =
    latestFYItem && prevFYItem && prevFYItem.totalAmount > 0
      ? latestFYItem.totalAmount - prevFYItem.totalAmount
      : null;
  const fyYoyChangeRate =
    latestFYItem && prevFYItem && prevFYItem.totalAmount > 0
      ? calculatePercentageChange(latestFYItem.totalAmount, prevFYItem.totalAmount)
      : null;

  // Trend direction determination
  let trendDirection: TrendNarrative['trendDirection'] = 'stable';
  let trendDirectionTh = 'ระดับการใช้จ่ายทรงตัว';

  const momRate = latestItem.momChangeRate;
  const yoyRate = latestItem.yoyChangeRate;

  if (momRate !== null && yoyRate !== null) {
    if (momRate < -1 && yoyRate < -1) {
      trendDirection = 'decreasing';
      trendDirectionTh = 'มีแนวโน้มลดลงอย่างต่อเนื่อง';
    } else if (momRate > 1 && yoyRate > 1) {
      trendDirection = 'increasing';
      trendDirectionTh = 'มีแนวโน้มปรับตัวสูงขึ้น';
    } else if (Math.abs(momRate) <= 1 && Math.abs(yoyRate) <= 1) {
      trendDirection = 'stable';
      trendDirectionTh = 'ระดับการใช้จ่ายคงที่';
    } else {
      trendDirection = 'mixed';
      trendDirectionTh = 'ทิศทางผสมผสานตามปัจจัยฤดูกาล';
    }
  }

  const momText =
    momRate !== null
      ? `${momRate > 0 ? '+' : ''}${momRate.toFixed(1)}% (${momRate > 0 ? '+' : ''}฿${Math.abs(latestItem.momChangeAmount || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
      : 'ไม่มีข้อมูลงวดก่อนหน้า';

  const yoyText =
    yoyRate !== null
      ? `${yoyRate > 0 ? '+' : ''}${yoyRate.toFixed(1)}%`
      : 'ไม่มีข้อมูลงวดปีก่อนหน้า';

  const fyText =
    fyYoyChangeRate !== null
      ? `${fyYoyChangeRate > 0 ? '+' : ''}${fyYoyChangeRate.toFixed(1)}% (${fyYoyChangeRate > 0 ? '+' : ''}฿${Math.abs(fyYoyChangeAmount || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })})`
      : 'ไม่มีข้อมูลปีงบก่อนหน้า';

  const latestQ = getFiscalQuarter(latestItem.month);
  const isFYCompleteText = latestFYItem?.isComplete
    ? 'มีข้อมูลครบ 12 เดือน'
    : `บันทึกแล้ว ${latestFYItem?.recordedMonths || 0}/12 เดือน (ระหว่างปีงบประมาณ)`;

  const trendSummaryTh = `ค่าไฟฟ้างวดล่าสุด (${latestItem.fullLabel} ${latestQ.shortLabel} ปีงบประมาณ ${latestItem.fyBe}) บันทึกที่ ฿${latestItem.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} โดยเปลี่ยนแปลง ${momText} เทียบเดือนก่อนหน้า และ ${yoyText} เทียบช่วงเดียวกันปีก่อนหน้า ในระดับปีงบประมาณ ${latestFYNum} (${formatFiscalYearRange(latestFYNum)}) ${isFYCompleteText} ยอดรวม ฿${(latestFYItem?.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} เปลี่ยนแปลง ${fyText} เทียบปีงบประมาณ ${prevFYNum}`;

  return {
    latestMonth: {
      yearBe: latestItem.yearBe,
      month: latestItem.month,
      monthName: THAI_MONTHS[latestItem.month - 1] || `${latestItem.month}`,
      periodLabel: latestItem.periodLabel,
      amount: latestItem.amount,
    },
    previousMonth: prevItem
      ? {
          yearBe: prevItem.yearBe,
          month: prevItem.month,
          monthName: THAI_MONTHS[prevItem.month - 1] || `${prevItem.month}`,
          periodLabel: prevItem.periodLabel,
          amount: prevItem.amount,
        }
      : null,
    momChangeAmount: latestItem.momChangeAmount,
    momChangeRate: latestItem.momChangeRate,
    sameMonthPreviousYear: sameMonthLastYearItem
      ? {
          yearBe: sameMonthLastYearItem.yearBe,
          month: sameMonthLastYearItem.month,
          amount: sameMonthLastYearItem.amount,
        }
      : null,
    yoySameMonthChangeAmount: latestItem.yoyChangeAmount,
    yoySameMonthChangeRate: latestItem.yoyChangeRate,
    currentFiscalYear: {
      fyBe: latestFYNum,
      monthsCount: latestFYItem?.recordedMonths || 0,
      total: latestFYItem?.totalAmount || 0,
      label: `ปีงบประมาณ ${latestFYNum} (ต.ค. ${latestFYNum - 1} – ก.ย. ${latestFYNum})`,
    },
    previousFiscalYear: {
      fyBe: prevFYNum,
      monthsCount: prevFYItem?.recordedMonths || 0,
      total: prevFYItem?.totalAmount || 0,
      label: `ปีงบประมาณ ${prevFYNum} (ต.ค. ${prevFYNum - 1} – ก.ย. ${prevFYNum})`,
    },
    fyYoyChangeAmount,
    fyYoyChangeRate,
    trendDirection,
    trendDirectionTh,
    trendSummaryTh,
    dataCoverage: {
      totalRecords: totalRecordsCount,
      startLabel: monthlyTrends[0]?.fullLabel || '-',
      endLabel: latestItem.fullLabel,
      completeFiscalYears: fiscalYearComparison.filter((fy) => fy.isComplete).length,
    },
  };
}
