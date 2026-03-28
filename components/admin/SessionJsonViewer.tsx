// =============================================================================
// PathUp — Session JSON Viewer
// Collapsible JSON viewer для admin. Подсвечивает ключевые поля.
// =============================================================================

"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react"

interface Props {
  data: unknown
  defaultExpanded?: boolean
}

export function SessionJsonViewer({ data, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied,   setCopied]   = useState(false)

  const json = JSON.stringify(data, null, 2)

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
      {/* Toggle bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer
                   bg-[#0F0F0F] hover:bg-[#111111] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown  size={12} className="text-[#555550]" />
            : <ChevronRight size={12} className="text-[#555550]" />
          }
          <span className="text-xs text-[#555550] font-mono">
            {expanded ? "свернуть" : "развернуть"}
          </span>
        </div>

        {expanded && (
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy() }}
            className="flex items-center gap-1 text-xs text-[#555550]
                       hover:text-[#888880] transition-colors"
          >
            {copied
              ? <><Check size={11} className="text-[#C8F060]" /> скопировано</>
              : <><Copy size={11} /> копировать</>
            }
          </button>
        )}
      </div>

      {/* JSON content */}
      {expanded && (
        <pre className="px-4 py-4 overflow-x-auto text-xs leading-relaxed
                        bg-[#080808] text-[#888880] font-mono max-h-[600px]
                        overflow-y-auto">
          <JsonHighlight json={json} />
        </pre>
      )}
    </div>
  )
}

// Минимальная подсветка JSON без внешних библиотек
function JsonHighlight({ json }: { json: string }) {
  const highlighted = json
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-[#C8F060]"          // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-[#888880]"           // key
          } else {
            cls = "text-[#E8E4DC]"           // string value
          }
        } else if (/true|false/.test(match)) {
          cls = "text-[#F0A030]"             // boolean
        } else if (/null/.test(match)) {
          cls = "text-[#555550]"             // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
}
