import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '../env';

const rawJwtSecret = env.JWT_SECRET;
const encodedSecret = new TextEncoder().encode(rawJwtSecret);
export const COOKIE_NAME = 'auth_session';

export interface SessionPayload {
  userId: number;
  username: string;
  role: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
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

/**
 * Sets persistent session cookie across full system.
 * Allows HTTP access on localhost/LAN IP by checking COOKIE_SECURE env,
 * while preventing browser cookie rejection when HTTPS is not present.
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  const isHttpsOnly = env.COOKIE_SECURE;

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttpsOnly,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days persistent session
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  // Also set maxAge 0 to guarantee deletion across all browser engines
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
