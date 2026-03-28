// =============================================================================
// PathUp — Events Queries
// =============================================================================

import db from "@/lib/db/client"
import type { EventName } from "@/types"

export async function insertEvent(
  event: EventName,
  session_id: string | null,
  properties?: Record<string, unknown>
) {
  return db.event.create({
    data: {
      session_id: session_id ?? undefined,
      event,
      properties: properties ? (properties as any) : undefined,
    },
  })
}

export async function getEventsBySession(session_id: string) {
  return db.event.findMany({
    where: { session_id },
    orderBy: { created_at: "asc" },
  })
}

// Воронка за период
export async function getFunnelByDate(days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const events = await db.event.groupBy({
    by: ["event"],
    _count: { event: true },
    where: { created_at: { gte: since } },
  })

  return Object.fromEntries(
    events.map((e) => [e.event, e._count.event])
  )
}
