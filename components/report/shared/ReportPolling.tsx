// =============================================================================
// PathUp — ReportPolling
// Client component: поллит /api/report/[sid] пока отчёт не готов,
// затем делает hard redirect на страницу отчёта.
// =============================================================================

"use client"

import { useEffect, useState } from "react"
import { useRouter }           from "next/navigation"

interface Props {
  session_id: string
  status:     string
  isFull?:    boolean
}

const STEPS = [
  "Анализируем твои интересы и активности...",
  "Определяем главный барьер...",
  "Подбираем подходящие траектории...",
  "Составляем план на 7, 30 и 90 дней...",
]

export function ReportPolling({ session_id, status, isFull = false }: Props) {
  const router = useRouter()
  const [step, setStep]       = useState(0)
  const [dots, setDots]       = useState(1)
  const [attempts, setAttempts] = useState(0)

  // Animate step progression
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Poll for completion
  useEffect(() => {
    if (status === "done") {
      router.refresh()
      return
    }

    let timer: NodeJS.Timeout

    const poll = async () => {
      try {
        const res  = await fetch(`/api/report/${session_id}`)
        const data = await res.json()

        if (data.status === "done") {
          // Force full page reload to get server-rendered content
          window.location.reload()
          return
        }

        if (data.status === "failed") {
          window.location.reload()
          return
        }

        // Keep polling — max 60 attempts (~2 min)
        setAttempts((a) => a + 1)
        if (attempts < 60) {
          timer = setTimeout(poll, 2000)
        }
      } catch {
        timer = setTimeout(poll, 3000)
      }
    }

    timer = setTimeout(poll, 1500)
    return () => clearTimeout(timer)
  }, [session_id, status, attempts])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        {/* Spinner */}
        <div className="w-8 h-8 border-2 border-[#C8F060] border-t-transparent rounded-full animate-spin mb-10" />

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.slice(0, step + 1).map((s, i) => (
            <p
              key={i}
              className="text-sm text-[#888880] animate-fade-up"
              style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
            >
              {i === step ? `${s}${".".repeat(dots)}` : s}
            </p>
          ))}
        </div>

        {/* Timeout message */}
        {attempts > 30 && (
          <p className="text-xs text-[#555550] mt-8">
            Занимает чуть больше времени чем обычно...
          </p>
        )}
      </div>
    </div>
  )
}
