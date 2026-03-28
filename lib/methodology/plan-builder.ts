// =============================================================================
// PathUp — Plan Builder
// Строит планы на 7, 30 и 90 дней на основе профиля и выбранного пути.
// Детерминированная логика. Все тексты — конкретные, без воды.
// =============================================================================

import type {
  GrowthPath,
  StructuredProfile,
  Action,
  WeekPhase,
  Quarter,
  GapType,
} from "@/types"
import { randomUUID } from "crypto"

// -----------------------------------------------------------------------------
// Action Library
// Каждый action тегирован: для каких путей, какой gap решает
// -----------------------------------------------------------------------------

interface ActionTemplate {
  label: string
  description: string
  duration_minutes: 15 | 30 | 60 | 90
  is_public: boolean
  for_paths: GrowthPath[]
  resolves_gap?: GapType
  requires_project: boolean
  requires_public_work: boolean
  day_target: number
}

const ACTION_LIBRARY: ActionTemplate[] = [
  // --- P7: Mindset Reset actions ---
  {
    label: "Дописать незаконченный проект до рабочего состояния",
    description:
      "Открой незаконченный проект. Убери всё что не работает. " +
      "Цель — довести до состояния «работает», а не «идеально».",
    duration_minutes: 60,
    is_public: false,
    for_paths: ["P7_mindset_reset", "P2_portfolio_build"],
    resolves_gap: "G3_no_completion",
    requires_project: true,
    requires_public_work: false,
    day_target: 2,
  },
  {
    label: "Опубликовать проект в любом виде",
    description:
      "GitHub Pages, CodePen, или личный телеграм-канал. " +
      "Неважно куда — важно что вне твоего компьютера.",
    duration_minutes: 30,
    is_public: true,
    for_paths: ["P7_mindset_reset", "P2_portfolio_build"],
    resolves_gap: "G4_no_feedback_loop",
    requires_project: true,
    requires_public_work: false,
    day_target: 3,
  },
  {
    label: "Показать проект одному человеку и записать реакцию",
    description:
      "Другу, однокласснику — кому угодно. " +
      "Спросить: что непонятно, что понравилось. Записать одним абзацем.",
    duration_minutes: 30,
    is_public: true,
    for_paths: ["P7_mindset_reset", "P2_portfolio_build", "P1_skill_sprint"],
    resolves_gap: "G8_confidence_gap",
    requires_project: true,
    requires_public_work: false,
    day_target: 4,
  },
  {
    label: "Написать итог недели в трёх предложениях",
    description:
      "Что сделал. Что было страшно. " +
      "Что оказалось проще чем думал. Три предложения, не больше.",
    duration_minutes: 15,
    is_public: false,
    for_paths: ["P7_mindset_reset", "P1_skill_sprint", "P3_exploration_sprint"],
    resolves_gap: undefined,
    requires_project: false,
    requires_public_work: false,
    day_target: 7,
  },

  // --- P1: Skill Sprint actions ---
  {
    label: "Выбрать один конкретный ресурс и начать",
    description:
      "Не искать «лучший курс» — выбрать один за 10 минут и начать первый урок. " +
      "Критерий: там есть практические задания.",
    duration_minutes: 60,
    is_public: false,
    for_paths: ["P1_skill_sprint"],
    resolves_gap: "G2_no_evidence",
    requires_project: false,
    requires_public_work: false,
    day_target: 1,
  },
  {
    label: "Сделать первый рабочий пример по теме",
    description:
      "Не смотреть туториалы — сделать что-то самому, даже если по образцу. " +
      "Результат должен работать на твоём компьютере.",
    duration_minutes: 90,
    is_public: false,
    for_paths: ["P1_skill_sprint"],
    resolves_gap: "G9_knowledge_no_application",
    requires_project: false,
    requires_public_work: false,
    day_target: 3,
  },
  {
    label: "Показать первый результат кому-то из знакомых",
    description:
      "Не ждать пока будет «достаточно хорошо». " +
      "Показать сейчас и записать один вопрос который возник у смотрящего.",
    duration_minutes: 30,
    is_public: true,
    for_paths: ["P1_skill_sprint"],
    resolves_gap: "G4_no_feedback_loop",
    requires_project: false,
    requires_public_work: false,
    day_target: 5,
  },

  // --- P3: Exploration Sprint actions ---
  {
    label: "Выбрать две области и составить список вопросов к каждой",
    description:
      "По 3–5 вопросов к каждой области: что там делают, что нужно уметь, " +
      "как выглядит реальная работа. Записать в заметки.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P3_exploration_sprint"],
    resolves_gap: "G1_no_direction",
    requires_project: false,
    requires_public_work: false,
    day_target: 1,
  },
  {
    label: "Сделать мини-проект в первой области (30 минут)",
    description:
      "Не изучать — попробовать. Набросок, прототип, первый абзац, простой скрипт. " +
      "Цель: ощутить как это делается, а не сделать хорошо.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P3_exploration_sprint"],
    resolves_gap: "G2_no_evidence",
    requires_project: false,
    requires_public_work: false,
    day_target: 3,
  },
  {
    label: "Сделать мини-проект во второй области (30 минут)",
    description:
      "То же что с первой — попробовать, не изучить. " +
      "После: записать одно слово для каждой области описывающее твоё ощущение.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P3_exploration_sprint"],
    resolves_gap: "G12_scattered_attention",
    requires_project: false,
    requires_public_work: false,
    day_target: 5,
  },

  // --- P4: Academic Track actions ---
  {
    label: "Пройти диагностический тест по профильному предмету",
    description:
      "Найти пробный вариант экзамена / олимпиады и решить без подготовки. " +
      "Цель: узнать текущий уровень, а не показать хороший результат.",
    duration_minutes: 90,
    is_public: false,
    for_paths: ["P4_academic_track"],
    resolves_gap: "G10_no_concrete_goal",
    requires_project: false,
    requires_public_work: false,
    day_target: 2,
  },
  {
    label: "Составить список топ-3 пробелов на основе теста",
    description:
      "Посмотреть на ошибки и определить 3 темы где больше всего потерь. " +
      "Написать по одному конкретному вопросу к каждой теме.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P4_academic_track"],
    resolves_gap: "G5_skill_goal_mismatch",
    requires_project: false,
    requires_public_work: false,
    day_target: 3,
  },

  // --- P5: Entrepreneurial ---
  {
    label: "Сформулировать: кому, что, и почему это важно",
    description:
      "Одно предложение: «Я помогаю [кому] сделать [что] потому что [почему им это нужно]». " +
      "Записать. Не редактировать дольше 10 минут.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P5_entrepreneurial"],
    resolves_gap: "G10_no_concrete_goal",
    requires_project: false,
    requires_public_work: false,
    day_target: 1,
  },
  {
    label: "Сделать простой пост или лендинг об идее",
    description:
      "Не продукт — описание идеи. Телеграм-пост, notion-страница, или figma-набросок. " +
      "Показать 3 людям из потенциальной аудитории.",
    duration_minutes: 60,
    is_public: true,
    for_paths: ["P5_entrepreneurial"],
    resolves_gap: "G4_no_feedback_loop",
    requires_project: false,
    requires_public_work: false,
    day_target: 4,
  },

  // --- P6: Mentorship Prep ---
  {
    label: "Оформить профиль или мини-резюме",
    description:
      "GitHub профиль, LinkedIn, или текстовый файл: кто ты, что умеешь, " +
      "что ищешь. Одна страница, без воды.",
    duration_minutes: 60,
    is_public: false,
    for_paths: ["P6_mentorship_prep"],
    resolves_gap: "G4_no_feedback_loop",
    requires_project: false,
    requires_public_work: true,
    day_target: 2,
  },
  {
    label: "Найти трёх реальных людей из интересующей профессии",
    description:
      "В LinkedIn, Telegram, или через общих знакомых. " +
      "Написать имена и по одному вопросу к каждому.",
    duration_minutes: 30,
    is_public: false,
    for_paths: ["P6_mentorship_prep"],
    resolves_gap: "G11_wrong_comparison",
    requires_project: false,
    requires_public_work: false,
    day_target: 4,
  },

  // --- Universal wrap-up action ---
  {
    label: "Зафиксировать прогресс: три предложения о неделе",
    description:
      "Что сделал. Что узнал. Что изменил бы. " +
      "Сохрани — будет точкой сравнения через месяц.",
    duration_minutes: 15,
    is_public: false,
    for_paths: [
      "P1_skill_sprint", "P2_portfolio_build", "P3_exploration_sprint",
      "P4_academic_track", "P5_entrepreneurial", "P6_mentorship_prep",
    ],
    resolves_gap: undefined,
    requires_project: false,
    requires_public_work: false,
    day_target: 7,
  },
]

// -----------------------------------------------------------------------------
// 7-Day Plan
// -----------------------------------------------------------------------------

export function build7DayPlan(
  profile: StructuredProfile,
  primaryPath: GrowthPath
): Action[] {
  const maxSessionMinutes = getMaxSessionMinutes(profile)

  // Шаг 1: actions из primary path
  const pathActions = ACTION_LIBRARY
    .filter((a) => a.for_paths.includes(primaryPath))
    .filter((a) => !a.requires_project || profile.has_current_project)
    .filter((a) => !a.requires_public_work || profile.has_public_work)
    .filter((a) => a.duration_minutes <= maxSessionMinutes)
    .slice(0, 4)

  // Шаг 2: если нет публичного action — добавить принудительно
  const hasPublic = pathActions.some((a) => a.is_public)
  if (!hasPublic && profile.feedback_comfort_level !== "low") {
    const publicAction = ACTION_LIBRARY.find(
      (a) => a.is_public && !pathActions.includes(a)
    )
    if (publicAction) pathActions.push(publicAction)
  }

  // Шаг 3: всегда добавить итоговое действие (если ещё нет)
  const hasWrapUp = pathActions.some((a) => a.day_target === 7)
  if (!hasWrapUp) {
    const wrapUp = ACTION_LIBRARY.find(
      (a) => a.day_target === 7 && !pathActions.includes(a)
    )
    if (wrapUp) pathActions.push(wrapUp)
  }

  // Cap at 5
  return pathActions.slice(0, 5).map((template, i) =>
    templateToAction(template, i)
  )
}

// -----------------------------------------------------------------------------
// 30-Day Plan
// -----------------------------------------------------------------------------

const PHASE_TEMPLATES: Record<GrowthPath, Omit<WeekPhase, "actions">[]> = {
  P7_mindset_reset: [
    { week: 1, theme: "Разблокировка", focus: "Завершить и опубликовать одну существующую работу", milestone: "Есть хотя бы одна опубликованная работа", is_review_week: false },
    { week: 2, theme: "Первый новый шаг", focus: "Начать и закончить маленький новый проект за неделю", milestone: "Новый проект — любой — сделан и показан", is_review_week: true },
    { week: 3, theme: "Усложнение", focus: "Взять задачу чуть сложнее предыдущей", milestone: "Проект сложнее предыдущего завершён", is_review_week: false },
    { week: 4, theme: "Фиксация паттерна", focus: "Оформить всё сделанное, зафиксировать что изменилось", milestone: "2–3 работы оформлены, написан текст о прогрессе", is_review_week: false },
  ],
  P1_skill_sprint: [
    { week: 1, theme: "Запуск", focus: "Выбрать ресурс и сделать первый рабочий пример", milestone: "Есть один рабочий пример навыка", is_review_week: false },
    { week: 2, theme: "Углубление", focus: "Усложнить задачи, добавить новый элемент", milestone: "Завершён проект уровень 2", is_review_week: true },
    { week: 3, theme: "Применение", focus: "Использовать навык в реальной задаче из жизни", milestone: "Есть реальная задача решённая новым навыком", is_review_week: false },
    { week: 4, theme: "Публикация", focus: "Опубликовать результат и получить фидбэк", milestone: "Работа опубликована, получен хотя бы один отзыв", is_review_week: false },
  ],
  P2_portfolio_build: [
    { week: 1, theme: "Инвентаризация", focus: "Собрать и оценить все существующие работы", milestone: "Список всех работ с оценкой качества", is_review_week: false },
    { week: 2, theme: "Оформление", focus: "Довести 2 лучших работы до публичного вида", milestone: "2 работы оформлены и опубликованы", is_review_week: true },
    { week: 3, theme: "Создание", focus: "Сделать одну новую работу специально для портфолио", milestone: "Новая работа под цель завершена", is_review_week: false },
    { week: 4, theme: "Дистрибуция", focus: "Показать портфолио целевым людям", milestone: "Получено 3+ отзыва от людей из профессии", is_review_week: false },
  ],
  P3_exploration_sprint: [
    { week: 1, theme: "Область A", focus: "Первое погружение в первое направление", milestone: "Сделан мини-проект в области A", is_review_week: false },
    { week: 2, theme: "Область B", focus: "Первое погружение во второе направление", milestone: "Сделан мини-проект в области B", is_review_week: true },
    { week: 3, theme: "Сравнение", focus: "Сравнить ощущения и зафиксировать предпочтение", milestone: "Записаны плюсы и минусы каждой области", is_review_week: false },
    { week: 4, theme: "Выбор", focus: "Выбрать одно направление и сделать первый шаг в нём", milestone: "Выбрана одна область, начат следующий шаг", is_review_week: false },
  ],
  P4_academic_track: [
    { week: 1, theme: "Диагностика", focus: "Пройти пробный тест и определить пробелы", milestone: "Знаю свой текущий уровень и топ-3 пробела", is_review_week: false },
    { week: 2, theme: "Закрытие пробела 1", focus: "Проработать первую слабую тему", milestone: "Тема 1 проработана, решены 10+ задач", is_review_week: true },
    { week: 3, theme: "Закрытие пробела 2", focus: "Проработать вторую слабую тему", milestone: "Тема 2 проработана, решены 10+ задач", is_review_week: false },
    { week: 4, theme: "Симуляция", focus: "Пройти пробный вариант в условиях экзамена", milestone: "Пробный экзамен пройден, результат выше исходного", is_review_week: false },
  ],
  P5_entrepreneurial: [
    { week: 1, theme: "Идея", focus: "Сформулировать ценностное предложение и целевую аудиторию", milestone: "Чёткое «кому, что, почему» в одном предложении", is_review_week: false },
    { week: 2, theme: "Первый контакт", focus: "Показать идею 5 людям из ЦА, записать реакции", milestone: "5 разговоров с потенциальными пользователями", is_review_week: true },
    { week: 3, theme: "MVP", focus: "Сделать простейший рабочий прототип или лендинг", milestone: "Есть что-то что можно потрогать или посмотреть", is_review_week: false },
    { week: 4, theme: "Запуск", focus: "Опубликовать и получить первых реальных пользователей", milestone: "3+ человека попробовали продукт", is_review_week: false },
  ],
  P6_mentorship_prep: [
    { week: 1, theme: "Подготовка", focus: "Оформить профиль и портфолио для первого контакта", milestone: "Профиль/резюме готово к показу", is_review_week: false },
    { week: 2, theme: "Поиск", focus: "Найти 5 потенциальных менторов или наставников", milestone: "Список из 5 человек с контактами", is_review_week: true },
    { week: 3, theme: "Первый контакт", focus: "Написать 3 людям из списка", milestone: "3 сообщения отправлено, ждём ответов", is_review_week: false },
    { week: 4, theme: "Разговор", focus: "Провести хотя бы один разговор с ментором", milestone: "Есть одна встреча / созвон с профессионалом", is_review_week: false },
  ],
}

export function build30DayPlan(
  profile: StructuredProfile,
  primaryPath: GrowthPath
): WeekPhase[] {
  const template = PHASE_TEMPLATES[primaryPath] ?? PHASE_TEMPLATES.P3_exploration_sprint

  return template.map((phase) => ({
    ...phase,
    actions: [],  // Детальные actions для каждой недели LLM не заполняет — система оставляет пустыми
  }))
}

// -----------------------------------------------------------------------------
// 90-Day Plan
// -----------------------------------------------------------------------------

const MONTH_STRUCTURES: Record<GrowthPath, Quarter["months"]> = {
  P7_mindset_reset: [
    { month: 1, theme: "Foundation", goal: "Сломать паттерн незавершённости — опубликовать минимум 2 работы", key_activities: ["Завершить незаконченные проекты", "Начать публиковать", "Получить первый внешний фидбэк"] },
    { month: 2, theme: "Application", goal: "Освоить один новый инструмент и применить в реальной задаче", key_activities: ["Выбрать направление для углубления", "Сделать проекты сложнее предыдущих", "Показать 3+ людям"] },
    { month: 3, theme: "Proof", goal: "Оформить портфолио из лучших работ и показать целевой аудитории", key_activities: ["Отобрать 2–3 лучших работы", "Написать описания", "Опубликовать портфолио"] },
  ],
  P1_skill_sprint: [
    { month: 1, theme: "Foundation", goal: "Освоить базу и сделать первый реальный проект", key_activities: ["Выбрать ресурс и начать", "Пройти основные концепции", "Сделать первый проект"] },
    { month: 2, theme: "Application", goal: "Применить навык в реальной задаче из жизни", key_activities: ["Усложнить задачи", "Найти реальную проблему для решения", "Получить фидбэк от людей в теме"] },
    { month: 3, theme: "Proof", goal: "Собрать портфолио из 2–3 проектов и опубликовать", key_activities: ["Оформить проекты", "Написать о чём каждый", "Опубликовать и распространить"] },
  ],
  P2_portfolio_build: [
    { month: 1, theme: "Inventory", goal: "Собрать и оформить все существующие работы", key_activities: ["Инвентаризация проектов", "Дооформить лучшие", "Первые публикации"] },
    { month: 2, theme: "Creation", goal: "Создать 1–2 новые работы специально под цель", key_activities: ["Определить какие работы нужны", "Создать под целевую аудиторию", "Получить фидбэк"] },
    { month: 3, theme: "Distribution", goal: "Донести портфолио до нужных людей", key_activities: ["Определить кому показывать", "Написать 10 людям", "Получить 3+ профессиональных отзыва"] },
  ],
  P3_exploration_sprint: [
    { month: 1, theme: "Exploration", goal: "Попробовать 2–3 направления и выбрать одно", key_activities: ["Мини-проект в каждой области", "Сравнить ощущения", "Выбрать одно направление"] },
    { month: 2, theme: "Foundation", goal: "Заложить базу в выбранном направлении", key_activities: ["Найти хороший ресурс", "Сделать первый серьёзный проект", "Найти сообщество"] },
    { month: 3, theme: "First Result", goal: "Получить первый внешний результат", key_activities: ["Завершить первый публичный проект", "Получить фидбэк от профессионалов", "Определить следующий шаг"] },
  ],
  P4_academic_track: [
    { month: 1, theme: "Diagnosis", goal: "Понять текущий уровень и составить план до дедлайна", key_activities: ["Пробные тесты", "Определить пробелы", "Расписать план по неделям"] },
    { month: 2, theme: "Drilling", goal: "Закрыть главные пробелы через практику", key_activities: ["Проработать слабые темы", "Решать задачи каждый день", "Отслеживать прогресс"] },
    { month: 3, theme: "Simulation", goal: "Довести до автоматизма через симуляцию экзамена", key_activities: ["Пробные экзамены в реальных условиях", "Работа над ошибками", "Финальный прогон"] },
  ],
  P5_entrepreneurial: [
    { month: 1, theme: "Validation", goal: "Подтвердить что идея нужна реальным людям", key_activities: ["Формулировка ценностного предложения", "10 разговоров с ЦА", "Решение: делать или менять идею"] },
    { month: 2, theme: "Build", goal: "Сделать рабочий прототип и получить первых пользователей", key_activities: ["MVP за месяц", "Первые 5 реальных пользователей", "Итерация по фидбэку"] },
    { month: 3, theme: "Growth", goal: "Вырасти до 20+ пользователей и понять что работает", key_activities: ["Активное распространение", "Измерение метрик", "Решение о следующем шаге"] },
  ],
  P6_mentorship_prep: [
    { month: 1, theme: "Preparation", goal: "Подготовить всё необходимое для первого контакта", key_activities: ["Портфолио и профиль", "Список потенциальных менторов", "Первые сообщения"] },
    { month: 2, theme: "Networking", goal: "Провести 3–5 разговоров с профессионалами", key_activities: ["Созвоны и встречи", "Конкретные вопросы к каждому", "Фиксировать что узнал"] },
    { month: 3, theme: "Integration", goal: "Применить полученные знания в проекте", key_activities: ["Проект с новыми знаниями", "Показать ментору результат", "Определить следующий ментор или шаг"] },
  ],
}

const ANCHOR_GOALS: Record<GrowthPath, (p: StructuredProfile) => string> = {
  P7_mindset_reset: () =>
    "Через 90 дней у меня есть 2–3 опубликованные работы которые я не стыжусь показать",
  P1_skill_sprint: (p) =>
    `Через 90 дней у меня есть рабочий проект в области ${p.primary_interest} и я могу объяснить что умею`,
  P2_portfolio_build: () =>
    "Через 90 дней у меня есть портфолио из 2–3 работ которые я готов показать куда угодно",
  P3_exploration_sprint: () =>
    "Через 90 дней я выбрал одно направление и сделал первый серьёзный проект в нём",
  P4_academic_track: () =>
    "Через 90 дней я подготовлен к экзамену и знаю свои слабые и сильные стороны",
  P5_entrepreneurial: () =>
    "Через 90 дней у меня есть реальные пользователи моего продукта или чёткое понимание почему идея не работает",
  P6_mentorship_prep: () =>
    "Через 90 дней я познакомился с тремя профессионалами из интересующей меня области",
}

export function build90DayPlan(
  profile: StructuredProfile,
  primaryPath: GrowthPath
): Quarter {
  const months = MONTH_STRUCTURES[primaryPath] ?? MONTH_STRUCTURES.P3_exploration_sprint

  return {
    anchor_goal: ANCHOR_GOALS[primaryPath](profile),
    months,
    weekly_ritual: "Каждое воскресенье: что сделал, что узнал, что было страшно и оказалось нестрашным",
    retrospective_prompts: [
      "Что я сделал за 90 дней чего не сделал бы без плана?",
      "Какой страх оказался меньше чем казался?",
      "Что мне хочется делать следующие 90 дней?",
    ],
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getMaxSessionMinutes(profile: StructuredProfile): number {
  if (profile.hours_per_week_number < 3) return 30
  if (profile.hours_per_week_number < 6) return 60
  return 90
}

function templateToAction(template: ActionTemplate, index: number): Action {
  return {
    action_id: `ACT_${String(index + 1).padStart(3, "0")}`,
    label: template.label,
    description: template.description,
    duration_minutes: template.duration_minutes,
    is_public: template.is_public,
    day_target: template.day_target,
    resolves_gap: template.resolves_gap,
  }
}
