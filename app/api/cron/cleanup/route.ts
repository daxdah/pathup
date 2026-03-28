// =============================================================================
// PathUp — GET /api/cron/cleanup
// Vercel Cron: запускается раз в день в 03:00.
// Удаляет истёкшие сессии согласно privacy policy.
// =============================================================================

import { NextRequest }          from "next/server"
import { ok, unauthorized }     from "@/lib/utils/api"
import { requireCronSecret }    from "@/lib/utils/api"
import { runPrivacyCleanup }    from "@/lib/privacy/cleanup"

export async function GET(request: NextRequest) {
  if (!requireCronSecret(request)) return unauthorized()

  const result = await runPrivacyCleanup()
  return ok(result)
}
