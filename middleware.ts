import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const DEFAULT_INSECURE_SECRET = 'super-secret-jwt-key-min-32-chars-long-12345';
const rawJwtSecret = process.env.JWT_SECRET || DEFAULT_INSECURE_SECRET;
const encodedSecret = new TextEncoder().encode(rawJwtSecret);
const COOKIE_NAME = 'auth_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, encodedSecret);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
