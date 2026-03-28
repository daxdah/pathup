// =============================================================================
// PathUp — Admin Layout
// Обёртка для всех admin страниц.
// Middleware уже проверил токен — здесь просто UI shell.
// =============================================================================

import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Admin nav */}
      <nav className="border-b border-[#1A1A1A] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[#C8F060] font-mono text-sm font-semibold">
              PathUp Admin
            </span>
            <div className="flex gap-4">
              {[
                { href: "/admin",          label: "Обзор"    },
                { href: "/admin/sessions", label: "Сессии"   },
                { href: "/admin/feedback", label: "Фидбэк"   },
                { href: "/admin/reports",  label: "Отчёты"   },
                { href: "/admin/config",   label: "Настройки"},
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-[#555550] hover:text-[#888880] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-[#555550] hover:text-[#888880] transition-colors"
            >
              Выйти
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
