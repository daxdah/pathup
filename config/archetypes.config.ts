// =============================================================================
// PathUp — Archetypes Configuration
// Все метаданные архетипов. Логика назначения — в lib/methodology/archetype-engine.ts
// =============================================================================

import type { Archetype, Blocker, DecisionStyle, CompletionPattern, GoalType } from "@/types"

export interface ArchetypeConfig {
  id: Archetype
  label_ru: string                    // для пользователя
  label_short: string                 // для admin/analytics
  description: string                 // для отчёта
  strengths: string[]
  weaknesses: string[]
  major_risk: string
  what_they_need: string

  // Сигналы для назначения архетипа (используется в archetype-engine.ts)
  signals: {
    blockers?: Blocker[]              // если есть эти блокеры — +score
    decision_style?: DecisionStyle[]  // если этот стиль — +score
    completion_pattern?: CompletionPattern[]
    goal_type?: GoalType[]
    // Специальные флаги
    high_interest_count?: boolean     // interest_count >= 3
    low_interest_confidence?: boolean // interest_confidence = "unsure" | "random"
    has_public_work?: boolean
    no_project?: boolean
  }
  base_score: number                  // стартовый вес для scoring
}

export const ARCHETYPES: Record<Archetype, ArchetypeConfig> = {
  Dreamer: {
    id: "Dreamer",
    label_ru: "Мечтатель",
    label_short: "Dreamer",
    description:
      "Много интересов, красивые идеи, нет ни одного завершённого проекта. " +
      "Говорит «хочу стать», но не делает ничего конкретного.",
    strengths: [
      "Широкий кругозор и любопытство",
      "Легко загорается новым — высокая начальная мотивация",
    ],
    weaknesses: [
      "Не доводит до конца",
      "Боится выбора — выбор означает отказ от остального",
    ],
    major_risk:
      "Проведёт следующие 2 года в режиме «я ещё думаю»",
    what_they_need:
      "Один конкретный проект на 30 дней с жёсткими рамками. " +
      "Не выбор пути — а первый шаг на любом пути.",
    signals: {
      completion_pattern: ["drops", "barely_starts"],
      high_interest_count: true,
    },
    base_score: 0,
  },

  Achiever: {
    id: "Achiever",
    label_ru: "Целеустремлённый",
    label_short: "Achiever",
    description:
      "Отличник, делает всё правильно, участвует в олимпиадах. " +
      "Но не знает зачем. Оптимизирует метрики, а не смысл.",
    strengths: [
      "Дисциплина и исполнительность",
      "Умеет работать на результат и соблюдать дедлайны",
    ],
    weaknesses: [
      "Боится ошибок, не умеет рисковать",
      "Принимает чужие цели за свои",
    ],
    major_risk:
      "Выберет университет / профессию по рейтингу и выгорит в 22",
    what_they_need:
      "Вопрос «а ты сам этого хочешь?» + пространство для эксперимента вне оценок",
    signals: {
      decision_style: ["analytical_stuck"],
      goal_type: ["university"],
      completion_pattern: ["completes_and_publishes", "completes_private"],
    },
    base_score: 0,
  },

  Builder: {
    id: "Builder",
    label_ru: "Создатель",
    label_short: "Builder",
    description:
      "Уже что-то делает — пишет код, рисует, снимает видео. " +
      "Есть конкретный навык, нет понимания куда его вести.",
    strengths: [
      "Практичность и умение учиться через делание",
      "Есть portfolio seed — что-то уже создано",
    ],
    weaknesses: [
      "Застревает в одном инструменте",
      "Не думает о следующем уровне",
    ],
    major_risk:
      "Через год будет делать то же самое чуть лучше — без роста по смыслу",
    what_they_need:
      "Следующий уровень сложности + понимание как текущий навык конвертируется в возможности",
    signals: {
      completion_pattern: ["completes_private", "completes_and_publishes"],
      blockers: ["no_start"],
    },
    base_score: 0,
  },

  Anxious: {
    id: "Anxious",
    label_ru: "Осторожный",
    label_short: "Anxious",
    description:
      "Умный, рефлексирующий, парализован страхом ошибки. " +
      "Много думает, мало делает. Часто перфекционист.",
    strengths: [
      "Глубокое мышление и самокритика",
      "Внимание к деталям — когда доводит до конца, выходит хорошо",
    ],
    weaknesses: [
      "Анализирует до паралича",
      "Избегает публичных действий из-за страха оценки",
    ],
    major_risk:
      "Откладывает первый шаг годами под видом «подготовки»",
    what_they_need:
      "Маленький публичный шаг с низкой ставкой + структура снижающая неопределённость",
    signals: {
      blockers: ["fear_of_failure"],
      decision_style: ["analytical_stuck"],
      completion_pattern: ["drops", "completes_private"],
    },
    base_score: 0,
  },

  Rebel: {
    id: "Rebel",
    label_ru: "Бунтарь",
    label_short: "Rebel",
    description:
      "Отвергает стандартные пути («универ — не для меня»), " +
      "но альтернативы нет. Бунт без направления.",
    strengths: [
      "Независимое мышление",
      "Не боится нестандартных решений",
    ],
    weaknesses: [
      "Путает нонконформизм с бездействием",
      "Нет плана Б",
    ],
    major_risk:
      "Через 3 года окажется без навыков и без диплома",
    what_they_need:
      "Конкретные нестандартные траектории с реальными примерами людей которые прошли этот путь",
    signals: {
      goal_type: ["own_project", "earn"],
      blockers: ["parent_conflict"],
      decision_style: ["impulsive"],
    },
    base_score: 0,
  },

  Follower: {
    id: "Follower",
    label_ru: "Ищущий",
    label_short: "Follower",
    description:
      "Делает то что говорят родители / друзья. " +
      "Нет сформированного «я хочу». Соглашается со всем.",
    strengths: [
      "Адаптивность и умение работать в команде",
      "Не создаёт конфликтов, хорошо слышит обратную связь",
    ],
    weaknesses: [
      "Нет внутреннего компаса",
      "Легко сбивается внешним давлением",
    ],
    major_risk:
      "Выберет чужой путь и поймёт это слишком поздно",
    what_they_need:
      "Диагностика собственных предпочтений через действие, а не через разговоры",
    signals: {
      blockers: ["no_start", "no_community"],
      decision_style: ["waits_for_others", "follows_peers"],
      low_interest_confidence: true,
    },
    base_score: 0,
  },

  Specialist: {
    id: "Specialist",
    label_ru: "Специалист",
    label_short: "Specialist",
    description:
      "Глубоко погружён в одну тему (математика, биология, история). " +
      "Вне неё теряется. Не знает как монетизировать или развить интерес.",
    strengths: [
      "Глубина и экспертиза в нише",
      "Умеет учиться сложному и работать с абстракциями",
    ],
    weaknesses: [
      "Узкий кругозор",
      "Не думает о пересечениях с другими областями",
    ],
    major_risk:
      "Не увидит смежных возможностей, застрянет в академической башне",
    what_they_need:
      "Карта смежных полей + конкретные точки пересечения его темы с рынком / проектами",
    signals: {
      completion_pattern: ["completes_private", "completes_and_publishes"],
      goal_type: ["university", "skill"],
    },
    base_score: 0,
  },

  Hustler: {
    id: "Hustler",
    label_ru: "Запускатель",
    label_short: "Hustler",
    description:
      "Хочет зарабатывать прямо сейчас. Мотивирован деньгами и статусом. " +
      "Нетерпелив, ищет shortcut.",
    strengths: [
      "Высокая мотивация и скорость действия",
      "Не боится продавать и получать отказы",
    ],
    weaknesses: [
      "Бросает если нет результата за 2 недели",
      "Игнорирует фундамент",
    ],
    major_risk:
      "Серия провалов без рефлексии → разочарование и откат",
    what_they_need:
      "Быстрый win с реальным результатом + объяснение почему фундамент ускоряет а не замедляет",
    signals: {
      goal_type: ["earn", "own_project"],
      goal_horizon: ["urgent"],
      decision_style: ["impulsive"],
    } as any,
    base_score: 0,
  },
}

// Список всех архетипов для итерации
export const ALL_ARCHETYPES = Object.values(ARCHETYPES)

// Лейблы для UI (короткий формат)
export const ARCHETYPE_LABELS: Record<Archetype, string> = Object.fromEntries(
  ALL_ARCHETYPES.map((a) => [a.id, a.label_ru])
) as Record<Archetype, string>
