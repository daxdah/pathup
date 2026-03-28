// =============================================================================
// PathUp — Processing Pipeline
// Единая точка входа для обработки анкеты и генерации отчётов.
//
// Поток:
//   QuestionnaireInput
//     → buildStructuredProfile()       [детерминированно, ~1ms]
//     → runDecisionLayer()             [детерминированно, ~2ms]
//     → createSession()                [DB write]
//     → generateFreeReport()           [async, LLM или mock]
//     → [после оплаты] generateFullReport()
//
// LLM вызовы — всегда async и никогда не блокируют ответ пользователю.
// При любой ошибке — fallback на mock, продукт не ломается.
// =============================================================================

import { randomUUID } from "crypto"
import type {
  QuestionnaireInput,
  StructuredProfile,
  DecisionOutput,
  FreeReport,
  FullReport,
  ParentReport,
} from "@/types"
import { buildStructuredProfile }  from "@/lib/methodology/profile-builder"
import { runDecisionLayer }         from "@/lib/methodology/decision-layer"
import { generateReport }           from "@/lib/ai/orchestrator"
import {
  createSession,
  saveFreeReport,
  saveFullReport,
  saveParentReport,
  setReportStatus,
  getSessionOrThrow,
} from "@/lib/db/queries/sessions"
import { trackServer } from "@/lib/analytics/track"

// -----------------------------------------------------------------------------
// Step 1 + 2: Profile + Decision  (sync, no external deps)
// -----------------------------------------------------------------------------

export function processQuestionnaire(input: QuestionnaireInput): {
  session_id: string
  profile: StructuredProfile
  decision: DecisionOutput
} {
  const session_id = input.session_id   // already a UUID from client
  const profile    = buildStructuredProfile(input)
  const decision   = runDecisionLayer(profile)

  return { session_id, profile, decision }
}

// -----------------------------------------------------------------------------
// Step 3: Persist to DB
// -----------------------------------------------------------------------------

export async function persistSession(
  session_id: string,
  input: QuestionnaireInput,
  profile: StructuredProfile,
  decision: DecisionOutput
) {
  await createSession({ session_id, questionnaire: input, profile, decision })
  await trackServer("questionnaire_completed", session_id, {
    archetype:    profile.archetype,
    primary_gap:  profile.primary_gap,
    primary_path: decision.primary_path,
    grade:        profile.grade,
  })
}

// -----------------------------------------------------------------------------
// Step 4: Generate Free Report (background, never awaited by API route)
// -----------------------------------------------------------------------------

export async function generateAndSaveFreeReport(
  session_id: string,
  profile: StructuredProfile,
  decision: DecisionOutput
): Promise<void> {
  try {
    await setReportStatus(session_id, "free", "generating")

    const report = await generateReport({ type: "free", profile, decision })

    await saveFreeReport(session_id, report)

    console.log(`[Pipeline] Free report saved: ${session_id}`)
  } catch (err) {
    console.error(`[Pipeline] Free report failed: ${session_id}`, err)
    await setReportStatus(session_id, "free", "failed")
  }
}

// -----------------------------------------------------------------------------
// Step 5: Generate Full Report (triggered after payment webhook)
// -----------------------------------------------------------------------------

export async function generateAndSaveFullReport(
  session_id: string
): Promise<void> {
  try {
    await setReportStatus(session_id, "full", "generating")

    // Load profile + decision from DB (already saved in step 3)
    const row = await getSessionOrThrow(session_id)
    const profile  = row.profile  as unknown as StructuredProfile
    const decision = row.decision as unknown as DecisionOutput

    const report = await generateReport({ type: "full", profile, decision })

    await saveFullReport(session_id, report)

    console.log(`[Pipeline] Full report saved: ${session_id}`)
  } catch (err) {
    console.error(`[Pipeline] Full report failed: ${session_id}`, err)
    await setReportStatus(session_id, "full", "failed")
  }
}

// -----------------------------------------------------------------------------
// Optional: Generate Parent Report (on-demand)
// -----------------------------------------------------------------------------

export async function generateAndSaveParentReport(
  session_id: string
): Promise<ParentReport> {
  const row = await getSessionOrThrow(session_id)

  // Return cached if exists
  if (row.parent_report) {
    return row.parent_report as unknown as ParentReport
  }

  const profile  = row.profile  as unknown as StructuredProfile
  const decision = row.decision as unknown as DecisionOutput

  const report = await generateReport({ type: "parent", profile, decision })

  await saveParentReport(session_id, report)

  return report
}

// -----------------------------------------------------------------------------
// Retry failed report (admin action)
// -----------------------------------------------------------------------------

export async function retryFailedReport(
  session_id: string,
  reportType: "free" | "full"
): Promise<void> {
  const row = await getSessionOrThrow(session_id)
  const profile  = row.profile  as unknown as StructuredProfile
  const decision = row.decision as unknown as DecisionOutput

  if (reportType === "free") {
    await generateAndSaveFreeReport(session_id, profile, decision)
  } else {
    await generateAndSaveFullReport(session_id)
  }
}
