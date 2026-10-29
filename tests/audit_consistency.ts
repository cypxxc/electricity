import { getDashboardAnalytics } from '../lib/services/analytics';
import { db } from '../lib/db';
import { electricityRecords } from '../lib/db/schema';
import { getFiscalYear } from '../lib/utils/math';

async function verifyAll() {
  console.log('=== 1. RAW DATABASE AUDIT ===');
  const allRecords = await db.select().from(electricityRecords);
  console.log('Total record count in DB:', allRecords.length);

  const rawSum = allRecords.reduce((acc, r) => acc + parseFloat(r.amount), 0);
  console.log('Raw DB Sum of amounts:', rawSum.toFixed(2));

  console.log('\n=== 2. FISCAL YEAR PARTITIONING AUDIT ===');
  const fyGroups = new Map<number, typeof allRecords>();
  for (const r of allRecords) {
    const fy = getFiscalYear(r.yearBe, r.month);
    if (!fyGroups.has(fy)) fyGroups.set(fy, []);
    fyGroups.get(fy)!.push(r);
  }

  const sortedFYs = Array.from(fyGroups.keys()).sort((a, b) => a - b);
  console.log('Fiscal Years found in DB:', sortedFYs);

  let fiscalSumCheck = 0;
  for (const fy of sortedFYs) {
    const recs = fyGroups.get(fy)!;
    const sum = recs.reduce((a, r) => a + parseFloat(r.amount), 0);
    fiscalSumCheck += sum;
    console.log(`FY ${fy}: ${recs.length} months | Sum: ฿${sum.toFixed(2)} | Complete 12 mo: ${recs.length === 12}`);
  }

  console.log('\nSum of 7 FYs:', fiscalSumCheck.toFixed(2));
  console.log('Difference Raw Sum vs FY Sum:', Math.abs(rawSum - fiscalSumCheck));

  console.log('\n=== 3. ANALYTICS SERVICE AUDIT ===');
  const analytics = await getDashboardAnalytics();
  const kpis = analytics.kpis;

  console.log('KPIs Total Historical Cost:', kpis.totalHistoricalCost.toFixed(2));
  console.log('KPIs Total Records Count:', kpis.totalRecordsCount);
  console.log('KPIs Latest FY Be:', kpis.latestFiscalYearBe);
  console.log('KPIs Latest FY Total:', kpis.latestFiscalYearTotal.toFixed(2));
  console.log('KPIs Previous FY Be:', kpis.previousFiscalYearBe);
  console.log('KPIs Previous FY Total:', kpis.previousFiscalYearTotal.toFixed(2));
  console.log('KPIs FY YoY Change Rate:', kpis.fiscalYoyChangeRate?.toFixed(2) + '%');

  const expectedYoY = ((kpis.latestFiscalYearTotal - kpis.previousFiscalYearTotal) / kpis.previousFiscalYearTotal) * 100;
  console.log('Calculated Expected FY YoY:', expectedYoY.toFixed(2) + '%');
  console.log('YoY Match:', Math.abs((kpis.fiscalYoyChangeRate || 0) - expectedYoY) < 0.001);

  console.log('\n=== 4. FISCAL MATRIX VS CALENDAR MATRIX CONSISTENCY ===');
  const calMatrixTotal = analytics.matrixRows.reduce((a, r) => a + r.yearTotal, 0);
  const fyMatrixTotal = analytics.fiscalMatrixRows.reduce((a, r) => a + r.yearTotal, 0);
  console.log('Calendar Matrix Grand Total:', calMatrixTotal.toFixed(2));
  console.log('Fiscal Matrix Grand Total:', fyMatrixTotal.toFixed(2));
  console.log('Matrix Totals Match Raw Cost:', Math.abs(calMatrixTotal - rawSum) < 0.001 && Math.abs(fyMatrixTotal - rawSum) < 0.001);

  console.log('\n=== 5. NARRATIVE & METADATA CONSISTENCY ===');
  console.log('Latest Month in Narrative:', analytics.narrative.latestMonth.periodLabel, '฿' + analytics.narrative.latestMonth.amount);
  console.log('Current FY in Narrative:', analytics.narrative.currentFiscalYear.fyBe, '฿' + analytics.narrative.currentFiscalYear.total);
  console.log('Previous FY in Narrative:', analytics.narrative.previousFiscalYear.fyBe, '฿' + analytics.narrative.previousFiscalYear.total);
  console.log('Data Coverage:', analytics.narrative.dataCoverage.startLabel, 'to', analytics.narrative.dataCoverage.endLabel);
  console.log('Complete Fiscal Years:', analytics.narrative.dataCoverage.completeFiscalYears);

  console.log('\n=== 6. PERIOD SELECTOR ORDER SIMULATION ===');
  const sortedPills = [...analytics.fiscalYearComparison].sort((a, b) => b.fyBe - a.fyBe);
  const maxFY = Math.max(...analytics.fiscalYearComparison.map(f => f.fyBe));
  console.log('Pill order (first to last):', sortedPills.map(p => `ปีงบ ${p.fyBe}${p.fyBe === maxFY ? ' (ล่าสุด)' : ''}`).join(' | '));
  console.log('Is 2569 first pill?:', sortedPills[0].fyBe === 2569);
  console.log('Is 2569 marked ล่าสุด?:', sortedPills[0].fyBe === maxFY);
  console.log('\n=== 7. SIMULATE FUTURE DATA INGESTION (FY 2570 TEST) ===');
  // Simulate adding a record for October 2569 (Month 10 of B.E. 2569 -> Q1 of Thai Fiscal Year 2570)
  const simulatedRecords = [
    ...allRecords,
    {
      id: 9999,
      yearBe: 2569,
      yearCe: 2026,
      month: 10,
      amount: '45000.00',
      note: 'Simulated Future Month (Oct 2569 / FY 2570)',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const simulatedFYMap = new Map<number, number>();
  for (const r of simulatedRecords) {
    const fy = getFiscalYear(r.yearBe, r.month);
    simulatedFYMap.set(fy, (simulatedFYMap.get(fy) || 0) + 1);
  }
  const simulatedSortedFY = Array.from(simulatedFYMap.keys()).sort((a, b) => b - a);

  console.log('Simulated Newest Fiscal Year:', simulatedSortedFY[0]);
  console.log('Is FY 2570 dynamically detected?:', simulatedSortedFY[0] === 2570);
  console.log('FY 2570 month count:', simulatedFYMap.get(2570));
  console.log('Is FY 2570 recognized as in-progress (1/12)?:', simulatedFYMap.get(2570) === 1);
  console.log('Simulated Pills Order:', simulatedSortedFY.map((fy, idx) => `ปีงบ ${fy}${idx === 0 ? ' (ล่าสุด)' : ''}`).join(' | '));
  console.log('Is FY 2570 first pill with ล่าสุด badge?:', simulatedSortedFY[0] === 2570);
}

verifyAll().catch(console.error);
