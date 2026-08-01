import { NextResponse, NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authToken = req.cookies.get('authToken');

  const response = NextResponse.next();

  if (pathname === '/auth/sign-in' || pathname.startsWith('/auth/sign-in/')) {
    if (authToken) {
      const redirectResponse = NextResponse.redirect(
        new URL('/dashboard', req.url)
      );
      redirectResponse.headers.set(
        'x-redirect-reason',
        'already-authenticated'
      );
      return redirectResponse;
    }
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!authToken) {
      const redirectResponse = NextResponse.redirect(
        new URL('/auth/sign-in', req.url)
      );
      redirectResponse.headers.set('x-redirect-reason', 'not-authenticated');
      return redirectResponse;
    }
  }

  if (req.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/blog', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/auth/sign-in',
    '/auth/sign-in/:path*',
    '/dashboard',
    '/dashboard/:path*'
  ]
};
