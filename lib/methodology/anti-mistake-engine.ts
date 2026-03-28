// =============================================================================
// PathUp — Anti-Mistake Engine
// Назначает топ-3 анти-ошибки для профиля.
// =============================================================================

import type { AntiMistake, StructuredProfile } from "@/types"

interface AntiMistakeRule {
  mistake: AntiMistake
  label: string
  condition: (p: StructuredProfile) => boolean
  priority: number
}

export const ANTI_MISTAKE_RULES: AntiMistakeRule[] = [
  {
    mistake: "M4_perfectionism_freeze",
    label: "Ловушка перфекционизма",
    priority: 1,
    condition: (p) =>
      p.blockers.includes("fear_of_failure") ||
      (p.archetype === "Anxious" && !p.has_public_work) ||
      (p.archetype === "Achiever" && !p.has_public_work),
  },
  {
    mistake: "M1_infinite_planning",
    label: "Бесконечное планирование",
    priority: 2,
    condition: (p) =>
      p.decision_style === "analytical_stuck" && p.completion_rate === "low",
  },
  {
    mistake: "M3_shiny_object",
    label: "Синдром нового интересного",
    priority: 3,
    // FIX 2: lowered threshold from >= 3 to >= 2
    // interest_count=2 + drops is enough to signal shiny-object pattern.
    // Catches Rebel/Dreamer profiles bouncing between just two directions.
    condition: (p) =>
      p.interest_count >= 2 && p.completion_rate === "low",
  },
  {
    mistake: "M2_motivation_dependency",
    label: "Зависимость от мотивации",
    priority: 4,
    // PRE-LAUNCH FIX 2: extended condition to include survive/no-direction Follower profiles.
    // waits_for_others + no interests = action only happens when pushed by others.
    // This is structurally the same as motivation dependency — needs system, not inspiration.
    condition: (p) =>
      p.blockers.includes("loses_interest") ||
      p.archetype === "Dreamer" ||
      (
        p.goal_type === "survive" &&
        p.decision_style === "waits_for_others" &&
        p.interest_count === 0
      ),
  },
  {
    mistake: "M5_lone_wolf",
    label: "Работа в изоляции",
    priority: 5,
    condition: (p) =>
      !p.has_public_work && p.feedback_comfort_level === "low",
  },
  {
    mistake: "M8_comparison_spiral",
    label: "Спираль сравнения",
    priority: 6,
    condition: (p) =>
      p.archetype === "Anxious" || p.pressure_source === "peers",
  },
  {
    mistake: "M9_overload_start",
    label: "Перегруженный старт",
    priority: 7,
    condition: (p) =>
      p.archetype === "Hustler" ||
      (p.archetype === "Dreamer" && p.goal_horizon === "urgent"),
  },
  {
    mistake: "M6_credential_overvaluation",
    label: "Переоценка корочки",
    priority: 8,
    condition: (p) =>
      p.goal_type === "university" && p.archetype === "Achiever",
  },
  {
    mistake: "M7_wrong_metric",
    label: "Неправильная метрика",
    priority: 9,
    condition: (p) =>
      p.archetype === "Hustler" || p.goal_horizon === "urgent",
  },
  {
    mistake: "M10_invisible_progress",
    label: "Невидимый прогресс",
    priority: 10,
    condition: () => true, // universal — всем
  },
]

export function assignAntiMistakes(profile: StructuredProfile): AntiMistake[] {
  // FIX 8: M10_invisible_progress is universal and always included,
  // but it no longer competes for the top-2 slots.
  // Result is always: [most_relevant, second_most_relevant, M10]
  // This ensures the first two mistakes are always meaningful and specific.
  const top2 = ANTI_MISTAKE_RULES
    .filter((rule) => rule.mistake !== "M10_invisible_progress")
    .filter((rule) => rule.condition(profile))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map((rule) => rule.mistake)

  return [...top2, "M10_invisible_progress"]
}

export const ANTI_MISTAKE_LABELS: Record<AntiMistake, string> = Object.fromEntries(
  ANTI_MISTAKE_RULES.map((r) => [r.mistake, r.label])
) as Record<AntiMistake, string>
