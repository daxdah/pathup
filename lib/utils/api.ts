// =============================================================================
// PathUp — API Utilities
// Типизированные хелперы для API routes.
// Единообразный формат ответов, error handling, auth checks.
// =============================================================================

import { NextResponse } from "next/server"
import type { ZodSchema } from "zod"

// -----------------------------------------------------------------------------
// Response helpers
// -----------------------------------------------------------------------------

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function created<T>(data: T) {
  return ok(data, 201)
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(message = "Internal server error", err?: unknown) {
  if (err) console.error("[API Error]", message, err)
  return NextResponse.json({ error: message }, { status: 500 })
}

// -----------------------------------------------------------------------------
// Request parsing with Zod validation
// -----------------------------------------------------------------------------

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return { data: null, error: badRequest("Invalid JSON body") }
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      error: badRequest("Validation failed", result.error.flatten()),
    }
  }

  return { data: result.data, error: null }
}

// -----------------------------------------------------------------------------
// Auth checks
// -----------------------------------------------------------------------------

export function requireAdminSecret(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false

  const header = request.headers.get("x-admin-token")
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("admin_token="))
    ?.split("=")[1]

  return header === secret || cookie === secret
}

export function requireCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const header =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.headers.get("x-cron-secret")

  return header === secret
}

// -----------------------------------------------------------------------------
// Rate limit headers (simple, no Redis needed for MVP)
// -----------------------------------------------------------------------------

const submitCounts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now()
  const entry = submitCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    submitCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (entry.count >= limit) return false // blocked

  entry.count++
  return true
}

// Clean up old entries every hour
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of submitCounts.entries()) {
      if (now > entry.resetAt) submitCounts.delete(key)
    }
  },
  60 * 60 * 1000
)
