// =============================================================================
// PathUp — Payment Provider
// Абстракция: один интерфейс, две реализации (ЮКасса + Mock).
// Переключение через PAYMENT_MOCK=true в .env
// =============================================================================

import type { CreatePaymentParams, PaymentResult, PaymentStatus } from "@/types"

// -----------------------------------------------------------------------------
// Interface
// -----------------------------------------------------------------------------

export interface PaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  verifyWebhook(rawBody: string, signature: string): boolean
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
}

// -----------------------------------------------------------------------------
// ЮКасса
// -----------------------------------------------------------------------------

class YookassaProvider implements PaymentProvider {
  private shopId     = process.env.YOOKASSA_SHOP_ID     ?? ""
  private secretKey  = process.env.YOOKASSA_SECRET_KEY  ?? ""

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const credentials = Buffer.from(`${this.shopId}:${this.secretKey}`).toString("base64")

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization:       `Basic ${credentials}`,
        "Content-Type":      "application/json",
        "Idempotence-Key":   params.session_id, // идемпотентность из коробки
      },
      body: JSON.stringify({
        amount: {
          value:    params.amount.toFixed(2),
          currency: "RUB",
        },
        confirmation: {
          type:       "redirect",
          return_url: params.return_url,
        },
        description: params.description,
        metadata: {
          session_id: params.session_id,
        },
        receipt: {
          customer: { email: params.email },
          items: [
            {
              description: params.description,
              quantity:    "1",
              amount: {
                value:    params.amount.toFixed(2),
                currency: "RUB",
              },
              vat_code: 1,
              payment_mode:    "full_payment",
              payment_subject: "service",
            },
          ],
        },
        capture: true,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`YooKassa error ${response.status}: ${err}`)
    }

    const data = await response.json()

    return {
      payment_id:       data.id,
      confirmation_url: data.confirmation.confirmation_url,
      status:           data.status,
    }
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    // ЮКасса не использует подпись в webhook — проверяем IP в продакшне
    // Для MVP: принимаем все webhooks (добавить IP whitelist в продакшне)
    return true
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const credentials = Buffer.from(`${this.shopId}:${this.secretKey}`).toString("base64")

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${credentials}` },
    })

    if (!response.ok) throw new Error(`YooKassa status check failed: ${response.status}`)

    const data = await response.json()
    return data.status
  }
}

// -----------------------------------------------------------------------------
// Mock Provider (dev + tests)
// -----------------------------------------------------------------------------

class MockPaymentProvider implements PaymentProvider {
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    console.log(`[Payment Mock] Creating payment for session: ${params.session_id}`)

    // Симулируем redirect через mock webhook endpoint
    return {
      payment_id:       `mock_pay_${params.session_id.slice(0, 8)}`,
      confirmation_url: `${appUrl}/api/webhooks/payment/mock?sid=${params.session_id}&email=${encodeURIComponent(params.email)}`,
      status:           "pending",
    }
  }

  verifyWebhook(_rawBody: string, _signature: string): boolean {
    return true
  }

  async getPaymentStatus(_paymentId: string): Promise<PaymentStatus> {
    return "succeeded"
  }
}

// -----------------------------------------------------------------------------
// Export active provider
// -----------------------------------------------------------------------------

export const payments: PaymentProvider =
  process.env.PAYMENT_MOCK === "true"
    ? new MockPaymentProvider()
    : new YookassaProvider()
