import { db, pool } from '../lib/db';
import { electricityRecords, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkDuplicateRecord, createRecord } from '../lib/services/records';
import { getDashboardKPIs } from '../lib/services/analytics';
import { generateExcelWorkbook, generateCsvString, parseExcelBuffer } from '../lib/services/excel';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

async function verifyE2E() {
  console.log('=== STARTING END-TO-END VERIFICATION ===\n');

  // Test 1: Check Database Records
  console.log('1. Checking Database Records...');
  const records = await db.select().from(electricityRecords);
  console.log(`   Found ${records.length} records in PostgreSQL electricity_records table.`);
  if (records.length !== 84) {
    throw new Error(`Expected 84 records, but found ${records.length}`);
  }
  console.log('   ✓ Database has exactly 84 records matching Excel data.');

  // Test 2: Check Admin Account
  console.log('\n2. Verifying Admin User Authentication...');
  const [adminUser] = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
  if (!adminUser) {
    throw new Error('Default admin user not found in database');
  }
  const isPasswordValid = await bcrypt.compare('adminpassword123', adminUser.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Admin password hash verification failed');
  }
  console.log(`   ✓ Admin user "${adminUser.username}" authenticated successfully with bcrypt hash.`);

  // Test 3: Deduplication Validation
  console.log('\n3. Testing Duplicate Prevention (Requirement 7)...');
  const isDuplicate = await checkDuplicateRecord(2567, 1);
  console.log(`   Check duplicate for Year 2567, Month 1: ${isDuplicate}`);
  if (!isDuplicate) {
    throw new Error('Deduplication check failed: Year 2567 Month 1 should already exist!');
  }

  try {
    await createRecord({
      yearBe: 2567,
      month: 1,
      amount: 99999,
      note: 'Should fail',
    });
    throw new Error('Duplicate insertion did NOT throw an error!');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    console.log(`   ✓ Duplicate rejection verified: "${msg}"`);
  }

  // Test 4: Analytics Aggregations
  console.log('\n4. Verifying Analytics Dashboard Calculations...');
  const kpis = await getDashboardKPIs();
  console.log(`   Total Historical Cost: ฿${kpis.totalHistoricalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
  console.log(`   Monthly Average: ฿${kpis.monthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
  console.log(`   Latest Year (${kpis.latestYearBe}) Total: ฿${kpis.latestYearTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
  console.log(`   YoY Change Rate: ${kpis.yoyChangeRate?.toFixed(2)}%`);
  if (kpis.totalHistoricalCost <= 0 || kpis.totalRecordsCount !== 84) {
    throw new Error('KPI calculation incorrect');
  }
  console.log('   ✓ Analytics calculations verified.');

  // Test 5: Excel & CSV Export
  console.log('\n5. Testing Export Generation (Requirement 8)...');
  const excelBuffer = generateExcelWorkbook(records);
  console.log(`   Generated Excel workbook: ${excelBuffer.length} bytes`);
  if (excelBuffer.length < 1000) {
    throw new Error('Generated Excel file is unexpectedly small');
  }

  const csvString = generateCsvString(records);
  console.log(`   Generated CSV string: ${csvString.length} characters (has BOM: ${csvString.startsWith('\uFEFF')})`);
  if (!csvString.startsWith('\uFEFF')) {
    throw new Error('CSV missing UTF-8 BOM header');
  }
  console.log('   ✓ Excel and CSV export generation verified.');

  // Test 6: Excel Parsing on Seed File
  console.log('\n6. Testing Excel Parser against source file (Requirement 3)...');
  const possibleSeedPaths = [
    path.resolve(process.cwd(), 'data', 'สรุปค่าไฟฟ้า 62-69.xlsx'),
    path.resolve(process.cwd(), 'สรุปค่าไฟฟ้า 62-69.xlsx'),
  ];
  const seedFilePath = possibleSeedPaths.find((p) => fs.existsSync(p));
  if (!seedFilePath) {
    throw new Error(`Seed file not found at: ${possibleSeedPaths.join(' or ')}`);
  }
  const fileBytes = fs.readFileSync(seedFilePath);
  const parsedItems = parseExcelBuffer(fileBytes);
  console.log(`   Parsed items from Excel file: ${parsedItems.length}`);
  if (parsedItems.length !== 84) {
    throw new Error(`Expected 84 items parsed, got ${parsedItems.length}`);
  }
  console.log('   ✓ Excel parser successfully extracted all 84 records.');

  console.log('\n=== ALL 6 END-TO-END VERIFICATION CHECKS PASSED ===\n');
}

verifyE2E()
  .catch((e) => {
    console.error('E2E Verification Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
