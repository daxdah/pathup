// =============================================================================
// PathUp — POST /api/checkin/[sid]
// Принимает check-in ответы, сохраняет, возвращает follow-up текст.
// =============================================================================

import { NextRequest }           from "next/server"
import { CheckinInputSchema }    from "@/schemas"
import {
  ok, notFound, serverError, parseBody,
} from "@/lib/utils/api"
import {
  getSession,
  saveCheckinResult,
} from "@/lib/db/queries/sessions"
import { trackServer } from "@/lib/analytics/track"

export async function POST(
  request: NextRequest,
  { params }: { params: { sid: string } }
) {
  const { data, error } = await parseBody(request, CheckinInputSchema)
  if (error) return error

  const session = await getSession(params.sid)
  if (!session) return notFound()

  // Get total action count from stored report
  const report    = (session.full_report ?? session.free_report) as any
  const actions   = report?.plan_7d?.actions ?? report?.plan_7d_preview ?? []
  const total     = actions.length || 4
  const completed = data.completed_action_ids.length

  // Build follow-up message (deterministic, no LLM)
  const follow_up_message = buildFollowUp(completed, total, data.reason_if_empty)
  const next_focus        = getNextFocus(report)

  const result = { completion_count: completed, total_actions: total, follow_up_message, next_focus }

  await saveCheckinResult(params.sid, result)
  await trackServer("checkin_completed", params.sid, { completed, total })

  return ok(result)
}

function buildFollowUp(done: number, total: number, reason?: string): string {
  if (done >= total) {
    return "Отлично — ты сделал всё что планировал. Это работает. Следующая неделя — чуть сложнее."
  }
  if (done >= Math.ceil(total / 2)) {
    return "Хорошо — не всё, но что-то. Это уже лучше чем ничего, и это не ирония. Продолжаем."
  }
  if (done > 0) {
    return "Один шаг сделан. Этого достаточно чтобы не останавливаться. Следующая неделя — с того же шага."
  }

  // Nothing done
  const reasonMessages: Record<string, string> = {
    no_time:       "Нет времени — значит план нужно сжать. На следующей неделе — одно действие вместо четырёх.",
    too_hard:      "Показалось сложным — значит шаг был слишком большим. Разобьём его на меньший.",
    lost_interest: "Интерес прошёл — нормально. Посмотри на план ещё раз и выбери один шаг который всё-таки хочется сделать.",
  }
  return reasonMessages[reason ?? ""] ??
    "Планы ломаются — это нормально. Один шаг на следующей неделе. Только один."
}

function getNextFocus(report: any): string | undefined {
  // Return week 2 focus if available
  const phases = report?.plan_30d?.phases
  if (Array.isArray(phases) && phases[1]) {
    return phases[1].focus
  }
  return undefined
}
