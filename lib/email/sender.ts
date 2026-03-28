// =============================================================================
// PathUp — Email Sender
// Resend wrapper. Все email функции здесь — не в API routes.
// =============================================================================

import { Resend }    from "resend"
import * as React    from "react"

// Lazy init — не инициализируем если нет ключа
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error("RESEND_API_KEY not set")
    _resend = new Resend(key)
  }
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "PathUp <hello@pathup.ru>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// -----------------------------------------------------------------------------
// Welcome email (after payment)
// -----------------------------------------------------------------------------

export async function sendWelcomeEmail(
  session_id: string,
  email: string
): Promise<void> {
  const reportUrl = `${APP_URL}/report/${session_id}/full`

  await send({
    to:      email,
    subject: "Твой план готов — PathUp",
    html:    buildWelcomeHtml(reportUrl),
  })
}

// -----------------------------------------------------------------------------
// Check-in emails
// -----------------------------------------------------------------------------

export async function sendCheckinEmail(
  session_id: string,
  email: string,
  day: 7 | 30 | 90
): Promise<void> {
  const checkinUrl = `${APP_URL}/checkin/${session_id}`

  const subjects: Record<typeof day, string> = {
    7:  "Как прошла первая неделя?",
    30: "Месяц прошёл. Три вопроса.",
    90: "90 дней. Время для ретроспективы.",
  }

  await send({
    to:      email,
    subject: subjects[day],
    html:    buildCheckinHtml(checkinUrl, day),
  })
}

// -----------------------------------------------------------------------------
// Core send function
// -----------------------------------------------------------------------------

async function send(params: {
  to:      string
  subject: string
  html:    string
}): Promise<void> {
  // Mock mode: просто логируем
  if (process.env.MOCK_MODE === "true" || !process.env.RESEND_API_KEY) {
    console.log(`[Email Mock] To: ${params.to} | Subject: ${params.subject}`)
    return
  }

  const resend = getResend()

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: params.subject,
    html:    params.html,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}

// -----------------------------------------------------------------------------
// HTML templates (inline — без React Email зависимости в MVP)
// Простые, без украшений, работают везде
// -----------------------------------------------------------------------------

function buildWelcomeHtml(reportUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Твой план готов</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <p style="color:#C8F060;font-size:14px;font-weight:600;margin:0 0 32px;">PathUp</p>

    <h1 style="color:#E8E4DC;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.2;">
      Твой план готов.
    </h1>

    <p style="color:#888880;font-size:15px;line-height:1.6;margin:0 0 32px;">
      Полный план на 7, 30 и 90 дней — по ссылке ниже.
      Он останется у тебя навсегда.
    </p>

    <a href="${reportUrl}"
       style="display:inline-block;background:#C8F060;color:#0A0A0A;font-weight:600;
              font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Открыть план →
    </a>

    <p style="color:#555550;font-size:12px;margin:40px 0 0;">
      PathUp · Инструмент планирования, не психологическая помощь
    </p>
  </div>
</body>
</html>`
}

function buildCheckinHtml(checkinUrl: string, day: 7 | 30 | 90): string {
  const bodies: Record<typeof day, string> = {
    7: `
      <p style="color:#888880;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Неделю назад ты получил план.<br>
        Там было несколько конкретных шагов.
      </p>
      <p style="color:#888880;font-size:15px;line-height:1.6;margin:0 0 32px;">
        Один вопрос: что из этого ты сделал?
      </p>`,
    30: `
      <p style="color:#888880;font-size:15px;line-height:1.6;margin:0 0 32px;">
        30 дней назад ты получил план.<br>
        Три вопроса — без правильных ответов.
      </p>`,
    90: `
      <p style="color:#888880;font-size:15px;line-height:1.6;margin:0 0 32px;">
        Три месяца назад у тебя был план.<br>
        Время для ретроспективы.
      </p>`,
  }

  const subjects: Record<typeof day, string> = {
    7:  "Как прошла первая неделя?",
    30: "Месяц прошёл. Три вопроса.",
    90: "90 дней. Время для ретроспективы.",
  }

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${subjects[day]}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <p style="color:#C8F060;font-size:14px;font-weight:600;margin:0 0 32px;">PathUp</p>

    <h1 style="color:#E8E4DC;font-size:22px;font-weight:700;margin:0 0 24px;line-height:1.2;">
      ${subjects[day]}
    </h1>

    ${bodies[day]}

    <a href="${checkinUrl}"
       style="display:inline-block;background:#C8F060;color:#0A0A0A;font-weight:600;
              font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Отметить прогресс →
    </a>

    <p style="color:#555550;font-size:12px;margin:40px 0 0;">
      PathUp · Это не проверка. Это помогает скорректировать следующий шаг.
    </p>
  </div>
</body>
</html>`
}
