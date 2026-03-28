// =============================================================================
// PathUp — Terms of Service
// =============================================================================

import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Условия использования — PathUp",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-[#C8F060] font-semibold text-sm">PathUp</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-xl font-bold mb-8 text-[#E8E4DC]">
          Условия использования
        </h1>

        <div className="space-y-8 text-sm text-[#888880] leading-relaxed">

          <Section title="Что такое PathUp">
            PathUp — это инструмент планирования личного развития для школьников 14–18 лет.
            Продукт предоставляет структурированный план действий на основе анкеты.
            PathUp не является психологической, медицинской или профессиональной консультацией.
          </Section>

          <Section title="Платёж и доступ">
            <ul className="space-y-2 pl-4 list-disc list-outside">
              <li>
                Базовый результат (архетип + главный барьер + 2 первых шага) — бесплатно,
                без регистрации
              </li>
              <li>
                Полный план (7/30/90 дней, anti-mistakes, ресурсы) — разовый платёж,
                цена указана на сайте
              </li>
              <li>Подписки нет. Повторных списаний нет.</li>
              <li>
                Доступ к оплаченному отчёту — постоянный, по ссылке которую ты получил на email
              </li>
            </ul>
          </Section>

          <Section title="Возврат">
            Если что-то пошло не так с генерацией отчёта — напиши на{" "}
            <a href="mailto:hello@pathup.ru" className="text-[#888880] hover:text-[#E8E4DC]">
              hello@pathup.ru
            </a>{" "}
            в течение 72 часов. Мы либо исправим, либо вернём деньги.
          </Section>

          <Section title="Ограничения">
            <ul className="space-y-2 pl-4 list-disc list-outside">
              <li>
                PathUp — инструмент, а не гарантия результата. План эффективен настолько,
                насколько ты его выполняешь.
              </li>
              <li>
                Мы не несём ответственности за решения принятые на основе отчёта.
              </li>
              <li>
                Сервис предназначен для лиц 14+ лет. Пользователи до 18 лет
                используют сервис с ведома родителей или законных представителей.
              </li>
            </ul>
          </Section>

          <Section title="Контент">
            Отчёты генерируются с помощью AI на основе твоих ответов.
            Мы делаем всё чтобы контент был точным и полезным,
            но не гарантируем что каждое утверждение в отчёте является
            профессиональной рекомендацией.
          </Section>

          <Section title="Контакт">
            По любым вопросам:{" "}
            <a href="mailto:hello@pathup.ru" className="text-[#888880] hover:text-[#E8E4DC]">
              hello@pathup.ru
            </a>
          </Section>
        </div>

        <p className="text-xs text-[#444440] mt-10">
          Последнее обновление: {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#E8E4DC] mb-2">{title}</h2>
      <div className="text-[#888880]">{children}</div>
    </div>
  )
}
