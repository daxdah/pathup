// =============================================================================
// PathUp — Path Selector
// Выбирает и ранжирует траектории роста для профиля.
// Скоринг: положительные сигналы + штрафы + hard excludes.
// =============================================================================

import type { GrowthPath, StructuredProfile, ExcludedPath } from "@/types"
import { GROWTH_PATHS, ALL_PATHS } from "@/config/paths.config"

interface PathSelectionResult {
  recommended_paths: GrowthPath[]
  path_scores: Record<GrowthPath, number>
}

// -----------------------------------------------------------------------------
// Скоринг одного пути
// Возвращает -1 если путь hard-excluded
// -----------------------------------------------------------------------------

function scorePath(path: typeof ALL_PATHS[number], profile: StructuredProfile): number {
  // --- HARD EXCLUDES ---
  if (path.exclude_if_archetypes.includes(profile.archetype)) return -1

  if (path.exclude_if_no_project && !profile.has_current_project) return -1

  if (path.exclude_if_no_public_work && !profile.has_public_work) return -1

  if (
    path.exclude_if_low_feedback_comfort &&
    (profile.feedback_comfort === "prefer_not" || profile.feedback_comfort === "private")
  ) {
    return -1
  }

  // --- TIME GATE ---
  if (path.min_hours_per_week > profile.hours_per_week_number) return -1

  let score = 0

  // --- ARCHETYPE MATCH (+10 per match) ---
  if (path.best_for_archetypes.includes(profile.archetype)) {
    score += 10
  }

  // --- GOAL ALIGNMENT (+15) ---
  if (path.compatible_goal_types.includes(profile.goal_type as any)) {
    score += 15
  }

  // --- GAP RESOLUTION (+8 per resolved gap) ---
  for (const gap of profile.detected_gaps) {
    if (path.resolves_gaps.includes(gap)) {
      score += 8
    }
  }

  // --- PRIMARY GAP RESOLUTION BONUS (+10) ---
  if (path.resolves_gaps.includes(profile.primary_gap)) {
    score += 10
  }

  // --- SPECIFIC POSITIVE SIGNALS ---

  // P1: есть текущий проект → skill sprint ещё лучше
  if (path.id === "P1_skill_sprint" && profile.has_current_project) {
    score += 10
  }

  // P2: есть незавершённые проекты → портфолио-кандидат
  if (path.id === "P2_portfolio_build" && profile.projects_completed_last_90d >= 1) {
    score += 12
  }

  // P3: много интересов → нужно исследование
  // FIX 10: hard-exclude P3 if interest_count=0 (no interests to explore)
  if (path.id === "P3_exploration_sprint" && profile.interest_count === 0) {
    return -1
  }

  // FIX 3 (quality): hard-exclude P1 if interest_count=0
  // Skill Sprint needs a target skill/area — impossible with no stated interests.
  if (path.id === "P1_skill_sprint" && profile.interest_count === 0) {
    return -1
  }

  // FIX 3b: hard-exclude P3 when primary gap is G6_time_scarcity
  // Exploration Sprint requires 2 mini-projects/week — impossible at <3h/week
  if (
    path.id === "P3_exploration_sprint" &&
    profile.primary_gap === "G6_time_scarcity"
  ) {
    return -1
  }

  // PRE-LAUNCH FIX 1: hard-exclude P4 for survive/no-direction profiles
  // P4 (Academic Track) requires university intent. When goal=survive and
  // interest_count=0 it only appears as a scoring fallback — which produces
  // a meaningless and confusing recommendation.
  if (
    path.id === "P4_academic_track" &&
    profile.goal_type !== "university" &&
    profile.interest_count === 0
  ) {
    return -1
  }
  if (path.id === "P3_exploration_sprint" && profile.interest_count >= 3) {
    score += 15
  }

  // P4: горящий дедлайн + university цель → академический трек важен
  // FIX: добавлено goal_type === "university" — чтобы earn/own_project с urgent
  // горизонтом не получали академический план
  if (
    path.id === "P4_academic_track" &&
    profile.has_deadline &&
    profile.goal_type === "university"
  ) {
    score += 20
  }

  // P5: хочет зарабатывать + есть проект
  if (
    path.id === "P5_entrepreneurial" &&
    profile.goal_type === "earn" &&
    profile.has_current_project
  ) {
    score += 15
  }

  // P6: есть публичные работы → готов к ментору
  if (path.id === "P6_mentorship_prep" && profile.has_public_work) {
    score += 12
  }

  // P7: completion_rate low + fear = нужен reset
  if (
    path.id === "P7_mindset_reset" &&
    profile.completion_rate === "low" &&
    profile.blockers.includes("fear_of_failure")
  ) {
    score += 20
  }

  // --- PENALISE WRONG HORIZON ---
  // Если дедлайн горит, а путь — долгосрочный
  if (
    profile.has_deadline &&
    ["P3_exploration_sprint", "P6_mentorship_prep"].includes(path.id)
  ) {
    score -= 10
  }

  // Минимальный score должен быть > 0 чтобы попасть в список
  return score
}

// -----------------------------------------------------------------------------
// Главная функция
// -----------------------------------------------------------------------------

export function selectPaths(profile: StructuredProfile): PathSelectionResult {
  const path_scores = {} as Record<GrowthPath, number>

  for (const path of ALL_PATHS) {
    path_scores[path.id] = scorePath(path, profile)
  }

  const recommended_paths = (Object.entries(path_scores) as [GrowthPath, number][])
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([path]) => path)

  // Fallback: если ничего не подошло — P3 (exploration) подходит всем
  if (recommended_paths.length === 0) {
    recommended_paths.push("P3_exploration_sprint")
    path_scores["P3_exploration_sprint"] = 1
  }

  return { recommended_paths, path_scores }
}

// -----------------------------------------------------------------------------
// Получить исключённые пути с объяснением
// -----------------------------------------------------------------------------

export function getExcludedPaths(profile: StructuredProfile): ExcludedPath[] {
  const excluded: ExcludedPath[] = []

  for (const path of ALL_PATHS) {
    // Проверяем каждый hard exclude
    if (path.exclude_if_archetypes.includes(profile.archetype)) {
      excluded.push({
        path: path.id,
        reason: `Архетип ${profile.archetype} конфликтует с этой траекторией`,
      })
      continue
    }

    if (path.exclude_if_no_project && !profile.has_current_project) {
      excluded.push({
        path: path.id,
        reason: "Нет текущих проектов — нечего развивать",
      })
      continue
    }

    if (path.exclude_if_no_public_work && !profile.has_public_work) {
      excluded.push({
        path: path.id,
        reason: "Нет публичных работ — не с чем выходить к людям",
      })
      continue
    }

    if (
      path.exclude_if_low_feedback_comfort &&
      (profile.feedback_comfort === "prefer_not" || profile.feedback_comfort === "private")
    ) {
      excluded.push({
        path: path.id,
        reason: "Низкий комфорт с публичным фидбэком — этот путь требует его",
      })
      continue
    }

    if (path.min_hours_per_week > profile.hours_per_week_number) {
      excluded.push({
        path: path.id,
        reason: `Нужно минимум ${path.min_hours_per_week}ч/нед, есть только ${profile.hours_per_week_number}`,
      })
    }
  }

  return excluded
}
