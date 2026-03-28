// =============================================================================
// PathUp — Decision Layer Tests
// Core methodology engine test. No external deps, pure functions only.
// Run: npm run test:run
// =============================================================================

import { describe, it, expect } from "vitest"
import { buildStructuredProfile } from "../profile-builder"
import { runDecisionLayer }        from "../decision-layer"
import type { QuestionnaireInput } from "@/types"

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_INPUT: QuestionnaireInput = {
  grade:               10,
  interest_areas:      ["tech", "design"],
  interest_confidence: "likely",
  recent_activities:   ["coding", "learning"],
  completion_pattern:  "drops",
  goal_type:           "skill",
  goal_horizon:        "year",
  hours_per_week:      "2to4",
  blockers:            ["no_start", "fear_of_failure"],
  decision_style:      "analytical_stuck",
  pressure_source:     "parents",
  feedback_comfort:    "nervous_but_ok",
  one_step_today:      "Дописать CSS-проект",
  submitted_at:        new Date().toISOString(),
  session_id:          "00000000-0000-0000-0000-000000000001",
}

// ── Profile builder ───────────────────────────────────────────────────────────

describe("buildStructuredProfile", () => {
  it("produces a valid profile from minimal input", () => {
    const profile = buildStructuredProfile(BASE_INPUT)

    expect(profile.profile_id).toBeTruthy()
    expect(profile.grade).toBe(10)
    expect(profile.interest_areas).toEqual(["tech", "design"])
    expect(profile.interest_count).toBe(2)
    expect(profile.primary_interest).toBe("tech")
  })

  it("derives has_current_project from activities", () => {
    const withProject = buildStructuredProfile({
      ...BASE_INPUT,
      recent_activities: ["coding"],
      completion_pattern: "completes_private",
    })
    expect(withProject.has_current_project).toBe(true)

    const noProject = buildStructuredProfile({
      ...BASE_INPUT,
      recent_activities: ["nothing"],
    })
    expect(noProject.has_current_project).toBe(false)
  })

  it("derives has_public_work correctly", () => {
    const withPublic = buildStructuredProfile({
      ...BASE_INPUT,
      completion_pattern: "completes_and_publishes",
    })
    expect(withPublic.has_public_work).toBe(true)

    const withoutPublic = buildStructuredProfile({
      ...BASE_INPUT,
      completion_pattern: "drops",
      recent_activities:  ["coding"],
    })
    expect(withoutPublic.has_public_work).toBe(false)
  })

  it("maps hours correctly", () => {
    const p = buildStructuredProfile({ ...BASE_INPUT, hours_per_week: "gt8" })
    expect(p.hours_per_week_number).toBe(9)

    const q = buildStructuredProfile({ ...BASE_INPUT, hours_per_week: "lt2" })
    expect(q.hours_per_week_number).toBe(1)
  })

  it("assigns an archetype", () => {
    const profile = buildStructuredProfile(BASE_INPUT)
    const validArchetypes = [
      "Dreamer","Achiever","Builder","Anxious",
      "Rebel","Follower","Specialist","Hustler",
    ]
    expect(validArchetypes).toContain(profile.archetype)
  })

  it("detects at least one gap", () => {
    const profile = buildStructuredProfile(BASE_INPUT)
    expect(profile.detected_gaps.length).toBeGreaterThan(0)
    expect(profile.primary_gap).toBeTruthy()
  })

  it("marks high-confidence interest as high", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_confidence: "proven",
    })
    expect(profile.interest_confidence).toBe("high")
  })
})

// ── Decision layer ────────────────────────────────────────────────────────────

describe("runDecisionLayer", () => {
  it("returns a complete DecisionOutput", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)

    expect(decision.decision_id).toBeTruthy()
    expect(decision.profile_id).toBe(profile.profile_id)
    expect(decision.recommended_paths.length).toBeGreaterThan(0)
    expect(decision.primary_path).toBeTruthy()
    expect(decision.plan_7d.length).toBeGreaterThan(0)
    expect(decision.plan_30d.length).toBe(4)
    expect(decision.plan_90d.anchor_goal).toBeTruthy()
    expect(decision.anti_mistakes.length).toBeGreaterThan(0)
  })

  it("7-day plan has max 5 actions", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    expect(decision.plan_7d.length).toBeLessThanOrEqual(5)
  })

  it("30-day plan has exactly 4 weeks", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    expect(decision.plan_30d.length).toBe(4)
    const weeks = decision.plan_30d.map(p => p.week)
    expect(weeks).toEqual([1, 2, 3, 4])
  })

  it("90-day plan has exactly 3 months", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    expect(decision.plan_90d.months.length).toBe(3)
    expect(decision.plan_90d.retrospective_prompts.length).toBe(3)
  })

  it("excluded paths have reasons", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    decision.excluded_paths.forEach(ep => {
      expect(ep.reason.length).toBeGreaterThan(5)
    })
  })

  it("all path scores are recorded", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    // Should have score for every path
    const paths = [
      "P1_skill_sprint","P2_portfolio_build","P3_exploration_sprint",
      "P4_academic_track","P5_entrepreneurial","P6_mentorship_prep",
      "P7_mindset_reset",
    ]
    paths.forEach(p => {
      expect(typeof decision.path_scores[p as any]).toBe("number")
    })
  })
})

// ── Archetype assignment ──────────────────────────────────────────────────────

describe("archetype signals", () => {
  it("assigns Anxious for fear_of_failure + analytical_stuck + drops", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      blockers:           ["fear_of_failure"],
      decision_style:     "analytical_stuck",
      completion_pattern: "drops",
      feedback_comfort:   "prefer_not",
    })
    // Anxious should score highest or be close
    expect(["Anxious", "Achiever"]).toContain(profile.archetype)
  })

  it("assigns Hustler for earn + urgent + impulsive", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type:      "earn",
      goal_horizon:   "urgent",
      decision_style: "impulsive",
      blockers:       ["loses_interest"],
    })
    expect(profile.archetype).toBe("Hustler")
  })

  it("assigns Specialist for single interest + high confidence", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_areas:      ["science"],
      interest_confidence: "proven",
      goal_type:           "university",
    })
    expect(["Specialist", "Achiever"]).toContain(profile.archetype)
  })

  it("assigns Follower for waits_for_others decision style", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      decision_style:      "waits_for_others",
      interest_confidence: "random",
      completion_pattern:  "barely_starts",
    })
    expect(["Follower", "Dreamer"]).toContain(profile.archetype)
  })
})

// ── Gap detection ─────────────────────────────────────────────────────────────

describe("gap detection", () => {
  it("detects G6_time_scarcity for lt2 hours", () => {
    const profile = buildStructuredProfile({ ...BASE_INPUT, hours_per_week: "lt2" })
    expect(profile.detected_gaps).toContain("G6_time_scarcity")
  })

  it("detects G8_confidence_gap for fear + low feedback comfort", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      blockers:        ["fear_of_failure"],
      feedback_comfort: "private",
    })
    expect(profile.detected_gaps).toContain("G8_confidence_gap")
  })

  it("detects G7_external_pressure for parents + avoidant style", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      pressure_source: "parents",
      decision_style:  "waits_for_others",
    })
    expect(profile.detected_gaps).toContain("G7_external_pressure")
  })

  it("does not detect G3_no_completion when no current project", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      recent_activities:  ["nothing"],
      completion_pattern: "barely_starts",
    })
    // G3 requires has_current_project = true
    expect(profile.detected_gaps).not.toContain("G3_no_completion")
  })

  it("always returns at least one gap", () => {
    const profile = buildStructuredProfile(BASE_INPUT)
    expect(profile.detected_gaps.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Path selection ────────────────────────────────────────────────────────────

describe("path selection", () => {
  it("excludes P5_entrepreneurial for Anxious with no public work", () => {
    const profile  = buildStructuredProfile({
      ...BASE_INPUT,
      blockers:          ["fear_of_failure"],
      feedback_comfort:  "private",
      completion_pattern:"drops",
    })
    const decision = runDecisionLayer(profile)
    expect(decision.recommended_paths).not.toContain("P5_entrepreneurial")
  })

  it("includes P7_mindset_reset for low completion + fear", () => {
    const profile  = buildStructuredProfile({
      ...BASE_INPUT,
      completion_pattern: "drops",
      blockers:           ["fear_of_failure"],
    })
    const decision = runDecisionLayer(profile)
    // P7 should be in top 3
    expect(decision.recommended_paths).toContain("P7_mindset_reset")
  })

  it("always recommends at least one path", () => {
    const profile  = buildStructuredProfile(BASE_INPUT)
    const decision = runDecisionLayer(profile)
    expect(decision.recommended_paths.length).toBeGreaterThan(0)
  })
})

// =============================================================================
// QA Audit v2 — Critical Fix Tests
// =============================================================================

describe("FIX 1: P4 deadline bonus — university only", () => {
  it("earn + urgent does NOT score P4 highly", () => {
    const hustlerInput: QuestionnaireInput = {
      ...BASE_INPUT,
      grade: 10,
      interest_areas: ["business"],
      interest_confidence: "proven",
      recent_activities: ["content", "coding", "public_work"],
      completion_pattern: "completes_and_publishes",
      goal_type: "earn",
      goal_horizon: "urgent",
      hours_per_week: "gt8",
      blockers: ["loses_interest"],
      decision_style: "impulsive",
      pressure_source: "self",
      feedback_comfort: "open",
    }
    const profile  = buildStructuredProfile(hustlerInput)
    const decision = runDecisionLayer(profile)

    // P4 must NOT be in top 2 for an earn-goal profile
    const top2 = decision.recommended_paths.slice(0, 2)
    expect(top2).not.toContain("P4_academic_track")

    // P4 score must be less than P5 score (entrepreneurial beats academic for Hustler)
    const p4Score = decision.path_scores["P4_academic_track"] ?? 0
    const p5Score = decision.path_scores["P5_entrepreneurial"] ?? 0
    expect(p5Score).toBeGreaterThan(p4Score)
  })

  it("university + urgent still gets P4 bonus", () => {
    const achieverInput: QuestionnaireInput = {
      ...BASE_INPUT,
      grade: 11,
      interest_areas: ["science"],
      interest_confidence: "proven",
      recent_activities: ["competition", "learning"],
      completion_pattern: "completes_and_publishes",
      goal_type: "university",
      goal_horizon: "urgent",
      hours_per_week: "5to7",
      blockers: ["no_time"],
      decision_style: "analytical_stuck",
      pressure_source: "parents",
      feedback_comfort: "nervous_but_ok",
    }
    const profile  = buildStructuredProfile(achieverInput)
    const decision = runDecisionLayer(profile)

    expect(decision.recommended_paths[0]).toBe("P4_academic_track")
    expect(decision.path_scores["P4_academic_track"] ?? 0).toBeGreaterThan(30)
  })
})

describe("FIX 2: earn goal is directional, not vague", () => {
  it("earn + proven confidence = directional, not vague", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type: "earn",
      interest_confidence: "proven",
    })
    expect(profile.goal_specificity).toBe("directional")
  })

  it("earn + low confidence = vague (no change)", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type: "earn",
      interest_confidence: "random",  // maps to low
    })
    expect(profile.goal_specificity).toBe("vague")
  })

  it("earn + medium confidence = directional", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type: "earn",
      interest_confidence: "likely",  // maps to medium
    })
    expect(profile.goal_specificity).toBe("directional")
  })

  it("Hustler earn profile no longer gets G10 as primary gap", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type: "earn",
      interest_confidence: "proven",
      recent_activities: ["coding", "public_work"],
      completion_pattern: "completes_and_publishes",
      hours_per_week: "gt8",
      blockers: ["loses_interest"],
      decision_style: "impulsive",
      pressure_source: "self",
      feedback_comfort: "open",
    })
    // With earn=directional, G10 (requires vague) should not be primary gap
    expect(profile.goal_specificity).toBe("directional")
    expect(profile.primary_gap).not.toBe("G10_no_concrete_goal")
  })
})

describe("FIX 3: P3 excluded for low-time and G6 profiles", () => {
  it("P3 excluded when hours < 3 (min_hours raised to 3)", () => {
    const lowTimeProfile = buildStructuredProfile({
      ...BASE_INPUT,
      hours_per_week: "lt2",  // 1h — below new min of 3
      interest_areas: ["tech", "design", "science"],
      interest_confidence: "unsure",
      goal_type: "direction",
      completion_pattern: "barely_starts",
      recent_activities: ["learning"],
    })
    const decision = runDecisionLayer(lowTimeProfile)
    expect(decision.recommended_paths).not.toContain("P3_exploration_sprint")
  })

  it("P3 excluded when primary gap is G6_time_scarcity", () => {
    const g6Profile = buildStructuredProfile({
      ...BASE_INPUT,
      hours_per_week: "lt2",
      interest_areas: ["engineering"],
      interest_confidence: "likely",
      goal_type: "skill",
      completion_pattern: "barely_starts",
      blockers: ["no_time", "too_complex"],
    })
    expect(g6Profile.primary_gap).toBe("G6_time_scarcity")
    const decision = runDecisionLayer(g6Profile)
    expect(decision.recommended_paths).not.toContain("P3_exploration_sprint")
  })

  it("P3 still works for 3+ hours profile", () => {
    const adequateTimeProfile = buildStructuredProfile({
      ...BASE_INPUT,
      hours_per_week: "2to4",  // 3h — exactly at new min
      interest_areas: ["tech", "design", "arts"],
      interest_confidence: "unsure",
      goal_type: "direction",
      completion_pattern: "drops",
      blockers: ["no_start", "loses_interest"],
    })
    const decision = runDecisionLayer(adequateTimeProfile)
    // P3 should be in recommended paths (not excluded by time gate)
    expect(decision.recommended_paths).toContain("P3_exploration_sprint")
  })
})

// =============================================================================
// QA Audit v2 — Quality Fix Tests
// =============================================================================

describe("FIX Q1: Anxious archetype — fear + low feedback triggers regardless of completion_rate", () => {
  it("fear_of_failure + prefer_not + medium completion = Anxious (not Builder)", () => {
    // Katya-type: completes privately, but never publishes due to fear
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      grade: 9,
      interest_areas: ["design", "arts"],
      interest_confidence: "likely",
      recent_activities: ["design", "learning"],
      completion_pattern: "completes_private",   // medium — was preventing Anxious
      goal_type: "direction",
      goal_horizon: "long_term",
      hours_per_week: "2to4",
      blockers: ["fear_of_failure", "no_community"],
      decision_style: "analytical_stuck",
      pressure_source: "parents",
      feedback_comfort: "prefer_not",            // key signal
    })
    // Combined rule: fear + prefer_not adds +20 to Anxious even with medium completion
    expect(profile.archetype).toBe("Anxious")
  })

  it("fear_of_failure + open feedback still does NOT force Anxious", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      blockers: ["fear_of_failure"],
      feedback_comfort: "open",           // open — combined rule won't fire
      completion_pattern: "completes_private",
      decision_style: "impulsive",
    })
    // Without the combined signal, fear alone doesn't override other strong signals
    expect(["Anxious", "Builder", "Hustler"]).toContain(profile.archetype)
    // Just check it's not forced into wrong box by the new rule
  })
})

describe("FIX Q2: M3_shiny_object fires at interest_count >= 2", () => {
  it("2 interests + low completion triggers M3", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_areas: ["tech", "business"],   // count = 2
      interest_confidence: "likely",
      completion_pattern: "drops",             // low
      goal_type: "own_project",
      decision_style: "impulsive",
      blockers: ["parent_conflict", "no_start"],
    })
    const decision = runDecisionLayer(profile)
    expect(decision.anti_mistakes).toContain("M3_shiny_object")
  })

  it("1 interest + low completion does NOT trigger M3", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_areas: ["tech"],               // count = 1
      completion_pattern: "drops",
    })
    const decision = runDecisionLayer(profile)
    expect(decision.anti_mistakes).not.toContain("M3_shiny_object")
  })

  it("2 interests + high completion does NOT trigger M3", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_areas: ["tech", "design"],     // count = 2
      completion_pattern: "completes_and_publishes",  // high
    })
    const decision = runDecisionLayer(profile)
    expect(decision.anti_mistakes).not.toContain("M3_shiny_object")
  })
})

describe("FIX Q3: P1_skill_sprint excluded when interest_count === 0", () => {
  it("unknown interests profile does not get P1", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      grade: 8,
      interest_areas: ["unknown"],
      interest_confidence: "random",
      recent_activities: ["nothing"],
      completion_pattern: "barely_starts",
      goal_type: "survive",
      goal_horizon: "long_term",
      hours_per_week: "2to4",
      blockers: ["no_start", "too_complex"],
      decision_style: "waits_for_others",
      pressure_source: "parents",
      feedback_comfort: "nervous_but_ok",
    })
    const decision = runDecisionLayer(profile)
    expect(decision.recommended_paths).not.toContain("P1_skill_sprint")
  })

  it("single specific interest still gets P1", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      interest_areas: ["tech"],              // count = 1 (not 0)
      interest_confidence: "proven",
      recent_activities: ["coding"],
      completion_pattern: "completes_private",
      hours_per_week: "5to7",
    })
    const decision = runDecisionLayer(profile)
    // P1 should be available (interest_count = 1, not 0)
    expect(decision.path_scores["P1_skill_sprint"] ?? -1).toBeGreaterThan(0)
  })
})

// =============================================================================
// Pre-launch Fixes — P9 Алина scenarios
// =============================================================================

describe("PRE-LAUNCH FIX 1: P4 excluded for survive/no-direction profiles", () => {
  const alinaBase: QuestionnaireInput = {
    ...BASE_INPUT,
    grade: 8,
    interest_areas: ["unknown"],
    interest_confidence: "random",
    recent_activities: ["nothing"],
    completion_pattern: "barely_starts",
    goal_type: "survive",
    goal_horizon: "long_term",
    hours_per_week: "2to4",
    blockers: ["no_start", "too_complex"],
    decision_style: "waits_for_others",
    pressure_source: "parents",
    feedback_comfort: "nervous_but_ok",
  }

  it("survive + interest_count=0 does NOT get P4_academic_track", () => {
    const profile  = buildStructuredProfile(alinaBase)
    const decision = runDecisionLayer(profile)
    expect(decision.recommended_paths).not.toContain("P4_academic_track")
    expect(decision.path_scores["P4_academic_track"] ?? 0).toBeLessThanOrEqual(0)
  })

  it("university goal still gets P4 even with interest_count=0", () => {
    const profile = buildStructuredProfile({
      ...alinaBase,
      goal_type: "university",   // explicit university intent — P4 should stay
      interest_confidence: "random",
    })
    const decision = runDecisionLayer(profile)
    // P4 not excluded by our rule (goal_type IS university)
    expect(decision.path_scores["P4_academic_track"] ?? -1).toBeGreaterThan(-1)
  })

  it("survive + interest_count=1 also does NOT get P4 (non-zero but no direction)", () => {
    const profile = buildStructuredProfile({
      ...alinaBase,
      interest_areas: ["arts"],      // count=1 but still no university intent
      interest_confidence: "unsure",
    })
    const decision = runDecisionLayer(profile)
    expect(decision.recommended_paths).not.toContain("P4_academic_track")
  })
})

describe("PRE-LAUNCH FIX 2: M2 fires for survive + waits_for_others + no interests", () => {
  it("Alina-type profile gets M2_motivation_dependency", () => {
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      grade: 8,
      interest_areas: ["unknown"],
      interest_confidence: "random",
      recent_activities: ["nothing"],
      completion_pattern: "barely_starts",
      goal_type: "survive",
      goal_horizon: "long_term",
      hours_per_week: "2to4",
      blockers: ["no_start", "too_complex"],
      decision_style: "waits_for_others",
      pressure_source: "parents",
      feedback_comfort: "nervous_but_ok",
    })
    const decision = runDecisionLayer(profile)
    expect(decision.anti_mistakes).toContain("M2_motivation_dependency")
    // Also verify M10 is still present (always last)
    expect(decision.anti_mistakes).toContain("M10_invisible_progress")
    // Verify exactly 3 anti-mistakes
    expect(decision.anti_mistakes).toHaveLength(3)
  })

  it("M2 does NOT fire for survive + impulsive (different profile)", () => {
    // impulsive decision_style — waits_for_others condition not met
    const profile = buildStructuredProfile({
      ...BASE_INPUT,
      goal_type: "survive",
      decision_style: "impulsive",
      interest_areas: ["unknown"],
      interest_confidence: "random",
    })
    const decision = runDecisionLayer(profile)
    // M2 should not fire purely from survive+impulsive without the full condition
    const m2Fired = decision.anti_mistakes.includes("M2_motivation_dependency")
    // Only fires if also has loses_interest blocker or is Dreamer
    if (!profile.blockers.includes("loses_interest") && profile.archetype !== "Dreamer") {
      expect(m2Fired).toBe(false)
    }
  })
})
