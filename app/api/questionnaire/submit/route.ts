// =============================================================================
// PathUp — POST /api/questionnaire/submit
//
// Критический путь продукта. Принимает анкету → строит профиль →
// запускает decision layer → сохраняет в БД → запускает генерацию
// free report в фоне → возвращает session_id.
//
// Пользователь редиректится на /report/[sid] немедленно.
// Free report генерируется параллельно (polling на клиенте).
// =============================================================================

import { NextRequest }      from "next/server"
import { QuestionnaireInputSchema } from "@/schemas"
import {
  ok,
  badRequest,
  serverError,
  parseBody,
  checkRateLimit,
} from "@/lib/utils/api"
import {
  processQuestionnaire,
  persistSession,
  generateAndSaveFreeReport,
  generateAndSaveFullReport,
} from "@/lib/pipeline"

export async function POST(request: NextRequest) {
  // --- Rate limiting ---
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
  if (!checkRateLimit(ip, 10, 60_000)) {
    return badRequest("Слишком много запросов. Подожди минуту.")
  }

  // --- Parse + validate ---
  const { data: input, error } = await parseBody(request, QuestionnaireInputSchema)
  if (error) return error

  try {
    // --- Step 1 & 2: Profile + Decision (sync, deterministic, ~3ms) ---
    const { session_id, profile, decision } = processQuestionnaire(input)

    // --- Step 3: Persist to DB ---
    await persistSession(session_id, input, profile, decision)

    // --- Step 4: Generate free AND full reports in background (beta — no paywall) ---
    generateAndSaveFreeReport(session_id, profile, decision).catch((err) => {
      console.error("[Submit] Background free report failed:", err)
    })
    generateAndSaveFullReport(session_id).catch((err) => {
      console.error("[Submit] Background full report failed:", err)
    })

    // --- Respond immediately ---
    return ok({ session_id })

  } catch (err) {
    return serverError("Failed to process questionnaire", err)
  }
}
