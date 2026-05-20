import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SortField = 'created_at' | 'access_level' | 'email'
type SortOrder = 'asc' | 'desc'

type StudentDbRow = {
  id: string
  email: string
  name: string | null
  access_level: number
  created_at: string
  updated_at?: string | null
  auth_user_id?: string | null
}

type PaymentSummary = {
  status: string | null
  amount: number | null
  currency: string | null
  created_at: string | null
}

function parseIntParam(value: string | null, fallback: number): number {
  if (value === null) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function parseLevelParam(value: string | null): 1 | 2 | 3 | null | 'invalid' {
  if (value === null || value === 'all') return null
  const n = Number.parseInt(value, 10)
  if (n === 1 || n === 2 || n === 3) return n
  return 'invalid'
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getAuthMetadataValue(metadata: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!metadata) return null
  for (const key of keys) {
    const value = getString(metadata[key])
    if (value) return value
  }
  return null
}

function getLatestIso(values: Array<string | null | undefined>) {
  let latest: string | null = null
  let latestTime = 0

  for (const value of values) {
    if (!value) continue
    const time = new Date(value).getTime()
    if (!Number.isFinite(time)) continue
    if (time > latestTime) {
      latestTime = time
      latest = value
    }
  }

  return latest
}

function getPaymentCreatedAt(payment: Record<string, unknown>) {
  return getString(payment.created_at) ?? getString(payment.updated_at) ?? getString(payment.paid_at)
}

function toPaymentSummary(payment: Record<string, unknown> | null | undefined): PaymentSummary {
  if (!payment) {
    return { status: null, amount: null, currency: null, created_at: null }
  }

  const amountRaw = payment.amount ?? payment.amount_total
  const amount = typeof amountRaw === 'number' && Number.isFinite(amountRaw) ? amountRaw : null
  const currency = getString(payment.currency)
  const status = getString(payment.status)

  return {
    status,
    amount,
    currency,
    created_at: getPaymentCreatedAt(payment),
  }
}

async function safeCount(
  query: PromiseLike<{ count: number | null; error: unknown }>
): Promise<number> {
  const result = await query
  return result.error ? 0 : result.count ?? 0
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const qRaw = url.searchParams.get('q')
    const levelRaw = url.searchParams.get('level')
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

    const level = parseLevelParam(levelRaw)
    if (level === 'invalid') {
      return NextResponse.json({ error: 'Invalid level parameter' }, { status: 400 })
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
      .select('id,email,name,access_level,created_at,updated_at,auth_user_id', { count: 'exact' })

    if (q) {
      query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    }

    if (level !== null) {
      query = query.eq('access_level', level)
    }

    query = query.order(sort, { ascending: order === 'asc' }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Error fetching students' }, { status: 500 })
    }

    const students = (data ?? []) as StudentDbRow[]
    const studentIds = students.map((s) => s.id)
    const authUserIds = students.map((s) => s.auth_user_id).filter((id): id is string => !!id)
    const sinceSevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [lessonsRes, progressRes, examsRes, paymentsRes, paymentSummaryRes, summaryCounts] = await Promise.all([
      admin.from('lessons').select('id'),
      studentIds.length
        ? admin
            .from('progress')
            .select('student_id,lesson_id,watched,watched_at,updated_at')
            .in('student_id', studentIds)
        : Promise.resolve({ data: [], error: null }),
      studentIds.length
        ? admin
            .from('exam_results')
            .select('student_id,score,passed,submitted_at,created_at')
            .in('student_id', studentIds)
        : Promise.resolve({ data: [], error: null }),
      studentIds.length
        ? admin.from('payments').select('*').in('student_id', studentIds)
        : Promise.resolve({ data: [], error: null }),
      admin.from('payments').select('student_id,status'),
      Promise.all([
        safeCount(admin.from('students').select('id', { count: 'exact', head: true })),
        safeCount(admin.from('students').select('id', { count: 'exact', head: true }).eq('access_level', 1)),
        safeCount(admin.from('students').select('id', { count: 'exact', head: true }).eq('access_level', 2)),
        safeCount(admin.from('students').select('id', { count: 'exact', head: true }).eq('access_level', 3)),
        safeCount(admin.from('students').select('id', { count: 'exact', head: true }).gte('created_at', sinceSevenDaysAgo)),
      ]),
    ])

    const authUsers = await Promise.all(
      authUserIds.map(async (id) => {
        try {
          const { data: authData, error: authUserError } = await admin.auth.admin.getUserById(id)
          if (authUserError || !authData?.user) return null
          return authData.user
        } catch {
          return null
        }
      })
    )

    const authUserById = new Map(authUsers.filter(Boolean).map((authUser) => [authUser!.id, authUser!]))
    const totalLessons = lessonsRes.error ? 0 : lessonsRes.data?.length ?? 0

    const progressByStudent = new Map<
      string,
      { watchedLessonIds: Set<number>; latestWatchedAt: string | null }
    >()
    if (!progressRes.error) {
      for (const row of (progressRes.data ?? []) as Array<Record<string, any>>) {
        const studentId = getString(row.student_id)
        if (!studentId) continue
        const current = progressByStudent.get(studentId) ?? { watchedLessonIds: new Set<number>(), latestWatchedAt: null }

        if (row.watched === true && typeof row.lesson_id === 'number') {
          current.watchedLessonIds.add(row.lesson_id)
        }

        current.latestWatchedAt = getLatestIso([current.latestWatchedAt, getString(row.watched_at), getString(row.updated_at)])
        progressByStudent.set(studentId, current)
      }
    }

    const examsByStudent = new Map<
      string,
      { attempts: number; passed: number; bestScore: number | null; latestExamAt: string | null }
    >()
    if (!examsRes.error) {
      for (const row of (examsRes.data ?? []) as Array<Record<string, any>>) {
        const studentId = getString(row.student_id)
        if (!studentId) continue
        const current =
          examsByStudent.get(studentId) ?? { attempts: 0, passed: 0, bestScore: null, latestExamAt: null }

        current.attempts += 1
        if (row.passed === true) current.passed += 1
        if (typeof row.score === 'number') {
          current.bestScore = current.bestScore === null ? row.score : Math.max(current.bestScore, row.score)
        }
        current.latestExamAt = getLatestIso([current.latestExamAt, getString(row.submitted_at), getString(row.created_at)])
        examsByStudent.set(studentId, current)
      }
    }

    const latestPaymentByStudent = new Map<string, Record<string, unknown>>()
    if (!paymentsRes.error) {
      for (const payment of (paymentsRes.data ?? []) as Array<Record<string, unknown>>) {
        const studentId = getString(payment.student_id)
        if (!studentId) continue
        const current = latestPaymentByStudent.get(studentId)
        const currentTime = current ? new Date(getPaymentCreatedAt(current) ?? '').getTime() : 0
        const nextTime = new Date(getPaymentCreatedAt(payment) ?? '').getTime()
        if (!current || (Number.isFinite(nextTime) && nextTime >= currentTime)) {
          latestPaymentByStudent.set(studentId, payment)
        }
      }
    }

    let paidStudents = 0
    if (!paymentSummaryRes.error) {
      const paid = new Set<string>()
      for (const payment of (paymentSummaryRes.data ?? []) as Array<Record<string, unknown>>) {
        const studentId = getString(payment.student_id)
        const status = getString(payment.status)?.toLowerCase()
        if (studentId && (status === 'paid' || status === 'complete' || status === 'succeeded')) {
          paid.add(studentId)
        }
      }
      paidStudents = paid.size
    }

    const [totalStudents, level1, level2, level3, newLast7Days] = summaryCounts

    return NextResponse.json({
      data: students.map((s) => {
        const authUser = s.auth_user_id ? authUserById.get(s.auth_user_id) : null
        const metadata = (authUser?.user_metadata ?? null) as Record<string, unknown> | null
        const progress = progressByStudent.get(s.id)
        const exams = examsByStudent.get(s.id)
        const payment = toPaymentSummary(latestPaymentByStudent.get(s.id))
        const phone = getAuthMetadataValue(metadata, ['phone', 'phone_number', 'mobile', 'whatsapp']) ?? getString(authUser?.phone)
        const displayName = s.name ?? getAuthMetadataValue(metadata, ['name', 'full_name'])
        const latestActivityAt = getLatestIso([
          progress?.latestWatchedAt,
          exams?.latestExamAt,
          payment.created_at,
          getString(authUser?.last_sign_in_at),
          s.updated_at ?? null,
        ])

        const watchedLessons = progress?.watchedLessonIds.size ?? 0
        const progressPct = totalLessons > 0 ? Math.round((watchedLessons / totalLessons) * 100) : 0

        return {
          id: s.id as string,
          email: s.email as string,
          name: (displayName ?? null) as string | null,
          access_level: s.access_level as number,
          created_at: s.created_at as string,
          updated_at: (s.updated_at ?? null) as string | null,
          auth_user_id: (s.auth_user_id ?? null) as string | null,
          phone,
          auth: authUser
            ? {
                email: authUser.email ?? null,
                created_at: authUser.created_at ?? null,
                email_confirmed_at: authUser.email_confirmed_at ?? null,
                last_sign_in_at: authUser.last_sign_in_at ?? null,
              }
            : null,
          payment,
          progress: {
            watched_lessons: watchedLessons,
            total_lessons: totalLessons,
            pct: progressPct,
            latest_watched_at: progress?.latestWatchedAt ?? null,
          },
          exams: {
            attempts: exams?.attempts ?? 0,
            passed: exams?.passed ?? 0,
            best_score: exams?.bestScore ?? null,
            latest_exam_at: exams?.latestExamAt ?? null,
          },
          latest_activity_at: latestActivityAt,
        }
      }),
      summary: {
        total_students: totalStudents,
        new_last_7_days: newLast7Days,
        level_counts: {
          1: level1,
          2: level2,
          3: level3,
        },
        paid_students: paidStudents,
        visible_without_phone: students.reduce((acc, s) => {
          const authUser = s.auth_user_id ? authUserById.get(s.auth_user_id) : null
          const metadata = (authUser?.user_metadata ?? null) as Record<string, unknown> | null
          const phone =
            getAuthMetadataValue(metadata, ['phone', 'phone_number', 'mobile', 'whatsapp']) ?? getString(authUser?.phone)
          return acc + (phone ? 0 : 1)
        }, 0),
      },
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error('GET /api/admin/students error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
