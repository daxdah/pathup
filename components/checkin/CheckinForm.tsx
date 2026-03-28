"use client"

import { useState } from "react"
import { CheckSquare, Square, ArrowRight } from "lucide-react"
import type { Action } from "@/types"

interface Props {
  session_id: string
  actions:    Action[]
}

export function CheckinForm({ session_id, actions }: Props) {
  const [checked,  setChecked]  = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<string | null>(null)
  const [reason,   setReason]   = useState<string>("")

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch(`/api/checkin/${session_id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          session_id,
          completed_action_ids: [...checked],
          reason_if_empty:      checked.size === 0 ? reason || undefined : undefined,
        }),
      })
      const data = await res.json()
      setResult(data.follow_up_message ?? "Спасибо. Двигаемся дальше.")
    } catch {
      setResult("Что-то пошло не так. Но прогресс зафиксирован.")
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-xl border border-[#C8F060]/20 bg-[#C8F060]/5">
          <p className="text-sm text-[#888880] leading-relaxed">{result}</p>
        </div>
        <a
          href={`/report/${session_id}/full`}
          className="inline-flex items-center gap-2 text-sm text-[#888880]
                     hover:text-[#E8E4DC] transition-colors"
        >
          Открыть план → 
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action checklist */}
      {actions.length > 0 ? (
        <div className="space-y-2">
          {actions.map((action: Action) => {
            const done = checked.has(action.action_id)
            return (
              <button
                key={action.action_id}
                onClick={() => toggle(action.action_id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  done
                    ? "border-[#C8F060]/30 bg-[#C8F060]/5"
                    : "border-[#1A1A1A] bg-[#0F0F0F] hover:border-[#2A2A2A]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {done
                      ? <CheckSquare size={15} className="text-[#C8F060]" />
                      : <Square      size={15} className="text-[#444440]" />
                    }
                  </div>
                  <p className={`text-sm ${done ? "text-[#888880] line-through" : "text-[#E8E4DC]"}`}>
                    {action.label}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[#555550]">Действия из плана не найдены.</p>
      )}

      {/* Reason if nothing done */}
      {checked.size === 0 && actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#555550]">Что помешало?</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "no_time",       label: "Не было времени"   },
              { value: "too_hard",      label: "Показалось сложным"},
              { value: "lost_interest", label: "Потерял интерес"   },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReason(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  reason === opt.value
                    ? "border-[#C8F060]/40 bg-[#C8F060]/10 text-[#C8F060]"
                    : "border-[#2A2A2A] text-[#555550] hover:border-[#3A3A3A]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A] font-semibold
                   px-6 py-3 rounded-xl hover:bg-[#D8FF70] transition-all
                   disabled:opacity-40 text-sm"
      >
        {loading ? "Отправка..." : "Отправить"}
        {!loading && <ArrowRight size={14} />}
      </button>
    </div>
  )
}
