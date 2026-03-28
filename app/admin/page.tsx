// =============================================================================
// PathUp — Admin Dashboard
// Обзор: воронка, последние сессии, проблемные отчёты.
// Server Component — данные читаются напрямую из БД.
// =============================================================================

import Link from "next/link"
import {
  getRecentSessions,
  getFunnelStats,
  getFailedSessions,
} from "@/lib/db/queries/sessions"
import { getFunnelByDate } from "@/lib/db/queries/events"

export const dynamic = "force-dynamic"  // не кешировать

export default async function AdminDashboard() {
  const [funnel, sessions, failed, eventFunnel] = await Promise.all([
    getFunnelStats(),
    getRecentSessions(20),
    getFailedSessions(),
    getFunnelByDate(7),
  ])

  const conversionRate = funnel.total > 0
    ? ((funnel.paid / funnel.total) * 100).toFixed(1)
    : "0"

  const reportRate = funnel.total > 0
    ? ((funnel.withFreeReport / funnel.total) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Обзор</h1>
        <span className="text-xs text-[#555550] font-mono">
          {new Date().toLocaleDateString("ru-RU")}
        </span>
      </div>

      {/* Funnel stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Сессий всего",    value: funnel.total,           sub: "анкет заполнено"     },
          { label: "Отчётов выдано",  value: funnel.withFreeReport,  sub: `${reportRate}% от сессий` },
          { label: "Оплачено",        value: funnel.paid,            sub: `${conversionRate}% конверсия` },
          { label: "За 7 дней",       value: eventFunnel["questionnaire_completed"] ?? 0, sub: "завершённых анкет" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]"
          >
            <p className="text-2xl font-bold font-mono mb-1">{stat.value}</p>
            <p className="text-xs text-[#888880]">{stat.label}</p>
            <p className="text-xs text-[#444440] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Event funnel (last 7 days) */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Воронка за 7 дней</h2>
        <div className="space-y-2">
          {[
            { event: "questionnaire_started",   label: "Начали анкету"         },
            { event: "questionnaire_completed",  label: "Завершили анкету"      },
            { event: "free_report_viewed",       label: "Открыли free report"   },
            { event: "upgrade_clicked",          label: "Кликнули на апгрейд"   },
            { event: "payment_completed",        label: "Оплатили"              },
            { event: "full_report_viewed",       label: "Открыли full report"   },
          ].map((row) => {
            const count  = eventFunnel[row.event] ?? 0
            const topVal = eventFunnel["questionnaire_started"] ?? 1
            const pct    = topVal > 0 ? (count / topVal) * 100 : 0

            return (
              <div key={row.event} className="flex items-center gap-3">
                <span className="text-xs text-[#555550] w-44 shrink-0">
                  {row.label}
                </span>
                <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8F060] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[#888880] w-8 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Failed reports */}
      {failed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-[#F0A030]">
            Проблемные отчёты ({failed.length})
          </h2>
          <div className="space-y-2">
            {failed.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#F0A030]/20 bg-[#0F0F0F]"
              >
                <span className="font-mono text-xs text-[#555550]">
                  {s.id.slice(0, 8)}
                </span>
                <span className="text-xs text-[#888880]">{s.archetype ?? "—"}</span>
                <div className="flex gap-2 ml-auto">
                  <StatusBadge status={s.free_report_status} label="free" />
                  <StatusBadge status={s.full_report_status} label="full" />
                </div>
                <RetryButton sessionId={s.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Последние сессии</h2>
          <Link href="/admin/sessions" className="text-xs text-[#555550] hover:text-[#888880]">
            Все →
          </Link>
        </div>
        <SessionsTable sessions={sessions} />
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    done:       "text-[#C8F060]  bg-[#C8F060]/10",
    pending:    "text-[#888880]  bg-[#888880]/10",
    generating: "text-[#F0A030]  bg-[#F0A030]/10",
    failed:     "text-[#F05050]  bg-[#F05050]/10",
  }
  const cls = colors[status] ?? colors.pending

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${cls}`}>
      {label}:{status}
    </span>
  )
}

function RetryButton({ sessionId }: { sessionId: string }) {
  return (
    <form
      action={`/api/admin/retry-report`}
      method="POST"
      className="inline"
    >
      <input type="hidden" name="session_id" value={sessionId} />
      <button
        type="submit"
        className="text-xs text-[#888880] hover:text-[#C8F060] transition-colors border
                   border-[#2A2A2A] px-2 py-0.5 rounded"
      >
        Retry
      </button>
    </form>
  )
}

function SessionsTable({ sessions }: { sessions: Awaited<ReturnType<typeof getRecentSessions>> }) {
  return (
    <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1A1A1A] text-[#555550]">
            {["ID", "Архетип", "Gap", "Класс", "Оплата", "Free", "Full", ""].map((h) => (
              <th key={h} className="text-left px-3 py-2 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#111111] transition-colors"
            >
              <td className="px-3 py-2 font-mono text-[#555550]">
                {s.id.slice(0, 8)}
              </td>
              <td className="px-3 py-2 text-[#888880]">{s.archetype ?? "—"}</td>
              <td className="px-3 py-2 text-[#555550]">
                {s.primary_gap?.replace("G", "").split("_")[0] ?? "—"}
              </td>
              <td className="px-3 py-2 text-[#555550]">{s.grade ?? "—"}</td>
              <td className="px-3 py-2">
                {s.is_paid
                  ? <span className="text-[#C8F060]">✓</span>
                  : <span className="text-[#444440]">—</span>
                }
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={s.free_report_status} label="" />
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={s.full_report_status} label="" />
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/sessions/${s.id}`}
                  className="text-[#555550] hover:text-[#C8F060] transition-colors"
                >
                  →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
