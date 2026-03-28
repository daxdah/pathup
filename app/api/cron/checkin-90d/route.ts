import { NextRequest }       from "next/server"
import { ok, unauthorized }  from "@/lib/utils/api"
import { requireCronSecret } from "@/lib/utils/api"
import { getSessionsForCheckin, markCheckinSent } from "@/lib/db/queries/sessions"
import { sendCheckinEmail }  from "@/lib/email/sender"
import { trackServer }       from "@/lib/analytics/track"

export async function GET(request: NextRequest) {
  if (!requireCronSecret(request)) return unauthorized()
  const sessions = await getSessionsForCheckin(90)
  let sent = 0, failed = 0
  for (const s of sessions) {
    try {
      await sendCheckinEmail(s.id, s.email, 90)
      await markCheckinSent(s.id, 90)
      await trackServer("checkin_email_sent", s.id, { day: 90 })
      sent++
    } catch { failed++ }
  }
  return ok({ sent, failed, total: sessions.length })
}
