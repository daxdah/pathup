// =============================================================================
// PathUp — POST /api/track
// Принимает analytics события от клиента и сохраняет в БД.
// Fire-and-forget: всегда возвращает 200 даже при ошибке записи.
// =============================================================================

import { NextRequest } from "next/server"
import { z }           from "zod"
import { ok }          from "@/lib/utils/api"
import { insertEvent } from "@/lib/db/queries/events"

const TrackBodySchema = z.object({
  event:      z.string(),
  session_id: z.string().nullable(),
  properties: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = TrackBodySchema.safeParse(body)

    if (parsed.success) {
      // Fire-and-forget: не ждём, не блокируем
      insertEvent(
        parsed.data.event as any,
        parsed.data.session_id,
        parsed.data.properties
      ).catch((err) => {
        console.warn("[Track] DB insert failed:", err?.message)
      })
    }
  } catch {
    // Молча проглатываем — трекинг никогда не ломает продукт
  }

  // Всегда 200
  return ok({ ok: true })
}
