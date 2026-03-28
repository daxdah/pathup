// =============================================================================
// PathUp — Zod Schemas
// Единственный источник правды о структуре данных
// Используются и для TypeScript типов и для runtime валидации
// =============================================================================

import { z } from "zod"

// -----------------------------------------------------------------------------
// Shared enums
// -----------------------------------------------------------------------------

const InterestAreaEnum = z.enum([
  "tech", "design", "science", "business",
  "content", "people", "engineering", "medicine",
  "arts", "unknown",
])

const InterestConfidenceEnum = z.enum(["proven", "likely", "unsure", "random"])

const RecentActivityEnum = z.enum([
  "coding", "design", "learning", "competition",
  "content", "public_work", "nothing",
])

const CompletionPatternEnum = z.enum([
  "completes_and_publishes", "completes_private", "drops", "barely_starts",
])

const GoalTypeEnum = z.enum([
  "university", "skill", "direction", "own_project", "earn", "survive",
])

const GoalHorizonEnum = z.enum(["urgent", "year", "long_term"])

const HoursPerWeekEnum = z.enum(["lt2", "2to4", "5to7", "gt8"])

const BlockerEnum = z.enum([
  "no_start", "loses_interest", "fear_of_failure",
  "no_time", "parent_conflict", "no_community", "too_complex",
])

const DecisionStyleEnum = z.enum([
  "analytical_stuck", "impulsive", "waits_for_others", "follows_peers",
])

const PressureSourceEnum = z.enum(["self", "parents", "peers", "none"])

const FeedbackComfortEnum = z.enum(["open", "nervous_but_ok", "prefer_not", "private"])

const ArchetypeEnum = z.enum([
  "Dreamer", "Achiever", "Builder", "Anxious",
  "Rebel", "Follower", "Specialist", "Hustler",
])

const GrowthPathEnum = z.enum([
  "P1_skill_sprint", "P2_portfolio_build", "P3_exploration_sprint",
  "P4_academic_track", "P5_entrepreneurial", "P6_mentorship_prep",
  "P7_mindset_reset",
])

const GapTypeEnum = z.enum([
  "G1_no_direction", "G2_no_evidence", "G3_no_completion",
  "G4_no_feedback_loop", "G5_skill_goal_mismatch", "G6_time_scarcity",
  "G7_external_pressure", "G8_confidence_gap", "G9_knowledge_no_application",
  "G10_no_concrete_goal", "G11_wrong_comparison", "G12_scattered_attention",
  "G13_no_community",  // FIX 3: new gap for no_community blocker
])

const AntiMistakeEnum = z.enum([
  "M1_infinite_planning", "M2_motivation_dependency", "M3_shiny_object",
  "M4_perfectionism_freeze", "M5_lone_wolf", "M6_credential_overvaluation",
  "M7_wrong_metric", "M8_comparison_spiral", "M9_overload_start",
  "M10_invisible_progress",
])

const ConfidenceLevelEnum = z.enum(["low", "medium", "high"])
const SpecificityLevelEnum = z.enum(["vague", "directional", "specific"])
const CompletionRateEnum = z.enum(["low", "medium", "high"])
const ReportStatusEnum = z.enum(["pending", "generating", "done", "failed"])

// -----------------------------------------------------------------------------
// Questionnaire Input Schema
// -----------------------------------------------------------------------------

export const QuestionnaireInputSchema = z.object({
  grade: z.union([
    z.literal(8), z.literal(9), z.literal(10),
    z.literal(11), z.literal(12),
  ]),
  interest_areas: z.array(InterestAreaEnum).min(1).max(3),
  interest_confidence: InterestConfidenceEnum,
  recent_activities: z.array(RecentActivityEnum).min(1),
  completion_pattern: CompletionPatternEnum,
  goal_type: GoalTypeEnum,
  goal_horizon: GoalHorizonEnum,
  hours_per_week: HoursPerWeekEnum,
  blockers: z.array(BlockerEnum).min(1).max(2),
  decision_style: DecisionStyleEnum,
  pressure_source: PressureSourceEnum,
  feedback_comfort: FeedbackComfortEnum,
  one_step_today: z.string().max(100).optional(),
  submitted_at: z.string().datetime(),
  session_id: z.string().uuid(),
})

// -----------------------------------------------------------------------------
// Structured Profile Schema
// -----------------------------------------------------------------------------

export const StructuredProfileSchema = z.object({
  profile_id: z.string().uuid(),
  grade: z.number().int().min(8).max(12),
  created_at: z.string().datetime(),

  // Interests
  interest_areas: z.array(InterestAreaEnum),
  interest_count: z.number().int().min(0),
  interest_confidence: ConfidenceLevelEnum,
  primary_interest: InterestAreaEnum,

  // Experience
  has_current_project: z.boolean(),
  has_public_work: z.boolean(),
  projects_completed_last_90d: z.number().int().min(0).max(3),
  completion_rate: CompletionRateEnum,
  recent_activities: z.array(RecentActivityEnum),

  // Goals
  goal_type: GoalTypeEnum,
  goal_horizon: GoalHorizonEnum,
  goal_specificity: SpecificityLevelEnum,
  has_deadline: z.boolean(),

  // Resources
  hours_per_week_bucket: HoursPerWeekEnum,
  hours_per_week_number: z.number().min(0),
  schedule_flexibility: z.enum(["structured", "flexible", "chaotic"]),

  // Psychology
  blockers: z.array(BlockerEnum),
  primary_blocker: BlockerEnum,
  decision_style: DecisionStyleEnum,
  pressure_source: PressureSourceEnum,
  feedback_comfort: FeedbackComfortEnum,
  feedback_comfort_level: ConfidenceLevelEnum,

  // Archetype
  archetype: ArchetypeEnum,
  archetype_confidence: ConfidenceLevelEnum,

  // Gaps
  detected_gaps: z.array(GapTypeEnum),
  primary_gap: GapTypeEnum,

  // Optional
  one_step_today: z.string().optional(),
})

// -----------------------------------------------------------------------------
// Decision Output Schema
// -----------------------------------------------------------------------------

const ActionSchema = z.object({
  action_id: z.string(),
  label: z.string(),
  description: z.string(),
  duration_minutes: z.union([
    z.literal(15), z.literal(30), z.literal(60), z.literal(90),
  ]),
  is_public: z.boolean(),
  day_target: z.number().int().min(1).max(7),
  resolves_gap: GapTypeEnum.optional(),
})

const WeekPhaseSchema = z.object({
  week: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  theme: z.string(),
  focus: z.string(),
  milestone: z.string(),
  actions: z.array(ActionSchema),
  is_review_week: z.boolean(),
})

const MonthPlanSchema = z.object({
  month: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  theme: z.string(),
  goal: z.string(),
  key_activities: z.array(z.string()),
})

const QuarterSchema = z.object({
  anchor_goal: z.string(),
  months: z.array(MonthPlanSchema).length(3),
  weekly_ritual: z.string(),
  retrospective_prompts: z.array(z.string()).length(3),
})

const ExcludedPathSchema = z.object({
  path: GrowthPathEnum,
  reason: z.string(),
})

export const DecisionOutputSchema = z.object({
  decision_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  generated_at: z.string().datetime(),

  archetype: ArchetypeEnum,
  primary_gap: GapTypeEnum,
  detected_gaps: z.array(GapTypeEnum),

  recommended_paths: z.array(GrowthPathEnum).min(1).max(3),
  primary_path: GrowthPathEnum,
  excluded_paths: z.array(ExcludedPathSchema),

  anti_mistakes: z.array(AntiMistakeEnum).max(3),

  plan_7d: z.array(ActionSchema).min(1).max(5),
  plan_30d: z.array(WeekPhaseSchema).length(4),
  plan_90d: QuarterSchema,

  path_scores: z.record(GrowthPathEnum, z.number()),
})

// -----------------------------------------------------------------------------
// Report Schemas
// -----------------------------------------------------------------------------

export const FreeReportSchema = z.object({
  report_id: z.string(),
  profile_id: z.string(),
  decision_id: z.string(),
  generated_at: z.string().datetime(),

  archetype_label: z.string(),
  archetype_description: z.string(),
  primary_gap_label: z.string(),
  primary_gap_description: z.string(),
  top_path_label: z.string(),
  top_path_teaser: z.string(),

  plan_7d_preview: z.array(ActionSchema).max(2),
  plan_30d_locked: z.literal(true),
  plan_90d_locked: z.literal(true),

  what_if_nothing_changes: z.string(),  // NEW: explicit "if nothing changes" block
  upgrade_prompt: z.string(),
})

export const FullReportSchema = z.object({
  report_id: z.string(),
  profile_id: z.string(),
  decision_id: z.string(),
  generated_at: z.string().datetime(),
  version: z.number().int(),

  archetype_label: z.string(),
  archetype_description: z.string(),
  archetype_strengths: z.array(z.string()),
  archetype_risks: z.array(z.string()),

  primary_gap_label: z.string(),
  primary_gap_description: z.string(),
  all_gaps: z.array(z.object({
    gap: GapTypeEnum,
    label: z.string(),
    severity: z.enum(["critical", "moderate", "minor"]),
  })),

  recommended_paths: z.array(z.object({
    path: GrowthPathEnum,
    label: z.string(),
    why_for_you: z.string(),
    rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  })),

  plan_7d: z.object({
    intro: z.string(),
    actions: z.array(ActionSchema),
    main_result: z.string(),
  }),

  plan_30d: z.object({
    intro: z.string(),
    phases: z.array(WeekPhaseSchema),
    milestone: z.string(),
  }),

  plan_90d: z.object({
    intro: z.string(),
    quarter: QuarterSchema,
    success_criteria: z.string(),
  }),

  anti_mistakes: z.array(z.object({
    mistake: AntiMistakeEnum,
    label: z.string(),
    personalised_warning: z.string(),
  })),

  suggested_resources: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    type: z.enum(["course", "book", "community", "tool", "person"]),
    relevance: z.string(),
  })).optional(),

  // NEW deliverable-oriented fields
  why_we_think_this: z.string(),           // explicit reasoning block
  what_if_nothing_changes: z.string(),      // always-visible consequence block
  what_not_to_do: z.string(),               // "stop doing this now" — more prominent than anti_mistakes
  deliverables_30d: z.array(z.string()).min(2).max(4),  // concrete work artifacts for 30 days
  proof_of_progress: z.array(z.string()).min(2).max(5), // observable signals that plan is working

  one_step_today: z.string().optional(),
  report_type: z.literal("full"),
})

export const ParentReportSchema = z.object({
  report_id: z.string(),
  profile_id: z.string(),
  generated_at: z.string().datetime(),

  child_archetype_label: z.string(),
  child_archetype_for_parent: z.string(),
  primary_challenge: z.string(),
  what_child_needs: z.string(),

  plan_7d_summary: z.string(),
  plan_30d_summary: z.string(),
  plan_90d_goal: z.string(),

  how_to_support: z.array(z.string()).length(3),
  what_not_to_do: z.array(z.string()).min(2).max(3),
  pressure_warning: z.string().optional(),
  check_in_questions: z.array(z.string()).length(3),

  report_type: z.literal("parent"),
  note: z.string(),
})

// -----------------------------------------------------------------------------
// Check-in Schemas
// -----------------------------------------------------------------------------

export const CheckinInputSchema = z.object({
  session_id: z.string().uuid(),
  completed_action_ids: z.array(z.string()),
  reason_if_empty: z.enum(["no_time", "too_hard", "lost_interest"]).optional(),
})

export const CheckinResultSchema = z.object({
  completion_count: z.number().int().min(0),
  total_actions: z.number().int().min(1),
  follow_up_message: z.string(),
  next_focus: z.string().optional(),
})

// -----------------------------------------------------------------------------
// Re-exports of enums (used in config files)
// -----------------------------------------------------------------------------

export {
  ArchetypeEnum,
  GrowthPathEnum,
  GapTypeEnum,
  AntiMistakeEnum,
  InterestAreaEnum,
  BlockerEnum,
  GoalTypeEnum,
  ReportStatusEnum,
}
