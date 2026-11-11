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
  const token = request.cookies.get('rental_token')?.value;
  const { pathname } = request.nextUrl;

  // Luôn truyền pathname vào header để layout.tsx đọc được
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const isAuthPage = isPublicRoute(pathname);

  // Chưa đăng nhập + không phải trang auth → redirect về login
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập + vào trang login/register hoặc trang chủ -> redirect về dashboard/portal
  if (token && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      if (payloadDecoded.role === 'tenant') {
        return NextResponse.redirect(new URL('/portal', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('rental_token');
      return response;
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
