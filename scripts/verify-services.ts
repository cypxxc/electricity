import { getDashboardKPIs, getMonthlyTrendData, getYearlyComparisonData, getYearMonthlyMatrix } from '../lib/services/analytics';
import { getRecords, getDistinctYears } from '../lib/services/records';
import { pool } from '../lib/db';

async function verify() {
  console.log('--- Verifying Analytics Services ---');

  const kpis = await getDashboardKPIs();
  console.log('KPIs:', {
    totalHistoricalCost: kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    totalRecordsCount: kpis.totalRecordsCount,
    monthlyAverage: kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    latestYearBe: kpis.latestYearBe,
    latestYearTotal: kpis.latestYearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    previousYearBe: kpis.previousYearBe,
    previousYearTotal: kpis.previousYearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    yoyChangeRate: kpis.yoyChangeRate?.toFixed(2) + '%',
  });

  const trends = await getMonthlyTrendData();
  console.log(`Monthly trends length: ${trends.length} (first: ${trends[0]?.periodLabel}, last: ${trends[trends.length - 1]?.periodLabel})`);

  const yearly = await getYearlyComparisonData();
  console.log('Yearly summaries:', yearly.map((y) => `${y.yearBe}: ${y.totalAmount.toFixed(0)} (${y.recordedMonths} mos)`));

  const matrix = await getYearMonthlyMatrix();
  console.log(`Matrix rows: ${matrix.length} years`);

  const paginated = await getRecords({ page: 1, limit: 5 });
  console.log(`Paginated: total=${paginated.total}, count=${paginated.records.length}`);

  const distinctYears = await getDistinctYears();
  console.log('Distinct years:', distinctYears);

  console.log('--- All Services Verified Successfully ---');
}

verify()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
