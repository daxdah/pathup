// =============================================================================
// PathUp — /report/[sid]  (Free Report Page)
//
// Server Component. Читает отчёт из БД, рендерит FreeReportShell.
// Если отчёт ещё генерируется — показывает polling экран.
// =============================================================================

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getSession } from "@/lib/db/queries/sessions"
import { FreeReportShell }    from "@/components/report/free/FreeReportShell"
import { ReportPolling }      from "@/components/report/shared/ReportPolling"
import type { FreeReport }    from "@/types"

interface Props {
  params: { sid: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Твой результат — PathUp",
    robots: { index: false }, // отчёты не индексируются
  }
}

export default async function FreeReportPage({ params }: Props) {
  const { sid } = params

  const session = await getSession(sid)
  if (!session) return notFound()

  const price = process.env.NEXT_PUBLIC_PRICE_RUB ?? "790"

  // Report still generating — show polling screen
  if (session.free_report_status !== "done") {
    return (
      <ReportPolling
        session_id={sid}
        status={session.free_report_status as string}
      />
    )
  }

  // Report failed — show error with retry option
  if (session.free_report_status === "failed" || !session.free_report) {
    return <ReportError session_id={sid} />
  }

  const report = session.free_report as unknown as FreeReport

  return (
    <FreeReportShell
      report={report}
      session_id={sid}
      price={price}
    />
  )
}

function ReportError({ session_id }: { session_id: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-[#888880] mb-6">
          Что-то пошло не так при генерации отчёта.
          Мы уже знаем об этом.
        </p>
        <a
          href={`/report/${session_id}`}
          className="inline-block bg-[#C8F060] text-[#0A0A0A] font-semibold px-6 py-3 rounded-xl hover:bg-[#D8FF70] transition-all text-sm"
        >
          Попробовать снова
        </a>
      </div>
    </div>
  )
}
