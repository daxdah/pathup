// =============================================================================
// PathUp — Admin Session Detail
// Полный просмотр одной сессии: profile, decision, оба отчёта, retry кнопки.
// =============================================================================

import { notFound }           from "next/navigation"
import { getSessionOrThrow }  from "@/lib/db/queries/sessions"
import { SessionJsonViewer }  from "@/components/admin/SessionJsonViewer"
import { RetryReportButton }  from "@/components/admin/RetryReportButton"

export const dynamic = "force-dynamic"

interface Props { params: { id: string } }

export default async function SessionDetailPage({ params }: Props) {
  let session: Awaited<ReturnType<typeof getSessionOrThrow>>

  try {
    session = await getSessionOrThrow(params.id)
  } catch {
    return notFound()
  }

  const profile  = session.profile  as any
  const decision = session.decision as any

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-sm text-[#555550] mb-1">
            {session.id}
          </h1>
          <div className="flex gap-3 flex-wrap">
            <Chip label={profile?.archetype   ?? "—"} color="green" />
            <Chip label={profile?.primary_gap ?? "—"} color="orange" />
            <Chip label={`grade ${profile?.grade ?? "?"}`} />
            <Chip label={session.is_paid ? "PAID" : "free"} color={session.is_paid ? "green" : "dim"} />
          </div>
        </div>
        <div className="text-xs text-[#555550] font-mono shrink-0">
          {new Date(session.created_at).toLocaleString("ru-RU")}
        </div>
      </div>

      {/* Report status + actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReportStatusCard
          label="Free Report"
          status={session.free_report_status}
          hasData={!!session.free_report}
          sessionId={session.id}
          reportType="free"
        />
        <ReportStatusCard
          label="Full Report"
          status={session.full_report_status}
          hasData={!!session.full_report}
          sessionId={session.id}
          reportType="full"
          requiresPaid={!session.is_paid}
        />
      </div>

      {/* Profile */}
      <Section title="Structured Profile">
        <SessionJsonViewer data={session.profile} />
      </Section>

      {/* Decision */}
      <Section title="Decision Output">
        <SessionJsonViewer data={session.decision} />
      </Section>

      {/* Free Report */}
      {session.free_report && (
        <Section title="Free Report">
          <SessionJsonViewer data={session.free_report} />
        </Section>
      )}

      {/* Full Report */}
      {session.full_report && (
        <Section title="Full Report">
          <SessionJsonViewer data={session.full_report} />
        </Section>
      )}

      {/* Raw questionnaire */}
      <Section title="Questionnaire Input" dimmed>
        <SessionJsonViewer data={session.questionnaire} />
      </Section>

    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function Chip({
  label,
  color = "dim",
}: {
  label: string
  color?: "green" | "orange" | "dim"
}) {
  const cls = {
    green:  "bg-[#C8F060]/10 text-[#C8F060]  border-[#C8F060]/20",
    orange: "bg-[#F0A030]/10 text-[#F0A030]  border-[#F0A030]/20",
    dim:    "bg-[#1A1A1A]    text-[#555550]   border-[#2A2A2A]",
  }[color]

  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  )
}

function Section({
  title,
  children,
  dimmed,
}: {
  title: string
  children: React.ReactNode
  dimmed?: boolean
}) {
  return (
    <div>
      <h2 className={`text-xs uppercase tracking-widest mb-3 ${dimmed ? "text-[#444440]" : "text-[#555550]"}`}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function ReportStatusCard({
  label,
  status,
  hasData,
  sessionId,
  reportType,
  requiresPaid,
}: {
  label:        string
  status:       string
  hasData:      boolean
  sessionId:    string
  reportType:   "free" | "full"
  requiresPaid?: boolean
}) {
  const statusColors: Record<string, string> = {
    done:       "text-[#C8F060]",
    generating: "text-[#F0A030]",
    failed:     "text-[#F05050]",
    pending:    "text-[#555550]",
  }

  return (
    <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs font-mono ${statusColors[status] ?? "text-[#555550]"}`}>
          {status}
        </span>
      </div>

      {requiresPaid && (
        <p className="text-xs text-[#555550]">Требуется оплата</p>
      )}

      <RetryReportButton
        sessionId={sessionId}
        reportType={reportType}
        disabled={requiresPaid}
      />
    </div>
  )
}
