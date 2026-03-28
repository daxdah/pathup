// =============================================================================
// PathUp — Questionnaire Questions Data
// Тексты вопросов и вариантов ответов
// Отдельно от логики — легко редактировать без изменения кода
// =============================================================================

import type {
  Grade,
  InterestArea,
  InterestConfidence,
  RecentActivity,
  CompletionPattern,
  GoalType,
  GoalHorizon,
  HoursPerWeek,
  Blocker,
  DecisionStyle,
  PressureSource,
  FeedbackComfort,
} from "@/types"

export type QuestionType = "single" | "multi" | "free_text"

export interface AnswerOption<T extends string | number> {
  value: T
  label: string
  hint?: string                         // дополнительное пояснение если нужно
}

export interface Question<T extends string | number = string> {
  id: string
  block: 1 | 2 | 3 | 4 | 5
  type: QuestionType
  required: boolean
  wording: string
  subtext?: string                      // пояснение под вопросом
  options?: AnswerOption<T>[]
  max_select?: number                   // для multi вопросов
  placeholder?: string                  // для free_text
  max_length?: number                   // для free_text
}

// -----------------------------------------------------------------------------
// Вопросы
// -----------------------------------------------------------------------------

export const Q1: Question<Grade> = {
  id: "grade",
  block: 1,
  type: "single",
  required: true,
  wording: "В каком ты классе?",
  options: [
    { value: 8, label: "8 класс" },
    { value: 9, label: "9 класс" },
    { value: 10, label: "10 класс" },
    { value: 11, label: "11 класс" },
    { value: 12, label: "Уже окончил школу" },
  ],
}

export const Q2: Question<InterestArea> = {
  id: "interest_areas",
  block: 1,
  type: "multi",
  required: true,
  wording: "Что тебя реально цепляет?",
  subtext: "Выбери всё, что хочется развивать — не то, что «надо». Максимум 3.",
  max_select: 3,
  options: [
    { value: "tech", label: "Программирование / разработка" },
    { value: "design", label: "Дизайн / визуальное" },
    { value: "science", label: "Наука / исследования" },
    { value: "business", label: "Бизнес / продукт / стартапы" },
    { value: "content", label: "Контент / медиа / написание" },
    { value: "people", label: "Работа с людьми / психология / образование" },
    { value: "engineering", label: "Инженерия / физика / математика" },
    { value: "medicine", label: "Медицина / биология" },
    { value: "arts", label: "Искусство / музыка / творчество" },
    { value: "unknown", label: "Пока не знаю — всё кажется одинаково неинтересным" },
  ],
}

export const Q3: Question<InterestConfidence> = {
  id: "interest_confidence",
  block: 1,
  type: "single",
  required: true,
  wording: "Насколько ты уверен, что это реально твоё, а не «кажется интересным»?",
  options: [
    { value: "proven", label: "Уверен — я уже что-то делал в этом направлении" },
    { value: "likely", label: "Скорее да — мне это нравится, но опыта мало" },
    { value: "unsure", label: "Не уверен — просто кажется интересным" },
    { value: "random", label: "Совсем не уверен — выбрал наугад" },
  ],
}

export const Q4: Question<RecentActivity> = {
  id: "recent_activities",
  block: 2,
  type: "multi",
  required: true,
  wording: "Что из этого ты делал за последние 3 месяца?",
  subtext: "Выбери всё подходящее.",
  options: [
    { value: "coding", label: "Писал код / делал проекты" },
    { value: "design", label: "Рисовал / делал дизайн" },
    { value: "learning", label: "Проходил курс или читал по теме" },
    { value: "competition", label: "Участвовал в олимпиаде / конкурсе / хакатоне" },
    { value: "content", label: "Вёл блог / снимал / писал" },
    { value: "public_work", label: "Делал что-то, что можно показать другим" },
    { value: "nothing", label: "Ничего из этого" },
  ],
}

export const Q5: Question<CompletionPattern> = {
  id: "completion_pattern",
  block: 2,
  type: "single",
  required: true,
  wording: "Если ты что-то начинал — чем обычно заканчивается?",
  options: [
    { value: "completes_and_publishes", label: "Довожу до результата и показываю / публикую" },
    { value: "completes_private", label: "Делаю, но никому не показываю" },
    { value: "drops", label: "Начинаю, но бросаю до конца" },
    { value: "barely_starts", label: "Пока почти ничего не начинал" },
  ],
}

export const Q6: Question<GoalType> = {
  id: "goal_type",
  block: 3,
  type: "single",
  required: true,
  wording: "Что для тебя сейчас важнее всего?",
  subtext: "Выбери одно.",
  options: [
    { value: "university", label: "Поступить в конкретный вуз" },
    { value: "skill", label: "Освоить навык и начать им пользоваться" },
    { value: "direction", label: "Разобраться, чем я вообще хочу заниматься" },
    { value: "own_project", label: "Сделать что-то своё — проект, продукт, канал" },
    { value: "earn", label: "Начать зарабатывать" },
    { value: "survive", label: "Просто не отставать и не облажаться" },
  ],
}

export const Q7: Question<GoalHorizon> = {
  id: "goal_horizon",
  block: 3,
  type: "single",
  required: true,
  wording: "Когда тебе нужен результат?",
  options: [
    { value: "urgent", label: "Как можно скорее — в ближайшие 1–3 месяца" },
    { value: "year", label: "Есть примерно год" },
    { value: "long_term", label: "Не горит — думаю о будущем в целом" },
  ],
}

export const Q8: Question<HoursPerWeek> = {
  id: "hours_per_week",
  block: 3,
  type: "single",
  required: true,
  wording: "Сколько часов в неделю ты реально можешь тратить на что-то помимо школы и домашних заданий?",
  subtext: "Без приукрашивания.",
  options: [
    { value: "lt2", label: "Меньше 2 часов", hint: "Очень мало, но достаточно для старта" },
    { value: "2to4", label: "2–4 часа" },
    { value: "5to7", label: "5–7 часов" },
    { value: "gt8", label: "8 часов и больше" },
  ],
}

export const Q9: Question<Blocker> = {
  id: "blockers",
  block: 4,
  type: "multi",
  required: true,
  wording: "Что чаще всего мешает тебе двигаться?",
  subtext: "Выбери максимум 2.",
  max_select: 2,
  options: [
    { value: "no_start", label: "Не знаю, с чего начать" },
    { value: "loses_interest", label: "Начинаю, но быстро теряю интерес" },
    { value: "fear_of_failure", label: "Боюсь облажаться или сделать плохо" },
    { value: "no_time", label: "Нет времени" },
    { value: "parent_conflict", label: "Родители хотят одного, я — другого" },
    { value: "no_community", label: "Нет людей рядом, которые в теме" },
    { value: "too_complex", label: "Всё кажется слишком сложным" },
  ],
}

export const Q10: Question<DecisionStyle> = {
  id: "decision_style",
  block: 4,
  type: "single",
  required: true,
  wording: "Как ты обычно принимаешь решения?",
  options: [
    { value: "analytical_stuck", label: "Долго думаю, анализирую — и всё равно не уверен" },
    { value: "impulsive", label: "Делаю быстро, потом разбираюсь" },
    { value: "waits_for_others", label: "Жду, когда кто-то подскажет или решит за меня" },
    { value: "follows_peers", label: "Смотрю на других и выбираю похожий путь" },
  ],
}

export const Q11: Question<PressureSource> = {
  id: "pressure_source",
  block: 4,
  type: "single",
  required: true,
  wording: "Кто больше всего влияет на то, что ты делаешь или планируешь?",
  options: [
    { value: "self", label: "В основном я сам решаю" },
    { value: "parents", label: "Родители — их мнение важно или обязательно" },
    { value: "peers", label: "Друзья и окружение" },
    { value: "none", label: "Никто особо не влияет, мне всё равно" },
  ],
}

export const Q12: Question<FeedbackComfort> = {
  id: "feedback_comfort",
  block: 4,
  type: "single",
  required: true,
  wording: "Представь, что ты сделал что-то и тебе предлагают показать незнакомому эксперту. Твоя реакция?",
  options: [
    { value: "open", label: "Окей, интересно что скажет" },
    { value: "nervous_but_ok", label: "Немного страшно, но покажу" },
    { value: "prefer_not", label: "Скорее нет — не готов к критике" },
    { value: "private", label: "Точно нет — это только для меня" },
  ],
}

export const Q13: Question<string> = {
  id: "one_step_today",
  block: 5,
  type: "free_text",
  required: false,
  wording: "Если бы тебе нужно было сделать что-то одно прямо сегодня вечером — что бы это могло быть?",
  subtext: "Напиши одним предложением, даже если не уверен.",
  placeholder: "Например: дописать проект, посмотреть туториал по React...",
  max_length: 100,
}

// -----------------------------------------------------------------------------
// Все вопросы в порядке прохождения
// -----------------------------------------------------------------------------

export const ALL_QUESTIONS = [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13]

// Обязательные вопросы (12 из 13)
export const REQUIRED_QUESTIONS = ALL_QUESTIONS.filter((q) => q.required)

// -----------------------------------------------------------------------------
// Блоки анкеты с transition текстами
// -----------------------------------------------------------------------------

export interface QuestionBlock {
  number: 1 | 2 | 3 | 4 | 5
  title: string
  question_ids: string[]
  transition_text?: string             // текст между блоками
}

export const QUESTION_BLOCKS: QuestionBlock[] = [
  {
    number: 1,
    title: "Кто ты",
    question_ids: ["grade", "interest_areas", "interest_confidence"],
    transition_text: "Хорошо. Теперь про то что ты уже делаешь.",
  },
  {
    number: 2,
    title: "Что делаешь",
    question_ids: ["recent_activities", "completion_pattern"],
    transition_text: "Понял. Давай про цели.",
  },
  {
    number: 3,
    title: "Куда и зачем",
    question_ids: ["goal_type", "goal_horizon", "hours_per_week"],
    transition_text: "Почти готово. Последний блок — что мешает.",
  },
  {
    number: 4,
    title: "Что мешает",
    question_ids: ["blockers", "decision_style", "pressure_source", "feedback_comfort"],
    transition_text: "Один необязательный вопрос — и мы строим план.",
  },
  {
    number: 5,
    title: "Финал",
    question_ids: ["one_step_today"],
  },
]

// Pre-questionnaire intro
export const QUESTIONNAIRE_INTRO = {
  title: "Сначала пара слов о том как это работает.",
  body: "Мы не спрашиваем о мечтах и призвании.\nМы спрашиваем о том что ты делаешь прямо сейчас — что интересует, сколько времени есть, что мешает.\n\nНа основе этого система строит план.\nНе магия — логика.",
  cta: "Понятно, начинаем →",
}
