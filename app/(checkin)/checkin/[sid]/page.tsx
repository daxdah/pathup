// =============================================================================
// PathUp — /checkin/[sid]
// Страница недельного check-in. Пользователь отмечает выполненные действия.
// =============================================================================

import { notFound }   from "next/navigation"
import type { Metadata } from "next"
import { getSession } from "@/lib/db/queries/sessions"
import type { FreeReport, FullReport } from "@/types"
import { CheckinForm } from "@/components/checkin/CheckinForm"

interface Props { params: { sid: string } }

export const metadata: Metadata = {
  title: "Как прошла неделя — PathUp",
  robots: { index: false },
}

export default async function CheckinPage({ params }: Props) {
  const session = await getSession(params.sid)
  if (!session || !session.is_paid) return notFound()

  // Get actions from the report to show checkboxes
  const report = (session.full_report ?? session.free_report) as any
  const actions = report?.plan_7d?.actions ?? report?.plan_7d_preview ?? []

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-md w-full">

        <div className="mb-8">
          <span className="text-[#C8F060] font-semibold text-sm">PathUp</span>
        </div>

        <h1 className="text-xl font-bold mb-2">Как прошла неделя?</h1>
        <p className="text-sm text-[#555550] mb-8">
          Отметь что сделал. Это не проверка — это помогает скорректировать следующую неделю.
        </p>

        <CheckinForm
          session_id={params.sid}
          actions={actions}
        />

      </div>
    </div>
  )
}
