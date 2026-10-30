import { db, pool } from '../lib/db';
import { electricityRecords } from '../lib/db/schema';
import { THAI_MONTH_FULL } from '../lib/validations/record';
import { sql, count, asc } from 'drizzle-orm';

interface MockMonthRecord {
  yearBe: number;
  month: number;
  amount: number;
  reason?: string;
}

const MOCK_DATA: MockMonthRecord[] = [
  // ปี พ.ศ. 2570 (ค.ศ. 2027)
  { yearBe: 2570, month: 1, amount: 31450.25, reason: 'ช่วงฤดูหนาว อากาศเย็น มีวันหยุดปีใหม่' },
  { yearBe: 2570, month: 2, amount: 39280.80, reason: 'เริ่มเข้าสู่ช่วงอุณหภูมิสูงขึ้น' },
  { yearBe: 2570, month: 3, amount: 49820.40, reason: 'เข้าสู่ฤดูร้อน การใช้งานระบบทำความเย็นเพิ่มขึ้น' },
  { yearBe: 2570, month: 4, amount: 62450.75, reason: 'ยอดพีคฤดูร้อน เมษายน อุณหภูมิเฉลี่ยสูงสุด' },
  { yearBe: 2570, month: 5, amount: 58910.30, reason: 'ฤดูร้อนต่อเนื่อง มีการเปิดแอร์ตลอดวัน' },
  { yearBe: 2570, month: 6, amount: 53740.60, reason: 'เริ่มเข้าสู่ฤดูฝน มีฝนตกช่วยคลายความร้อน' },
  { yearBe: 2570, month: 7, amount: 48120.50, reason: 'ช่วงฤดูฝน อากาศเย็นลง' },
  { yearBe: 2570, month: 8, amount: 49630.90, reason: 'กิจกรรมและการประชุมราชการเต็มรูปแบบ' },
  { yearBe: 2570, month: 9, amount: 43280.15, reason: 'สิ้นสุดปีงบประมาณ 2570' },
  { yearBe: 2570, month: 10, amount: 41890.35, reason: 'เริ่มต้นไตรมาสที่ 1 ปีงบประมาณ 2571' },
  { yearBe: 2570, month: 11, amount: 35620.40, reason: 'ปลายฤดูฝนเริ่มเข้าสู่ฤดูหนาว' },
  { yearBe: 2570, month: 12, amount: 29150.80, reason: 'ช่วงวันหยุดยาวสิ้นปี อากาศหนาวเย็น' },

  // ปี พ.ศ. 2571 (ค.ศ. 2028)
  { yearBe: 2571, month: 1, amount: 33120.60, reason: 'ฤดูหนาว ค่า Ft ปรับขึ้นเล็กน้อย' },
  { yearBe: 2571, month: 2, amount: 40850.45, reason: 'อุณหภูมิเริ่มสูงขึ้น' },
  { yearBe: 2571, month: 3, amount: 52340.20, reason: 'เข้าสู่ฤดูร้อน' },
  { yearBe: 2571, month: 4, amount: 65180.95, reason: 'ยอดพีคประจำปี 2571 ฤดูร้อนจัด' },
  { yearBe: 2571, month: 5, amount: 61420.30, reason: 'ช่วงฤดูร้อนจัดต่อเนื่อง' },
  { yearBe: 2571, month: 6, amount: 55890.50, reason: 'เข้าสู่ฤดูฝน' },
  { yearBe: 2571, month: 7, amount: 50210.75, reason: 'ฤดูฝน มีฝนตกชุก' },
  { yearBe: 2571, month: 8, amount: 51730.40, reason: 'กิจกรรมราชการและการปฏิบัติการสำนักงาน' },
  { yearBe: 2571, month: 9, amount: 45190.80, reason: 'สิ้นสุดปีงบประมาณ 2571' },
  { yearBe: 2571, month: 10, amount: 43650.25, reason: 'เริ่มต้นไตรมาสที่ 1 ปีงบประมาณ 2572' },
  { yearBe: 2571, month: 11, amount: 37410.50, reason: 'เข้าสู่ฤดูหนาว' },
  { yearBe: 2571, month: 12, amount: 30560.90, reason: 'ปลายปีงบประมาณ/วันหยุดยาว ธันวาคม' },
];

async function seedMockData() {
  console.log('========================================================');
  console.log('  STARTING MOCK DATA SEEDING (2 NEW YEARS: 2570 & 2571)');
  console.log('========================================================\n');

  // Check initial count
  const initialCountResult = await db.select({ total: count() }).from(electricityRecords);
  const initialTotal = Number(initialCountResult[0]?.total || 0);
  console.log(`Current records in database: ${initialTotal}`);

  let insertedCount = 0;

  for (const item of MOCK_DATA) {
    const yearCe = item.yearBe - 543;
    const monthName = THAI_MONTH_FULL[item.month - 1];
    const note = `ข้อมูลจำลองประจำเดือน${monthName} ${item.yearBe} (${item.reason})`;

    const result = await db
      .insert(electricityRecords)
      .values({
        yearBe: item.yearBe,
        yearCe,
        month: item.month,
        amount: item.amount.toFixed(2),
        note,
      })
      .onConflictDoUpdate({
        target: [electricityRecords.yearBe, electricityRecords.month],
        set: {
          yearCe,
          amount: item.amount.toFixed(2),
          note,
          updatedAt: new Date(),
        },
      })
      .returning({ id: electricityRecords.id, yearBe: electricityRecords.yearBe, month: electricityRecords.month });

    if (result.length > 0) {
      insertedCount++;
      console.log(
        `  ✓ [${item.yearBe}/${String(item.month).padStart(2, '0')}] ${monthName} ${item.yearBe}: ` +
        `฿${item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} - ${item.reason}`
      );
    }
  }

  // Verify total after insert
  const finalCountResult = await db.select({ total: count() }).from(electricityRecords);
  const finalTotal = Number(finalCountResult[0]?.total || 0);

  console.log('\n--------------------------------------------------------');
  console.log(`Successfully processed ${insertedCount} mock records.`);
  console.log(`Previous DB Total: ${initialTotal} records`);
  console.log(`New DB Total:      ${finalTotal} records (Difference: +${finalTotal - initialTotal})`);
  console.log('--------------------------------------------------------\n');

  // Group summary by year
  const summary = await db
    .select({
      yearBe: electricityRecords.yearBe,
      recordCount: count(),
      totalAmount: sql<string>`sum(cast(${electricityRecords.amount} as numeric))`,
    })
    .from(electricityRecords)
    .groupBy(electricityRecords.yearBe)
    .orderBy(asc(electricityRecords.yearBe));

  console.log('Summary by Year in Database:');
  console.table(
    summary.map((s) => ({
      'ปี พ.ศ.': s.yearBe,
      'จำนวนเดือน': Number(s.recordCount),
      'ยอดรวมทั้งปี (บาท)': Number(s.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    }))
  );
}

seedMockData()
  .catch((err) => {
    console.error('Failed to seed mock data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
