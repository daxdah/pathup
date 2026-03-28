// =============================================================================
// PathUp — GET /api/report/[sid]
//
// Клиент поллит этот endpoint пока free_report_status !== 'done'.
// Возвращает статус + данные если готово.
// =============================================================================

import { NextRequest }     from "next/server"
import { ok, notFound, serverError } from "@/lib/utils/api"
import { getSession }      from "@/lib/db/queries/sessions"

export async function GET(
  _request: NextRequest,
  { params }: { params: { sid: string } }
) {
  const { sid } = params

  try {
    const session = await getSession(sid)
    if (!session) return notFound("Session not found")

    return ok({
      status:      session.free_report_status,
      is_paid:     session.is_paid,
      free_report: session.free_report_status === "done"
        ? session.free_report
        : null,
    })

  } catch (err) {
    return serverError("Failed to fetch report status", err)
  }
}
