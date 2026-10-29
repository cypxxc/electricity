import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const DEFAULT_INSECURE_SECRET = 'super-secret-jwt-key-min-32-chars-long-12345';
const rawJwtSecret = process.env.JWT_SECRET || DEFAULT_INSECURE_SECRET;

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_INSECURE_SECRET)
) {
  console.warn(
    '⚠️ [SECURITY WARNING]: Running in production with default/missing JWT_SECRET. Please set JWT_SECRET in environment variables.'
  );
}

const encodedSecret = new TextEncoder().encode(rawJwtSecret);
const COOKIE_NAME = 'auth_session';

export interface SessionPayload {
  userId: number;
  username: string;
  role: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return {
      userId: payload.userId as number,
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
