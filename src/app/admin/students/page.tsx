'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type StudentRow = {
  id: string
  email: string
  name: string | null
  access_level: number
  created_at: string
  updated_at: string | null
  auth_user_id: string | null
  phone: string | null
  auth: {
    email: string | null
    created_at: string | null
    email_confirmed_at: string | null
    last_sign_in_at: string | null
  } | null
  payment: {
    status: string | null
    amount: number | null
    currency: string | null
    created_at: string | null
  }
  progress: {
    watched_lessons: number
    total_lessons: number
    pct: number
    latest_watched_at: string | null
  }
  exams: {
    attempts: number
    passed: number
    best_score: number | null
    latest_exam_at: string | null
  }
  latest_activity_at: string | null
}

type Summary = {
  total_students: number
  new_last_7_days: number
  level_counts: Record<'1' | '2' | '3', number>
  paid_students: number
  visible_without_phone: number
}

type MeResponse = {
  id: string
  access_level: number
}

type StudentsResponse = {
  data: StudentRow[]
  summary?: Summary
  total: number
  limit: number
  offset: number
}

type SortField = 'created_at' | 'access_level' | 'email'
type SortOrder = 'asc' | 'desc'

type SortOption = {
  label: string
  sort: SortField
  order: SortOrder
}

type Level = 1 | 2 | 3

const EMPTY_SUMMARY: Summary = {
  total_students: 0,
  new_last_7_days: 0,
  level_counts: { 1: 0, 2: 0, 3: 0 },
  paid_students: 0,
  visible_without_phone: 0,
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Basic',
  2: 'Full',
  3: 'Admin',
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])

  return debounced
}

function isLevel(n: unknown): n is Level {
  return n === 1 || n === 2 || n === 3
}

function formatDateBrussels(iso: string | null | undefined, withTime = false) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'

  return d.toLocaleString('nl-BE', {
    timeZone: 'Europe/Brussels',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function formatPaymentAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return null
  const value = amount / 100

  try {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value)
  } catch {
    return `${value} ${currency.toUpperCase()}`
  }
}

function formatRelative(iso: string | null | undefined) {
  if (!iso) return 'Geen activiteit'
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return 'Geen activiteit'

  const diffMs = Date.now() - time
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays <= 0) return 'Vandaag'
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 30) return `${diffDays} dagen geleden`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 maand geleden'
  if (diffMonths < 12) return `${diffMonths} maanden geleden`

  const diffYears = Math.floor(diffMonths / 12)
  return diffYears === 1 ? '1 jaar geleden' : `${diffYears} jaar geleden`
}

function levelBadgeVariant(level: number): 'default' | 'secondary' | 'outline' {
  if (level >= 3) return 'default'
  if (level === 2) return 'secondary'
  return 'outline'
}

function paymentBadge(student: StudentRow) {
  const status = student.payment.status?.toLowerCase()
  if (status === 'paid' || status === 'complete' || status === 'succeeded') {
    return { label: 'Betaald', className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' }
  }
  if (student.access_level >= 2) {
    return { label: 'Toegang actief', className: 'border-sky-400/30 bg-sky-400/10 text-sky-200' }
  }
  return { label: 'Geen betaling', className: 'border-white/10 bg-white/5 text-[var(--text-dim)]' }
}

function buildWhatsappHref(phone: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}`
}

function StatBlock({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Users
  label: string
  value: string | number
  helper?: string
}) {
  return (
    <div className="min-h-[104px] rounded-lg border border-[var(--border)] bg-[var(--card)]/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">{label}</div>
        <Icon className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</div>
      {helper ? <div className="mt-1 text-xs text-[var(--text-dim)]">{helper}</div> : null}
    </div>
  )
}

function ProgressMeter({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct))

  return (
    <div className="min-w-[128px]">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[var(--text-dim)]">Voortgang</span>
        <span className="font-medium tabular-nums text-white">{clamped}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

function ContactAction({
  icon: Icon,
  label,
  onClick,
  href,
  disabled,
}: {
  icon: typeof Mail
  label: string
  onClick?: () => void
  href?: string
  disabled?: boolean
}) {
  const className =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dim)] transition hover:border-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

  if (href && !disabled) {
    return (
      <a className={className} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" title={label}>
        <Icon className="h-4 w-4" />
      </a>
    )
  }

  return (
    <button className={className} type="button" onClick={onClick} disabled={disabled} title={label}>
      <Icon className="h-4 w-4" />
    </button>
  )
}

function LevelSelectCell({
  studentId,
  email,
  initialLevel,
  disabled,
  onCommitted,
}: {
  studentId: string
  email: string
  initialLevel: number
  disabled: boolean
  onCommitted: (level: Level) => void
}) {
  const [selected, setSelected] = useState<Level>(() => (isLevel(initialLevel) ? initialLevel : 1))
  const [committed, setCommitted] = useState<Level>(() => (isLevel(initialLevel) ? initialLevel : 1))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successTick, setSuccessTick] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<number | null>(null)
  const latestDesiredRef = useRef<Level>(committed)

  useEffect(() => {
    const next = isLevel(initialLevel) ? initialLevel : 1
    setSelected(next)
    setCommitted(next)
    latestDesiredRef.current = next
    setPending(false)
    setError(null)
    abortRef.current?.abort()
    abortRef.current = null
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, initialLevel])

  const sendPatch = async (level: Level) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setPending(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/students/${studentId}/level`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ access_level: level }),
        signal: controller.signal,
      })

      if (!res.ok) {
        let message = `Update failed (${res.status})`
        try {
          const json = (await res.json()) as { error?: string }
          if (json?.error) message = json.error
        } catch {
          // ignore parse errors
        }
        setSelected(committed)
        setError(message)
        return
      }

      setCommitted(level)
      setSelected(level)
      onCommitted(level)
      setSuccessTick((t) => t + 1)
    } catch (e: unknown) {
      const isAbort =
        controller.signal.aborted ||
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError')
      if (isAbort) return
      const message = e instanceof Error ? e.message : 'Network error'
      setSelected(committed)
      setError(message)
    } finally {
      if (!controller.signal.aborted) setPending(false)
    }
  }

  useEffect(() => {
    if (successTick === 0) return
    const t = window.setTimeout(() => setSuccessTick(0), 1200)
    return () => window.clearTimeout(t)
  }, [successTick])

  const queueUpdate = (level: Level) => {
    latestDesiredRef.current = level
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      void sendPatch(latestDesiredRef.current)
    }, 200)
  }

  const showSuccess = successTick > 0 && !pending && !error && selected === committed

  return (
    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <div className="relative w-[140px]">
        <Select
          value={String(selected)}
          onValueChange={(v) => {
            const n = Number.parseInt(v, 10)
            if (!isLevel(n)) return
            setSelected(n)
            setError(null)
            if (n === committed) return
            queueUpdate(n)
          }}
          disabled={disabled || pending}
          options={[
            { label: 'Level 1', value: '1' },
            { label: 'Level 2', value: '2' },
            { label: 'Level 3', value: '3' },
          ]}
          aria-label={`Update access level for ${email}`}
        />
        {pending ? (
          <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--text-dim)]" />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2">
          <div className="text-xs text-red-400">{error}</div>
          <button
            type="button"
            className="text-xs text-[var(--accent)] underline-offset-2 hover:underline"
            onClick={() => {
              setSelected(committed)
              setError(null)
              queueUpdate(latestDesiredRef.current)
            }}
          >
            Retry
          </button>
        </div>
      ) : showSuccess ? (
        <div className="text-xs text-[var(--text-dim)]">Level opgeslagen</div>
      ) : null}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">{label}</div>
      <div className="max-w-[220px] text-right text-sm text-white">{value ?? '-'}</div>
    </div>
  )
}

function StudentDetailPanel({
  student,
  onClose,
  onCopy,
}: {
  student: StudentRow
  onClose: () => void
  onCopy: (value: string, label: string) => void
}) {
  const payment = paymentBadge(student)
  const paymentAmount = formatPaymentAmount(student.payment.amount, student.payment.currency)
  const whatsappHref = buildWhatsappHref(student.phone)

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/55" type="button" aria-label="Close detail panel" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-[var(--border)] bg-[var(--bg)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={levelBadgeVariant(student.access_level)}>
                Level {student.access_level} - {LEVEL_LABELS[student.access_level] ?? 'Custom'}
              </Badge>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${payment.className}`}>{payment.label}</span>
            </div>
            <h2 className="truncate text-xl font-semibold text-white">{student.name?.trim() || 'Naam onbekend'}</h2>
            <p className="mt-1 truncate text-sm text-[var(--text-dim)]">{student.email}</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-[var(--border)] p-2 text-[var(--text-dim)] transition hover:text-white"
            onClick={onClose}
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-5">
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Phone className="h-4 w-4 text-[var(--accent)]" />
              Contact
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-4">
              <div className="flex flex-wrap gap-2">
                <ContactAction icon={Mail} label="E-mail openen" href={`mailto:${student.email}`} />
                <ContactAction icon={Copy} label="E-mail kopieren" onClick={() => onCopy(student.email, 'E-mail')} />
                <ContactAction icon={Phone} label="WhatsApp openen" href={whatsappHref ?? undefined} disabled={!whatsappHref} />
                <ContactAction
                  icon={Copy}
                  label="Telefoon kopieren"
                  onClick={() => student.phone && onCopy(student.phone, 'Telefoon')}
                  disabled={!student.phone}
                />
              </div>
              <div className="mt-4">
                <DetailRow label="Telefoon" value={student.phone ?? 'Niet ingevuld'} />
                <DetailRow label="E-mail bevestigd" value={student.auth?.email_confirmed_at ? 'Ja' : 'Onbekend'} />
                <DetailRow label="Laatste login" value={formatDateBrussels(student.auth?.last_sign_in_at, true)} />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart3 className="h-4 w-4 text-[var(--accent)]" />
              Platformgebruik
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-4">
              <ProgressMeter pct={student.progress.pct} />
              <div className="mt-4">
                <DetailRow
                  label="Lessen bekeken"
                  value={`${student.progress.watched_lessons}/${student.progress.total_lessons}`}
                />
                <DetailRow label="Laatste lesactiviteit" value={formatDateBrussels(student.progress.latest_watched_at, true)} />
                <DetailRow label="Examens gemaakt" value={student.exams.attempts} />
                <DetailRow label="Examens gehaald" value={student.exams.passed} />
                <DetailRow label="Beste score" value={student.exams.best_score === null ? '-' : student.exams.best_score} />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard className="h-4 w-4 text-[var(--accent)]" />
              Betaling en account
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 p-4">
              <DetailRow label="Betaalstatus" value={student.payment.status ?? 'Geen betaling gevonden'} />
              <DetailRow label="Bedrag" value={paymentAmount ?? '-'} />
              <DetailRow label="Betaald op" value={formatDateBrussels(student.payment.created_at, true)} />
              <DetailRow label="Student ID" value={student.id} />
              <DetailRow label="Auth ID" value={student.auth_user_id ?? '-'} />
              <DetailRow label="Aangemaakt" value={formatDateBrussels(student.created_at, true)} />
              <DetailRow label="Bijgewerkt" value={formatDateBrussels(student.updated_at, true)} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

export default function AdminStudentsPage() {
  const sortOptions: SortOption[] = useMemo(
    () => [
      { label: 'Nieuwste accounts', sort: 'created_at', order: 'desc' },
      { label: 'Oudste accounts', sort: 'created_at', order: 'asc' },
      { label: 'Level hoog naar laag', sort: 'access_level', order: 'desc' },
      { label: 'Level laag naar hoog', sort: 'access_level', order: 'asc' },
      { label: 'E-mail A-Z', sort: 'email', order: 'asc' },
      { label: 'E-mail Z-A', sort: 'email', order: 'desc' },
    ],
    []
  )

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const [sortIndex, setSortIndex] = useState(0)
  const [limit, setLimit] = useState<20 | 50>(20)
  const [offset, setOffset] = useState(0)
  const [levelFilter, setLevelFilter] = useState<'all' | '1' | '2' | '3'>('all')

  const sort = sortOptions[sortIndex]?.sort ?? 'created_at'
  const order = sortOptions[sortIndex]?.order ?? 'desc'

  const [data, setData] = useState<StudentRow[]>([])
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [myLevel, setMyLevel] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, sort, order, limit, levelFilter])

  const requestKey = useMemo(() => {
    return JSON.stringify({ q: debouncedSearch.trim(), sort, order, limit, offset, levelFilter })
  }, [debouncedSearch, sort, order, limit, offset, levelFilter])

  const fetchStudents = async (signal: AbortSignal) => {
    const params = new URLSearchParams()
    const q = debouncedSearch.trim()
    if (q) params.set('q', q)
    if (levelFilter !== 'all') params.set('level', levelFilter)
    params.set('sort', sort)
    params.set('order', order)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    let res: Response
    try {
      res = await fetch(`/api/admin/students?${params.toString()}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        signal,
      })
    } catch (e: unknown) {
      const isAbort =
        signal.aborted ||
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError')
      if (isAbort) return
      throw e
    }

    setStatus(res.status)

    if (res.status === 401 || res.status === 403) {
      setData([])
      setTotal(0)
      setSummary(EMPTY_SUMMARY)
      setError(null)
      return
    }

    if (!res.ok) {
      try {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error || `Request failed (${res.status})`)
      } catch (e: unknown) {
        const isAbort =
          signal.aborted ||
          (e instanceof DOMException && e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError')
        if (isAbort) return
        if (e instanceof Error) throw e
        throw new Error(`Request failed (${res.status})`)
      }
    }

    try {
      const json = (await res.json()) as StudentsResponse
      setData(Array.isArray(json.data) ? json.data : [])
      setSummary(json.summary ?? EMPTY_SUMMARY)
      setTotal(typeof json.total === 'number' ? json.total : 0)
      setError(null)
    } catch (e: unknown) {
      const isAbort =
        signal.aborted ||
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError')
      if (isAbort) return
      throw e
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        await fetchStudents(controller.signal)
      } catch (e: unknown) {
        const isAbort =
          controller.signal.aborted ||
          (e instanceof DOMException && e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError')

        if (isAbort) return
        if (requestId !== requestIdRef.current) return

        const message = e instanceof Error ? e.message : 'Unknown error'
        setError(message)
        setData([])
        setTotal(0)
      } finally {
        if (controller.signal.aborted) return
        if (requestId !== requestIdRef.current) return
        setLoading(false)
      }
    }

    void run()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, refreshTick])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await fetch('/api/me', { method: 'GET', headers: { accept: 'application/json' } })
        if (!res.ok) {
          if (!mounted) return
          setMyLevel(null)
          return
        }
        const json = (await res.json()) as MeResponse
        if (!mounted) return
        setMyLevel(typeof json?.access_level === 'number' ? json.access_level : null)
      } catch {
        if (!mounted) return
        setMyLevel(null)
      }
    }
    void run()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedStudentId) return
    if (!data.some((student) => student.id === selectedStudentId)) setSelectedStudentId(null)
  }, [data, selectedStudentId])

  useEffect(() => {
    if (!copyNotice) return
    const t = window.setTimeout(() => setCopyNotice(null), 1600)
    return () => window.clearTimeout(t)
  }, [copyNotice])

  const canPrev = offset > 0
  const canNext = offset + limit < total
  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = total === 0 ? 0 : Math.min(offset + limit, total)
  const noAccess = status === 401 || status === 403
  const canEditLevels = myLevel === 3 && !noAccess
  const selectedStudent = selectedStudentId ? data.find((student) => student.id === selectedStudentId) ?? null : null

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyNotice(`${label} gekopieerd`)
    } catch {
      setCopyNotice('Kopieren mislukt')
    }
  }

  const updateStudentLevel = (studentId: string, level: Level) => {
    setData((rows) => rows.map((r) => (r.id === studentId ? { ...r, access_level: level } : r)))
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
            <Shield className="h-4 w-4 text-[var(--accent)]" />
            Level 3 beheer
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Accounts beheren</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-dim)]">
            Bekijk nieuwe accounts, contactgegevens, betalingen en voortgang vanuit een controlepaneel.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setRefreshTick((t) => t + 1)}
          disabled={loading || noAccess}
          className="w-full md:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Vernieuwen
        </Button>
      </div>

      {noAccess ? (
        <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="text-base font-medium">Geen toegang</div>
          <div className="mt-1 text-sm text-[var(--text-dim)]">
            Je hebt geen toestemming om deze pagina te bekijken.
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard">Terug naar dashboard</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <StatBlock icon={Users} label="Accounts" value={summary.total_students} helper={`${total} in deze selectie`} />
            <StatBlock icon={UserCheck} label="Nieuw 7 dagen" value={summary.new_last_7_days} helper="Nieuwe registraties" />
            <StatBlock icon={CreditCard} label="Betaald" value={summary.paid_students} helper="Unieke betaalde accounts" />
            <StatBlock icon={Shield} label="Level 1" value={summary.level_counts[1]} helper="Basic toegang" />
            <StatBlock icon={CheckCircle2} label="Level 2" value={summary.level_counts[2]} helper="Volledige course" />
            <StatBlock icon={AlertCircle} label="Zonder telefoon" value={summary.visible_without_phone} helper="Zichtbare rijen" />
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)]/70">
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid w-full gap-3 md:grid-cols-[minmax(220px,1fr)_150px_220px_110px]">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--text-dim)]" htmlFor="admin-student-search">
                      Zoeken
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                      <Input
                        id="admin-student-search"
                        placeholder="Naam of e-mail"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-[var(--border)] bg-[var(--bg)] pl-9 text-white placeholder:text-[var(--text-dim)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--text-dim)]" htmlFor="admin-level-filter">
                      Level
                    </label>
                    <Select
                      id="admin-level-filter"
                      value={levelFilter}
                      onValueChange={(value) => setLevelFilter((value === '1' || value === '2' || value === '3' ? value : 'all'))}
                      options={[
                        { label: 'Alle levels', value: 'all' },
                        { label: 'Level 1', value: '1' },
                        { label: 'Level 2', value: '2' },
                        { label: 'Level 3', value: '3' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--text-dim)]" htmlFor="admin-sort">
                      Sorteren
                    </label>
                    <Select
                      id="admin-sort"
                      value={String(sortIndex)}
                      onValueChange={(value) => setSortIndex(Number(value))}
                      options={sortOptions.map((opt, idx) => ({ label: opt.label, value: String(idx) }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--text-dim)]" htmlFor="admin-rows">
                      Rijen
                    </label>
                    <Select
                      id="admin-rows"
                      value={String(limit)}
                      onValueChange={(value) => setLimit((Number(value) === 50 ? 50 : 20) as 20 | 50)}
                      options={[
                        { label: '20', value: '20' },
                        { label: '50', value: '50' },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center xl:justify-end">
                  <div className="text-sm tabular-nums text-[var(--text-dim)]">
                    <span className="text-white">{showingFrom}</span> - <span className="text-white">{showingTo}</span>
                    <span className="mx-2">van</span>
                    <span className="text-white">{total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOffset((o) => Math.max(0, o - limit))} disabled={!canPrev || loading}>
                      Vorige
                    </Button>
                    <Button variant="outline" onClick={() => setOffset((o) => o + limit)} disabled={!canNext || loading}>
                      Volgende
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-[var(--border)] py-4 last:border-b-0">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                    <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
                    <div className="ml-auto h-4 w-24 animate-pulse rounded bg-white/10" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-5">
                  <div className="text-base font-medium text-red-100">Laden mislukt</div>
                  <div className="mt-1 text-sm text-red-100/70">{error}</div>
                  <Button variant="outline" className="mt-4" onClick={() => setRefreshTick((t) => t + 1)}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : total === 0 ? (
              <div className="p-6">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-6">
                  <div className="text-base font-medium">Geen accounts gevonden</div>
                  <div className="mt-1 text-sm text-[var(--text-dim)]">Pas je zoekopdracht of filters aan.</div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Account</TableHead>
                      <TableHead className="min-w-[210px]">Contact</TableHead>
                      <TableHead className="w-[160px]">Level</TableHead>
                      <TableHead className="min-w-[150px]">Betaling</TableHead>
                      <TableHead className="min-w-[180px]">Voortgang</TableHead>
                      <TableHead className="min-w-[150px]">Activiteit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((student) => {
                      const payment = paymentBadge(student)
                      const whatsappHref = buildWhatsappHref(student.phone)

                      return (
                        <TableRow
                          key={student.id}
                          className="cursor-pointer transition hover:bg-white/[0.03]"
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/12 text-sm font-semibold text-[var(--accent)]">
                                {(student.name?.trim()?.[0] ?? student.email[0] ?? '?').toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-medium text-white">{student.name?.trim() || 'Naam onbekend'}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-dim)]">
                                  <span>{formatDateBrussels(student.created_at)}</span>
                                  {student.auth?.email_confirmed_at ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-300">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      bevestigd
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="min-w-0 space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-[var(--text-dim)]">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[var(--text-dim)]">
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                <span className={student.phone ? 'truncate text-white' : 'text-[var(--text-dim)]'}>
                                  {student.phone ?? 'Geen nummer'}
                                </span>
                              </div>
                              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                <ContactAction icon={Copy} label="E-mail kopieren" onClick={() => copyValue(student.email, 'E-mail')} />
                                <ContactAction icon={ExternalLink} label="WhatsApp openen" href={whatsappHref ?? undefined} disabled={!whatsappHref} />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {canEditLevels ? (
                              <LevelSelectCell
                                studentId={student.id}
                                email={student.email}
                                initialLevel={student.access_level}
                                disabled={loading}
                                onCommitted={(level) => updateStudentLevel(student.id, level)}
                              />
                            ) : (
                              <Badge variant={levelBadgeVariant(student.access_level)}>Level {student.access_level}</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${payment.className}`}>
                              {payment.label}
                            </span>
                            <div className="mt-1 text-xs text-[var(--text-dim)]">
                              {formatPaymentAmount(student.payment.amount, student.payment.currency) ??
                                formatDateBrussels(student.payment.created_at)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <ProgressMeter pct={student.progress.pct} />
                            <div className="mt-1 text-xs text-[var(--text-dim)]">
                              {student.progress.watched_lessons}/{student.progress.total_lessons} lessen, {student.exams.passed} examens gehaald
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-white">
                              <Activity className="h-4 w-4 text-[var(--accent)]" />
                              {formatRelative(student.latest_activity_at)}
                            </div>
                            <div className="mt-1 text-xs text-[var(--text-dim)]">
                              {formatDateBrussels(student.latest_activity_at, true)}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}

      {copyNotice ? (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-white shadow-xl">
          {copyNotice}
        </div>
      ) : null}

      {selectedStudent ? (
        <StudentDetailPanel student={selectedStudent} onClose={() => setSelectedStudentId(null)} onCopy={copyValue} />
      ) : null}
    </div>
  )
}
