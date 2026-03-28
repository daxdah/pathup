// =============================================================================
// PathUp — POST /api/report/[sid]/upgrade
//
// Создаёт платёж в ЮКасса и возвращает URL для редиректа.
// =============================================================================

import { NextRequest }    from "next/server"
import { z }              from "zod"
import { ok, badRequest, notFound, serverError, parseBody } from "@/lib/utils/api"
import { getSession }     from "@/lib/db/queries/sessions"
import { payments }       from "@/lib/payments"
import { trackServer }    from "@/lib/analytics/track"

const UpgradeBodySchema = z.object({
  email: z.string().email("Некорректный email"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { sid: string } }
) {
  const { sid } = params

  // --- Validate body ---
  const { data, error } = await parseBody(request, UpgradeBodySchema)
  if (error) return error

  try {
    // --- Check session exists ---
    const session = await getSession(sid)
    if (!session) return notFound("Session not found")

    // --- Already paid ---
    if (session.is_paid) {
      return ok({
        already_paid: true,
        redirect_url: `/report/${sid}/full`,
      })
    }

    // --- Create payment ---
    const price = Number(process.env.NEXT_PUBLIC_PRICE_RUB ?? 790)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const payment = await payments.createPayment({
      session_id:  sid,
      amount:      price,
      email:       data.email,
      description: "PathUp — полный план развития",
      return_url:  `${appUrl}/success/${sid}`,
    })

    await trackServer("payment_started", sid, { email: data.email })

    return ok({ payment_url: payment.confirmation_url })

  } catch (err) {
    return serverError("Failed to create payment", err)
  }
}
