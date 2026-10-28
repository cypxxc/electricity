'use server';

import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { setSessionCookie, clearSessionCookie } from './session';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    await setSessionCookie({
      userId: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error('Login action error:', err);
    return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
