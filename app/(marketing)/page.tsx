import Link from "next/link"
import { ArrowRight, Check, X } from "lucide-react"

// -----------------------------------------------------------------------------
// Landing Page — PathUp
// Цель: убедить подростка потратить 5 минут на анкету
// Одна кнопка. Один поток. Ценность до регистрации.
// -----------------------------------------------------------------------------

const PRICE = process.env.NEXT_PUBLIC_PRICE_RUB ?? "790"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#C8F060]/5 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[600px] rounded-full bg-[#C8F060]/3 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-[#C8F060] font-semibold tracking-tight text-lg">
          PathUp
        </span>
        <Link
          href="/for-parents"
          className="text-sm text-[#888880] hover:text-[#E8E4DC] transition-colors"
        >
          Для родителей →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24">
        <div className="max-w-2xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2A2A2A] bg-[#111111] text-xs text-[#888880] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8F060] animate-pulse" />
            Без регистрации · Результат сразу
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Не знаешь что
            <br />
            делать дальше —
            <br />
            <span className="text-[#C8F060]">это не проблема</span>
            <br />
            характера.
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-[#888880] leading-relaxed mb-10 max-w-lg">
            PathUp смотрит на то что ты делаешь прямо сейчас
            и выдаёт конкретный план на{" "}
            <span className="text-[#E8E4DC]">7, 30 и 90 дней</span>.
            Не тест личности. Не курс. Не советы.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/start"
              className="group inline-flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#D8FF70] transition-all duration-200 text-base"
            >
              Узнать свой план
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <span className="text-sm text-[#555550]">
              12 вопросов · ~5 минут
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-[#1A1A1A]">
        <p className="text-xs uppercase tracking-widest text-[#555550] mb-10">
          Как работает
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Анкета",
              desc: "12 вопросов о том что ты реально делаешь, что тебя тормозит, сколько времени есть.",
            },
            {
              step: "02",
              title: "Анализ",
              desc: "Система определяет архетип, главный барьер и подходящую траекторию — без LLM-магии.",
            },
            {
              step: "03",
              title: "План",
              desc: "Конкретные шаги на 7 дней, расписанный месяц и anchor-цель на 90 дней.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#0F0F0F]"
            >
              <span className="text-xs font-mono text-[#C8F060] mb-3 block">
                {item.step}
              </span>
              <h3 className="font-semibold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-[#888880] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-[#1A1A1A]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#555550] mb-6">
              Что ты получишь
            </p>
            <ul className="space-y-4">
              {[
                "Твой архетип — кто ты сейчас, а не кем должен стать",
                "Главный барьер — что реально тебя тормозит",
                "2–3 подходящие траектории под твою ситуацию",
                "5 конкретных действий на эту неделю",
                "Расписанный план на 30 дней с milestones",
                "Anchor-цель на 90 дней которую можно потрогать",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check
                    size={16}
                    className="text-[#C8F060] mt-0.5 shrink-0"
                  />
                  <span className="text-[#888880]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#555550] mb-6">
              Это не
            </p>
            {[
              ["Тест «кем тебе быть»", "нет типов вроде «аналитик → иди в финансы»"],
              ["Список курсов", "нет «пройди эти 40 часов и всё получится»"],
              ["Мотивационный текст", "нет воды про «следуй своей страсти»"],
              ["Подписка", `разовый платёж ${PRICE}₽ за полный план`],
            ].map(([label, desc]) => (
              <div
                key={label}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]"
              >
                <X size={14} className="text-[#555550] mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-[#E8E4DC]">{label}</span>
                  <span className="text-sm text-[#555550] ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example archetype card */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-[#1A1A1A]">
        <p className="text-xs uppercase tracking-widest text-[#555550] mb-6">
          Пример из отчёта
        </p>
        <div className="max-w-lg p-6 rounded-2xl border border-[#C8F060]/20 bg-[#0F0F0F]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono text-[#C8F060] bg-[#C8F060]/10 px-2 py-0.5 rounded-full">
              Архетип
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Осторожный строитель</h3>
          <p className="text-sm text-[#888880] leading-relaxed">
            Ты делаешь больше чем кажется со стороны — учишься, пишешь код, пробуешь.
            Но всё это остаётся у тебя: незаконченное, неопубликованное, невидимое.
            Не потому что плохо — а потому что кажется что ещё чуть-чуть и будет готово.
          </p>
          <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
            <p className="text-xs text-[#555550]">
              Главный барьер:{" "}
              <span className="text-[#F0A030]">Страх первого публичного шага</span>
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-[#1A1A1A] text-center">
        <h2 className="text-3xl font-bold mb-4">
          Первые два шага — бесплатно.
          <br />
          <span className="text-[#888880] font-normal">Сразу после анкеты.</span>
        </h2>
        <p className="text-sm text-[#555550] mb-8">
          Без регистрации. Без email. Полный план — {PRICE}₽.
        </p>
        <Link
          href="/start"
          className="group inline-flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A] font-semibold px-8 py-4 rounded-xl hover:bg-[#D8FF70] transition-all duration-200"
        >
          Узнать свой план
          <ArrowRight
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1A1A1A] px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555550]">
          <span>© 2026 PathUp</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#888880] transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-[#888880] transition-colors">
              Условия
            </Link>
            <Link href="/for-parents" className="hover:text-[#888880] transition-colors">
              Родителям
            </Link>
            <Link href="/about" className="hover:text-[#888880] transition-colors">
              О проекте
            </Link>
          </div>
          <span>Инструмент планирования, не психологическая помощь.</span>
        </div>
      </footer>
    </main>
  )
}
