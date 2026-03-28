// =============================================================================
// PathUp — GET /api/admin/sessions
// Paginated список сессий с фильтрацией.
// =============================================================================

import { NextRequest }          from "next/server"
import { ok, unauthorized }     from "@/lib/utils/api"
import { requireAdminSecret }   from "@/lib/utils/api"
import { getRecentSessions }    from "@/lib/db/queries/sessions"

export async function GET(request: NextRequest) {
  if (!requireAdminSecret(request)) return unauthorized()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)

  const sessions = await getRecentSessions(limit)
  return ok({ sessions, count: sessions.length })
}
