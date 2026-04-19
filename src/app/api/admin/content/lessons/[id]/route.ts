import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyAdminRequester } from '@/lib/admin/verifyAdminRequester'
import { parseContentUpdateBody, parseNumericContentId } from '@/lib/admin/contentUpdate'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest, ctx: { params: { id: string } }) {
  try {
    const id = parseNumericContentId(ctx.params?.id)
    if (id === null) {
      return NextResponse.json({ error: 'Invalid lesson id' }, { status: 400 })
    }

    const auth = await verifyAdminRequester()
    if (!auth.ok) return auth.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = parseContentUpdateBody(body)
    if (!parsed.ok) return parsed.response

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const { data, error } = await admin
      .from('lessons')
      .update({ title: parsed.payload.title, description: parsed.payload.description })
      .eq('id', id)
      .select('id,title,description')
      .maybeSingle()

    if (error) {
      console.error('PATCH lesson content', error)
      return NextResponse.json({ error: 'Error updating lesson' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id as number,
      title: data.title as string,
      description: (data.description ?? null) as string | null,
    })
  } catch (err) {
    console.error('PATCH /api/admin/content/lessons/[id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
