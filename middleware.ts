import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected routes list (extend as needed)
const PROTECTED_PATHS = ['/', '/profile'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore NextAuth internal, static, api (except we will still protect /api user endpoints), and public asset routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/auth/') || // allow custom auth pages
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  const requiresAuth = PROTECTED_PATHS.includes(pathname);
  if (!requiresAuth) return NextResponse.next();

  const token = await getToken({ req });
  if (token) return NextResponse.next();

  const loginUrl = new URL('/auth/login', req.url);
  loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname || '/');
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/profile'],
};
