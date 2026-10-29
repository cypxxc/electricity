import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { parseExcelBuffer } from '@/lib/services/excel';
import { db } from '@/lib/db';
import { electricityRecords } from '@/lib/db/schema';
import { recordInputSchema } from '@/lib/validations/record';
import { revalidatePath, revalidateTag } from 'next/cache';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const strategy = (formData.get('strategy') as string) || 'skip'; // 'skip' | 'overwrite'

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์สำหรับนำเข้า' }, { status: 400 });
    }

    // Protect against unbounded file upload memory spikes (15MB maximum)
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ขนาดไฟล์เกินกำหนด (สูงสุด 15MB)' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedRecords = parseExcelBuffer(buffer);
    if (parsedRecords.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลที่ถูกต้องในไฟล์ Excel (โปรดตรวจสอบรูปแบบหัวตาราง)' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Scalability Optimization: Batch fetch existing keys in 1 single query instead of N individual roundtrips
    const existingRows = await db
      .select({ yearBe: electricityRecords.yearBe, month: electricityRecords.month })
      .from(electricityRecords);
    const existingSet = new Set(existingRows.map((r) => `${r.yearBe}-${r.month}`));

    // Execute atomic batch mutations inside a single database transaction
    await db.transaction(async (tx) => {
      for (const item of parsedRecords) {
        const validation = recordInputSchema.safeParse(item);
        if (!validation.success) {
          errors.push(`ปี ${item.yearBe} เดือน ${item.month}: ข้อมูลไม่ถูกต้อง`);
          continue;
        }

        const isDuplicate = existingSet.has(`${item.yearBe}-${item.month}`);

        if (isDuplicate) {
          if (strategy === 'overwrite') {
            await tx
              .update(electricityRecords)
              .set({
                amount: item.amount.toFixed(2),
                note: item.note || 'อัปเดตจากการนำเข้า Excel',
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(electricityRecords.yearBe, item.yearBe),
                  eq(electricityRecords.month, item.month)
                )
              );
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          const yearCe = item.yearBe - 543;
          await tx.insert(electricityRecords).values({
            yearBe: item.yearBe,
            yearCe,
            month: item.month,
            amount: item.amount.toFixed(2),
            note: item.note || 'นำเข้าจาก Excel',
          });
          existingSet.add(`${item.yearBe}-${item.month}`);
          insertedCount++;
        }
      }
    });

    revalidateTag('analytics', 'max');
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      totalParsed: parsedRecords.length,
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ Excel' },
      { status: 500 }
    );
  }
}
