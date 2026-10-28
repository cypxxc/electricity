import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { parseExcelBuffer } from '@/lib/services/excel';
import { db } from '@/lib/db';
import { electricityRecords } from '@/lib/db/schema';
import { checkDuplicateRecord } from '@/lib/services/records';
import { recordInputSchema } from '@/lib/validations/record';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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

    for (const item of parsedRecords) {
      const validation = recordInputSchema.safeParse(item);
      if (!validation.success) {
        errors.push(`ปี ${item.yearBe} เดือน ${item.month}: ข้อมูลไม่ถูกต้อง`);
        continue;
      }

      const isDuplicate = await checkDuplicateRecord(item.yearBe, item.month);

      if (isDuplicate) {
        if (strategy === 'overwrite') {
          await db
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
        await db.insert(electricityRecords).values({
          yearBe: item.yearBe,
          yearCe,
          month: item.month,
          amount: item.amount.toFixed(2),
          note: item.note || 'นำเข้าจาก Excel',
        });
        insertedCount++;
      }
    }

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
