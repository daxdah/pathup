// =============================================================================
// PathUp — Admin Login
// Простая форма ввода секрета. Устанавливает httpOnly cookie.
// =============================================================================

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AdminLoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get("from") ?? "/admin"

  const [secret, setSecret]   = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    })

    if (res.ok) {
      router.push(from)
    } else {
      setError("Неверный секрет")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[#C8F060] font-mono text-sm mb-8">PathUp Admin</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret"
              autoFocus
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3
                         text-sm text-[#E8E4DC] placeholder:text-[#444440]
                         focus:outline-none focus:border-[#C8F060] transition-colors font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-[#F05050]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full bg-[#C8F060] text-[#0A0A0A] font-semibold py-3 rounded-xl
                       hover:bg-[#D8FF70] transition-all disabled:opacity-40 text-sm"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  )
}
