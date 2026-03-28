// =============================================================================
// PathUp — Growth Paths Configuration
// Метаданные траекторий. Логика выбора — в lib/methodology/path-selector.ts
// =============================================================================

import type { GrowthPath, Archetype, GoalType, GapType } from "@/types"

export interface PathConfig {
  id: GrowthPath
  label_ru: string
  description: string
  who_it_fits: string
  who_it_does_not_fit: string
  typical_signals: string[]
  first_actions: string[]

  // Scoring rules
  best_for_archetypes: Archetype[]
  compatible_goal_types: GoalType[]
  resolves_gaps: GapType[]
  min_hours_per_week: number            // минимум часов для этого пути

  // Hard excludes — если true, путь не попадает в рекомендации
  exclude_if_archetypes: Archetype[]
  exclude_if_no_public_work: boolean    // некоторые пути требуют наличия работ
  exclude_if_no_project: boolean        // некоторые пути требуют наличия проекта
  exclude_if_low_feedback_comfort: boolean
}

export const GROWTH_PATHS: Record<GrowthPath, PathConfig> = {
  P1_skill_sprint: {
    id: "P1_skill_sprint",
    label_ru: "Навыковый спринт",
    description: "Освоить конкретный навык за 90 дней с измеримым результатом",
    who_it_fits: "Строители, Нетерпеливые, Специалисты с новым направлением",
    who_it_does_not_fit: "Мечтатели (не выберут навык), Осторожные (испугаются публичного результата)",
    typical_signals: [
      "Называет конкретную технологию или область",
      "Есть 5+ часов в неделю",
      "Хочет результат руками",
    ],
    first_actions: [
      "Выбрать один learning resource",
      "Сделать первый проект за 7 дней",
      "Показать кому-то",
    ],
    best_for_archetypes: ["Builder", "Hustler", "Specialist"],
    compatible_goal_types: ["skill", "university", "own_project"],
    resolves_gaps: ["G2_no_evidence", "G9_knowledge_no_application", "G10_no_concrete_goal"],
    min_hours_per_week: 2,
    exclude_if_archetypes: [],
    exclude_if_no_public_work: false,
    exclude_if_no_project: false,
    exclude_if_low_feedback_comfort: false,
  },

  P2_portfolio_build: {
    id: "P2_portfolio_build",
    label_ru: "Сборка портфолио",
    description: "Собрать портфолио из 2–3 реальных работ за 90 дней",
    who_it_fits: "Строители, Достигаторы с творческим уклоном, Специалисты",
    who_it_does_not_fit: "Ведомые (нет своего голоса), Мечтатели (не закончат)",
    typical_signals: [
      "Уже что-то делает, но нигде не публикует",
      "Хочет поступить в хороший вуз или попасть на стажировку",
    ],
    first_actions: [
      "Дооформить существующий проект",
      "Опубликовать",
      "Получить первый внешний фидбэк",
    ],
    best_for_archetypes: ["Builder", "Achiever", "Specialist"],
    compatible_goal_types: ["skill", "university", "direction"],
    resolves_gaps: ["G4_no_feedback_loop", "G3_no_completion", "G2_no_evidence"],
    min_hours_per_week: 2,
    exclude_if_archetypes: ["Follower"],
    exclude_if_no_public_work: false,
    exclude_if_no_project: true,    // нечего оформлять без проектов
    exclude_if_low_feedback_comfort: false,
  },

  P3_exploration_sprint: {
    id: "P3_exploration_sprint",
    label_ru: "Спринт исследования",
    description: "Попробовать 2–3 направления и выбрать одно за 30–60 дней",
    who_it_fits: "Мечтатели, Ведомые, Осторожные на ранней стадии",
    who_it_does_not_fit: "Нетерпеливые (хотят результат сразу), Специалисты (уже выбрали)",
    typical_signals: [
      "Не может назвать один интерес",
      "Боится «закрыть дверь»",
      "Много всего нравится",
    ],
    first_actions: [
      "Выбрать 2 области",
      "За 2 недели сделать по одному мини-проекту",
      "Сравнить ощущения",
    ],
    best_for_archetypes: ["Dreamer", "Follower", "Anxious"],
    compatible_goal_types: ["direction", "skill"],
    resolves_gaps: ["G1_no_direction", "G10_no_concrete_goal", "G12_scattered_attention"],
    min_hours_per_week: 3,  // FIX: raised from 2 — exploration needs 2 mini-projects/week
    exclude_if_archetypes: ["Specialist", "Hustler"],
    exclude_if_no_public_work: false,
    exclude_if_no_project: false,
    exclude_if_low_feedback_comfort: false,
  },

  P4_academic_track: {
    id: "P4_academic_track",
    label_ru: "Академический трек",
    description: "Подготовиться к поступлению / олимпиаде / экзамену",
    who_it_fits: "Достигаторы, Специалисты, любой с чётким дедлайном",
    who_it_does_not_fit: "Бунтари (отвергают систему), Нетерпеливые (не хотят ждать)",
    typical_signals: [
      "Есть конкретный экзамен / вуз / дата",
      "Мотивация внешняя или смешанная",
    ],
    first_actions: [
      "Диагностический тест",
      "Выявить топ-3 пробела",
      "План по неделям до дедлайна",
    ],
    best_for_archetypes: ["Achiever", "Specialist"],
    compatible_goal_types: ["university"],
    resolves_gaps: ["G10_no_concrete_goal", "G5_skill_goal_mismatch"],
    min_hours_per_week: 3,
    exclude_if_archetypes: ["Rebel"],
    exclude_if_no_public_work: false,
    exclude_if_no_project: false,
    exclude_if_low_feedback_comfort: false,
  },

  P5_entrepreneurial: {
    id: "P5_entrepreneurial",
    label_ru: "Предпринимательский эксперимент",
    description: "Запустить маленький проект / продукт / сервис за 90 дней",
    who_it_fits: "Нетерпеливые, Строители с продуктовым мышлением, Бунтари",
    who_it_does_not_fit: "Осторожные, Ведомые, Мечтатели без исполнительности",
    typical_signals: [
      "Хочет зарабатывать или «запустить что-то своё»",
      "Уже думал о конкретной идее",
    ],
    first_actions: [
      "Сформулировать кому и что",
      "Сделать landing или пост",
      "Получить первые 5 реакций",
    ],
    best_for_archetypes: ["Hustler", "Builder", "Rebel"],
    compatible_goal_types: ["own_project", "earn"],
    resolves_gaps: ["G2_no_evidence", "G4_no_feedback_loop"],
    min_hours_per_week: 4,
    exclude_if_archetypes: ["Anxious", "Follower"],
    exclude_if_no_public_work: false,
    exclude_if_no_project: true,    // нужно доказательство исполнительности
    exclude_if_low_feedback_comfort: true, // нужна готовность к публичному фидбэку
  },

  P6_mentorship_prep: {
    id: "P6_mentorship_prep",
    label_ru: "Подготовка к ментору",
    description: "Подготовиться к работе с ментором / стажировке / нетворкингу",
    who_it_fits: "Строители, Достигаторы, Специалисты готовые к следующему уровню",
    who_it_does_not_fit: "Мечтатели и Ведомые (нет чего показать)",
    typical_signals: [
      "Есть навык, но нет связей",
      "Хочет попасть «внутрь» профессии",
    ],
    first_actions: [
      "Оформить профиль / резюме",
      "Найти 3 конкретных человека",
      "Написать первое сообщение",
    ],
    best_for_archetypes: ["Builder", "Achiever", "Specialist"],
    compatible_goal_types: ["skill", "university", "direction"],
    resolves_gaps: ["G4_no_feedback_loop", "G11_wrong_comparison"],
    min_hours_per_week: 2,
    exclude_if_archetypes: ["Dreamer", "Follower"],
    exclude_if_no_public_work: true,   // не с чем идти к ментору
    exclude_if_no_project: true,
    exclude_if_low_feedback_comfort: true,
  },

  P7_mindset_reset: {
    id: "P7_mindset_reset",
    label_ru: "Разблокировка действием",
    description: "Разблокировать действие через структуру и маленькие wins",
    who_it_fits: "Осторожные, Ведомые в стагнации, Достигаторы на выгорании",
    who_it_does_not_fit: "Нетерпеливые и Строители (им нужен прогресс, а не разблокировка)",
    typical_signals: [
      "Долго ничего не делал",
      "Высокая тревога",
      "Говорит «не знаю с чего начать» на каждый вариант",
    ],
    first_actions: [
      "Одно действие сегодня (5 минут)",
      "Зафиксировать",
      "Повторить завтра",
    ],
    best_for_archetypes: ["Anxious", "Follower", "Achiever"],
    compatible_goal_types: ["direction", "skill", "survive"],
    resolves_gaps: ["G8_confidence_gap", "G3_no_completion", "G4_no_feedback_loop"],
    min_hours_per_week: 1,
    exclude_if_archetypes: ["Hustler"],
    exclude_if_no_public_work: false,
    exclude_if_no_project: false,
    exclude_if_low_feedback_comfort: false,
  },
}

export const ALL_PATHS = Object.values(GROWTH_PATHS)

// Лейблы для UI
export const PATH_LABELS: Record<GrowthPath, string> = Object.fromEntries(
  ALL_PATHS.map((p) => [p.id, p.label_ru])
) as Record<GrowthPath, string>
