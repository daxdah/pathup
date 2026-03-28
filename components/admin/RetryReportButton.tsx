// =============================================================================
// PathUp — Retry Report Button
// Кнопка для принудительной регенерации отчёта из admin панели.
// =============================================================================

"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"

interface Props {
  sessionId:  string
  reportType: "free" | "full"
  disabled?:  boolean
}

type State = "idle" | "loading" | "success" | "error"

export function RetryReportButton({ sessionId, reportType, disabled }: Props) {
  const [state, setState]   = useState<State>("idle")
  const [message, setMessage] = useState("")

  async function handleRetry() {
    setState("loading")
    setMessage("")

    try {
      const res = await fetch("/api/admin/retry-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, report_type: reportType }),
      })

      const data = await res.json()

      if (res.ok) {
        setState("success")
        setMessage("Регенерация запущена")
        // Reset after 3s
        setTimeout(() => setState("idle"), 3000)
      } else {
        setState("error")
        setMessage(data.error ?? "Ошибка")
        setTimeout(() => setState("idle"), 4000)
      }
    } catch {
      setState("error")
      setMessage("Сеть недоступна")
      setTimeout(() => setState("idle"), 4000)
    }
  }

  const labels: Record<State, string> = {
    idle:    `Regenerate ${reportType}`,
    loading: "Запуск...",
    success: "Запущено",
    error:   "Ошибка",
  }

  const icons: Record<State, React.ReactNode> = {
    idle:    <RefreshCw size={11} />,
    loading: <RefreshCw size={11} className="animate-spin" />,
    success: <Check     size={11} className="text-[#C8F060]" />,
    error:   <AlertCircle size={11} className="text-[#F05050]" />,
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleRetry}
        disabled={disabled || state === "loading"}
        className="flex items-center gap-1.5 text-xs border border-[#2A2A2A] px-3 py-1.5
                   rounded-lg text-[#888880] hover:text-[#E8E4DC] hover:border-[#3A3A3A]
                   transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {icons[state]}
        {labels[state]}
      </button>
      {message && (
        <p className={`text-xs ${state === "error" ? "text-[#F05050]" : "text-[#555550]"}`}>
          {message}
        </p>
      )}
    </div>
  )
}
