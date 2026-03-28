"use client"

import { useState } from "react"

interface Props {
  session_id: string
  report_id?: string
}

type Step = "cta" | "form" | "done"

export function FeedbackBlock({ session_id, report_id }: Props) {
  const [step, setStep] = useState<Step>("cta")

  if (step === "done") return <DoneState />
  if (step === "form") return (
    <FeedbackForm
      session_id={session_id}
      report_id={report_id}
      onDone={() => setStep("done")}
      onDismiss={() => setStep("cta")}
    />
  )

  return (
    <div className="mt-12 pt-8 border-t border-[#1A1A1A]">
      <div className="max-w-md">
        <p className="text-sm text-[#888880] mb-1">
          Помоги улучшить PathUp — займёт около минуты.
        </p>
        <p className="text-xs text-[#555550] mb-4">
          Мне важен честный фидбэк: что было полезно, что показалось слабым и чего не хватило.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("form")}
            className="text-sm bg-[#1A1A1A] text-[#E8E4DC] px-4 py-2.5 rounded-xl
                       hover:bg-[#222222] transition-all border border-[#2A2A2A] font-medium"
          >
            Оставить отзыв
          </button>
          <a
            href="https://t.me/daxdah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#555550] hover:text-[#888880] transition-colors"
          >
            или напиши в Telegram: @daxdah
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Форма ────────────────────────────────────────────────────────────────────

function FeedbackForm({ session_id, report_id, onDone, onDismiss }: {
  session_id: string
  report_id?: string
  onDone: () => void
  onDismiss: () => void
}) {
  const [score, setScore]       = useState<number | null>(null)
  const [useful, setUseful]     = useState("")
  const [weak, setWeak]         = useState("")
  const [confusing, setConfusing] = useState("")
  const [missing, setMissing]   = useState("")
  const [recommend, setRecommend] = useState<boolean | null>(null)
  const [allowPublic, setAllowPublic] = useState(false)
  const [telegram, setTelegram] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const canSubmit = score !== null && useful.trim().length > 0
    && weak.trim().length > 0 && recommend !== null

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          report_id,
          score_relevance: score,
          most_useful: useful.trim(),
          most_weak: weak.trim(),
          confusing: confusing.trim(),
          missing: missing.trim(),
          would_recommend: recommend,
          allow_public: allowPublic,
          telegram: telegram.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      onDone()
    } catch {
      setError("Что-то пошло не так. Попробуй ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-[#1A1A1A]">
      <div className="max-w-lg space-y-5">
        <div>
          <p className="text-sm font-medium text-[#E8E4DC] mb-0.5">
            Помоги улучшить PathUp
          </p>
          <p className="text-xs text-[#555550]">
            Честный отзыв — лучшее что ты можешь сделать для продукта.
          </p>
        </div>

        {/* Score */}
        <div>
          <label className="text-xs text-[#888880] block mb-2">
            Насколько отчёт был "про тебя"? (1 — совсем нет, 10 — точно в цель)
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                  score === n
                    ? "bg-[#C8F060] text-[#0A0A0A]"
                    : "bg-[#1A1A1A] text-[#888880] hover:bg-[#222222]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Most useful */}
        <TextField
          label="Что было самым полезным?"
          value={useful}
          onChange={setUseful}
          placeholder="Например: блок 'если ничего не менять', конкретные шаги, точность описания..."
          required
        />

        {/* Most weak */}
        <TextField
          label="Что показалось слишком общим, шаблонным или слабым?"
          value={weak}
          onChange={setWeak}
          placeholder="Говори честно — это помогает улучшить продукт"
          required
        />

        {/* Confusing */}
        <TextField
          label="Что было непонятно или лишнее? (необязательно)"
          value={confusing}
          onChange={setConfusing}
          placeholder="Если ничего — можно пропустить"
        />

        {/* Missing */}
        <TextField
          label="Чего ты ожидал увидеть, но не увидел? (необязательно)"
          value={missing}
          onChange={setMissing}
          placeholder="Что было бы полезно добавить"
        />

        {/* Recommend */}
        <div>
          <label className="text-xs text-[#888880] block mb-2">
            Посоветовал бы PathUp другу?
          </label>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button
                key={String(v)}
                onClick={() => setRecommend(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  recommend === v
                    ? v ? "bg-[#C8F060]/20 text-[#C8F060] border border-[#C8F060]/30"
                        : "bg-[#F05050]/10 text-[#F05050] border border-[#F05050]/20"
                    : "bg-[#1A1A1A] text-[#888880] border border-[#1A1A1A] hover:border-[#2A2A2A]"
                }`}
              >
                {v ? "Да" : "Нет"}
              </button>
            ))}
          </div>
        </div>

        {/* Allow public */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => setAllowPublic(v => !v)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              allowPublic ? "border-[#C8F060] bg-[#C8F060]" : "border-[#3A3A3A]"
            }`}
          >
            {allowPublic && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <p className="text-xs text-[#888880] leading-relaxed">
            Разрешаю использовать этот отзыв публично (без имени и контактов)
          </p>
        </div>

        {/* Telegram */}
        <div>
          <label className="text-xs text-[#888880] block mb-2">
            Telegram для связи (необязательно)
          </label>
          <input
            value={telegram}
            onChange={e => setTelegram(e.target.value)}
            placeholder="@username"
            className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-2.5
                       text-sm text-[#E8E4DC] placeholder:text-[#444440]
                       focus:outline-none focus:border-[#C8F060] transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-[#F05050]">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="bg-[#C8F060] text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-xl
                       hover:bg-[#D8FF70] transition-all disabled:opacity-40
                       disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Отправляем..." : "Отправить отзыв"}
          </button>
          <button
            onClick={onDismiss}
            className="text-xs text-[#444440] hover:text-[#666660] transition-colors"
          >
            Отмена
          </button>
        </div>

        <p className="text-xs text-[#444440]">
          Есть идея или жёсткий фидбэк — напиши напрямую:{" "}
          <a href="https://t.me/daxdah" target="_blank" rel="noopener noreferrer"
            className="text-[#555550] hover:text-[#888880] transition-colors">
            @daxdah
          </a>
        </p>
      </div>
    </div>
  )
}

// ─── Done state ───────────────────────────────────────────────────────────────

function DoneState() {
  return (
    <div className="mt-12 pt-8 border-t border-[#1A1A1A]">
      <p className="text-sm text-[#C8F060] font-medium mb-1">Спасибо — это реально помогает.</p>
      <p className="text-xs text-[#555550]">
        Если хочешь обсудить лично —{" "}
        <a href="https://t.me/daxdah" target="_blank" rel="noopener noreferrer"
          className="text-[#888880] hover:text-[#E8E4DC] transition-colors">
          @daxdah
        </a>
      </p>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function TextField({ label, value, onChange, placeholder, required }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-[#888880] block mb-2">
        {label}{required && <span className="text-[#F05050] ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3
                   text-sm text-[#E8E4DC] placeholder:text-[#444440] resize-none
                   focus:outline-none focus:border-[#C8F060] transition-colors leading-relaxed"
      />
    </div>
  )
}
