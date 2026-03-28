// =============================================================================
// PathUp — Decision Layer
// Главный оркестратор методологии.
// Принимает StructuredProfile → возвращает DecisionOutput.
// НЕТ вызовов LLM. НЕТ внешних зависимостей. Чистые функции.
// =============================================================================

import { randomUUID } from "crypto"
import type {
  StructuredProfile,
  DecisionOutput,
  GrowthPath,
  GapType,
  AntiMistake,
  Action,
  WeekPhase,
  Quarter,
  ExcludedPath,
} from "@/types"
import { assignArchetype } from "./archetype-engine"
import { detectGaps } from "./gap-detector"
import { selectPaths, getExcludedPaths } from "./path-selector"
import { assignAntiMistakes } from "./anti-mistake-engine"
import { build7DayPlan, build30DayPlan, build90DayPlan } from "./plan-builder"

// -----------------------------------------------------------------------------
// Главная функция
// -----------------------------------------------------------------------------

export function runDecisionLayer(profile: StructuredProfile): DecisionOutput {
  // Шаг 1: Архетип (уже назначен в profile, но верифицируем)
  const archetype = profile.archetype

  // Шаг 2: Все найденные gaps (уже назначены в profile)
  const detected_gaps = profile.detected_gaps
  const primary_gap = profile.primary_gap

  // Шаг 3: Выбор путей с подсчётом очков
  const { recommended_paths, path_scores } = selectPaths(profile)
  const primary_path = recommended_paths[0]

  // Шаг 4: Исключённые пути с объяснением
  const excluded_paths = getExcludedPaths(profile)

  // Шаг 5: Анти-ошибки
  const anti_mistakes = assignAntiMistakes(profile)

  // Шаг 6: Планы
  const plan_7d = build7DayPlan(profile, primary_path)
  const plan_30d = build30DayPlan(profile, primary_path)
  const plan_90d = build90DayPlan(profile, primary_path)

  return {
    decision_id: randomUUID(),
    profile_id: profile.profile_id,
    generated_at: new Date().toISOString(),

    archetype,
    primary_gap,
    detected_gaps,

    recommended_paths,
    primary_path,
    excluded_paths,

    anti_mistakes,

    plan_7d,
    plan_30d,
    plan_90d,

    path_scores,
  }
}

// -----------------------------------------------------------------------------
// Экспорт для тестов
// -----------------------------------------------------------------------------
export { assignArchetype, detectGaps, selectPaths, assignAntiMistakes }
