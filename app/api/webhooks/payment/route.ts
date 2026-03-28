// =============================================================================
// PathUp — POST /api/webhooks/payment
//
// Webhook от ЮКасса. Вызывается при успешной оплате.
// Идемпотентный: повторный вызов безопасен.
//
// После оплаты:
//   1. Помечаем сессию как оплаченную
//   2. Запускаем генерацию full report (background)
//   3. Отправляем welcome email
// =============================================================================

import { NextRequest }      from "next/server"
import { ok, badRequest, serverError } from "@/lib/utils/api"
import { payments }         from "@/lib/payments"
import {
  markSessionPaid,
  getSession,
}                           from "@/lib/db/queries/sessions"
import { generateAndSaveFullReport } from "@/lib/pipeline"
import { trackServer }      from "@/lib/analytics/track"
import { sendWelcomeEmail } from "@/lib/email/sender"

export async function POST(request: NextRequest) {
  // --- Read raw body for signature verification ---
  const rawBody = await request.text()
  const signature = request.headers.get("x-yookassa-signature") ?? ""

  // --- Verify webhook signature ---
  const isValid = payments.verifyWebhook(rawBody, signature)
  if (!isValid) {
    console.warn("[Webhook] Invalid signature")
    return badRequest("Invalid signature")
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return badRequest("Invalid JSON")
  }

  // --- Only handle succeeded payments ---
  if (event?.event !== "payment.succeeded") {
    return ok({ ignored: true })
  }

  const payment    = event.object
  const payment_id = payment?.id
  const session_id = payment?.metadata?.session_id
  const email      = payment?.receipt?.customer?.email

  if (!payment_id || !session_id) {
    console.error("[Webhook] Missing payment_id or session_id", event)
    return badRequest("Missing required fields")
  }

  try {
    // --- Idempotency check ---
    const session = await getSession(session_id)
    if (!session) {
      console.error("[Webhook] Session not found:", session_id)
      return ok({ ok: true, note: "session_not_found" })
    }

    if (session.is_paid) {
      // Already processed — idempotent response
      return ok({ ok: true, note: "already_processed" })
    }

    // --- Mark as paid ---
    await markSessionPaid({
      session_id,
      payment_id,
      email: email ?? session.email ?? "",
    })

    await trackServer("payment_completed", session_id, { payment_id })

    // --- Generate full report in background ---
    generateAndSaveFullReport(session_id).catch((err) => {
      console.error("[Webhook] Full report generation failed:", err)
    })

    // --- Send welcome email ---
    if (email) {
      sendWelcomeEmail(session_id, email).catch((err) => {
        console.error("[Webhook] Welcome email failed:", err)
      })
    }

    console.log(`[Webhook] Payment processed: ${session_id}`)
    return ok({ ok: true })

  } catch (err) {
    return serverError("Webhook processing failed", err)
  }
}
