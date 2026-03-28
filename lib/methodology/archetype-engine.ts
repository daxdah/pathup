// =============================================================================
// PathUp — Archetype Engine
// Назначает архетип на основе сигналов из profile.
// Scoring: каждый сигнал добавляет очки нужному архетипу.
// Побеждает архетип с наибольшим score.
// =============================================================================

import type {
  Archetype,
  ConfidenceLevel,
  QuestionnaireInput,
} from "@/types"

// Входной тип — частичный профиль (до полного построения)
interface ProfileSignals {
  grade: number
  interest_areas: string[]
  interest_count: number
  interest_confidence: ConfidenceLevel
  has_current_project: boolean
  has_public_work: boolean
  completion_rate: "low" | "medium" | "high"
  goal_type: string
  goal_horizon: string
  hours_per_week_bucket: string
  blockers: string[]
  primary_blocker: string
  decision_style: string
  pressure_source: string
  feedback_comfort: string
  feedback_comfort_level: ConfidenceLevel
}

interface ArchetypeResult {
  archetype: Archetype
  confidence: ConfidenceLevel
  scores: Record<Archetype, number>
}

// -----------------------------------------------------------------------------
// Scoring rules
// Каждое правило: условие → { archetype, points }
// -----------------------------------------------------------------------------

interface ScoringRule {
  condition: (p: ProfileSignals) => boolean
  scores: Partial<Record<Archetype, number>>
}

const SCORING_RULES: ScoringRule[] = [
  // --- DREAMER signals ---
  {
    condition: (p) => p.interest_count >= 3,
    scores: { Dreamer: 15, Follower: 5 },
  },
  {
    condition: (p) => p.completion_rate === "low" && p.interest_count >= 2,
    scores: { Dreamer: 20 },
  },
  {
    condition: (p) => p.blockers.includes("loses_interest"),
    scores: { Dreamer: 15, Hustler: 5 },
  },
  {
    condition: (p) => p.interest_confidence === "low" && p.interest_count >= 2,
    scores: { Dreamer: 10, Follower: 10 },
  },

  // --- ACHIEVER signals ---
  {
    condition: (p) => p.goal_type === "university",
    scores: { Achiever: 20, Specialist: 10 },
  },
  {
    condition: (p) => p.decision_style === "analytical_stuck" && p.completion_rate === "high",
    scores: { Achiever: 20 },
  },
  {
    condition: (p) => p.completion_rate === "high" && p.has_public_work,
    scores: { Achiever: 10, Builder: 15 },
  },
  {
    condition: (p) => p.grade === 11 && p.goal_horizon === "urgent",
    scores: { Achiever: 15, Specialist: 5 },
  },
  {
    condition: (p) => p.blockers.includes("fear_of_failure") && p.completion_rate === "high",
    scores: { Achiever: 15, Anxious: 10 },
  },

  // --- BUILDER signals ---
  {
    condition: (p) => p.has_current_project && p.completion_rate !== "low",
    scores: { Builder: 25 },
  },
  {
    condition: (p) => p.has_public_work,
    scores: { Builder: 20, Achiever: 5 },
  },
  {
    condition: (p) =>
      p.interest_areas.some((a) => ["tech", "design"].includes(a)) &&
      p.has_current_project,
    scores: { Builder: 15 },
  },
  {
    condition: (p) => p.completion_rate === "medium" && p.has_current_project,
    scores: { Builder: 15, Anxious: 5 },
  },

  // --- ANXIOUS signals ---
  {
    condition: (p) => p.blockers.includes("fear_of_failure"),
    scores: { Anxious: 20 },
  },
  {
    condition: (p) => p.decision_style === "analytical_stuck" && p.completion_rate === "low",
    scores: { Anxious: 25 },
  },
  {
    condition: (p) =>
      p.feedback_comfort === "prefer_not" || p.feedback_comfort === "private",
    scores: { Anxious: 20, Follower: 5 },
  },
  {
    // FIX 1: combined signal — fear of failure + avoids public feedback
    // fires even when completion_rate is medium (catches "completes privately" profiles).
    // Katya-type: finishes work but never shows it due to fear.
    condition: (p) =>
      p.blockers.includes("fear_of_failure") &&
      (p.feedback_comfort === "prefer_not" || p.feedback_comfort === "private"),
    scores: { Anxious: 20 },
  },
  {
    condition: (p) => p.has_current_project && !p.has_public_work,
    scores: { Anxious: 15, Builder: 5 },
  },
  {
    condition: (p) => p.blockers.includes("too_complex"),
    scores: { Anxious: 15, Follower: 10 },
  },

  // --- REBEL signals ---
  {
    condition: (p) => p.blockers.includes("parent_conflict"),
    scores: { Rebel: 25 },
  },
  {
    condition: (p) => p.goal_type === "earn" && p.decision_style === "impulsive",
    scores: { Rebel: 15, Hustler: 20 },
  },
  {
    condition: (p) =>
      p.goal_type === "own_project" && p.pressure_source === "parents",
    scores: { Rebel: 20 },
  },
  {
    condition: (p) =>
      p.decision_style === "impulsive" && p.completion_rate === "low",
    scores: { Rebel: 10, Hustler: 10 },
  },

  // --- FOLLOWER signals ---
  {
    condition: (p) =>
      p.decision_style === "waits_for_others" ||
      p.decision_style === "follows_peers",
    scores: { Follower: 25 },
  },
  {
    condition: (p) => p.pressure_source === "parents" && p.decision_style !== "impulsive",
    scores: { Follower: 15, Achiever: 5 },
  },
  {
    condition: (p) => p.interest_confidence === "low" && p.completion_rate === "low",
    scores: { Follower: 20, Dreamer: 10 },
  },
  {
    condition: (p) => p.goal_type === "survive",
    scores: { Follower: 20, Anxious: 15 },
  },

  // --- SPECIALIST signals ---
  {
    condition: (p) => p.interest_count === 1 && p.interest_confidence === "high",
    scores: { Specialist: 30 },
  },
  {
    condition: (p) =>
      p.interest_areas.some((a) =>
        ["science", "engineering", "medicine"].includes(a)
      ) && p.completion_rate !== "low",
    scores: { Specialist: 15 },
  },
  {
    condition: (p) => p.goal_type === "university" && p.interest_count <= 2,
    scores: { Specialist: 10, Achiever: 10 },
  },
  {
    condition: (p) => p.interest_confidence === "high" && p.has_current_project,
    scores: { Specialist: 10, Builder: 10 },
  },

  // --- HUSTLER signals ---
  {
    condition: (p) => p.goal_type === "earn",
    scores: { Hustler: 25, Rebel: 5 },
  },
  {
    condition: (p) => p.goal_horizon === "urgent" && p.decision_style === "impulsive",
    scores: { Hustler: 20 },
  },
  {
    condition: (p) => p.goal_type === "own_project" && p.decision_style === "impulsive",
    scores: { Hustler: 20 },
  },
  {
    condition: (p) =>
      p.goal_horizon === "urgent" && p.completion_rate !== "low",
    scores: { Hustler: 10, Achiever: 5 },
  },
]

// -----------------------------------------------------------------------------
// Главная функция
// -----------------------------------------------------------------------------

export function assignArchetype(profile: ProfileSignals): ArchetypeResult {
  const scores: Record<Archetype, number> = {
    Dreamer: 0,
    Achiever: 0,
    Builder: 0,
    Anxious: 0,
    Rebel: 0,
    Follower: 0,
    Specialist: 0,
    Hustler: 0,
  }

  // Применяем все правила
  for (const rule of SCORING_RULES) {
    if (rule.condition(profile)) {
      for (const [archetype, points] of Object.entries(rule.scores)) {
        scores[archetype as Archetype] += points ?? 0
      }
    }
  }

  // Находим победителя
  const sortedArchetypes = (Object.entries(scores) as [Archetype, number][])
    .sort(([, a], [, b]) => b - a)

  const [topArchetype, topScore] = sortedArchetypes[0]
  const [, secondScore] = sortedArchetypes[1]

  // Определяем confidence: разрыв между 1-м и 2-м местом
  const gap = topScore - secondScore
  const confidence: ConfidenceLevel =
    gap >= 20 ? "high" : gap >= 10 ? "medium" : "low"

  return {
    archetype: topArchetype,
    confidence,
    scores,
  }
}
