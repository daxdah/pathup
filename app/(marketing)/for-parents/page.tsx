// =============================================================================
// PathUp — /for-parents
// Лендинг для родителей. Другой тон, другие акценты.
// =============================================================================

import Link        from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Для родителей — PathUp",
  description: "PathUp строит персональный план развития для школьников 14–18 лет. " +
               "Вы получаете отдельный отчёт — что происходит и как поддержать.",
}

const PRICE = process.env.NEXT_PUBLIC_PRICE_RUB ?? "790"

export default function ForParentsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="px-6 py-5 border-b border-[#1A1A1A]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#C8F060] font-semibold text-sm">PathUp</Link>
          <Link href="/start" className="text-xs text-[#555550] hover:text-[#888880] transition-colors">
            Для школьников →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <section className="py-20">
          <p className="text-xs uppercase tracking-widest text-[#555550] mb-6">
            Для родителей
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Ваш ребёнок не ленится.
            <br />
            <span className="text-[#888880] font-normal">Ему не хватает структуры.</span>
          </h1>
          <p className="text-lg text-[#888880] leading-relaxed max-w-xl mb-10">
            PathUp строит персональный план развития для школьников 14–18 лет
            на основе их реальной ситуации — не советов в интернете.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Link
              href="/start"
              className="group inline-flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A]
                         font-semibold px-7 py-3.5 rounded-xl hover:bg-[#D8FF70] transition-all"
            >
              Подарить ребёнку план
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-sm text-[#555550] self-center">
              Ребёнок проходит анкету сам — {PRICE}₽
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="py-12 border-t border-[#1A1A1A]">
          <p className="text-xs uppercase tracking-widest text-[#555550] mb-8">
            Что получает ребёнок
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Диагностика",    "Архетип и главный барьер — не психологический ярлык, а поведенческое описание"],
              ["План на 7 дней", "3–5 конкретных действий с временем и днём выполнения"],
              ["План на 30 дней","4 недели с milestone на каждую"],
              ["Plan на 90 дней","Одна anchor-цель квартала + еженедельный ритуал"],
            ].map(([title, desc]) => (
              <div key={title} className="p-5 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-[#555550] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-12 border-t border-[#1A1A1A]">
          <p className="text-xs uppercase tracking-widest text-[#555550] mb-8">
            Почему это работает иначе
          </p>
          <div className="space-y-4 max-w-xl">
            {[
              "Ребёнок отвечает на вопросы о реальных действиях, а не о мечтах",
              "Система принимает решения на основе логики, а не ИИ-советов",
              "План под конкретную ситуацию — не универсальный список курсов",
              "Никакого давления: результат честный, тон уважительный",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <Check size={14} className="text-[#C8F060] mt-0.5 shrink-0" />
                <span className="text-[#888880]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Important note */}
        <section className="py-12 border-t border-[#1A1A1A]">
          <div className="p-5 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] max-w-xl">
            <p className="text-xs font-mono text-[#555550] mb-2">Важно</p>
            <p className="text-sm text-[#888880] leading-relaxed">
              Ребёнок видит свой отчёт первым. Мы не передаём родителям ответы на вопросы анкеты —
              только план и рекомендации по поддержке.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-[#1A1A1A]">
          <h2 className="text-2xl font-bold mb-3">
            Пусть ребёнок пройдёт анкету сам.
          </h2>
          <p className="text-sm text-[#555550] mb-8">
            5 минут. Результат сразу. Полный план — {PRICE}₽.
          </p>
          <Link
            href="/start"
            className="group inline-flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A]
                       font-semibold px-8 py-4 rounded-xl hover:bg-[#D8FF70] transition-all"
          >
            Перейти к анкете
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </section>

      </main>

      <footer className="border-t border-[#1A1A1A] px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-[#444440]">
          <span>PathUp — инструмент планирования, не психологическая помощь</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#555550] transition-colors">Конфиденциальность</Link>
            <Link href="/terms"   className="hover:text-[#555550] transition-colors">Условия</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
