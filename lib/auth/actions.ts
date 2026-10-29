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

// In-memory sliding-window rate limiter to prevent Brute-Force password attacks
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
  }

  const now = Date.now();
  const attempt = loginAttempts.get(username);

  // Check rate limit lockout
  if (attempt && attempt.count >= MAX_FAILED_ATTEMPTS) {
    const elapsed = now - attempt.lastAttempt;
    if (elapsed < LOCKOUT_WINDOW_MS) {
      const minutesRemaining = Math.ceil((LOCKOUT_WINDOW_MS - elapsed) / 60000);
      return {
        success: false,
        error: `คุณพยายามเข้าสู่ระบบผิดพลาดเกินกำหนด (${MAX_FAILED_ATTEMPTS} ครั้ง) กรุณารอ ${minutesRemaining} นาทีก่อนลองใหม่อีกครั้ง`,
      };
    } else {
      // Lockout expired, reset attempts
      loginAttempts.delete(username);
    }
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      const currentCount = (loginAttempts.get(username)?.count || 0) + 1;
      loginAttempts.set(username, { count: currentCount, lastAttempt: now });
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const currentCount = (loginAttempts.get(username)?.count || 0) + 1;
      loginAttempts.set(username, { count: currentCount, lastAttempt: now });
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    // Login successful: reset failed attempt counter and set session cookie
    loginAttempts.delete(username);

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
