// =============================================================================
// PathUp — /success/[sid]
// Страница после успешной оплаты. Показывает подтверждение + CTA на full report.
// Polling пока full report не готов.
// =============================================================================

import Link        from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getSession } from "@/lib/db/queries/sessions"

interface Props { params: { sid: string } }

export const metadata: Metadata = {
  title: "Готово — PathUp",
  robots: { index: false },
}

export default async function SuccessPage({ params }: Props) {
  const session = await getSession(params.sid)
  if (!session || !session.is_paid) return notFound()

  const email       = session.email ?? ""
  const isReady     = session.full_report_status === "done"
  const reportUrl   = `/report/${params.sid}/full`

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">

        {/* Check icon */}
        <div className="w-12 h-12 rounded-full bg-[#C8F060]/15 border border-[#C8F060]/30
                        flex items-center justify-center mx-auto mb-6">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#C8F060" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-xl font-bold mb-2">Готово.</h1>

        {email && (
          <p className="text-sm text-[#555550] mb-8">
            Копия отправлена на{" "}
            <span className="text-[#888880]">{email}</span>
          </p>
        )}

        {isReady ? (
          <Link
            href={reportUrl}
            className="inline-flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A]
                       font-semibold px-7 py-3.5 rounded-xl hover:bg-[#D8FF70] transition-all"
          >
            Открыть план →
          </Link>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-[#888880]">
              <div className="w-4 h-4 border-2 border-[#C8F060] border-t-transparent
                              rounded-full animate-spin" />
              Генерируем полный план...
            </div>
            {/* Auto-redirect when ready */}
            <AutoRedirect url={reportUrl} />
          </div>
        )}

      </div>
    </div>
  )
}

// Client component: polls and redirects when report is ready
function AutoRedirect({ url }: { url: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function poll() {
            setTimeout(function() {
              fetch(window.location.href)
                .then(r => r.text())
                .then(html => {
                  if (html.includes('Открыть план')) {
                    window.location.href = '${url}';
                  } else {
                    poll();
                  }
                })
                .catch(poll);
            }, 2500);
          })();
        `,
      }}
    />
  )
}
