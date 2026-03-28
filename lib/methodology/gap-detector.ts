// =============================================================================
// PathUp — Gap Detector
// Определяет барьеры пользователя на основе профиля.
// Возвращает упорядоченный список gaps (приоритет = порядок).
// =============================================================================

import type { GapType, StructuredProfile } from "@/types"

interface GapResult {
  gaps: GapType[]
  primary_gap: GapType
}

interface GapRule {
  gap: GapType
  priority: number                          // меньше = важнее
  condition: (p: StructuredProfile) => boolean
  label: string
}

// -----------------------------------------------------------------------------
// Правила обнаружения gaps
// Порядок важен — первый найденный = primary_gap
// -----------------------------------------------------------------------------

export const GAP_RULES: GapRule[] = [
  {
    // FIX 1: расширено условие — ловит "много интересов, ни одного серьёзного"
    // Было: interest_count === 0 (только полное отсутствие интересов)
    // Стало: также срабатывает когда много интересов + низкая уверенность + ничего не делает
    gap: "G1_no_direction",
    priority: 1,
    label: "Нет направления",
    condition: (p) =>
      p.interest_confidence === "low" &&
      p.goal_specificity === "vague" &&
      (p.interest_count === 0 || p.completion_rate === "low"),
  },
  {
    gap: "G8_confidence_gap",
    priority: 2,
    label: "Страх публичного шага",
    condition: (p) =>
      p.blockers.includes("fear_of_failure") &&
      (p.feedback_comfort === "prefer_not" || p.feedback_comfort === "private"),
  },
  {
    gap: "G6_time_scarcity",
    priority: 3,
    label: "Дефицит времени",
    condition: (p) => p.hours_per_week_number < 3,
  },
  {
    // FIX 2: убрана зависимость от decision_style
    // Было: только waits_for_others | follows_peers (Rebel не попадал)
    // Стало: любой пользователь с давлением родителей и нечёткой целью
    gap: "G7_external_pressure",
    priority: 4,
    label: "Внешнее давление",
    condition: (p) =>
      p.pressure_source === "parents" &&
      p.goal_specificity !== "specific",
  },
  {
    gap: "G3_no_completion",
    priority: 5,
    label: "Незавершённые проекты",
    condition: (p) => p.completion_rate === "low" && p.has_current_project,
  },
  {
    gap: "G4_no_feedback_loop",
    priority: 6,
    label: "Нет обратной связи",
    condition: (p) => !p.has_public_work && p.projects_completed_last_90d >= 1,
  },
  {
    // FIX 3: новый gap G13_no_community
    // Ловит блокер no_community — частый и важный, но раньше не адресовался
    gap: "G13_no_community",
    priority: 6.5,
    label: "Нет людей в теме",
    condition: (p) =>
      p.blockers.includes("no_community") &&
      p.feedback_comfort !== "private",
  },
  {
    gap: "G12_scattered_attention",
    priority: 7,
    label: "Распылённое внимание",
    condition: (p) => p.interest_count >= 3 && p.completion_rate === "low",
  },
  {
    gap: "G9_knowledge_no_application",
    priority: 8,
    label: "Знания без применения",
    condition: (p) =>
      p.recent_activities.includes("learning") &&
      !p.has_current_project &&
      p.completion_rate === "low",
  },
  {
    gap: "G2_no_evidence",
    priority: 9,
    label: "Нет доказательств",
    condition: (p) => p.projects_completed_last_90d === 0,
  },
  {
    gap: "G10_no_concrete_goal",
    priority: 10,
    label: "Нет конкретной цели",
    condition: (p) => p.goal_specificity === "vague",
  },
  {
    gap: "G5_skill_goal_mismatch",
    priority: 11,
    label: "Навык не ведёт к цели",
    condition: (p) =>
      p.goal_type === "university" &&
      p.recent_activities.every((a) =>
        !["coding", "competition", "learning"].includes(a)
      ),
  },
  {
    gap: "G11_wrong_comparison",
    priority: 12,
    label: "Неверная точка отсчёта",
    condition: (p) =>
      p.pressure_source === "peers" &&
      p.blockers.includes("fear_of_failure"),
  },
]

// -----------------------------------------------------------------------------
// Главная функция
// -----------------------------------------------------------------------------

export function detectGaps(profile: StructuredProfile): GapResult {
  const foundGaps = GAP_RULES
    .filter((rule) => rule.condition(profile))
    .sort((a, b) => a.priority - b.priority)
    .map((rule) => rule.gap)

  // Всегда есть хотя бы один gap
  const gaps = foundGaps.length > 0 ? foundGaps : ["G10_no_concrete_goal" as GapType]
  const primary_gap = gaps[0]

  return { gaps, primary_gap }
}

// Лейблы для UI
export const GAP_LABELS: Record<string, string> = {
  ...Object.fromEntries(GAP_RULES.map((r) => [r.gap, r.label])),
  G13_no_community: "Нет людей в теме",
}
