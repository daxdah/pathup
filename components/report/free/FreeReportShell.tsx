"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { FreeReport } from "@/types"

interface FreeReportShellProps {
  report: FreeReport
  session_id: string
  price: string
}

export function FreeReportShell({ report, session_id }: FreeReportShellProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="px-6 py-5">
        <div className="max-w-xl mx-auto">
          <span className="text-[#C8F060] font-semibold text-sm tracking-tight">PathUp</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pb-16 space-y-4">
        <p className="text-[#555550] text-sm pt-2">Вот что мы про тебя поняли.</p>

        {/* Блок 1: Наблюдение */}
        <InsightBlock description={report.archetype_description} />

        {/* Блок 2: Что тормозит */}
        <GapBlock label={report.primary_gap_label} description={report.primary_gap_description} />

        {/* Блок 3: Если ничего не менять — ВСЕГДА ВИДИМ */}
        {report.what_if_nothing_changes && (
          <WhatIfBlock text={report.what_if_nothing_changes} />
        )}

        {/* Блок 4: Первые шаги */}
        <StepBlock actions={report.plan_7d_preview} pathLabel={report.top_path_label} />

        {/* CTA */}
        <div className="pt-2 space-y-3">
          <a
            href={`/report/${session_id}/full`}
            className="group flex items-center justify-center gap-2 bg-[#C8F060]
                       text-[#0A0A0A] font-semibold px-6 py-4 rounded-2xl
                       hover:bg-[#D8FF70] transition-all w-full text-sm"
          >
            Смотреть полный план
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-center text-xs text-[#444440]">
            7 дней · 30 дней · 90 дней · конкретные артефакты · ловушки
          </p>
        </div>

        <div className="text-center pt-2">
          <Link href={`/for-parents?ref=${session_id}`}
            className="text-xs text-[#444440] hover:text-[#666660] transition-colors">
            Показать родителям →
          </Link>
        </div>
      </main>
    </div>
  )
}

function InsightBlock({ description }: { description: string }) {
  return (
    <div className="rounded-2xl border border-[#C8F060]/15 bg-[#0D0D0D] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C8F060]" />
        <span className="text-xs text-[#C8F060] font-medium tracking-wide">Что мы увидели</span>
      </div>
      <p className="text-sm text-[#D0CCC4] leading-relaxed">{description}</p>
    </div>
  )
}

function GapBlock({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#F0A030]/15 bg-[#0D0D0D] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F0A030]" />
        <span className="text-xs text-[#F0A030] font-medium tracking-wide">Что тебя тормозит</span>
      </div>
      <p className="text-base font-semibold text-[#E8E4DC] mb-2">{label}</p>
      <p className="text-sm text-[#888880] leading-relaxed">{description}</p>
    </div>
  )
}

function WhatIfBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#3A2A1A] bg-[#0D0D0D] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F0A030]/60" />
        <span className="text-xs text-[#888860] font-medium tracking-wide">Если ничего не менять</span>
      </div>
      <p className="text-sm text-[#888880] leading-relaxed">{text}</p>
    </div>
  )
}

function StepBlock({ actions, pathLabel }: {
  actions: FreeReport["plan_7d_preview"]
  pathLabel: string
}) {
  const first = actions[0]
  const second = actions[1]
  if (!first) return null
  return (
    <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#888880]" />
          <span className="text-xs text-[#888880] font-medium tracking-wide">Первый конкретный шаг</span>
        </div>
        <span className="text-xs text-[#444440] font-mono">{pathLabel}</span>
      </div>

      <ActionRow action={first} highlight />
      {second && (
        <div className="border-t border-[#1A1A1A] pt-4">
          <ActionRow action={second} highlight={false} />
        </div>
      )}
    </div>
  )
}

function ActionRow({ action, highlight }: {
  action: FreeReport["plan_7d_preview"][number]
  highlight: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 ${
        highlight
          ? "text-[#C8F060] bg-[#C8F060]/10"
          : "text-[#888880] bg-[#1A1A1A]"
      }`}>
        д{action.day_target}
      </span>
      <div className="flex-1">
        <p className={`text-sm font-semibold mb-1 ${highlight ? "text-[#E8E4DC]" : "text-[#888880]"}`}>
          {action.label}
        </p>
        <p className="text-xs text-[#555550] leading-relaxed">{action.description}</p>
      </div>
      <span className="shrink-0 text-xs text-[#444440] font-mono">{action.duration_minutes}м</span>
    </div>
  )
}
