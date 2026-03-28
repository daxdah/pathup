// =============================================================================
// PathUp — Mock Report Generator
// Возвращает реалистичные mock отчёты когда нет API ключа.
// Используется для: разработки, тестов, fallback при ошибке LLM.
// =============================================================================

import { randomUUID } from "crypto"
import type { StructuredProfile, FreeReport, FullReport, ParentReport } from "@/types"
import { ARCHETYPE_LABELS } from "@/config/archetypes.config"
import { GAP_LABELS } from "@/lib/methodology/gap-detector"
import { ANTI_MISTAKE_LABELS } from "@/lib/methodology/anti-mistake-engine"
import { PATH_LABELS } from "@/config/paths.config"

type ReportType = "free" | "full" | "parent"

// -----------------------------------------------------------------------------
// Main mock function
// -----------------------------------------------------------------------------

export function getMockReport(
  type: "free",
  profile: StructuredProfile
): FreeReport
export function getMockReport(
  type: "full",
  profile: StructuredProfile
): FullReport
export function getMockReport(
  type: "parent",
  profile: StructuredProfile
): ParentReport
export function getMockReport(
  type: ReportType,
  profile: StructuredProfile
): FreeReport | FullReport | ParentReport {
  if (type === "free") return buildMockFreeReport(profile)
  if (type === "full") return buildMockFullReport(profile)
  return buildMockParentReport(profile)
}

// -----------------------------------------------------------------------------
// Free Report Mock
// -----------------------------------------------------------------------------

function buildMockFreeReport(profile: StructuredProfile): FreeReport {
  const archetypeLabel = ARCHETYPE_LABELS[profile.archetype]
  const gapLabel = GAP_LABELS[profile.primary_gap]
  const pathLabel = PATH_LABELS[profile.detected_gaps?.[0] ? "P7_mindset_reset" : "P1_skill_sprint"]

  return {
    report_id: `mock_free_${randomUUID().slice(0, 8)}`,
    profile_id: profile.profile_id,
    decision_id: `mock_dec_${randomUUID().slice(0, 8)}`,
    generated_at: new Date().toISOString(),

    archetype_label: archetypeLabel,
    archetype_description: getMockArchetypeDescription(profile),
    primary_gap_label: gapLabel,
    primary_gap_description: getMockGapDescription(profile),
    top_path_label: getMockPathLabel(profile),
    top_path_teaser: getMockPathTeaser(profile),

    plan_7d_preview: [
      {
        action_id: "ACT_001",
        label: getMock7DAction1Label(profile),
        description: getMock7DAction1Description(profile),
        duration_minutes: 60,
        is_public: false,
        day_target: 2,
        resolves_gap: profile.primary_gap,
      },
      {
        action_id: "ACT_002",
        label: "Показать результат одному человеку",
        description:
          "Другу, однокласснику — кому угодно. Спросить: что непонятно, что понравилось. " +
          "Записать ответ одним абзацем.",
        duration_minutes: 30,
        is_public: true,
        day_target: 4,
        resolves_gap: "G4_no_feedback_loop",
      },
    ],
    plan_30d_locked: true,
    plan_90d_locked: true,

    upgrade_prompt: getMockUpgradePrompt(profile),
  }
}

// -----------------------------------------------------------------------------
// Full Report Mock
// -----------------------------------------------------------------------------

function buildMockFullReport(profile: StructuredProfile): FullReport {
  const archetypeLabel = ARCHETYPE_LABELS[profile.archetype]
  const gapLabel = GAP_LABELS[profile.primary_gap]

  return {
    report_id: `mock_full_${randomUUID().slice(0, 8)}`,
    profile_id: profile.profile_id,
    decision_id: `mock_dec_${randomUUID().slice(0, 8)}`,
    generated_at: new Date().toISOString(),
    version: 1,

    archetype_label: archetypeLabel,
    archetype_description: getMockArchetypeDescription(profile),
    archetype_strengths: getMockStrengths(profile),
    archetype_risks: getMockRisks(profile),

    primary_gap_label: gapLabel,
    primary_gap_description: getMockGapDescriptionFull(profile),
    all_gaps: profile.detected_gaps.slice(0, 4).map((gap, i) => ({
      gap,
      label: GAP_LABELS[gap] ?? gap,
      severity: i === 0 ? "critical" : i === 1 ? "moderate" : "minor" as any,
    })),

    recommended_paths: [
      {
        path: "P7_mindset_reset",
        label: "Разблокировка действием",
        why_for_you: getMockPathWhyForYou(profile),
        rank: 1,
      },
      {
        path: "P1_skill_sprint",
        label: "Навыковый спринт",
        why_for_you:
          "После разблокировки — это следующий логичный шаг. " +
          "Конкретный навык + конкретный результат.",
        rank: 2,
      },
    ],

    plan_7d: {
      intro: getMock7DIntro(profile),
      actions: [
        {
          action_id: "ACT_001",
          label: getMock7DAction1Label(profile),
          description: getMock7DAction1Description(profile),
          duration_minutes: 60,
          is_public: false,
          day_target: 2,
          resolves_gap: "G3_no_completion",
        },
        {
          action_id: "ACT_002",
          label: "Опубликовать в любом виде",
          description:
            "GitHub Pages, CodePen, Notion. Неважно куда — важно что вне компьютера.",
          duration_minutes: 30,
          is_public: true,
          day_target: 3,
          resolves_gap: "G4_no_feedback_loop",
        },
        {
          action_id: "ACT_003",
          label: "Показать одному человеку и записать реакцию",
          description:
            "Другу, однокласснику. Спросить: что непонятно, что понравилось. Один абзац.",
          duration_minutes: 30,
          is_public: true,
          day_target: 4,
          resolves_gap: "G8_confidence_gap",
        },
        {
          action_id: "ACT_004",
          label: "Написать итог недели в трёх предложениях",
          description: "Что сделал. Что было страшно. Что оказалось проще чем думал.",
          duration_minutes: 15,
          is_public: false,
          day_target: 7,
        },
      ],
      main_result: "Одна опубликованная работа. Один внешний фидбэк. Одна запись о том что произошло.",
    },

    plan_30d: {
      intro: "Четыре недели — четыре шага. Каждый чуть сложнее предыдущего. Логика: сначала завершить, потом показать, потом усложнить, потом зафиксировать.",
      phases: [
        { week: 1, theme: "Разблокировка", focus: "Завершить и опубликовать одну существующую работу", milestone: "Есть хотя бы одна опубликованная работа", actions: [], is_review_week: false },
        { week: 2, theme: "Первый новый шаг", focus: "Начать и закончить маленький новый проект за неделю", milestone: "Новый проект — любой — сделан и показан", actions: [], is_review_week: true },
        { week: 3, theme: "Усложнение", focus: "Взять задачу чуть сложнее предыдущей", milestone: "Проект сложнее предыдущего завершён", actions: [], is_review_week: false },
        { week: 4, theme: "Фиксация", focus: "Оформить всё сделанное и зафиксировать изменения", milestone: "2–3 работы оформлены, есть текст о прогрессе", actions: [], is_review_week: false },
      ],
      milestone: "Минимум 2 завершённых и опубликованных работы.",
    },

    plan_90d: {
      intro: "Три месяца — три режима. Первый ломает старый паттерн. Второй строит навык. Третий превращает это в доказательство.",
      quarter: {
        anchor_goal: "Через 90 дней у меня есть 2–3 опубликованные работы которые я не стыжусь показать",
        months: [
          { month: 1, theme: "Foundation", goal: "Сломать паттерн незавершённости", key_activities: ["Завершить старые проекты", "Начать публиковать", "Первый внешний фидбэк"] },
          { month: 2, theme: "Application", goal: "Освоить один новый инструмент", key_activities: ["Выбрать направление", "Сделать сложнее", "Показать 3+ людям"] },
          { month: 3, theme: "Proof", goal: "Собрать портфолио и показать его", key_activities: ["Отобрать лучшие работы", "Написать описания", "Опубликовать"] },
        ],
        weekly_ritual: "Каждое воскресенье: что сделал, что узнал, что было страшно и оказалось нестрашным",
        retrospective_prompts: [
          "Что я сделал за 90 дней чего не сделал бы без плана?",
          "Какой страх оказался меньше чем казался?",
          "Что мне хочется делать следующие 90 дней?",
        ],
      },
      success_criteria: "Есть минимум 2 опубликованные работы. Есть хотя бы один внешний фидбэк. Есть привычка делать что-то каждую неделю.",
    },

    anti_mistakes: profile.detected_gaps.slice(0, 3).map((_, i) => ({
      mistake: ["M4_perfectionism_freeze", "M1_infinite_planning", "M10_invisible_progress"][i] as any,
      label: ["Ловушка перфекционизма", "Планирование вместо действия", "Невидимый прогресс"][i],
      personalised_warning: getMockAntiMistakeWarning(profile, i),
    })),

    suggested_resources: [
      { title: "Frontend Mentor", url: "https://frontendmentor.io", type: "tool", relevance: "Реальные проекты с фидбэком — именно то что нужно чтобы сломать паттерн работы «в стол»" },
      { title: "Show Your Work — Austin Kleon", type: "book", relevance: "Книга про то почему показывать незавершённое — это не слабость а стратегия" },
    ],

    one_step_today: profile.one_step_today,
    report_type: "full",
  }
}

// -----------------------------------------------------------------------------
// Parent Report Mock
// -----------------------------------------------------------------------------

function buildMockParentReport(profile: StructuredProfile): ParentReport {
  const hasParentPressure = profile.pressure_source === "parents"

  return {
    report_id: `mock_parent_${randomUUID().slice(0, 8)}`,
    profile_id: profile.profile_id,
    generated_at: new Date().toISOString(),

    child_archetype_label: ARCHETYPE_LABELS[profile.archetype],
    child_archetype_for_parent: getParentArchetypeDescription(profile),
    primary_challenge: getParentPrimaryChallenge(profile),
    what_child_needs: getParentWhatChildNeeds(profile),

    plan_7d_summary: "На этой неделе ребёнок работает над одним конкретным проектом — завершает начатое и впервые показывает результат кому-то. Это небольшой, но важный шаг.",
    plan_30d_summary: "Следующий месяц направлен на то чтобы сформировать привычку завершать и показывать работы. Каждая неделя — маленький проект от начала до публикации.",
    plan_90d_goal: "Через 90 дней у ребёнка есть несколько опубликованных работ которые он сам не стыдится показать — и привычка двигаться каждую неделю.",

    how_to_support: [
      "Если ребёнок показывает работу — первый вопрос «что было самым сложным?», а не «это хорошо?»",
      "Раз в неделю спрашивайте «что ты сделал на этой неделе?» — без оценки ответа",
      "Не предлагайте помощь сами — дождитесь пока попросят",
    ],
    what_not_to_do: [
      "Не спрашивайте каждый день «ну как там твой проект?» — это создаёт давление там где нужна автономия",
      "Не сравнивайте с другими детьми или с собой в его возрасте — это разрушает мотивацию",
      "Не предлагайте конкретные профессии или направления — сейчас важно чтобы он сам нашёл",
    ],

    pressure_warning: hasParentPressure
      ? "По данным анкеты, ваше мнение сильно влияет на решения ребёнка. Это не плохо — но в этом возрасте слишком явное направление от родителя часто блокирует собственную инициативу. Лучший вариант — задавать вопросы, а не давать ответы."
      : undefined,

    check_in_questions: [
      "Что оказалось сложнее чем ты думал на этой неделе?",
      "Есть что-то в чём тебе нужна помощь — не моя, а вообще?",
      "Что из того что ты делал на этой неделе тебе понравилось больше всего?",
    ],

    report_type: "parent",
    note: "Это план, а не диагноз. Подросток его видел первым.",
  }
}

// -----------------------------------------------------------------------------
// Text generators (контекстно-зависимые, не generic)
// -----------------------------------------------------------------------------

function getMockArchetypeDescription(p: StructuredProfile): string {
  const descriptions: Partial<Record<typeof p.archetype, string>> = {
    Anxious:
      "Ты делаешь больше чем кажется со стороны — учишься, пробуешь, думаешь. Но всё это остаётся у тебя: незаконченное, неопубликованное, невидимое. Не потому что плохо — а потому что кажется что ещё чуть-чуть и будет готово.",
    Dreamer:
      "Тебе интересно многое — и это реально хорошо. Но именно это создаёт ловушку: когда всё интересно, непонятно за что браться первым. Результат — много начатого и мало завершённого.",
    Builder:
      "Ты уже делаешь — это главное отличие от большинства. Есть навык, есть практика. Проблема не в том чтобы начать — а в том куда вести то что уже есть.",
    Achiever:
      "Ты умеешь работать на результат — дисциплина и ответственность есть. Но есть риск оптимизировать не те метрики: делать правильно то что тебе на самом деле неинтересно.",
    Hustler:
      "Ты хочешь результата прямо сейчас — и это нормально. Высокая энергия и скорость — твои сильные стороны. Главный риск: бросить когда нет быстрого результата и потерять то что уже накоплено.",
    Follower:
      "Ты хорошо адаптируешься и умеешь слышать других. Но сейчас важно найти собственный компас — не потому что чужие советы плохи, а потому что без своего направления любой совет одинаково хорош или плох.",
    Rebel:
      "Ты видишь стандартные пути насквозь — и часто правильно. Нонконформизм может быть большой силой. Но только когда есть конкретная альтернатива, а не просто отказ от стандартного.",
    Specialist:
      "Глубина — это редкость. Ты умеешь уходить в тему по-настоящему. Главный вопрос сейчас: как связать эту глубину с реальными возможностями вокруг тебя.",
  }

  return descriptions[p.archetype] ??
    "У тебя есть чёткий профиль — и под него построен конкретный план."
}

function getMockGapDescription(p: StructuredProfile): string {
  const desc: Partial<Record<typeof p.primary_gap, string>> = {
    G8_confidence_gap: "Ты делаешь — но не показываешь. Это паттерн, а не скромность. Первый публичный шаг не должен быть идеальным — он должен быть.",
    G3_no_completion: "Есть начатые проекты. Нет завершённых. Один завершённый даёт больше чем десять незаконченных.",
    G1_no_direction: "Пока нет чёткого направления — и это нормально на этом этапе. Нужно попробовать, а не выбрать теоретически.",
    G4_no_feedback_loop: "Без внешней обратной связи рост замедляется. Один показанный проект даёт больше информации чем месяц работы в одиночку.",
    G6_time_scarcity: "При меньше 3 часов в неделю нужен другой тип плана — компактный, без провалов.",
    G10_no_concrete_goal: "Цель есть, но она абстрактная. Конкретная цель — это то что можно проверить. «Хочу в IT» — нельзя. «Через 90 дней у меня есть проект на GitHub» — можно.",
  }

  return desc[p.primary_gap] ??
    "Есть конкретный барьер который система определила как главный для тебя прямо сейчас."
}

function getMockGapDescriptionFull(p: StructuredProfile): string {
  return getMockGapDescription(p) +
    " Именно с этого начинается план — не с глобальных вопросов, а с одного конкретного шага который снимает этот барьер."
}

function getMockPathLabel(p: StructuredProfile): string {
  if (p.completion_rate === "low") return "Разблокировка действием"
  if (p.has_current_project) return "Навыковый спринт"
  return "Спринт исследования"
}

function getMockPathTeaser(p: StructuredProfile): string {
  if (p.completion_rate === "low")
    return "Не новый курс и не амбициозный план — а серия маленьких завершённых шагов которые меняют то как ты себя воспринимаешь."
  if (p.has_current_project)
    return "За 30 дней ты перейдёшь от «я что-то делаю» к «вот что я умею показать»."
  return "Две области за две недели — и конкретный выбор вместо вечного «я ещё думаю»."
}

function getMock7DAction1Label(p: StructuredProfile): string {
  if (p.one_step_today) return p.one_step_today.slice(0, 60)
  if (p.has_current_project) return "Дописать незаконченный проект до рабочего состояния"
  return "Выбрать одно направление и сделать первый мини-проект за 30 минут"
}

function getMock7DAction1Description(p: StructuredProfile): string {
  if (p.has_current_project)
    return "Открой незаконченный проект. Убери всё что не работает. Цель — «работает», а не «идеально»."
  return "Не изучать — пробовать. Набросок, прототип, первые строки. Цель: ощутить как это делается."
}

function getMock7DIntro(p: StructuredProfile): string {
  if (p.primary_gap === "G8_confidence_gap")
    return "Эта неделя про одно: сломать привычку держать всё при себе. Не идеально — а реально и снаружи."
  if (p.primary_gap === "G3_no_completion")
    return "Эта неделя про одно: завершить что-то. Не начать новое — завершить то что есть."
  return "Эта неделя — про первый конкретный шаг. Не план, не подготовка — действие."
}

function getMockUpgradePrompt(p: StructuredProfile): string {
  const interest = p.primary_interest !== "unknown" ? p.primary_interest : "своём направлении"
  const hours = p.hours_per_week_number

  return `У тебя есть ${hours} часа в неделю и интерес к ${interest}. ` +
    `Этого достаточно для реального старта. ` +
    `Полный план показывает что именно делать в каждую из 4 недель — и почему именно в таком порядке.`
}

function getMockStrengths(p: StructuredProfile): string[] {
  const map: Partial<Record<typeof p.archetype, string[]>> = {
    Anxious: ["Умеешь разбираться в сложном самостоятельно — без внешней поддержки", "Внимателен к деталям: когда доводишь до конца — выходит хорошо"],
    Builder: ["Уже есть практический опыт — это редкость в твоём возрасте", "Умеешь учиться через делание, а не через теорию"],
    Achiever: ["Дисциплина и умение работать на дедлайн", "Можешь делать сложное систематически"],
    Dreamer: ["Широкий кругозор и быстрая обучаемость", "Высокая начальная мотивация к новому"],
    Hustler: ["Высокая скорость действия и отсутствие страха перед отказом", "Умеешь продавать и договариваться"],
    Specialist: ["Глубина понимания в своей теме — реальное конкурентное преимущество", "Умеешь работать с абстракциями и сложными концепциями"],
    Rebel: ["Независимое мышление — не идёшь по толпе", "Не боишься нестандартных решений"],
    Follower: ["Хорошо слышишь других и умеешь адаптироваться", "Работаешь в команде без конфликтов"],
  }
  return map[p.archetype] ?? ["Есть реальный потенциал", "Готов двигаться"]
}

function getMockRisks(p: StructuredProfile): string[] {
  const map: Partial<Record<typeof p.archetype, string[]>> = {
    Anxious: ["Риск застрять в подготовке и никогда не выйти с результатом публично"],
    Builder: ["Риск делать одно и то же чуть лучше без роста по смыслу"],
    Achiever: ["Риск оптимизировать чужие цели вместо своих"],
    Dreamer: ["Риск провести следующие 2 года в режиме «я ещё думаю»"],
    Hustler: ["Риск серии провалов без рефлексии и потеря мотивации"],
    Specialist: ["Риск не увидеть смежных возможностей за пределами своей темы"],
    Rebel: ["Риск остаться без навыков и без диплома через 3 года"],
    Follower: ["Риск выбрать чужой путь и понять это слишком поздно"],
  }
  return map[p.archetype] ?? ["Есть паттерн который стоит отследить"]
}

function getMockAntiMistakeWarning(p: StructuredProfile, index: number): string {
  const warnings = [
    `Ты ${p.archetype === "Anxious" ? "аналитик" : "думаешь глубоко"} — это значит тебе будет соблазн довести план до идеала прежде чем начать. Не переделывай. Просто открой первый шаг сегодня вечером.`,
    `Через 30 дней тебе будет казаться что ничего не изменилось — если не фиксировать. Три предложения каждое воскресенье — это не опция, это часть системы.`,
    `Мозг обнуляет прогресс без записи. Воскресный ритуал в три предложения — это часть плана, не дополнение к нему.`,
  ]
  return warnings[index] ?? warnings[0]
}

function getMockPathWhyForYou(p: StructuredProfile): string {
  if (p.completion_rate === "low")
    return `Тебе не нужен новый курс — тебе нужно сломать паттерн. При ${p.hours_per_week_number} часах в неделю это реально через маленькие завершённые шаги.`
  return `Это путь который работает при ${p.hours_per_week_number} часах в неделю и направлении ${p.primary_interest}.`
}

function getParentArchetypeDescription(p: StructuredProfile): string {
  const map: Partial<Record<typeof p.archetype, string>> = {
    Anxious: "Ваш ребёнок, скорее всего, думает больше чем показывает. Он начинает проекты и не заканчивает — не из-за лени, а потому что боится что результат окажется хуже чем замысел. Это паттерн, а не черта характера.",
    Builder: "Ваш ребёнок уже что-то делает — это важно. Есть практический навык, есть попытки. Проблема не в том чтобы начать, а в том чтобы показать результат и получить обратную связь.",
    Dreamer: "У вашего ребёнка много интересов и идей — это хорошо, но это же создаёт проблему. Когда всё интересно, непонятно за что браться. Нужна структура и конкретный первый шаг, а не ещё один совет «выбери одно».",
    Achiever: "Ваш ребёнок умеет работать на результат — дисциплина есть. Но есть риск что он оптимизирует внешние ожидания вместо своих интересов. Важно дать ему пространство для собственного выбора.",
  }
  return map[p.archetype] ??
    "Ваш ребёнок находится на важном этапе — когда интересы начинают оформляться в конкретные направления. Сейчас важна структура и поддержка, а не давление."
}

function getParentPrimaryChallenge(p: StructuredProfile): string {
  const map: Partial<Record<typeof p.primary_gap, string>> = {
    G8_confidence_gap: "Главная сложность — страх показать результат. Со стороны это может выглядеть как лень или незаинтересованность. На самом деле — это страх оценки. Это не проблема характера, это паттерн который меняется через маленькие публичные шаги.",
    G3_no_completion: "Ребёнок начинает, но не заканчивает. Это не лень — это отсутствие структуры которая делает завершение обязательным. Один завершённый проект изменит паттерн лучше чем десять разговоров об этом.",
    G1_no_direction: "Пока нет чёткого направления — и это нормально в этом возрасте. Проблема не в отсутствии интереса, а в том что нет инструмента чтобы попробовать разное и выбрать.",
  }
  return map[p.primary_gap] ??
    "Основная сложность — нехватка структуры и конкретных шагов. Не мотивации, а именно структуры."
}

function getParentWhatChildNeeds(p: StructuredProfile): string {
  if (p.completion_rate === "low")
    return "Ему сейчас нужно завершить хотя бы одно дело и показать его кому-то за пределами семьи. Ваша роль — не оценивать результат, а спросить «ну как оно?» без ожиданий."
  return "Ему нужна автономия в выборе направления и конкретный план что делать на этой неделе. Лучшее что вы можете сделать — не советовать, а спрашивать."
}
