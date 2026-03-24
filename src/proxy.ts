import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { APP_ROUTES } from "@/features/constants/routes"

// Các routes không cần check token
const publicRoutes = [APP_ROUTES.login, APP_ROUTES.api.authLogin]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Bỏ qua static files, api routes khác (nếu cấu hình riêng)
  if (pathname.includes("/_next") || pathname.includes("/favicon.ico")) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL(APP_ROUTES.login, request.url))
  }
  
  if (isPublicRoute && token) {
    // Nếu đã đăng nhập mà vẫn vào /login thì văng ra Home
    if (pathname === APP_ROUTES.login) {
      return NextResponse.redirect(new URL(APP_ROUTES.defaults.authenticated, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
