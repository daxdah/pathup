import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "О проекте — PathUp",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#C8F060] font-semibold text-sm tracking-tight">PathUp</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 space-y-12">

        <div>
          <p className="text-xs text-[#555550] mb-2 font-mono">О проекте</p>
          <h1 className="text-2xl font-bold text-[#E8E4DC] mb-4 leading-snug">
            PathUp — персональный план развития для школьников
          </h1>
          <p className="text-sm text-[#888880] leading-relaxed">
            PathUp помогает школьникам 14–18 лет разобраться где они сейчас застряли
            и что конкретно делать дальше. Не мотивационные советы — а честный диагноз
            и план с конкретными шагами и артефактами.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8F060]" />
            <span className="text-xs text-[#C8F060] font-medium tracking-wide">Связь с автором</span>
          </div>
          <p className="text-sm text-[#888880] leading-relaxed mb-4">
            Есть идея, баг или жёсткий фидбэк — напиши напрямую.
            Читаю всё и отвечаю.
          </p>
          <a
            href="https://t.me/daxdah"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222222]
                       transition-all text-[#E8E4DC] font-medium text-sm
                       px-4 py-3 rounded-xl border border-[#2A2A2A]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.56-.46.7-.92.43l-2.54-1.87-1.22 1.18c-.14.13-.26.24-.52.24l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1l-5.86 3.69-2.52-.79c-.55-.17-.56-.55.11-.81l9.84-3.79c.46-.17.86.11.73.68z" fill="#C8F060"/>
            </svg>
            @daxdah в Telegram
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#555550] font-mono">Принципы продукта</p>
          {[
            ["Без мотивационной воды", "Никаких \"верь в себя\" и \"найди своё призвание\". Только то что конкретно мешает и что конкретно делать."],
            ["Диагноз, а не тест личности", "PathUp не раскладывает по типам — он говорит где ты застрял и почему именно там."],
            ["Результат, а не описание", "Хороший план заканчивается конкретными артефактами — не ощущениями."],
          ].map(([title, desc]) => (
            <div key={title} className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]">
              <p className="text-sm font-semibold text-[#E8E4DC] mb-1">{title}</p>
              <p className="text-xs text-[#888880] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-xs text-[#444440] hover:text-[#666660] transition-colors">
            ← Вернуться на главную
          </Link>
        </div>
      </main>
    </div>
  )
}
