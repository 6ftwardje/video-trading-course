import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type SortField = 'created_at' | 'access_level' | 'email'
type SortOrder = 'asc' | 'desc'

function parseIntParam(value: string | null, fallback: number): number {
  if (value === null) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const qRaw = url.searchParams.get('q')
    const sortRaw = url.searchParams.get('sort')
    const orderRaw = url.searchParams.get('order')
    const limitRaw = url.searchParams.get('limit')
    const offsetRaw = url.searchParams.get('offset')

    let q = qRaw?.trim() ? qRaw.trim() : undefined
    // Keep search safe for PostgREST `.or(...)` syntax (commas/parens are separators).
    if (q) {
      q = q.replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim()
      if (!q) q = undefined
      if (q && q.length > 100) q = q.slice(0, 100)
    }

    const sortAllowlist: ReadonlyArray<SortField> = ['created_at', 'access_level', 'email']
    let sort: SortField = 'created_at'
    if (sortRaw !== null) {
      if (!sortAllowlist.includes(sortRaw as SortField)) {
        return NextResponse.json({ error: 'Invalid sort parameter' }, { status: 400 })
      }
      sort = sortRaw as SortField
    }

    let order: SortOrder = 'desc'
    if (orderRaw !== null) {
      if (orderRaw !== 'asc' && orderRaw !== 'desc') {
        return NextResponse.json({ error: 'Invalid order parameter' }, { status: 400 })
      }
      order = orderRaw
    }

    let limit = parseIntParam(limitRaw, 20)
    let offset = parseIntParam(offsetRaw, 0)

    if (limitRaw !== null && (!Number.isInteger(limit) || limit <= 0)) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 })
    }
    if (offsetRaw !== null && (!Number.isInteger(offset) || offset < 0)) {
      return NextResponse.json({ error: 'Invalid offset parameter' }, { status: 400 })
    }

    limit = Math.min(limit, 50)

    // 1) Authorization via regular (anon, cookie-based) server client + RLS.
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
      .select('access_level')
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

    // 2) Data access via service role (read-only) AFTER authorization succeeds.
    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    let query = admin
      .from('students')
      .select('id,email,name,access_level,created_at', { count: 'exact' })

    if (q) {
      query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    }

    query = query.order(sort, { ascending: order === 'asc' }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Error fetching students' }, { status: 500 })
    }

    return NextResponse.json({
      data: (data ?? []).map((s) => ({
        id: s.id as string,
        email: s.email as string,
        name: (s.name ?? null) as string | null,
        access_level: s.access_level as number,
        created_at: s.created_at as string,
      })),
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error('GET /api/admin/students error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


