// =============================================================================
// PathUp — GET /api/webhooks/payment/mock
// Симулирует успешную оплату в dev режиме.
// Доступен только при PAYMENT_MOCK=true.
// =============================================================================

import { NextRequest }  from "next/server"
import { redirect }     from "next/navigation"
import {
  markSessionPaid,
  getSession,
}                       from "@/lib/db/queries/sessions"
import { generateAndSaveFullReport } from "@/lib/pipeline"
import { trackServer }  from "@/lib/analytics/track"

export async function GET(request: NextRequest) {
  // Block in production
  if (process.env.PAYMENT_MOCK !== "true") {
    return new Response("Not available", { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const sid   = searchParams.get("sid")
  const email = searchParams.get("email") ?? "test@example.com"

  if (!sid) return new Response("Missing sid", { status: 400 })

  const session = await getSession(sid)
  if (!session) return new Response("Session not found", { status: 404 })

  if (!session.is_paid) {
    await markSessionPaid({
      session_id: sid,
      payment_id: `mock_${Date.now()}`,
      email,
    })

    await trackServer("payment_completed", sid, { mock: true })

    // Background full report generation
    generateAndSaveFullReport(sid).catch(console.error)
  }

  redirect(`/success/${sid}`)
}
