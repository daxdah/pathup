// =============================================================================
// PathUp — Session Queries
// Все DB операции с сессиями в одном месте.
// API routes не пишут Prisma запросы напрямую — только вызывают эти функции.
// =============================================================================

import db from "@/lib/db/client"
import type {
  QuestionnaireInput,
  StructuredProfile,
  DecisionOutput,
  FreeReport,
  FullReport,
  ParentReport,
  ReportStatus,
  CheckinResult,
} from "@/types"

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

export async function createSession(params: {
  session_id: string
  questionnaire: QuestionnaireInput
  profile: StructuredProfile
  decision: DecisionOutput
}) {
  return db.session.create({
    data: {
      id: params.session_id,
      questionnaire: params.questionnaire as any,
      profile:       params.profile   as any,
      decision:      params.decision  as any,
      free_report_status: "pending",
      full_report_status: "pending",
      // Denormalized fields for analytics
      archetype:    params.profile.archetype,
      primary_gap:  params.profile.primary_gap,
      primary_path: params.decision.primary_path,
      grade:        params.profile.grade,
    },
  })
}

// -----------------------------------------------------------------------------
// Read
// -----------------------------------------------------------------------------

export async function getSession(session_id: string) {
  return db.session.findUnique({
    where: { id: session_id },
  })
}

export async function getSessionOrThrow(session_id: string) {
  const session = await getSession(session_id)
  if (!session) throw new Error(`Session not found: ${session_id}`)
  return session
}

// Для check-in cron — найти сессии у которых пришло время
export async function getSessionsForCheckin(
  dayOffset: 7 | 30 | 90
): Promise<{ id: string; email: string }[]> {
  const field = `checkin_${dayOffset}d_sent` as const
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - dayOffset)

  const results = await db.session.findMany({
    where: {
      is_paid: true,
      email: { not: null },
      [field]: false,
      created_at: { lte: cutoff },
    },
    select: { id: true, email: true },
  })

  return results.filter((s): s is { id: string; email: string } =>
    s.email !== null
  )
}

// -----------------------------------------------------------------------------
// Update — report status
// -----------------------------------------------------------------------------

export async function setReportStatus(
  session_id: string,
  reportType: "free" | "full",
  status: ReportStatus
) {
  const field = reportType === "free"
    ? "free_report_status"
    : "full_report_status"

  return db.session.update({
    where: { id: session_id },
    data: { [field]: status },
  })
}

// -----------------------------------------------------------------------------
// Update — save generated reports
// -----------------------------------------------------------------------------

export async function saveFreeReport(session_id: string, report: FreeReport) {
  return db.session.update({
    where: { id: session_id },
    data: {
      free_report: report as any,
      free_report_status: "done",
    },
  })
}

export async function saveFullReport(session_id: string, report: FullReport) {
  return db.session.update({
    where: { id: session_id },
    data: {
      full_report: report as any,
      full_report_status: "done",
    },
  })
}

export async function saveParentReport(session_id: string, report: ParentReport) {
  return db.session.update({
    where: { id: session_id },
    data: {
      parent_report: report as any,
    },
  })
}

// -----------------------------------------------------------------------------
// Update — payment
// -----------------------------------------------------------------------------

export async function markSessionPaid(params: {
  session_id: string
  payment_id: string
  email: string
}) {
  return db.session.update({
    where: { id: params.session_id },
    data: {
      is_paid:    true,
      paid_at:    new Date(),
      payment_id: params.payment_id,
      email:      params.email,
    },
  })
}

// -----------------------------------------------------------------------------
// Update — check-ins
// -----------------------------------------------------------------------------

export async function markCheckinSent(
  session_id: string,
  day: 7 | 30 | 90
) {
  return db.session.update({
    where: { id: session_id },
    data: { [`checkin_${day}d_sent`]: true },
  })
}

export async function saveCheckinResult(
  session_id: string,
  result: CheckinResult
) {
  return db.session.update({
    where: { id: session_id },
    data: {
      checkin_7d_done: true,
      checkin_7d_result: result as any,
    },
  })
}

// -----------------------------------------------------------------------------
// Admin queries
// -----------------------------------------------------------------------------

export async function getRecentSessions(limit = 50) {
  return db.session.findMany({
    orderBy: { created_at: "desc" },
    take: limit,
    select: {
      id: true,
      created_at: true,
      archetype: true,
      primary_gap: true,
      primary_path: true,
      grade: true,
      is_paid: true,
      free_report_status: true,
      full_report_status: true,
      email: true,
    },
  })
}

export async function getFunnelStats() {
  const [total, withFreeReport, paid] = await Promise.all([
    db.session.count(),
    db.session.count({ where: { free_report_status: "done" } }),
    db.session.count({ where: { is_paid: true } }),
  ])

  return { total, withFreeReport, paid }
}

export async function getFailedSessions() {
  return db.session.findMany({
    where: {
      OR: [
        { free_report_status: "failed" },
        { full_report_status: "failed" },
      ],
    },
    orderBy: { created_at: "desc" },
    take: 20,
    select: {
      id: true,
      created_at: true,
      free_report_status: true,
      full_report_status: true,
      archetype: true,
    },
  })
}

// Cleanup expired unpaid sessions (вызывается из cron)
export async function deleteExpiredSessions(daysOld = 90) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysOld)

  return db.session.deleteMany({
    where: {
      is_paid: false,
      created_at: { lt: cutoff },
    },
  })
}
