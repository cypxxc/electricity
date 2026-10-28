import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { db, pool } from '../lib/db';
import { electricityRecords, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('--- Starting Seed Process ---');

  const filePath = path.resolve(process.cwd(), 'สรุปค่าไฟฟ้า 62-69.xlsx');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of rows
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  console.log(`Read sheet "${sheetName}" with ${rawRows.length} total rows.`);

  const recordsToInsert: {
    yearBe: number;
    yearCe: number;
    month: number;
    amount: string;
    note: string;
  }[] = [];

  // Data rows are rows with index >= 4 (0-based) where row[0] is year number 25xx
  for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
    const row = rawRows[rowIndex] as unknown[];
    if (!row || row.length === 0) continue;

    const firstCol = Number(row[0]);
    if (!isNaN(firstCol) && firstCol >= 2500 && firstCol <= 2650) {
      const yearBe = firstCol;
      const yearCe = yearBe - 543;

      // Columns 1 to 12 correspond to months Jan (1) to Dec (12)
      for (let month = 1; month <= 12; month++) {
        const val = row[month];
        if (val !== null && val !== undefined && val !== '') {
          const numVal = Number(val);
          if (!isNaN(numVal) && numVal > 0) {
            recordsToInsert.push({
              yearBe,
              yearCe,
              month,
              amount: numVal.toFixed(2),
              note: 'นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx',
            });
          }
        }
      }
    }
  }

  console.log(`Parsed ${recordsToInsert.length} valid monthly records from Excel.`);

  let insertedCount = 0;
  for (const record of recordsToInsert) {
    await db
      .insert(electricityRecords)
      .values(record)
      .onConflictDoUpdate({
        target: [electricityRecords.yearBe, electricityRecords.month],
        set: {
          amount: record.amount,
          yearCe: record.yearCe,
          note: record.note,
          updatedAt: new Date(),
        },
      });
    insertedCount++;
  }

  console.log(`Successfully stored/updated ${insertedCount} electricity records in PostgreSQL.`);

  // Seed Admin user
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, adminUsername))
    .limit(1);

  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      username: adminUsername,
      passwordHash,
      role: 'admin',
    });
    console.log(`Created default admin user: "${adminUsername}"`);
  } else {
    await db
      .update(users)
      .set({ passwordHash, role: 'admin' })
      .where(eq(users.username, adminUsername));
    console.log(`Updated default admin user: "${adminUsername}"`);
  }

  console.log('--- Seed Completed Successfully ---');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
