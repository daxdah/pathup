// =============================================================================
// PathUp — Parent Report Shell
// Отчёт для родителей. Другой тон, другие акценты.
// Без архетип-жаргона. Поведенческие описания. Конкретные советы.
// =============================================================================

import { Heart, Info, HelpCircle, X, CheckCircle } from "lucide-react"
import type { ParentReport } from "@/types"

interface ParentReportShellProps {
  report: ParentReport
}

export function ParentReportShell({ report }: ParentReportShellProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-[#C8F060] font-semibold text-sm">PathUp</span>
          <span className="text-xs text-[#555550]">Для родителей</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Important note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#2A2A2A] bg-[#111111]">
          <Info size={14} className="text-[#888880] mt-0.5 shrink-0" />
          <p className="text-xs text-[#888880] leading-relaxed">{report.note}</p>
        </div>

        {/* Who is your child */}
        <Section
          icon={<Heart size={14} className="text-[#C8F060]" />}
          accent="#C8F060"
          label="Кто ваш ребёнок"
        >
          <div className="p-5 rounded-xl border border-[#C8F060]/20 bg-[#0F0F0F]">
            <p className="text-xs font-mono text-[#555550] mb-2">{report.child_archetype_label}</p>
            <p className="text-sm text-[#888880] leading-relaxed">
              {report.child_archetype_for_parent}
            </p>
          </div>
        </Section>

        {/* Primary challenge */}
        <Section
          icon={<Info size={14} className="text-[#F0A030]" />}
          accent="#F0A030"
          label="Главная сложность прямо сейчас"
        >
          <div className="p-5 rounded-xl border border-[#F0A030]/20 bg-[#0F0F0F]">
            <p className="text-sm text-[#888880] leading-relaxed">{report.primary_challenge}</p>
          </div>
        </Section>

        {/* What child needs */}
        <Section
          icon={<CheckCircle size={14} className="text-[#888880]" />}
          accent="#888880"
          label="Что нужно ребёнку прямо сейчас"
        >
          <p className="text-sm text-[#888880] leading-relaxed p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
            {report.what_child_needs}
          </p>
        </Section>

        {/* Plan summaries */}
        <Section
          icon={null}
          accent="#555550"
          label="Что ребёнок делает по плану"
        >
          <div className="space-y-3">
            <PlanCard
              label="Эта неделя"
              text={report.plan_7d_summary}
            />
            <PlanCard
              label="Этот месяц"
              text={report.plan_30d_summary}
            />
            <PlanCard
              label="Цель квартала"
              text={report.plan_90d_goal}
              highlight
            />
          </div>
        </Section>

        {/* Pressure warning */}
        {report.pressure_warning && (
          <div className="flex items-start gap-3 p-5 rounded-xl border border-[#F0A030]/30 bg-[#F0A030]/5">
            <Info size={14} className="text-[#F0A030] mt-0.5 shrink-0" />
            <p className="text-sm text-[#888880] leading-relaxed">{report.pressure_warning}</p>
          </div>
        )}

        {/* How to support */}
        <Section
          icon={<CheckCircle size={14} className="text-[#C8F060]" />}
          accent="#C8F060"
          label="Как помочь — три конкретных действия"
        >
          <div className="space-y-3">
            {report.how_to_support.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]"
              >
                <span className="text-xs font-mono text-[#C8F060] bg-[#C8F060]/10 px-1.5 py-0.5 rounded shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-[#888880] leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What NOT to do */}
        <Section
          icon={<X size={14} className="text-[#F05050]" />}
          accent="#F05050"
          label="Что лучше не делать"
        >
          <div className="space-y-2">
            {report.what_not_to_do.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]"
              >
                <X size={12} className="text-[#555550] mt-0.5 shrink-0" />
                <p className="text-sm text-[#888880] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Check-in questions */}
        <Section
          icon={<HelpCircle size={14} className="text-[#888880]" />}
          accent="#888880"
          label="Вопросы для разговора раз в неделю"
        >
          <div className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] space-y-4">
            <p className="text-xs text-[#555550] mb-4">
              Открытые вопросы без ожидания «правильного» ответа.
            </p>
            {report.check_in_questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#555550] font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-sm text-[#888880]">{q}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer disclaimer */}
        <div className="pt-4 border-t border-[#1A1A1A]">
          <p className="text-xs text-[#444440] leading-relaxed text-center">
            PathUp — инструмент планирования, не психологическая помощь.
            <br />
            Этот отчёт основан на анкете которую заполнил ваш ребёнок.
          </p>
        </div>
      </main>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function Section({
  icon,
  accent,
  label,
  children,
}: {
  icon: React.ReactNode | null
  accent: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs uppercase tracking-widest text-[#555550]">{label}</p>
      </div>
      {children}
    </div>
  )
}

function PlanCard({
  label,
  text,
  highlight,
}: {
  label: string
  text: string
  highlight?: boolean
}) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "border-[#C8F060]/20 bg-[#C8F060]/5" : "border-[#1A1A1A] bg-[#0F0F0F]"}`}>
      <p className={`text-xs font-mono mb-1.5 ${highlight ? "text-[#C8F060]" : "text-[#555550]"}`}>
        {label}
      </p>
      <p className="text-sm text-[#888880] leading-relaxed">{text}</p>
    </div>
  )
}
