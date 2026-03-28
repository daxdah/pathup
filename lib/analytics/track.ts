// =============================================================================
// PathUp — Analytics
// Лёгкий трекер поверх Supabase events таблицы.
// Клиентская + серверная версии. Fire-and-forget, никогда не блокирует UI.
// =============================================================================

import type { EventName } from "@/types"

// -----------------------------------------------------------------------------
// Client-side tracking (fire-and-forget через fetch)
// -----------------------------------------------------------------------------

export function track(
  event: EventName,
  session_id: string | null,
  properties?: Record<string, unknown>
): void {
  // Не блокируем — просто отправляем
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, session_id, properties }),
      keepalive: true, // отправляется даже если пользователь уходит со страницы
    }).catch(() => {
      // Молча проглатываем — трекинг не должен ломать продукт
    })
  } catch {
    // Молча проглатываем
  }
}

// -----------------------------------------------------------------------------
// Server-side tracking (прямой insert в Supabase)
// Используется в API routes и server components
// -----------------------------------------------------------------------------

export async function trackServer(
  event: EventName,
  session_id: string | null,
  properties?: Record<string, unknown>
): Promise<void> {
  // Не ждём результата — fire and forget на сервере тоже
  insertEvent(event, session_id, properties).catch((err) => {
    console.warn("[Analytics] Failed to track event:", event, err?.message)
  })
}

async function insertEvent(
  event: EventName,
  session_id: string | null,
  properties?: Record<string, unknown>
): Promise<void> {
  // Динамический импорт чтобы не тащить Prisma в клиентский бандл
  const { default: db } = await import("@/lib/db/client")

  await db.event.create({
    data: {
      session_id: session_id ?? undefined,
      event,
      properties: properties ? JSON.parse(JSON.stringify(properties)) : undefined,
    },
  })
}

// -----------------------------------------------------------------------------
// Typed event helpers (удобнее чем голый track())
// -----------------------------------------------------------------------------

export const Analytics = {
  pageViewed: (path: string, session_id?: string) =>
    track("page_viewed", session_id ?? null, { path }),

  questionnaireStarted: () =>
    track("questionnaire_started", null),

  questionnaireBlockCompleted: (block: number, session_id?: string) =>
    track("questionnaire_block_completed", session_id ?? null, { block }),

  questionnaireCompleted: (session_id: string) =>
    track("questionnaire_completed", session_id),

  freeReportViewed: (session_id: string, archetype: string) =>
    track("free_report_viewed", session_id, { archetype }),

  upgradeClicked: (session_id: string, source: string) =>
    track("upgrade_clicked", session_id, { source }),

  paymentStarted: (session_id: string) =>
    track("payment_started", session_id),

  paymentCompleted: (session_id: string) =>
    track("payment_completed", session_id),

  fullReportViewed: (session_id: string) =>
    track("full_report_viewed", session_id),

  checkinEmailSent: (session_id: string, day: 7 | 30 | 90) =>
    trackServer("checkin_email_sent", session_id, { day }),

  checkinCompleted: (session_id: string, completion_count: number) =>
    track("checkin_completed", session_id, { completion_count }),

  actionChecked: (session_id: string, action_id: string) =>
    track("action_checked", session_id, { action_id }),
} as const
