// =============================================================================
// PathUp — /admin/feedback
// Просмотр всех отзывов в табличной структуре
// =============================================================================

import { redirect }    from "next/navigation"
import { cookies }     from "next/headers"
import db from "@/lib/db/client"

export default async function AdminFeedbackPage() {
  // Auth check
  const token = cookies().get("admin_token")?.value
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login")

  const feedbacks = await db.feedback.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
  })

  const avg = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.score_relevance, 0) / feedbacks.length).toFixed(1)
    : "—"

  const recommendPct = feedbacks.length > 0
    ? Math.round(feedbacks.filter(f => f.would_recommend).length / feedbacks.length * 100)
    : 0

  const publicCount = feedbacks.filter(f => f.allow_public).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#E8E4DC]">Фидбэк</h1>
        <span className="text-xs text-[#555550]">{feedbacks.length} отзывов</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Средняя оценка" value={`${avg} / 10`} />
        <StatCard label="Рекомендуют" value={`${recommendPct}%`} />
        <StatCard label="Разрешили публично" value={String(publicCount)} />
      </div>

      {/* Table */}
      {feedbacks.length === 0 ? (
        <p className="text-sm text-[#555550]">Пока нет отзывов.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A] text-[#555550]">
                {["Дата", "Оценка", "Полезно", "Слабо", "Непонятно", "Чего не хватило",
                  "Рекоменд.", "Публично", "Telegram", "Архетип", "Gap", "Класс"
                ].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(f => (
                <tr key={f.id} className="border-b border-[#0F0F0F] hover:bg-[#111111]">
                  <td className="py-2 pr-4 text-[#555550] whitespace-nowrap">
                    {new Date(f.created_at).toLocaleDateString("ru-RU", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`font-mono font-bold ${
                      f.score_relevance >= 8 ? "text-[#C8F060]"
                      : f.score_relevance >= 5 ? "text-[#F0A030]"
                      : "text-[#F05050]"
                    }`}>{f.score_relevance}</span>
                  </td>
                  <td className="py-2 pr-4 max-w-[180px]">
                    <TruncatedCell text={f.most_useful} />
                  </td>
                  <td className="py-2 pr-4 max-w-[180px]">
                    <TruncatedCell text={f.most_weak} />
                  </td>
                  <td className="py-2 pr-4 max-w-[140px]">
                    <TruncatedCell text={f.confusing || "—"} />
                  </td>
                  <td className="py-2 pr-4 max-w-[140px]">
                    <TruncatedCell text={f.missing || "—"} />
                  </td>
                  <td className="py-2 pr-4">
                    {f.would_recommend
                      ? <span className="text-[#C8F060]">да</span>
                      : <span className="text-[#F05050]">нет</span>}
                  </td>
                  <td className="py-2 pr-4">
                    {f.allow_public
                      ? <span className="text-[#888880]">да</span>
                      : <span className="text-[#444440]">нет</span>}
                  </td>
                  <td className="py-2 pr-4 text-[#888880]">{f.telegram || "—"}</td>
                  <td className="py-2 pr-4 text-[#555550] font-mono">{f.archetype || "—"}</td>
                  <td className="py-2 pr-4 text-[#555550] font-mono text-[10px]">{f.primary_gap || "—"}</td>
                  <td className="py-2 pr-4 text-[#555550]">{f.grade || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
      <p className="text-xs text-[#555550] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#E8E4DC]">{value}</p>
    </div>
  )
}

function TruncatedCell({ text }: { text: string }) {
  return (
    <p className="text-[#888880] leading-relaxed" title={text}>
      {text.length > 80 ? text.slice(0, 80) + "…" : text}
    </p>
  )
}
