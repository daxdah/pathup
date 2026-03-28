// =============================================================================
// PathUp — POST /api/admin/login
// Проверяет секрет и устанавливает httpOnly cookie.
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { z }                         from "zod"

const Schema = z.object({ secret: z.string() })

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }) }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || parsed.data.secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_token", adminSecret, {
    httpOnly: true,
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 8,   // 8 hours
    secure:   process.env.NODE_ENV === "production",
  })

  return response
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete("admin_token")
  return response
}
