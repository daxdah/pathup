// =============================================================================
// PathUp — GET /api/cron/checkin-7d
// Vercel Cron Job: запускается каждый день в 09:00.
// Находит сессии где прошло 8 дней после оплаты → отправляет check-in email.
//
// vercel.json:
// { "crons": [{ "path": "/api/cron/checkin-7d", "schedule": "0 9 * * *" }] }
// =============================================================================

import { NextRequest }    from "next/server"
import { ok, unauthorized } from "@/lib/utils/api"
import { requireCronSecret } from "@/lib/utils/api"
import {
  getSessionsForCheckin,
  markCheckinSent,
}                         from "@/lib/db/queries/sessions"
import { sendCheckinEmail } from "@/lib/email/sender"
import { trackServer }    from "@/lib/analytics/track"

export async function GET(request: NextRequest) {
  if (!requireCronSecret(request)) {
    return unauthorized("Invalid cron secret")
  }

  const sessions = await getSessionsForCheckin(7)
  console.log(`[Cron 7d] Found ${sessions.length} sessions to check-in`)

  let sent = 0
  let failed = 0

  for (const session of sessions) {
    try {
      await sendCheckinEmail(session.id, session.email, 7)
      await markCheckinSent(session.id, 7)
      await trackServer("checkin_email_sent", session.id, { day: 7 })
      sent++
    } catch (err) {
      console.error(`[Cron 7d] Failed for session ${session.id}:`, err)
      failed++
    }
  }

  return ok({ sent, failed, total: sessions.length })
}
