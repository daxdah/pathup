// =============================================================================
// PathUp — AI Orchestrator
// Абстракция над OpenAI. Принимает готовое решение → возвращает текст отчёта.
// LLM НЕ принимает стратегических решений — только упаковывает текст.
// =============================================================================

import OpenAI from "openai"
import { readFileSync } from "fs"
import { join } from "path"
import type {
  StructuredProfile,
  DecisionOutput,
  FreeReport,
  FullReport,
  ParentReport,
} from "@/types"
import {
  FreeReportSchema,
  FullReportSchema,
  ParentReportSchema,
} from "@/schemas"
import { getMockReport } from "./mock-generator"
import { randomUUID } from "crypto"

// -----------------------------------------------------------------------------
// OpenAI client (singleton)
// -----------------------------------------------------------------------------

let _openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ReportType = "free" | "full" | "parent"

interface GenerateReportOptions {
  type: ReportType
  profile: StructuredProfile
  decision: DecisionOutput
}

type ReportResult<T extends ReportType> =
  T extends "free" ? FreeReport :
  T extends "full" ? FullReport :
  ParentReport

// -----------------------------------------------------------------------------
// Prompt loader
// -----------------------------------------------------------------------------

function loadPrompt(name: string): string {
  try {
    const filePath = join(process.cwd(), "prompts", `${name}.md`)
    return readFileSync(filePath, "utf-8")
  } catch {
    console.warn(`[AI] Prompt file not found: ${name}.md — using empty string`)
    return ""
  }
}

// Builds the full system prompt by combining base files.
// Order: system → developer → safeguards → writing_rules
function buildSystemPrompt(): string {
  return [
    loadPrompt("system"),       // voice + core rules
    loadPrompt("developer"),    // product context + required blocks
    loadPrompt("safeguards"),   // absolute prohibitions
    loadPrompt("writing_rules"), // anti-generic rules
  ]
    .filter(Boolean)
    .join("\n\n---\n\n")
}

function buildInputPayload(
  profile: StructuredProfile,
  decision: DecisionOutput,
  reportType: ReportType
): string {
  const payload = {
    task: `generate_${reportType}_report`,
    target_schema: reportType === "free" ? "FreeReport" : reportType === "full" ? "FullReport" : "ParentReport",
    profile: {
      profile_id: profile.profile_id,
      grade: profile.grade,
      interest_areas: profile.interest_areas,
      interest_count: profile.interest_count,
      interest_confidence: profile.interest_confidence,
      primary_interest: profile.primary_interest,
      has_current_project: profile.has_current_project,
      has_public_work: profile.has_public_work,
      projects_completed_last_90d: profile.projects_completed_last_90d,
      completion_rate: profile.completion_rate,
      goal_type: profile.goal_type,
      goal_horizon: profile.goal_horizon,
      goal_specificity: profile.goal_specificity,
      hours_per_week_number: profile.hours_per_week_number,
      blockers: profile.blockers,
      primary_blocker: profile.primary_blocker,
      decision_style: profile.decision_style,
      pressure_source: profile.pressure_source,
      feedback_comfort: profile.feedback_comfort,
      archetype: profile.archetype,
      primary_gap: profile.primary_gap,
      detected_gaps: profile.detected_gaps,
      one_step_today: profile.one_step_today,
    },
    decision: {
      archetype: decision.archetype,
      primary_gap: decision.primary_gap,
      detected_gaps: decision.detected_gaps,
      recommended_paths: decision.recommended_paths,
      primary_path: decision.primary_path,
      excluded_paths: decision.excluded_paths,
      anti_mistakes: decision.anti_mistakes,
      plan_7d: decision.plan_7d,
      plan_30d: decision.plan_30d,
      plan_90d: decision.plan_90d,
    },
  }

  return JSON.stringify(payload, null, 2)
}

// -----------------------------------------------------------------------------
// Retry with exponential backoff
// -----------------------------------------------------------------------------

async function callWithRetry(
  params: Parameters<OpenAI["chat"]["completions"]["create"]>[0],
  maxRetries = 2
): Promise<string> {
  const client = getOpenAIClient()

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create(params)
      const content = (response as any).choices?.[0]?.message?.content ?? ""
      return content
    } catch (err: any) {
      console.error(`[AI] Attempt ${attempt + 1} failed:`, err?.message)
      if (attempt === maxRetries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  throw new Error("[AI] All retry attempts exhausted")
}

// -----------------------------------------------------------------------------
// Parse and validate LLM output
// -----------------------------------------------------------------------------

function parseReport<T extends ReportType>(
  raw: string,
  type: T,
  profile: StructuredProfile,
  decision: DecisionOutput
): ReportResult<T> | null {
  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim()

  try {
    const parsed = JSON.parse(cleaned)

    // Inject system fields + fix common LLM omissions before validation
    const severityMap: Record<string, string> = {
      high: "critical", critical: "critical",
      medium: "moderate", moderate: "moderate",
      low: "minor", minor: "minor",
    }

    const withSystemFields = {
      ...parsed,
      // System fields — LLM never fills these
      report_id:    parsed.report_id    || randomUUID(),
      profile_id:   parsed.profile_id   || profile.profile_id,
      decision_id:  parsed.decision_id  || decision.decision_id,
      generated_at: parsed.generated_at || new Date().toISOString(),
      // Free report: ensure new field has fallback
      ...(type === "free" && {
        what_if_nothing_changes: parsed.what_if_nothing_changes ?? "",
      }),
      // Full report specific defaults
      version: parsed.version ?? 1,
      report_type: parsed.report_type ?? type,
      // New deliverable fields — fallback if LLM omits them
      why_we_think_this: parsed.why_we_think_this ?? "",
      what_if_nothing_changes: parsed.what_if_nothing_changes ?? "",
      what_not_to_do: parsed.what_not_to_do ?? "",
      deliverables_30d: parsed.deliverables_30d?.length ? parsed.deliverables_30d : [],
      proof_of_progress: parsed.proof_of_progress?.length ? parsed.proof_of_progress : [],
      // Fix all_gaps severity — LLM sometimes returns "high"/"medium"/"low"
      all_gaps: Array.isArray(parsed.all_gaps)
        ? parsed.all_gaps.map((g: any) => ({
            ...g,
            severity: severityMap[g.severity] ?? "minor",
          }))
        : decision.detected_gaps?.map((gap: string, i: number) => ({
            gap,
            label: gap,
            severity: i === 0 ? "critical" : i === 1 ? "moderate" : "minor",
          })) ?? [],
      // Fallback for required arrays if LLM omits them
      recommended_paths: parsed.recommended_paths?.length
        ? parsed.recommended_paths
        : decision.recommended_paths?.slice(0, 3).map((path: string, i: number) => ({
            path, label: path, why_for_you: "", rank: (i + 1) as 1 | 2 | 3,
          })) ?? [],
      anti_mistakes: parsed.anti_mistakes?.length
        ? parsed.anti_mistakes
        : decision.anti_mistakes?.map((mistake: string) => ({
            mistake, label: mistake, personalised_warning: "",
          })) ?? [],
    }

    if (type === "free") {
      const result = FreeReportSchema.safeParse(withSystemFields)
      if (result.success) return result.data as ReportResult<T>
      console.error("[AI] Free report validation failed:", result.error.flatten())
      return null
    }

    if (type === "full") {
      const result = FullReportSchema.safeParse(withSystemFields)
      if (result.success) return result.data as ReportResult<T>
      console.error("[AI] Full report validation failed:", result.error.flatten())
      return null
    }

    if (type === "parent") {
      const result = ParentReportSchema.safeParse(withSystemFields)
      if (result.success) return result.data as ReportResult<T>
      console.error("[AI] Parent report validation failed:", result.error.flatten())
      return null
    }
  } catch (err) {
    console.error("[AI] JSON parse failed:", err)
  }

  return null
}

// -----------------------------------------------------------------------------
// Main generate function
// -----------------------------------------------------------------------------

export async function generateReport<T extends ReportType>(
  opts: GenerateReportOptions & { type: T }
): Promise<ReportResult<T>> {
  const { type, profile, decision } = opts

  // --- MOCK MODE ---
  const isMock =
    process.env.MOCK_MODE === "true" ||
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === ""

  if (isMock) {
    console.log(`[AI] Mock mode — returning mock ${type} report`)
    return getMockReport(type as any, profile) as ReportResult<T>
  }

  // --- REAL MODE ---
  const systemPrompt = buildSystemPrompt()
  const reportPrompt = loadPrompt(`${type}_report`)
  const inputPayload = buildInputPayload(profile, decision, type)

  const userContent = [reportPrompt, inputPayload].filter(Boolean).join("\n\n")

  // Model selection: free report → cheap, full/parent → quality
  const model = type === "free" ? "gpt-4o-mini" : "gpt-4o"

  let raw: string

  try {
    raw = await callWithRetry({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      max_tokens: type === "free" ? 1000 : 2500,
      response_format: { type: "json_object" },
    } as any)
  } catch (err) {
    console.error(`[AI] LLM call failed for ${type} report, falling back to mock:`, err)
    return getMockReport(type, profile) as ReportResult<T>
  }

  // Validate output
  const parsed = parseReport(raw, type, profile, decision)
  if (!parsed) {
    console.error(`[AI] Validation failed for ${type} report, falling back to mock`)
    return getMockReport(type, profile) as ReportResult<T>
  }

  // Inject system-generated IDs (don't trust LLM for these)
  const enriched = {
    ...parsed,
    report_id: randomUUID(),
    profile_id: profile.profile_id,
    decision_id: decision.decision_id,
    generated_at: new Date().toISOString(),
  }

  return enriched as ReportResult<T>
}
