// =============================================================================
// PathUp — Analytics Event Wiring
// Централизованные константы событий.
// Единственное место где определяется что и когда трекается.
//
// Использование:
//   import { EVENTS, buildEventProperties } from "@/lib/analytics/events"
//   track(EVENTS.UPGRADE_CLICKED, sid, buildEventProperties.upgradeClicked("blur_overlay"))
// =============================================================================

// -----------------------------------------------------------------------------
// Event name constants
// -----------------------------------------------------------------------------

export const EVENTS = {
  // Acquisition
  PAGE_VIEWED:                  "page_viewed",
  LANDING_CTA_CLICKED:          "landing_cta_clicked",

  // Questionnaire
  QUESTIONNAIRE_STARTED:        "questionnaire_started",
  QUESTIONNAIRE_BLOCK_COMPLETED:"questionnaire_block_completed",
  QUESTIONNAIRE_COMPLETED:      "questionnaire_completed",

  // Free report
  FREE_REPORT_VIEWED:           "free_report_viewed",
  FREE_REPORT_GENERATED:        "free_report_generated",
  FREE_REPORT_FAILED:           "free_report_failed",

  // Conversion
  UPGRADE_CLICKED:              "upgrade_clicked",
  PAYMENT_STARTED:              "payment_started",
  PAYMENT_COMPLETED:            "payment_completed",
  PAYMENT_FAILED:               "payment_failed",

  // Full report
  FULL_REPORT_VIEWED:           "full_report_viewed",
  FULL_REPORT_GENERATED:        "full_report_generated",
  FULL_REPORT_FAILED:           "full_report_failed",

  // Engagement
  ACTION_CHECKED:               "action_checked",
  PLAN_COPIED:                  "plan_copied",

  // Follow-up
  CHECKIN_EMAIL_SENT:           "checkin_email_sent",
  CHECKIN_COMPLETED:            "checkin_completed",
  CHECKIN_SKIPPED:              "checkin_skipped",

  // Retention
  REPORT_REVISITED:             "report_revisited",
} as const

export type EventName = typeof EVENTS[keyof typeof EVENTS]

// -----------------------------------------------------------------------------
// Event property builders
// Типизированные конструкторы свойств — не передаём сырые объекты
// -----------------------------------------------------------------------------

export const buildEventProperties = {
  pageViewed: (path: string) =>
    ({ path }),

  questionnaireCompleted: (profile: {
    archetype:    string
    primary_gap:  string
    primary_path: string
    grade:        number
    hours:        number
  }) => profile,

  freeReportViewed: (params: {
    archetype:    string
    primary_gap:  string
    is_returning: boolean
  }) => params,

  upgradeClicked: (source: "blur_overlay" | "sticky_bar" | "section_cta") =>
    ({ source }),

  paymentCompleted: (params: {
    payment_id: string
    amount:     number
  }) => params,

  fullReportViewed: (params: {
    archetype:    string
    primary_path: string
  }) => params,

  actionChecked: (action_id: string, day_target: number) =>
    ({ action_id, day_target }),

  checkinCompleted: (params: {
    day:              7 | 30 | 90
    completed_count:  number
    total_count:      number
  }) => params,
} as const

// -----------------------------------------------------------------------------
// Funnel definition (for admin dashboard rendering)
// Порядок важен — определяет отображение воронки
// -----------------------------------------------------------------------------

export const FUNNEL_STEPS = [
  { event: EVENTS.QUESTIONNAIRE_STARTED,   label: "Начали анкету"       },
  { event: EVENTS.QUESTIONNAIRE_COMPLETED, label: "Завершили анкету"    },
  { event: EVENTS.FREE_REPORT_VIEWED,      label: "Открыли free report" },
  { event: EVENTS.UPGRADE_CLICKED,         label: "Кликнули апгрейд"    },
  { event: EVENTS.PAYMENT_STARTED,         label: "Начали оплату"       },
  { event: EVENTS.PAYMENT_COMPLETED,       label: "Оплатили"            },
  { event: EVENTS.FULL_REPORT_VIEWED,      label: "Открыли full report" },
] as const

// -----------------------------------------------------------------------------
// Key engagement metrics (для ретеншн анализа)
// -----------------------------------------------------------------------------

export const ENGAGEMENT_EVENTS = [
  EVENTS.ACTION_CHECKED,
  EVENTS.PLAN_COPIED,
  EVENTS.CHECKIN_COMPLETED,
  EVENTS.REPORT_REVISITED,
] as const
