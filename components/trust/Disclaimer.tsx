// =============================================================================
// PathUp — Disclaimer
// Переиспользуемый компонент для disclaimers.
// Три варианта: footer, inline, banner.
// =============================================================================

import Link from "next/link"
import { Info, Shield } from "lucide-react"

type Variant = "footer" | "inline" | "banner"

interface Props {
  variant?:  Variant
  showLinks?: boolean
}

const TEXT = {
  short: "PathUp — инструмент планирования, не психологическая помощь.",
  full:  "PathUp помогает структурировать интересы и построить план действий. " +
         "Это не замена работе с психологом, педагогом или специалистом по профориентации.",
  data:  "Твои данные не передаются третьим лицам и не используются для рекламы.",
}

export function Disclaimer({ variant = "footer", showLinks = true }: Props) {
  if (variant === "banner") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
        <Info size={14} className="text-[#555550] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs text-[#888880] leading-relaxed">{TEXT.full}</p>
          <p className="text-xs text-[#555550]">{TEXT.data}</p>
          {showLinks && (
            <div className="flex gap-3 pt-1">
              <Link href="/privacy" className="text-xs text-[#444440] hover:text-[#555550] underline transition-colors">
                Конфиденциальность
              </Link>
              <Link href="/terms" className="text-xs text-[#444440] hover:text-[#555550] underline transition-colors">
                Условия
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <p className="text-xs text-[#444440] leading-relaxed">
        {TEXT.short}{" "}
        {showLinks && (
          <>
            <Link href="/privacy" className="underline hover:text-[#555550] transition-colors">
              Конфиденциальность
            </Link>
            {" · "}
            <Link href="/terms" className="underline hover:text-[#555550] transition-colors">
              Условия
            </Link>
          </>
        )}
      </p>
    )
  }

  // footer (default)
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between
                    gap-3 text-xs text-[#444440]">
      <span>{TEXT.short}</span>
      {showLinks && (
        <div className="flex gap-4 shrink-0">
          <Link href="/privacy" className="hover:text-[#555550] transition-colors">
            Конфиденциальность
          </Link>
          <Link href="/terms" className="hover:text-[#555550] transition-colors">
            Условия
          </Link>
        </div>
      )}
    </div>
  )
}

// Crisis resources component — показывается если нужна помощь
export function CrisisResources() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-[#1A1A1A] bg-[#0F0F0F]">
      <Shield size={14} className="text-[#888880] mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-[#888880] mb-2">
          Если сейчас тяжело — это важнее любого плана.
        </p>
        <div className="space-y-1">
          <p className="text-xs text-[#555550]">
            Телефон доверия (бесплатно, РФ):{" "}
            <a href="tel:88002000122" className="text-[#888880] hover:text-[#E8E4DC] transition-colors">
              8-800-2000-122
            </a>
          </p>
          <p className="text-xs text-[#555550]">
            Поговори с психологом в школе или с кем-то кому доверяешь.
          </p>
        </div>
      </div>
    </div>
  )
}
