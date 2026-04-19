import 'server-only'

import { NextResponse } from 'next/server'

export type ContentUpdatePayload = {
  title: string
  description: string | null
}

export function parseNumericContentId(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isSafeInteger(n) || n <= 0) return null
  return n
}

export function parseContentUpdateBody(body: unknown):
  | { ok: true; payload: ContentUpdatePayload }
  | { ok: false; response: NextResponse } {
  if (body === null || typeof body !== 'object') {
    return { ok: false, response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  }
  const o = body as Record<string, unknown>
  if (typeof o.title !== 'string') {
    return { ok: false, response: NextResponse.json({ error: 'title is required' }, { status: 400 }) }
  }
  const title = o.title.trim()
  if (!title) {
    return { ok: false, response: NextResponse.json({ error: 'title cannot be empty' }, { status: 400 }) }
  }

  let description: string | null = null
  if (o.description === null || o.description === undefined) {
    description = null
  } else if (typeof o.description === 'string') {
    const d = o.description.trim()
    description = d === '' ? null : d
  } else {
    return {
      ok: false,
      response: NextResponse.json({ error: 'description must be a string or null' }, { status: 400 }),
    }
  }

  return { ok: true, payload: { title, description } }
}
