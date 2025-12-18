'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type StudentRow = {
  id: string
  email: string
  name: string | null
  access_level: number
  created_at: string
}

type MeResponse = {
  id: string
  access_level: number
}

type StudentsResponse = {
  data: StudentRow[]
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

function SelectChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  )
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])

  return debounced
}

function formatDateBrussels(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('nl-BE', { timeZone: 'Europe/Brussels' })
}

function levelBadgeVariant(level: number): 'default' | 'secondary' | 'outline' {
  if (level >= 3) return 'default'
  if (level === 2) return 'secondary'
  return 'outline'
}

type Level = 1 | 2 | 3

function isLevel(n: unknown): n is Level {
  return n === 1 || n === 2 || n === 3
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

  // Keep component aligned if server data changes (e.g. pagination refresh).
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
        setSelected(committed) // rollback
        setError(message)
        return
      }

      // Success: commit and inform parent (so table stays in sync with server state).
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
      setSelected(committed) // rollback
      setError(message)
    } finally {
      if (!controller.signal.aborted) setPending(false)
    }
  }

  // Auto-hide "Level updated" after a moment.
  useEffect(() => {
    if (successTick === 0) return
    const t = window.setTimeout(() => {
      // no-op state change; we just rely on successTick for re-render timing
    }, 1200)
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
    <div className="flex flex-col gap-1">
      <div className="relative w-[150px]">
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
        <div className="text-xs text-[var(--text-dim)]">Level updated</div>
      ) : null}
    </div>
  )
}

export default function AdminStudentsPage() {
  const sortOptions: SortOption[] = useMemo(
    () => [
      { label: 'Newest', sort: 'created_at', order: 'desc' },
      { label: 'Oldest', sort: 'created_at', order: 'asc' },
      { label: 'Level (High → Low)', sort: 'access_level', order: 'desc' },
      { label: 'Level (Low → High)', sort: 'access_level', order: 'asc' },
      { label: 'Email (A → Z)', sort: 'email', order: 'asc' },
      { label: 'Email (Z → A)', sort: 'email', order: 'desc' },
    ],
    []
  )

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const [sortIndex, setSortIndex] = useState(0)
  const [limit, setLimit] = useState<20 | 50>(20)
  const [offset, setOffset] = useState(0)

  const sort = sortOptions[sortIndex]?.sort ?? 'created_at'
  const order = sortOptions[sortIndex]?.order ?? 'desc'

  const [data, setData] = useState<StudentRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)

  const [myLevel, setMyLevel] = useState<number | null>(null)

  const requestIdRef = useRef(0)
  const [refreshTick, setRefreshTick] = useState(0)

  // Reset pagination when filters change.
  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, sort, order, limit])

  const requestKey = useMemo(() => {
    return JSON.stringify({ q: debouncedSearch.trim(), sort, order, limit, offset })
  }, [debouncedSearch, sort, order, limit, offset])

  const fetchStudents = async (signal: AbortSignal) => {
    const params = new URLSearchParams()
    const q = debouncedSearch.trim()
    if (q) params.set('q', q)
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
      setError(null)
      return
    }

    if (!res.ok) {
      try {
        const text = await res.text()
        throw new Error(text || `Request failed (${res.status})`)
      } catch (e: unknown) {
        const isAbort =
          signal.aborted ||
          (e instanceof DOMException && e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError')
        if (isAbort) return
        // If text parsing failed for another reason, fall back to status.
        throw new Error(`Request failed (${res.status})`)
      }
    }

    try {
      const json = (await res.json()) as StudentsResponse
      setData(Array.isArray(json.data) ? json.data : [])
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

  // Fetch current user's access level (for showing/hiding the Level dropdown).
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

  const canPrev = offset > 0
  const canNext = offset + limit < total

  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = total === 0 ? 0 : Math.min(offset + limit, total)

  const noAccess = status === 401 || status === 403
  const canEditLevels = myLevel === 3 && !noAccess

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-[var(--text-dim)]">Search and manage access levels</p>
      </div>

      <Card className="mt-6 border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription className="text-[var(--text-dim)]">
            Browse all registered students (admin only).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 rounded-2xl bg-[var(--card)] p-6">
          {noAccess ? (
            <div className="rounded-lg bg-[var(--muted)]/20 p-6">
              <div className="text-base font-medium">No access</div>
              <div className="mt-1 text-sm text-[var(--text-dim)]">
                You don&apos;t have permission to view this page.
              </div>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/dashboard">Back to dashboard</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="w-full lg:max-w-md">
                    <Input
                      placeholder="Search by name or email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border-[var(--border)] bg-[var(--bg)] text-white placeholder:text-[var(--text-dim)]"
                    />
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-end lg:w-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--text-dim)]">Sort</span>
                      <div className="relative sm:w-[260px]">
                        <select
                          className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          value={String(sortIndex)}
                          onChange={(e) => setSortIndex(Number(e.target.value))}
                        >
                          {sortOptions.map((opt, idx) => (
                            <option key={`${opt.sort}-${opt.order}`} value={String(idx)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <SelectChevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--text-dim)]">Rows</span>
                      <div className="relative sm:w-[120px]">
                        <select
                          className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 pr-10 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          value={String(limit)}
                          onChange={(e) => setLimit((Number(e.target.value) === 50 ? 50 : 20) as 20 | 50)}
                        >
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                        <SelectChevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                  <div className="text-sm tabular-nums text-[var(--text-dim)] sm:mr-2 sm:whitespace-nowrap">
                    Showing <span className="text-white">{showingFrom}</span>
                    <span className="mx-1 text-[var(--text-dim)]">–</span>
                    <span className="text-white">{showingTo}</span>
                    <span className="mx-2 text-[var(--text-dim)]">of</span>
                    <span className="text-white">{total}</span>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setOffset((o) => Math.max(0, o - limit))}
                      disabled={!canPrev || loading}
                      className="w-full sm:w-auto"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOffset((o) => o + limit)}
                      disabled={!canNext || loading}
                      className="w-full sm:w-auto"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="rounded-md bg-[var(--bg)]">
                  <div className="p-4">
                    <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                  </div>
                  <div>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 border-b border-[var(--border)] p-4 last:border-b-0">
                        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
                        <div className="h-6 w-20 animate-pulse rounded bg-white/10" />
                        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-lg bg-[var(--muted)]/20 p-6">
                  <div className="text-base font-medium">Something went wrong</div>
                  <div className="mt-1 text-sm text-[var(--text-dim)]">{error}</div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRefreshTick((t) => t + 1)
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : total === 0 ? (
                <div className="rounded-lg bg-[var(--muted)]/20 p-6">
                  <div className="text-base font-medium">No students found</div>
                  <div className="mt-1 text-sm text-[var(--text-dim)]">
                    Try adjusting your search or filters.
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-[var(--bg)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[140px]">Level</TableHead>
                        <TableHead className="w-[140px]">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name?.trim() ? s.name : '—'}</TableCell>
                          <TableCell className="text-[var(--text-dim)]">{s.email}</TableCell>
                          <TableCell>
                            {canEditLevels ? (
                              <LevelSelectCell
                                studentId={s.id}
                                email={s.email}
                                initialLevel={s.access_level}
                                disabled={loading}
                                onCommitted={(level) => {
                                  setData((rows) => rows.map((r) => (r.id === s.id ? { ...r, access_level: level } : r)))
                                }}
                              />
                            ) : (
                              <Badge variant={levelBadgeVariant(s.access_level)}>Level {s.access_level}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-[var(--text-dim)]">{formatDateBrussels(s.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


