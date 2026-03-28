// =============================================================================
// PathUp — Privacy Cleanup
// Автоматическое удаление истёкших сессий.
// Вызывается из /api/cron/cleanup (Vercel Cron, раз в день).
// =============================================================================

import { deleteExpiredSessions } from "@/lib/db/queries/sessions"
import db from "@/lib/db/client"

export interface CleanupResult {
  deleted_sessions: number
  deleted_events:   number
  ran_at:           string
}

export async function runPrivacyCleanup(): Promise<CleanupResult> {
  const ran_at = new Date().toISOString()

  // 1. Удалить неоплаченные сессии старше 90 дней
  const { count: deleted_sessions } = await deleteExpiredSessions(90)

  // 2. Удалить осиротевшие events (сессия уже удалена)
  const { count: deleted_events } = await db.event.deleteMany({
    where: {
      session_id: { not: null },
      session:    null,
      created_at: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  })

  console.log(`[Cleanup] Sessions: ${deleted_sessions}, Events: ${deleted_events}`)

  return { deleted_sessions, deleted_events, ran_at }
}
