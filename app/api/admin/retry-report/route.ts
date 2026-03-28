// =============================================================================
// PathUp — POST /api/admin/retry-report
// Перезапускает генерацию упавшего отчёта.
// Требует admin cookie (проверяется через middleware + requireAdminSecret).
// =============================================================================

import { NextRequest }         from "next/server"
import { z }                   from "zod"
import {
  ok, badRequest, unauthorized, serverError, parseBody,
} from "@/lib/utils/api"
import { requireAdminSecret }  from "@/lib/utils/api"
import { retryFailedReport }   from "@/lib/pipeline"

const Schema = z.object({
  session_id:  z.string().uuid(),
  report_type: z.enum(["free", "full"]),
})

export async function POST(request: NextRequest) {
  if (!requireAdminSecret(request)) return unauthorized()

  const { data, error } = await parseBody(request, Schema)
  if (error) return error

  try {
    // Fire-and-forget: не ждём завершения
    retryFailedReport(data.session_id, data.report_type).catch((err) => {
      console.error("[Admin retry] Failed:", err)
    })

    return ok({ started: true, session_id: data.session_id })
  } catch (err) {
    return serverError("Failed to start retry", err)
  }
}
