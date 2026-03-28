import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "PathUp — Твой план на 7, 30 и 90 дней",
  description:
    "PathUp превращает хаос интересов и амбиций в конкретный план действий. " +
    "Не тест личности. Не курс. Персональная траектория для школьников 14–18 лет.",
  keywords: ["план развития", "школьники", "карьера", "что делать после школы", "pathup"],
  openGraph: {
    title: "PathUp — Твой план на 7, 30 и 90 дней",
    description: "Конкретный план развития для школьников 14–18 лет. Без воды.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "PathUp",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0A0A0A] text-[#E8E4DC] antialiased">
        {children}
      </body>
    </html>
  )
}
