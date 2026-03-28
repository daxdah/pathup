"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink, CheckSquare, Square, ArrowRight } from "lucide-react"
import type { FullReport } from "@/types"
import { Analytics }      from "@/lib/analytics/track"
import { FeedbackBlock }  from "@/components/feedback/FeedbackBlock"

interface Props { report: FullReport; session_id: string }
type Section = "overview" | "path" | "7d" | "30d" | "90d" | "traps" | "resources"

export function FullReportShell({ report, session_id }: Props) {
  const [active, setActive] = useState<Section>("overview")

  const nav: { id: Section; label: string }[] = [
    { id: "overview", label: "Обзор" },
    { id: "path",     label: "Путь" },
    { id: "7d",       label: "7 дней" },
    { id: "30d",      label: "30 дней" },
    { id: "90d",      label: "90 дней" },
    { id: "traps",    label: "Ловушки" },
    ...(report.suggested_resources ? [{ id: "resources" as Section, label: "Ресурсы" }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1A1A1A] px-6 py-4 sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-[#C8F060] font-semibold text-sm tracking-tight">PathUp</span>
          <span className="text-xs text-[#444440]">Полный план</span>
        </div>
      </header>

      <div className="border-b border-[#1A1A1A] px-6 sticky top-[57px] z-30 bg-[#0A0A0A]/95 backdrop-blur-sm overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-0.5 py-2 min-w-max">
          {nav.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                active === item.id ? "bg-[#C8F060]/15 text-[#C8F060]" : "text-[#555550] hover:text-[#888880]"
              }`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {active === "overview"  && <OverviewSection  report={report} onGoToPath={() => setActive("path")} />}
        {active === "path"      && <PathSection      report={report} onGoTo7d={() => setActive("7d")} />}
        {active === "7d"        && <Plan7DSection    report={report} session_id={session_id} />}
        {active === "30d"       && <Plan30DSection   report={report} />}
        {active === "90d"       && <Plan90DSection   report={report} />}
        {active === "traps"     && <TrapsSection     report={report} />}
        {active === "resources" && report.suggested_resources && (
          <ResourcesSection resources={report.suggested_resources} />
        )}

        {/* Feedback — показывается на всех вкладках */}
        <FeedbackBlock
          session_id={session_id}
          report_id={report.report_id}
        />
      </main>
    </div>
  )
}

// ─── ОБЗОР ───────────────────────────────────────────────────────────────────

function OverviewSection({ report, onGoToPath }: { report: FullReport; onGoToPath: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="space-y-4">

      {/* 1. Что мы реально поняли */}
      <Block color="green" label="Что мы реально про тебя поняли">
        <p className="text-sm text-[#D0CCC4] leading-relaxed">{report.archetype_description}</p>
      </Block>

      {/* 2. Почему мы так решили */}
      {report.why_we_think_this && (
        <Block color="dim" label="Почему мы так решили">
          <p className="text-sm text-[#888880] leading-relaxed">{report.why_we_think_this}</p>
        </Block>
      )}

      {/* 3. Где реально застрял */}
      <Block color="orange" label="Где ты реально застрял">
        <p className="text-base font-semibold text-[#E8E4DC] mb-2">{report.primary_gap_label}</p>
        <p className="text-sm text-[#888880] leading-relaxed">{report.primary_gap_description}</p>
        {report.all_gaps.length > 1 && (
          <div className="mt-3 pt-3 border-t border-[#1A1A1A] space-y-1.5">
            {report.all_gaps.slice(1).map((g) => (
              <div key={g.gap} className="flex items-center gap-2">
                <SeverityDot severity={g.severity} />
                <span className="text-xs text-[#555550]">{g.label}</span>
              </div>
            ))}
          </div>
        )}
      </Block>

      {/* 4. Если ничего не менять */}
      {report.what_if_nothing_changes && (
        <Block color="warm" label="Что будет, если ничего не менять">
          <p className="text-sm text-[#888880] leading-relaxed">{report.what_if_nothing_changes}</p>
        </Block>
      )}

      {/* 5. Что не нужно делать */}
      {report.what_not_to_do && (
        <Block color="red" label="Что тебе сейчас не нужно делать">
          <p className="text-sm text-[#888880] leading-relaxed">{report.what_not_to_do}</p>
        </Block>
      )}

      {/* CTA */}
      <button onClick={onGoToPath}
        className="group w-full flex items-center justify-center gap-2 bg-[#C8F060]
                   text-[#0A0A0A] font-semibold px-6 py-4 rounded-2xl hover:bg-[#D8FF70]
                   transition-all text-sm mt-2">
        Смотреть лучший следующий ход
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Детали профиля — коллапс */}
      <div className="rounded-xl border border-[#1A1A1A]">
        <button onClick={() => setProfileOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left">
          <span className="text-xs text-[#444440]">Детали профиля</span>
          {profileOpen ? <ChevronUp size={13} className="text-[#444440]" /> : <ChevronDown size={13} className="text-[#444440]" />}
        </button>
        {profileOpen && (
          <div className="px-4 pb-4 border-t border-[#1A1A1A] pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#444440]">Архетип:</span>
              <span className="text-xs text-[#888880] font-medium">{report.archetype_label}</span>
            </div>
            {report.archetype_strengths?.length > 0 && (
              <div>
                <p className="text-xs text-[#444440] mb-2">Что уже работает в твою пользу</p>
                <ul className="space-y-1.5">
                  {report.archetype_strengths.map(s => (
                    <li key={s} className="flex items-start gap-2 text-xs text-[#666660]">
                      <span className="text-[#C8F060] shrink-0 mt-0.5">+</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.archetype_risks?.length > 0 && (
              <div>
                <p className="text-xs text-[#444440] mb-2">Паттерны которые стоит знать</p>
                <ul className="space-y-1.5">
                  {report.archetype_risks.map(r => (
                    <li key={r} className="flex items-start gap-2 text-xs text-[#666660]">
                      <span className="text-[#F0A030] shrink-0 mt-0.5">!</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── ПУТЬ ────────────────────────────────────────────────────────────────────

function PathSection({ report, onGoTo7d }: { report: FullReport; onGoTo7d: () => void }) {
  const primary = report.recommended_paths.find(p => p.rank === 1)
  const others  = report.recommended_paths.filter(p => p.rank !== 1)

  return (
    <div className="space-y-4">

      {/* Primary path — полностью открыт, без аккордеона */}
      {primary && (
        <div className="rounded-2xl border border-[#C8F060]/20 bg-[#0D0D0D] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8F060]" />
            <span className="text-xs text-[#C8F060] font-medium tracking-wide">Лучший следующий ход</span>
          </div>

          {/* Название пути крупно */}
          <p className="text-lg font-bold text-[#E8E4DC] mb-3 leading-snug">{primary.label}</p>

          {/* Объяснение почему именно ему */}
          <p className="text-sm text-[#888880] leading-relaxed">{primary.why_for_you}</p>
        </div>
      )}

      <button onClick={onGoTo7d}
        className="group w-full flex items-center justify-center gap-2 bg-[#C8F060]
                   text-[#0A0A0A] font-semibold px-6 py-4 rounded-2xl hover:bg-[#D8FF70]
                   transition-all text-sm">
        Смотреть план на 7 дней
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Запасные варианты */}
      {others.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs text-[#444440] px-1">Если основной не подходит</p>
          {others.map(p => (
            <Collapsible key={p.path} title={p.label} badge={`#${p.rank}`}>
              <p className="text-sm text-[#888880] leading-relaxed">{p.why_for_you}</p>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 7 ДНЕЙ ──────────────────────────────────────────────────────────────────

function Plan7DSection({ report, session_id }: { report: FullReport; session_id: string }) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    const saved = localStorage.getItem(`pathup_checks_${session_id}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const toggle = (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else { next.add(id); Analytics.actionChecked(session_id, id) }
    setChecked(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(`pathup_checks_${session_id}`, JSON.stringify([...next]))
    }
  }

  const done = [...checked].length
  const total = report.plan_7d.actions.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#888880]" />
          <span className="text-xs text-[#888880] font-medium tracking-wide">
            Что именно делать в ближайшие 7 дней
          </span>
        </div>
        {total > 0 && <span className="text-xs text-[#444440] font-mono">{done}/{total}</span>}
      </div>

      {report.plan_7d.intro && (
        <p className="text-xs text-[#555550] leading-relaxed px-1">{report.plan_7d.intro}</p>
      )}

      {report.plan_7d.actions.map((action) => {
        const isDone = checked.has(action.action_id)
        return (
          <div key={action.action_id}
            className={`p-4 rounded-xl border transition-all ${
              isDone ? "border-[#C8F060]/20 bg-[#C8F060]/5" : "border-[#1A1A1A] bg-[#0D0D0D]"
            }`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggle(action.action_id)}
                className="shrink-0 mt-0.5 text-[#444440] hover:text-[#C8F060] transition-colors">
                {isDone ? <CheckSquare size={16} className="text-[#C8F060]" /> : <Square size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-mono text-[#C8F060] bg-[#C8F060]/10 px-1.5 py-0.5 rounded">
                    день {action.day_target}
                  </span>
                  {action.is_public && (
                    <span className="text-xs text-[#555550] font-mono">публично</span>
                  )}
                </div>
                <p className={`text-sm font-medium mb-1 ${isDone ? "line-through text-[#555550]" : "text-[#E8E4DC]"}`}>
                  {action.label}
                </p>
                <p className="text-xs text-[#555550] leading-relaxed">{action.description}</p>
              </div>
              <span className="shrink-0 text-xs text-[#444440] font-mono">{action.duration_minutes}м</span>
            </div>
          </div>
        )
      })}

      {/* Что должно существовать в конце */}
      <div className="p-4 rounded-xl border border-[#C8F060]/15 bg-[#C8F060]/5">
        <p className="text-xs text-[#C8F060] font-medium mb-1.5">Что должно существовать в конце недели</p>
        <p className="text-sm text-[#888880] leading-relaxed">{report.plan_7d.main_result}</p>
      </div>
    </div>
  )
}

// ─── 30 ДНЕЙ ─────────────────────────────────────────────────────────────────

function Plan30DSection({ report }: { report: FullReport }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#888880]" />
        <span className="text-xs text-[#888880] font-medium tracking-wide">
          Какие работы должны появиться за 30 дней
        </span>
      </div>

      {report.plan_30d.intro && (
        <p className="text-xs text-[#555550] leading-relaxed px-1">{report.plan_30d.intro}</p>
      )}

      {/* Deliverables — конкретные артефакты */}
      {report.deliverables_30d?.length > 0 && (
        <div className="rounded-xl border border-[#C8F060]/15 bg-[#0D0D0D] p-4">
          <p className="text-xs text-[#C8F060] font-medium mb-3">Конкретные артефакты за месяц</p>
          <ul className="space-y-2">
            {report.deliverables_30d.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#888880]">
                <span className="text-[#C8F060] shrink-0 mt-0.5 font-mono text-xs">{i + 1}.</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.plan_30d.phases.map((phase) => (
        <div key={phase.week}
          className={`p-4 rounded-xl border ${
            phase.is_review_week ? "border-[#C8F060]/15 bg-[#C8F060]/3" : "border-[#1A1A1A] bg-[#0D0D0D]"
          }`}>
          <div className="flex items-start gap-3">
            <span className="text-xs font-mono text-[#555550] shrink-0 pt-0.5 w-8">нед {phase.week}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold">{phase.theme}</span>
                {phase.is_review_week && (
                  <span className="text-xs font-mono text-[#C8F060] bg-[#C8F060]/10 px-1.5 py-0.5 rounded">ревизия</span>
                )}
              </div>
              <p className="text-xs text-[#888880] mb-2 leading-relaxed">{phase.focus}</p>
              <p className="text-xs text-[#555550]">
                <span className="text-[#444440]">итог: </span>{phase.milestone}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
        <p className="text-xs text-[#444440] mb-1.5">Milestone месяца</p>
        <p className="text-sm text-[#888880] leading-relaxed">{report.plan_30d.milestone}</p>
      </div>
    </div>
  )
}

// ─── 90 ДНЕЙ ─────────────────────────────────────────────────────────────────

function Plan90DSection({ report }: { report: FullReport }) {
  const { quarter } = report.plan_90d

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#888880]" />
        <span className="text-xs text-[#888880] font-medium tracking-wide">
          Какие доказательства роста должны появиться за 90 дней
        </span>
      </div>

      <div className="p-5 rounded-2xl border border-[#C8F060]/20 bg-[#C8F060]/5">
        <p className="text-xs text-[#C8F060] font-medium mb-2">Главная цель квартала</p>
        <p className="text-base font-semibold leading-snug">{quarter.anchor_goal}</p>
      </div>

      {/* Proof of progress */}
      {report.proof_of_progress?.length > 0 && (
        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4">
          <p className="text-xs text-[#444440] mb-3">Как понять что план реально работает</p>
          <ul className="space-y-2">
            {report.proof_of_progress.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#888880]">
                <span className="text-[#555550] shrink-0 mt-0.5 font-mono text-xs">→</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {quarter.months.map((month) => (
        <div key={month.month} className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
          <div className="flex items-start gap-3">
            <span className="text-xs font-mono text-[#555550] shrink-0 pt-0.5">м{month.month}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1.5">{month.goal}</p>
              <div className="flex flex-wrap gap-1.5">
                {month.key_activities.map(a => (
                  <span key={a} className="text-xs text-[#555550] bg-[#1A1A1A] px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
        <p className="text-xs text-[#444440] mb-1.5">Как понять что квартал удался</p>
        <p className="text-sm text-[#888880] leading-relaxed">{report.plan_90d.success_criteria}</p>
      </div>

      <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
        <p className="text-xs text-[#444440] mb-1.5">Еженедельный ритуал</p>
        <p className="text-sm text-[#888880] leading-relaxed">{quarter.weekly_ritual}</p>
      </div>

      <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
        <p className="text-xs text-[#444440] mb-3">Вопросы для ретроспективы</p>
        <ol className="space-y-2">
          {quarter.retrospective_prompts.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#888880]">
              <span className="text-[#555550] shrink-0 font-mono text-xs">{i + 1}.</span>{q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ─── ЛОВУШКИ ─────────────────────────────────────────────────────────────────

function TrapsSection({ report }: { report: FullReport }) {
  return (
    <div className="space-y-4">

      {/* Что не нужно делать — главный блок */}
      {report.what_not_to_do && (
        <div className="rounded-2xl border border-[#F05050]/15 bg-[#0D0D0D] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F05050]" />
            <span className="text-xs text-[#F05050] font-medium tracking-wide">
              Что тебе сейчас не нужно делать
            </span>
          </div>
          <p className="text-sm text-[#D0CCC4] leading-relaxed">{report.what_not_to_do}</p>
        </div>
      )}

      {/* Ловушки — паттерны срыва */}
      {report.anti_mistakes.length > 0 && (
        <div>
          <p className="text-xs text-[#444440] px-1 mb-3">Паттерны которые обычно ломают план</p>
          <div className="space-y-3">
            {report.anti_mistakes.map((m, i) => (
              <div key={m.mistake} className={`p-5 rounded-xl border bg-[#0D0D0D] ${
                i === 0 ? "border-[#F0A030]/20" : "border-[#1A1A1A]"
              }`}>
                {/* Label как паттерн — не категория */}
                <div className="flex items-center gap-2 mb-2">
                  {i === 0 && <div className="w-1 h-1 rounded-full bg-[#F0A030]" />}
                  <p className="text-sm font-semibold text-[#E8E4DC]">{m.label}</p>
                </div>
                {/* Personalised warning — механизм + правило */}
                <p className="text-sm text-[#888880] leading-relaxed">{m.personalised_warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── РЕСУРСЫ ─────────────────────────────────────────────────────────────────

function ResourcesSection({ resources }: { resources: NonNullable<FullReport["suggested_resources"]> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#888880]" />
        <span className="text-xs text-[#888880] font-medium tracking-wide">
          Ресурсы — не каталог, а маршрут
        </span>
      </div>
      <p className="text-xs text-[#555550] px-1 leading-relaxed">
        Только то что реально нужно для этого пути — и объяснение зачем.
      </p>
      {resources.map(r => (
        <div key={r.title} className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
          <div className="flex items-start gap-3">
            <span className="text-xs font-mono text-[#444440] bg-[#1A1A1A] px-1.5 py-0.5 rounded mt-0.5 shrink-0 whitespace-nowrap">
              {r.type}
            </span>
            <div className="flex-1">
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#E8E4DC] hover:text-[#C8F060] transition-colors inline-flex items-center gap-1 mb-2">
                  {r.title}<ExternalLink size={11} />
                </a>
              ) : (
                <p className="text-sm font-semibold text-[#E8E4DC] mb-2">{r.title}</p>
              )}
              {/* relevance теперь отображается крупнее — это главное */}
              <p className="text-sm text-[#888880] leading-relaxed">{r.relevance}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Shared ──────────────────────────────────────────────────────────────────

const BLOCK_COLORS = {
  green:  { dot: "bg-[#C8F060]",      border: "border-[#C8F060]/15",    label: "text-[#C8F060]"  },
  orange: { dot: "bg-[#F0A030]",      border: "border-[#F0A030]/15",    label: "text-[#F0A030]"  },
  red:    { dot: "bg-[#F05050]",      border: "border-[#F05050]/10",    label: "text-[#F05050]"  },
  warm:   { dot: "bg-[#F0A030]/60",   border: "border-[#3A2A1A]",       label: "text-[#888860]"  },
  dim:    { dot: "bg-[#888880]",      border: "border-[#2A2A2A]",       label: "text-[#888880]"  },
} as const

function Block({ color, label, children }: {
  color: keyof typeof BLOCK_COLORS
  label: string
  children: React.ReactNode
}) {
  const c = BLOCK_COLORS[color]
  return (
    <div className={`rounded-2xl border ${c.border} bg-[#0D0D0D] p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        <span className={`text-xs font-medium tracking-wide ${c.label}`}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function SeverityDot({ severity }: { severity: "critical" | "moderate" | "minor" }) {
  const c = { critical: "bg-[#F05050]", moderate: "bg-[#F0A030]", minor: "bg-[#555550]" }
  return <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c[severity]}`} />
}

function Collapsible({ title, badge, children }: {
  title: string; badge: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#111111] transition-colors">
        <span className="text-xs font-mono text-[#444440] shrink-0">{badge}</span>
        <span className="flex-1 text-sm text-[#888880]">{title}</span>
        {open ? <ChevronUp size={13} className="text-[#444440]" /> : <ChevronDown size={13} className="text-[#444440]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-[#1A1A1A]">{children}</div>
      )}
    </div>
  )
}
