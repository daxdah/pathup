// =============================================================================
// PathUp — Privacy Policy
// Простая, честная политика конфиденциальности без юридического мусора.
// =============================================================================

import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Конфиденциальность — PathUp",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#C8F060] font-semibold text-sm">PathUp</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 prose prose-sm">
        <h1 className="text-xl font-bold mb-8 text-[#E8E4DC]">
          Политика конфиденциальности
        </h1>

        <Section title="Коротко о главном">
          <ul>
            <li>Мы собираем минимум данных — только то что нужно для работы продукта</li>
            <li>Мы не продаём твои данные и не используем их для рекламы</li>
            <li>Email собирается только при оплате — не раньше</li>
            <li>Анкета анонимна до момента оплаты</li>
          </ul>
        </Section>

        <Section title="Что мы собираем">
          <p>При прохождении анкеты:</p>
          <ul>
            <li>Ответы на 12 вопросов (класс, интересы, цели, барьеры)</li>
            <li>Уникальный ID сессии (UUID — не содержит личных данных)</li>
            <li>Время создания сессии</li>
          </ul>
          <p>При оплате:</p>
          <ul>
            <li>Email — для отправки отчёта</li>
            <li>ID платежа от платёжной системы</li>
          </ul>
          <p>Что мы <strong>не</strong> собираем:</p>
          <ul>
            <li>Имя, фамилия, возраст (точный), адрес, телефон</li>
            <li>IP-адрес (кроме технических логов сервера)</li>
            <li>Данные устройства или геолокация</li>
          </ul>
        </Section>

        <Section title="Как мы используем данные">
          <ul>
            <li>Для генерации персонального плана развития</li>
            <li>Для отправки отчёта и follow-up emails (только если оплатил)</li>
            <li>Для анонимной агрегированной аналитики (улучшение продукта)</li>
          </ul>
        </Section>

        <Section title="Третьи стороны">
          <p>Мы используем следующие сервисы:</p>
          <ul>
            <li>
              <strong className="text-[#E8E4DC]">OpenAI</strong> — генерация текста отчёта.
              Данные анкеты передаются через API. OpenAI не использует API-запросы для обучения моделей.
            </li>
            <li>
              <strong className="text-[#E8E4DC]">ЮКасса</strong> — обработка платежей.
              Мы не храним данные банковских карт.
            </li>
            <li>
              <strong className="text-[#E8E4DC]">Resend</strong> — отправка email.
              Email передаётся только для доставки отчёта.
            </li>
            <li>
              <strong className="text-[#E8E4DC]">Supabase / Vercel</strong> — хостинг и база данных.
              Данные хранятся на серверах в ЕС.
            </li>
          </ul>
          <p>Больше никаких третьих сторон. Никаких рекламных сетей.</p>
        </Section>

        <Section title="Хранение и удаление">
          <ul>
            <li>Неоплаченные сессии автоматически удаляются через 90 дней</li>
            <li>Оплаченные сессии хранятся 1 год для возможности повторного доступа</li>
            <li>
              Чтобы удалить свои данные — напиши на{" "}
              <a href="mailto:hello@pathup.ru" className="text-[#888880] hover:text-[#E8E4DC]">
                hello@pathup.ru
              </a>{" "}
              с темой «Удаление данных»
            </li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>
            Мы используем только технически необходимые cookies —
            для сохранения сессии и admin-доступа.
            Никаких трекинговых или рекламных cookies.
          </p>
        </Section>

        <Section title="Контакт">
          <p>
            Вопросы по конфиденциальности:{" "}
            <a href="mailto:hello@pathup.ru" className="text-[#888880] hover:text-[#E8E4DC]">
              hello@pathup.ru
            </a>
          </p>
        </Section>

        <p className="text-xs text-[#444440] mt-8">
          Последнее обновление: {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[#E8E4DC] mb-3">{title}</h2>
      <div className="text-[#888880] text-sm leading-relaxed space-y-2 [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_li]:list-disc [&_li]:list-outside [&_strong]:text-[#E8E4DC]">
        {children}
      </div>
    </div>
  )
}
