// =============================================================================
// PathUp — /report/[sid]/full  (Full Report Page)
//
// Server Component. Доступна только для оплаченных сессий.
// Читает full_report из БД и рендерит FullReportShell.
// =============================================================================

import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getSession }         from "@/lib/db/queries/sessions"
import { FullReportShell }    from "@/components/report/full/FullReportShell"
import { ReportPolling }      from "@/components/report/shared/ReportPolling"
import type { FullReport }    from "@/types"

interface Props {
  params: { sid: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Твой план — PathUp",
    robots: { index: false },
  }
}

export default async function FullReportPage({ params }: Props) {
  const { sid } = params

  const session = await getSession(sid)
  if (!session) return notFound()

  // Still generating
  if (session.full_report_status !== "done") {
    return (
      <ReportPolling
        session_id={sid}
        status={session.full_report_status as string}
        isFull
      />
    )
  }

  // Failed
  if (!session.full_report) {
    return <FullReportError session_id={sid} />
  }

  const report = session.full_report as unknown as FullReport

  return (
    <FullReportShell
      report={report}
      session_id={sid}
    />
  )
}

function FullReportError({ session_id }: { session_id: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-[#888880] mb-2">
          Полный отчёт ещё не готов.
        </p>
        <p className="text-sm text-[#555550] mb-6">
          Обычно это занимает меньше минуты. Обнови страницу.
        </p>
        <a
          href={`/report/${session_id}/full`}
          className="inline-block bg-[#C8F060] text-[#0A0A0A] font-semibold px-6 py-3 rounded-xl hover:bg-[#D8FF70] transition-all text-sm"
        >
          Обновить страницу
        </a>
      </div>
    </div>
  )
}
