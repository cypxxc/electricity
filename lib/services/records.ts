import { db } from '../db';
import { electricityRecords, ElectricityRecord } from '../db/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { RecordInput } from '../validations/record';

export interface RecordsFilter {
  page?: number;
  limit?: number;
  yearBe?: number;
  month?: number;
  search?: string;
}

export interface PaginatedRecords {
  records: ElectricityRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getDistinctYears(): Promise<number[]> {
  const rows = await db
    .selectDistinct({ yearBe: electricityRecords.yearBe })
    .from(electricityRecords)
    .orderBy(desc(electricityRecords.yearBe));

  return rows.map((r) => r.yearBe);
}

export async function checkDuplicateRecord(
  yearBe: number,
  month: number,
  excludeId?: number
): Promise<boolean> {
  const conditions = [
    eq(electricityRecords.yearBe, yearBe),
    eq(electricityRecords.month, month),
  ];

  if (excludeId !== undefined) {
    conditions.push(sql`${electricityRecords.id} != ${excludeId}`);
  }

  const existing = await db
    .select({ id: electricityRecords.id })
    .from(electricityRecords)
    .where(and(...conditions))
    .limit(1);

  return existing.length > 0;
}

export async function getRecords(filter: RecordsFilter = {}): Promise<PaginatedRecords> {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filter.yearBe) {
    conditions.push(eq(electricityRecords.yearBe, filter.yearBe));
  }

  if (filter.month) {
    conditions.push(eq(electricityRecords.month, filter.month));
  }

  if (filter.search && filter.search.trim() !== '') {
    const q = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        ilike(electricityRecords.note, q),
        sql`${electricityRecords.yearBe}::text ILIKE ${q}`,
        sql`${electricityRecords.amount}::text ILIKE ${q}`
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(electricityRecords)
    .where(whereClause);

  const total = totalCountResult?.count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const records = await db
    .select()
    .from(electricityRecords)
    .where(whereClause)
    .orderBy(desc(electricityRecords.yearBe), desc(electricityRecords.month))
    .limit(limit)
    .offset(offset);

  return {
    records,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getRecordById(id: number): Promise<ElectricityRecord | null> {
  const [record] = await db
    .select()
    .from(electricityRecords)
    .where(eq(electricityRecords.id, id))
    .limit(1);

  return record || null;
}

export async function createRecord(input: RecordInput): Promise<ElectricityRecord> {
  const isDuplicate = await checkDuplicateRecord(input.yearBe, input.month);
  if (isDuplicate) {
    throw new Error(`ข้อมูลค่าไฟฟ้าสำหรับปี ${input.yearBe} เดือนที่ ${input.month} มีอยู่ในระบบแล้ว`);
  }

  const yearCe = input.yearBe - 543;
  const [created] = await db
    .insert(electricityRecords)
    .values({
      yearBe: input.yearBe,
      yearCe,
      month: input.month,
      amount: input.amount.toFixed(2),
      note: input.note || null,
    })
    .returning();

  return created;
}

export async function updateRecord(id: number, input: RecordInput): Promise<ElectricityRecord> {
  const isDuplicate = await checkDuplicateRecord(input.yearBe, input.month, id);
  if (isDuplicate) {
    throw new Error(`ข้อมูลค่าไฟฟ้าสำหรับปี ${input.yearBe} เดือนที่ ${input.month} มีอยู่ในระบบแล้ว`);
  }

  const yearCe = input.yearBe - 543;
  const [updated] = await db
    .update(electricityRecords)
    .set({
      yearBe: input.yearBe,
      yearCe,
      month: input.month,
      amount: input.amount.toFixed(2),
      note: input.note || null,
      updatedAt: new Date(),
    })
    .where(eq(electricityRecords.id, id))
    .returning();

  if (!updated) {
    throw new Error('ไม่พบข้อมูลรายการที่ต้องการแก้ไข');
  }

  return updated;
}

export async function deleteRecord(id: number): Promise<boolean> {
  const deleted = await db
    .delete(electricityRecords)
    .where(eq(electricityRecords.id, id))
    .returning({ id: electricityRecords.id });

  return deleted.length > 0;
}

export async function getAllRecordsForExport(yearBe?: number): Promise<ElectricityRecord[]> {
  const conditions = yearBe ? eq(electricityRecords.yearBe, yearBe) : undefined;

  return await db
    .select()
    .from(electricityRecords)
    .where(conditions)
    .orderBy(desc(electricityRecords.yearBe), desc(electricityRecords.month));
}
