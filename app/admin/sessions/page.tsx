// =============================================================================
// PathUp — Admin Sessions List
// =============================================================================

import Link               from "next/link"
import { getRecentSessions } from "@/lib/db/queries/sessions"

export const dynamic = "force-dynamic"

export default async function SessionsListPage() {
  const sessions = await getRecentSessions(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Все сессии</h1>
        <span className="text-xs text-[#555550] font-mono">{sessions.length} записей</span>
      </div>

      <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1A1A1A] text-[#555550]">
              {["ID", "Дата", "Архетип", "Gap", "Кл.", "Оплата", "Free", "Full", ""].map(h => (
                <th key={h} className="text-left px-3 py-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-[#1A1A1A] last:border-0
                                        hover:bg-[#111111] transition-colors">
                <td className="px-3 py-2 font-mono text-[#555550]">{s.id.slice(0,8)}</td>
                <td className="px-3 py-2 text-[#444440] font-mono">
                  {new Date(s.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-3 py-2 text-[#888880]">{s.archetype ?? "—"}</td>
                <td className="px-3 py-2 text-[#555550]">
                  {s.primary_gap?.split("_").slice(1, 3).join(" ") ?? "—"}
                </td>
                <td className="px-3 py-2 text-[#555550]">{s.grade ?? "—"}</td>
                <td className="px-3 py-2">
                  {s.is_paid
                    ? <span className="text-[#C8F060] font-mono">✓</span>
                    : <span className="text-[#2A2A2A]">—</span>}
                </td>
                <td className="px-3 py-2">
                  <StatusDot status={s.free_report_status} />
                </td>
                <td className="px-3 py-2">
                  <StatusDot status={s.full_report_status} />
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/sessions/${s.id}`}
                        className="text-[#444440] hover:text-[#C8F060] transition-colors">
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done:       "bg-[#C8F060]",
    generating: "bg-[#F0A030]",
    failed:     "bg-[#F05050]",
    pending:    "bg-[#2A2A2A]",
  }
  return (
    <div className={`w-2 h-2 rounded-full ${colors[status] ?? colors.pending}`} />
  )
}
