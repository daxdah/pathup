# PathUp

AI-powered growth planner для школьников 14–18 лет.

---

## Архитектура

```
questionnaire → structured profile → methodology layer → decision layer → LLM → report
```

LLM не принимает стратегических решений. Она упаковывает готовое решение Decision Layer в текст.

---

## Что уже работает

| Модуль | Статус |
|---|---|
| Methodology engine (archetype, gaps, paths, plans) | ✅ полностью |
| Decision Layer (детерминированный) | ✅ полностью |
| Pipeline оркестратор | ✅ полностью |
| Все API routes | ✅ полностью |
| Free / Full / Parent report рендер | ✅ полностью |
| Анкета (12 вопросов, useReducer) | ✅ полностью |
| Admin dashboard + session viewer | ✅ полностью |
| Analytics wiring (все события) | ✅ полностью |
| Trust layer (disclaimer, privacy, terms) | ✅ полностью |
| Mock mode (без внешних сервисов) | ✅ полностью |
| Unit tests (30+ проверок) | ✅ полностью |
| Cron jobs (email, cleanup) | ✅ полностью |

## Что в mock / заглушках

| Что | Как активировать |
|---|---|
| LLM генерация | Добавить `OPENAI_API_KEY` → снять `MOCK_MODE=true` |
| Оплата | Добавить ЮКасса ключи → снять `PAYMENT_MOCK=true` |
| Email | Добавить `RESEND_API_KEY` |
| Промпты | Создать файлы в `prompts/*.md` |

---

## Быстрый старт (mock режим, без внешних сервисов)

```bash
# 1. Зависимости
npm install

# 2. Окружение
cp .env.example .env.local
# .env.local уже настроен на mock — ничего не менять

# 3. База данных (нужен Supabase или локальный Postgres)
npm run db:generate
npm run db:push

# 4. Запуск
npm run dev
```

Открой http://localhost:3000

### Маршруты для проверки
```
/               → Landing
/start          → Анкета
/report/[sid]   → Free report (после анкеты)
/admin          → Admin (нужен ADMIN_SECRET)
/for-parents    → Лендинг для родителей
/privacy        → Политика конфиденциальности
```

---

## Тесты

```bash
npm run test:run    # запустить один раз
npm test            # watch mode
```

Покрывают весь lib/methodology/ — 30+ проверок без внешних зависимостей.

---

## Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL |
| `DIRECT_URL` | ✅ | Supabase direct URL |
| `OPENAI_API_KEY` | — | Без него → mock отчёты |
| `YOOKASSA_SHOP_ID` | — | Без него → mock оплата |
| `YOOKASSA_SECRET_KEY` | — | Без него → mock оплата |
| `RESEND_API_KEY` | — | Без него → email в консоль |
| `NEXT_PUBLIC_APP_URL` | ✅ | http://localhost:3000 в dev |
| `ADMIN_SECRET` | ✅ | Секрет для /admin |
| `CRON_SECRET` | ✅ | Секрет для Vercel Cron |
| `MOCK_MODE` | — | true = не вызывать OpenAI |
| `PAYMENT_MOCK` | — | true = симулировать оплату |

---

## Next Steps после MVP

**Приоритет 1 — запуск**
- Создать Supabase, добавить DATABASE_URL + npm run db:push
- Добавить OPENAI_API_KEY
- Зарегистрировать ЮКасса, добавить ключи
- Зарегистрировать Resend, добавить ключ
- Деплой на Vercel + домен

**Приоритет 2 — качество**
- Написать все 8 промптов в prompts/*.md
- Заполнить data/resources.data.ts реальными ресурсами
- Пройти анкету 8 раз (по одному разу за каждый архетип)
- Настроить Sentry

**Приоритет 3 — ретеншн**
- Check-in email цикл (cron уже настроен)
- Parent report как отдельный продукт
- Повторная анкета через 90 дней

**Приоритет 4 — рост**
- SEO страницы под запросы школьников
- Telegram бот для follow-up
- Локализация на английский
