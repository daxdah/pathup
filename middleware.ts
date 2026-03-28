// =============================================================================
// PathUp — Middleware
// Запускается перед каждым запросом.
// Отвечает за:
//   1. Защиту /admin маршрутов
//   2. Security headers на всех ответах
//   3. Блокировку /api/cron без CRON_SECRET
// =============================================================================

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ---------------------------------------------------------
  // 1. Security headers (на всех маршрутах)
  // ---------------------------------------------------------
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  // ---------------------------------------------------------
  // 2. Admin auth
  // ---------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    // Login page — пропускаем
    if (pathname === "/admin/login") return response

    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret) {
      // Admin отключён если нет секрета
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Проверяем cookie
    const token = request.cookies.get("admin_token")?.value
    if (token !== adminSecret) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ---------------------------------------------------------
  // 3. Cron protection
  // ---------------------------------------------------------
  if (pathname.startsWith("/api/cron")) {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get("authorization")
    const provided   = authHeader?.replace("Bearer ", "") ?? ""

    if (!cronSecret || provided !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cron/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
