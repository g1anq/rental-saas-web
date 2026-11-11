import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/payment-success'];

function isPublicRoute(pathname: string) {
  return (
    pathname === '/' ||
    PUBLIC_ROUTES.some((route) => pathname === route)
  );
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('rental_session')?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = isPublicRoute(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const clearLegacyCookie = (response: NextResponse) => {
    response.cookies.delete('rental_token');
    return response;
  };
  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  };

  let role: string | undefined;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded: { exp?: number; role?: string } = JSON.parse(atob(payloadBase64));
      if (
        typeof payloadDecoded.exp !== 'number' ||
        payloadDecoded.exp * 1000 <= Date.now() ||
        (payloadDecoded.role !== 'tenant' && payloadDecoded.role !== 'landlord')
      ) {
        throw new Error('Invalid or expired session');
      }
      role = payloadDecoded.role;
    } catch {
      const response = isAuthPage
        ? NextResponse.next({ request: { headers: requestHeaders } })
        : redirectToLogin();
      response.cookies.delete('rental_session');
      return clearLegacyCookie(response);
    }
  }

  // Chưa đăng nhập + không phải trang auth → redirect về login
  if (!token && !isAuthPage) {
    return clearLegacyCookie(redirectToLogin());
  }

  // Đã đăng nhập + vào trang login/register hoặc trang chủ -> redirect về dashboard/portal
  if (token && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const destination = role === 'tenant' ? '/portal' : '/dashboard';
    return clearLegacyCookie(NextResponse.redirect(new URL(destination, request.url)));
  }

  return clearLegacyCookie(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
