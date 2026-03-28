// =============================================================================
// PathUp — Profile Builder
// Преобразует QuestionnaireInput → StructuredProfile.
// Детерминированная логика — без LLM, без внешних зависимостей.
// =============================================================================

import { randomUUID } from "crypto"
import type {
  QuestionnaireInput,
  StructuredProfile,
  InterestArea,
  ConfidenceLevel,
  SpecificityLevel,
  CompletionRate,
} from "@/types"
import { assignArchetype } from "./archetype-engine"
import { detectGaps } from "./gap-detector"

// -----------------------------------------------------------------------------
// Главная функция
// -----------------------------------------------------------------------------

export function buildStructuredProfile(input: QuestionnaireInput): StructuredProfile {
  // --- INTERESTS ---
  const interest_areas = input.interest_areas
  const interest_count = interest_areas.filter((a) => a !== "unknown").length
  const interest_confidence = mapInterestConfidence(input.interest_confidence)
  const primary_interest: InterestArea =
    interest_areas.find((a) => a !== "unknown") ?? "unknown"

  // --- EXPERIENCE ---
  const has_current_project =
    input.recent_activities.some((a) =>
      ["coding", "design", "content", "public_work"].includes(a)
    ) && !input.recent_activities.includes("nothing")

  const has_public_work =
    input.recent_activities.includes("public_work") ||
    input.completion_pattern === "completes_and_publishes"

  const projects_completed_last_90d = deriveProjectsCompleted(input)
  const completion_rate = mapCompletionRate(input.completion_pattern)

  // --- GOALS ---
  const goal_specificity = deriveGoalSpecificity(input, interest_confidence)
  const has_deadline = input.goal_horizon === "urgent"

  // --- RESOURCES ---
  const hours_per_week_number = mapHoursToNumber(input.hours_per_week)
  const schedule_flexibility = deriveScheduleFlexibility(input)

  // --- PSYCHOLOGY ---
  const primary_blocker = input.blockers[0]
  const feedback_comfort_level = mapFeedbackComfort(input.feedback_comfort)

  // Собираем базовый профиль (без архетипа и gaps — нужен для их вычисления)
  const baseProfile = {
    profile_id: randomUUID(),
    grade: input.grade,
    created_at: new Date().toISOString(),

    interest_areas,
    interest_count,
    interest_confidence,
    primary_interest,

    has_current_project,
    has_public_work,
    projects_completed_last_90d,
    completion_rate,
    recent_activities: input.recent_activities,

    goal_type: input.goal_type,
    goal_horizon: input.goal_horizon,
    goal_specificity,
    has_deadline,

    hours_per_week_bucket: input.hours_per_week,
    hours_per_week_number,
    schedule_flexibility,

    blockers: input.blockers,
    primary_blocker,
    decision_style: input.decision_style,
    pressure_source: input.pressure_source,
    feedback_comfort: input.feedback_comfort,
    feedback_comfort_level,

    one_step_today: input.one_step_today,

    // Заглушки — заполним ниже
    archetype: "Dreamer" as const,
    archetype_confidence: "low" as ConfidenceLevel,
    detected_gaps: [] as any[],
    primary_gap: "G10_no_concrete_goal" as const,
  }

  // --- ARCHETYPE ---
  const { archetype, confidence: archetype_confidence } = assignArchetype(baseProfile as any)

  // --- GAPS ---
  const { gaps: detected_gaps, primary_gap } = detectGaps({
    ...baseProfile,
    archetype,
    archetype_confidence,
  } as any)

  return {
    ...baseProfile,
    archetype,
    archetype_confidence,
    detected_gaps,
    primary_gap,
  }
}

// -----------------------------------------------------------------------------
// Вспомогательные функции
// -----------------------------------------------------------------------------

function mapInterestConfidence(
  confidence: QuestionnaireInput["interest_confidence"]
): ConfidenceLevel {
  const map: Record<typeof confidence, ConfidenceLevel> = {
    proven: "high",
    likely: "medium",
    unsure: "low",
    random: "low",
  }
  return map[confidence]
}

function mapCompletionRate(
  pattern: QuestionnaireInput["completion_pattern"]
): CompletionRate {
  const map: Record<typeof pattern, CompletionRate> = {
    completes_and_publishes: "high",
    completes_private: "medium",
    drops: "low",
    barely_starts: "low",
  }
  return map[pattern]
}

function mapHoursToNumber(hours: QuestionnaireInput["hours_per_week"]): number {
  const map: Record<typeof hours, number> = {
    lt2: 1,
    "2to4": 3,
    "5to7": 6,
    gt8: 9,
  }
  return map[hours]
}

function mapFeedbackComfort(
  comfort: QuestionnaireInput["feedback_comfort"]
): ConfidenceLevel {
  const map: Record<typeof comfort, ConfidenceLevel> = {
    open: "high",
    nervous_but_ok: "medium",
    prefer_not: "low",
    private: "low",
  }
  return map[comfort]
}

function deriveProjectsCompleted(input: QuestionnaireInput): number {
  if (input.recent_activities.includes("nothing")) return 0
  if (input.completion_pattern === "barely_starts") return 0
  if (input.completion_pattern === "drops") return 0
  if (input.completion_pattern === "completes_private") return 1
  if (input.completion_pattern === "completes_and_publishes") return 2
  return 0
}

function deriveGoalSpecificity(
  input: QuestionnaireInput,
  interest_confidence: ConfidenceLevel
): SpecificityLevel {
  // Специфичная цель: конкретный вуз И высокая уверенность в интересах
  if (
    input.goal_type === "university" &&
    interest_confidence === "high"
  ) {
    return "specific"
  }

  // Направленная цель: есть конкретный тип + средняя уверенность
  // FIX: добавлен "earn" — конкретная цель зарабатывать не должна быть vague
  if (
    ["skill", "university", "own_project", "earn"].includes(input.goal_type) &&
    interest_confidence !== "low"
  ) {
    return "directional"
  }

  // Расплывчатая цель: не знает что хочет
  return "vague"
}

function deriveScheduleFlexibility(
  input: QuestionnaireInput
): "structured" | "flexible" | "chaotic" {
  // 11-класснику с горящим дедлайном — structured (всё расписано)
  if (input.grade === 11 && input.goal_horizon === "urgent") return "structured"

  // Мало времени + много блокеров — хаотичный
  if (
    input.hours_per_week === "lt2" &&
    input.blockers.includes("no_time")
  ) {
    return "chaotic"
  }

  // По умолчанию — гибкий
  return "flexible"
}
