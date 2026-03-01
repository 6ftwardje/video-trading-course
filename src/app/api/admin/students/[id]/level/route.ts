import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

function validateStudentId(id: unknown): string | null {
  if (typeof id !== 'string' || !id) return null
  // keep it defensive: allow uuid-like ids only (common Supabase default).
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidLike.test(id)) return null
  return id
}

function parseAccessLevel(value: unknown): 1 | 2 | 3 | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  if (value === 1 || value === 2 || value === 3) return value
  return null
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: { id: string } },
) {
  try {
    const studentId = validateStudentId(ctx.params?.id)
    if (!studentId) {
      return NextResponse.json({ error: 'Invalid student id' }, { status: 400 })
    }

    // 1) Authenticate requester via regular (anon, cookie-based) server client + RLS.
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: requesterStudent, error: requesterError } = await supabase
      .from('students')
      .select('id,access_level')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (requesterError) {
      return NextResponse.json({ error: 'Error fetching requester student record' }, { status: 500 })
    }

    if (!requesterStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (requesterStudent.access_level !== 3) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2) Validate request body.
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const newLevel = parseAccessLevel((body as any)?.access_level)
    if (!newLevel) {
      return NextResponse.json({ error: 'access_level must be an integer: 1, 2, or 3' }, { status: 400 })
    }

    // 3) Use service role for privileged write AFTER authorization succeeds.
    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // Fetch target student to get old_level; 404 if not found.
    const { data: target, error: targetErr } = await admin
      .from('students')
      .select('id,access_level')
      .eq('id', studentId)
      .maybeSingle()

    if (targetErr) {
      return NextResponse.json({ error: 'Error fetching target student' }, { status: 500 })
    }
    if (!target) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const oldLevel = Number(target.access_level)
    if (!Number.isInteger(oldLevel)) {
      return NextResponse.json({ error: 'Invalid target student level' }, { status: 500 })
    }

    // No-op update still logs (audit trail) unless you want to short-circuit.
    const { error: updateErr } = await admin
      .from('students')
      .update({ access_level: newLevel })
      .eq('id', studentId)

    if (updateErr) {
      return NextResponse.json({ error: 'Error updating student level' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/admin/students/[id]/level error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
