// =============================================================================
// PathUp — GET /api/admin/stats
// Статистика для admin dashboard. Только с admin токеном.
// =============================================================================

import { NextRequest }               from "next/server"
import { ok, unauthorized }          from "@/lib/utils/api"
import { requireAdminSecret }        from "@/lib/utils/api"
import { getFunnelStats }            from "@/lib/db/queries/sessions"
import { getFunnelByDate }           from "@/lib/db/queries/events"

export async function GET(request: NextRequest) {
  if (!requireAdminSecret(request)) return unauthorized()

  const [funnel, events7d, events30d] = await Promise.all([
    getFunnelStats(),
    getFunnelByDate(7),
    getFunnelByDate(30),
  ])

  return ok({ funnel, events7d, events30d })
}
