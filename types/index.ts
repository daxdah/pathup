// =============================================================================
// PathUp — TypeScript Types
// Все типы выводятся из Zod схем через z.infer<>
// Не дублируем интерфейсы вручную
// =============================================================================

import type { z } from "zod"
import type {
  QuestionnaireInputSchema,
  StructuredProfileSchema,
  DecisionOutputSchema,
  FreeReportSchema,
  FullReportSchema,
  ParentReportSchema,
  CheckinInputSchema,
  CheckinResultSchema,
} from "@/schemas"

// -----------------------------------------------------------------------------
// Questionnaire
// -----------------------------------------------------------------------------

export type QuestionnaireInput = z.infer<typeof QuestionnaireInputSchema>

export type Grade = 8 | 9 | 10 | 11 | 12

export type InterestArea =
  | "tech"
  | "design"
  | "science"
  | "business"
  | "content"
  | "people"
  | "engineering"
  | "medicine"
  | "arts"
  | "unknown"

export type InterestConfidence = "proven" | "likely" | "unsure" | "random"

export type RecentActivity =
  | "coding"
  | "design"
  | "learning"
  | "competition"
  | "content"
  | "public_work"
  | "nothing"

export type CompletionPattern =
  | "completes_and_publishes"
  | "completes_private"
  | "drops"
  | "barely_starts"

export type GoalType =
  | "university"
  | "skill"
  | "direction"
  | "own_project"
  | "earn"
  | "survive"

export type GoalHorizon = "urgent" | "year" | "long_term"

export type HoursPerWeek = "lt2" | "2to4" | "5to7" | "gt8"

export type Blocker =
  | "no_start"
  | "loses_interest"
  | "fear_of_failure"
  | "no_time"
  | "parent_conflict"
  | "no_community"
  | "too_complex"

export type DecisionStyle =
  | "analytical_stuck"
  | "impulsive"
  | "waits_for_others"
  | "follows_peers"

export type PressureSource = "self" | "parents" | "peers" | "none"

export type FeedbackComfort = "open" | "nervous_but_ok" | "prefer_not" | "private"

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------

export type StructuredProfile = z.infer<typeof StructuredProfileSchema>

export type Archetype =
  | "Dreamer"
  | "Achiever"
  | "Builder"
  | "Anxious"
  | "Rebel"
  | "Follower"
  | "Specialist"
  | "Hustler"

export type ConfidenceLevel = "low" | "medium" | "high"
export type SpecificityLevel = "vague" | "directional" | "specific"
export type CompletionRate = "low" | "medium" | "high"

// -----------------------------------------------------------------------------
// Decision
// -----------------------------------------------------------------------------

export type DecisionOutput = z.infer<typeof DecisionOutputSchema>

export type GrowthPath =
  | "P1_skill_sprint"
  | "P2_portfolio_build"
  | "P3_exploration_sprint"
  | "P4_academic_track"
  | "P5_entrepreneurial"
  | "P6_mentorship_prep"
  | "P7_mindset_reset"

export type GapType =
  | "G1_no_direction"
  | "G2_no_evidence"
  | "G3_no_completion"
  | "G4_no_feedback_loop"
  | "G5_skill_goal_mismatch"
  | "G6_time_scarcity"
  | "G7_external_pressure"
  | "G8_confidence_gap"
  | "G9_knowledge_no_application"
  | "G10_no_concrete_goal"
  | "G11_wrong_comparison"
  | "G12_scattered_attention"

export type AntiMistake =
  | "M1_infinite_planning"
  | "M2_motivation_dependency"
  | "M3_shiny_object"
  | "M4_perfectionism_freeze"
  | "M5_lone_wolf"
  | "M6_credential_overvaluation"
  | "M7_wrong_metric"
  | "M8_comparison_spiral"
  | "M9_overload_start"
  | "M10_invisible_progress"

export interface Action {
  action_id: string
  label: string
  description: string
  duration_minutes: 15 | 30 | 60 | 90
  is_public: boolean
  day_target: number
  resolves_gap?: GapType
}

export interface WeekPhase {
  week: 1 | 2 | 3 | 4
  theme: string
  focus: string
  milestone: string
  actions: Action[]
  is_review_week: boolean
}

export interface MonthPlan {
  month: 1 | 2 | 3
  theme: string
  goal: string
  key_activities: string[]
}

export interface Quarter {
  anchor_goal: string
  months: MonthPlan[]
  weekly_ritual: string
  retrospective_prompts: string[]
}

export interface ExcludedPath {
  path: GrowthPath
  reason: string
}

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

export type FreeReport = z.infer<typeof FreeReportSchema>
export type FullReport = z.infer<typeof FullReportSchema>
export type ParentReport = z.infer<typeof ParentReportSchema>

export type ReportStatus = "pending" | "generating" | "done" | "failed"

// -----------------------------------------------------------------------------
// Check-in
// -----------------------------------------------------------------------------

export type CheckinInput = z.infer<typeof CheckinInputSchema>
export type CheckinResult = z.infer<typeof CheckinResultSchema>

export type CheckinReason = "no_time" | "too_hard" | "lost_interest"

// -----------------------------------------------------------------------------
// Payment
// -----------------------------------------------------------------------------

export type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled"

export interface CreatePaymentParams {
  session_id: string
  amount: number
  email: string
  description: string
  return_url: string
}

export interface PaymentResult {
  payment_id: string
  confirmation_url: string
  status: PaymentStatus
}

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------

export type EventName =
  | "page_viewed"
  | "questionnaire_started"
  | "questionnaire_block_completed"
  | "questionnaire_completed"
  | "free_report_viewed"
  | "upgrade_clicked"
  | "payment_started"
  | "payment_completed"
  | "full_report_viewed"
  | "checkin_email_sent"
  | "checkin_completed"
  | "action_checked"

// -----------------------------------------------------------------------------
// DB Session (matches Prisma model)
// -----------------------------------------------------------------------------

export interface SessionRecord {
  id: string
  created_at: Date
  updated_at: Date
  questionnaire: QuestionnaireInput
  profile: StructuredProfile
  decision: DecisionOutput
  free_report: FreeReport | null
  full_report: FullReport | null
  free_report_status: ReportStatus
  full_report_status: ReportStatus
  is_paid: boolean
  paid_at: Date | null
  payment_id: string | null
  email: string | null
  archetype: Archetype | null
  primary_gap: GapType | null
  primary_path: GrowthPath | null
  grade: number | null
  checkin_7d_sent: boolean
  checkin_7d_done: boolean
  checkin_7d_result: CheckinResult | null
  checkin_30d_sent: boolean
  checkin_30d_done: boolean
  checkin_90d_sent: boolean
}
