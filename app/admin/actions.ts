'use server';

import { getSession } from '@/lib/auth/session';
import {
  createRecord,
  updateRecord,
  deleteRecord,
  checkDuplicateRecord,
} from '@/lib/services/records';
import { recordInputSchema } from '@/lib/validations/record';
import { revalidatePath } from 'next/cache';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createRecordAction(formData: FormData): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  const rawData = {
    yearBe: formData.get('yearBe'),
    month: formData.get('month'),
    amount: formData.get('amount'),
    note: formData.get('note'),
  };

  const parsed = recordInputSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: errorMsg };
  }

  const isDuplicate = await checkDuplicateRecord(parsed.data.yearBe, parsed.data.month);
  if (isDuplicate) {
    return {
      success: false,
      error: `ข้อมูลค่าไฟฟ้าประจำปี พ.ศ. ${parsed.data.yearBe} เดือนที่ ${parsed.data.month} มีอยู่ในระบบแล้ว`,
    };
  }

  try {
    await createRecord(parsed.data);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    return { success: false, error: message };
  }
}

export async function updateRecordAction(
  id: number,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  const rawData = {
    yearBe: formData.get('yearBe'),
    month: formData.get('month'),
    amount: formData.get('amount'),
    note: formData.get('note'),
  };

  const parsed = recordInputSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: errorMsg };
  }

  const isDuplicate = await checkDuplicateRecord(parsed.data.yearBe, parsed.data.month, id);
  if (isDuplicate) {
    return {
      success: false,
      error: `ข้อมูลค่าไฟฟ้าประจำปี พ.ศ. ${parsed.data.yearBe} เดือนที่ ${parsed.data.month} มีอยู่ในระบบแล้ว`,
    };
  }

  try {
    await updateRecord(id, parsed.data);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'แก้ไขข้อมูลเรียบร้อยแล้ว' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล';
    return { success: false, error: message };
  }
}

export async function deleteRecordAction(id: number): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  try {
    const ok = await deleteRecord(id);
    if (!ok) {
      return { success: false, error: 'ไม่พบรายการที่ต้องการลบ' };
    }
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'ลบข้อมูลเรียบร้อยแล้ว' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบข้อมูล';
    return { success: false, error: message };
  }
}
