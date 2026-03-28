import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db/client"
import { z }   from "zod"

const Schema = z.object({
  session_id:      z.string().uuid().optional(),
  report_id:       z.string().optional(),
  score_relevance: z.number().int().min(1).max(10),
  most_useful:     z.string().min(1).max(1000),
  most_weak:       z.string().min(1).max(1000),
  confusing:       z.string().max(1000).default(""),
  missing:         z.string().max(1000).default(""),
  would_recommend: z.boolean(),
  allow_public:    z.boolean().default(false),
  telegram:        z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  try {
    let archetype: string | null = null
    let primary_gap: string | null = null
    let grade: number | null = null

    if (data.session_id) {
      const session = await db.session.findUnique({
        where: { id: data.session_id },
        select: { archetype: true, primary_gap: true, grade: true },
      })
      if (session) {
        archetype   = session.archetype
        primary_gap = session.primary_gap
        grade       = session.grade
      }
    }

    const feedback = await db.feedback.create({
      data: {
        session_id:      data.session_id ?? null,
        report_id:       data.report_id ?? null,
        score_relevance: data.score_relevance,
        most_useful:     data.most_useful,
        most_weak:       data.most_weak,
        confusing:       data.confusing,
        missing:         data.missing,
        would_recommend: data.would_recommend,
        allow_public:    data.allow_public,
        telegram:        data.telegram ?? null,
        archetype,
        primary_gap,
        grade,
      },
    })

    console.log(`[Feedback] Saved: ${feedback.id} score=${data.score_relevance}`)
    return NextResponse.json({ id: feedback.id })

  } catch (err: any) {
    console.error("[Feedback] Failed to save:", err?.message ?? err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
