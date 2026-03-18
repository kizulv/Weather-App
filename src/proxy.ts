import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Các routes không cần check token
const publicRoutes = ['/login', '/api/auth/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Bỏ qua static files, api routes khác (nếu cấu hình riêng)
  if (pathname.includes('/_next') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isPublicRoute && token) {
    // Nếu đã đăng nhập mà vẫn vào /login thì văng ra Home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
