// =============================================================================
// PathUp — Report QA Checklist
// Минимальные проверки перед первыми пользователями.
// Запускается вручную или как часть smoke-тестов после деплоя.
//
// Использование:
//   node -e "require('./lib/ai/report-qa').runQAChecklist(freeReport, 'free')"
// =============================================================================

import type { FreeReport, FullReport, ParentReport } from "@/types"

// Result of a single check
interface QACheck {
  name:    string
  passed:  boolean
  detail?: string
}

interface QAResult {
  report_type: string
  total:  number
  passed: number
  failed: number
  checks: QACheck[]
}

// -----------------------------------------------------------------------------
// Shared checks (apply to all report types)
// -----------------------------------------------------------------------------

function sharedChecks(report: Record<string, unknown>): QACheck[] {
  return [
    {
      name: "No empty string fields",
      passed: !JSON.stringify(report).includes('""'),
      detail: "Check for accidentally empty string values",
    },
    {
      name: "No placeholder text",
      passed: !JSON.stringify(report).match(/\[.*\]|TODO|PLACEHOLDER|undefined/i),
      detail: "No square-bracket placeholders or TODOs in output",
    },
    {
      name: "No guaranteed results",
      passed: !JSON.stringify(report).match(
        /гарантирован|точно получ|обязательно достигн|поступишь|100%|гарантия/i
      ),
      detail: "No outcome guarantees",
    },
    {
      name: "No clinical diagnosis language",
      passed: !JSON.stringify(report).match(
        /тревожное расстройство|депрессия|adhd|синдром дефицита/i
      ),
      detail: "No clinical terms",
    },
    {
      name: "No forbidden phrases",
      passed: !JSON.stringify(report).match(
        /ты должен|ты обязан|найди своё призвание|следуй своей страсти|ты можешь всё|просто начни|просто делай|не упусти шанс|время уходит|ты отстаёшь|в твоём возрасте уже/i
      ),
      detail: "No banned motivational phrases",
    },
    {
      name: "No fabricated statistics",
      passed: !JSON.stringify(report).match(
        /\d+%\s*(школьников|подростков|людей)|по данным исследований|учёные доказали|статистика показывает/i
      ),
      detail: "No invented stats or research citations",
    },
    {
      name: "Valid JSON structure",
      passed: (() => {
        try { JSON.stringify(report); return true }
        catch { return false }
      })(),
    },
  ]
}

// -----------------------------------------------------------------------------
// Free report checks
// -----------------------------------------------------------------------------

function freeReportChecks(report: FreeReport): QACheck[] {
  const requiredTextFields = [
    "archetype_label",
    "archetype_description",
    "primary_gap_label",
    "primary_gap_description",
    "top_path_label",
    "top_path_teaser",
    "upgrade_prompt",
  ] as const

  return [
    {
      name: "All required text fields present",
      passed: requiredTextFields.every(f => typeof (report as any)[f] === "string" && (report as any)[f].length > 10),
      detail: `Required fields: ${requiredTextFields.join(", ")}`,
    },
    {
      name: "plan_7d_preview has exactly 2 actions",
      passed: Array.isArray(report.plan_7d_preview) && report.plan_7d_preview.length === 2,
      detail: `Got ${report.plan_7d_preview?.length ?? 0} actions`,
    },
    {
      name: "plan_7d_preview actions have required fields",
      passed: report.plan_7d_preview?.every(
        a => a.action_id && a.label && a.description && a.duration_minutes && a.day_target !== undefined
      ) ?? false,
    },
    {
      name: "plan_30d_locked is true",
      passed: report.plan_30d_locked === true,
    },
    {
      name: "plan_90d_locked is true",
      passed: report.plan_90d_locked === true,
    },
    {
      name: "archetype_description under 4 sentences",
      passed: (report.archetype_description?.split(/[.!?]/).filter(s => s.trim().length > 5).length ?? 0) <= 4,
    },
    {
      name: "upgrade_prompt does not contain FOMO language",
      passed: !report.upgrade_prompt?.match(/не упусти|срочно|торопись|последний шанс/i),
    },
  ]
}

// -----------------------------------------------------------------------------
// Full report checks
// -----------------------------------------------------------------------------

function fullReportChecks(report: FullReport): QACheck[] {
  return [
    {
      name: "report_type is 'full'",
      passed: report.report_type === "full",
    },
    {
      name: "archetype_strengths has 2–3 items",
      passed: report.archetype_strengths?.length >= 2 && report.archetype_strengths?.length <= 3,
    },
    {
      name: "archetype_risks has 1–2 items",
      passed: report.archetype_risks?.length >= 1 && report.archetype_risks?.length <= 2,
    },
    {
      name: "all_gaps array is present and non-empty",
      passed: Array.isArray(report.all_gaps) && report.all_gaps.length > 0,
    },
    {
      name: "all_gaps have severity field",
      passed: report.all_gaps?.every(g =>
        ["critical", "moderate", "minor"].includes(g.severity)
      ) ?? false,
    },
    {
      name: "plan_7d.actions is non-empty array",
      passed: Array.isArray(report.plan_7d?.actions) && report.plan_7d.actions.length > 0,
    },
    {
      name: "plan_7d.main_result is a single concrete sentence",
      passed: typeof report.plan_7d?.main_result === "string" &&
        report.plan_7d.main_result.length > 10 &&
        !report.plan_7d.main_result.match(/шаг вперёд|большой прогресс|вырастешь/i),
    },
    {
      name: "plan_30d has exactly 4 phases",
      passed: report.plan_30d?.phases?.length === 4,
    },
    {
      name: "plan_90d.quarter.months has 3 items",
      passed: report.plan_90d?.quarter?.months?.length === 3,
    },
    {
      name: "anti_mistakes all have personalised_warning",
      passed: report.anti_mistakes?.every(m =>
        typeof m.personalised_warning === "string" && m.personalised_warning.length > 20
      ) ?? false,
    },
    {
      name: "success_criteria uses observable language",
      passed: typeof report.plan_90d?.success_criteria === "string" &&
        !report.plan_90d.success_criteria.match(/почувствуешь|ощутишь|станешь лучше/i),
    },
    {
      name: "recommended_paths all have why_for_you",
      passed: report.recommended_paths?.every(p =>
        typeof p.why_for_you === "string" && p.why_for_you.length > 15
      ) ?? false,
    },
  ]
}

// -----------------------------------------------------------------------------
// Parent report checks
// -----------------------------------------------------------------------------

function parentReportChecks(report: ParentReport): QACheck[] {
  return [
    {
      name: "report_type is 'parent'",
      passed: report.report_type === "parent",
    },
    {
      name: "note has exact required value",
      passed: report.note === "Это план, а не диагноз. Подросток его видел первым.",
      detail: `Got: "${report.note}"`,
    },
    {
      name: "how_to_support has exactly 3 items",
      passed: report.how_to_support?.length === 3,
    },
    {
      name: "how_to_support items start with action verbs",
      passed: report.how_to_support?.every(s =>
        s.match(/^(если|когда|раз в|не спрашивайте|спросите|предложите|дайте|замечайте)/i)
      ) ?? false,
      detail: "Items should start with specific behavior instructions",
    },
    {
      name: "what_not_to_do has 2–3 items",
      passed: report.what_not_to_do?.length >= 2 && report.what_not_to_do?.length <= 3,
    },
    {
      name: "check_in_questions has exactly 3 items",
      passed: report.check_in_questions?.length === 3,
    },
    {
      name: "check_in_questions are open-ended (not yes/no)",
      passed: report.check_in_questions?.every(q =>
        q.match(/^(что|как|когда|где|кто|зачем|почему)/i)
      ) ?? false,
      detail: "Questions should start with interrogative pronouns",
    },
    {
      name: "No 'ты должен' directed at parent",
      passed: !JSON.stringify(report).match(/вы должны|вам нужно обязательно/i),
    },
    {
      name: "child_archetype_for_parent doesn't use archetype enum names",
      passed: !report.child_archetype_for_parent?.match(
        /\bAnxious\b|\bDreamer\b|\bBuilder\b|\bHustler\b|\bRebel\b|\bFollower\b|\bAchiever\b|\bSpecialist\b/
      ),
    },
  ]
}

// -----------------------------------------------------------------------------
// Main QA runner
// -----------------------------------------------------------------------------

export function runQAChecklist(
  report: FreeReport | FullReport | ParentReport,
  type: "free" | "full" | "parent"
): QAResult {
  const checks: QACheck[] = [
    ...sharedChecks(report as Record<string, unknown>),
    ...(type === "free" ? freeReportChecks(report as FreeReport) : []),
    ...(type === "full" ? fullReportChecks(report as FullReport) : []),
    ...(type === "parent" ? parentReportChecks(report as ParentReport) : []),
  ]

  const passed = checks.filter(c => c.passed).length
  const failed = checks.filter(c => !c.passed).length

  if (failed > 0) {
    console.warn(`[QA] ${type} report: ${failed} checks failed`)
    checks.filter(c => !c.passed).forEach(c => {
      console.warn(`  ❌ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`)
    })
  }

  return { report_type: type, total: checks.length, passed, failed, checks }
}

// Throws if any QA check fails — use in CI or smoke tests
export function assertQAPasses(
  report: FreeReport | FullReport | ParentReport,
  type: "free" | "full" | "parent"
): void {
  const result = runQAChecklist(report, type)
  if (result.failed > 0) {
    const failedNames = result.checks
      .filter(c => !c.passed)
      .map(c => c.name)
      .join(", ")
    throw new Error(`[QA] Report failed ${result.failed} checks: ${failedNames}`)
  }
}
