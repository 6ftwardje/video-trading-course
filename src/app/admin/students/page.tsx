'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type StudentRow = {
  id: string
  email: string
  name: string | null
  access_level: number
  created_at: string
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

  const canPrev = offset > 0
  const canNext = offset + limit < total

  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = total === 0 ? 0 : Math.min(offset + limit, total)

  const noAccess = status === 401 || status === 403

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
                            <Badge variant={levelBadgeVariant(s.access_level)}>Level {s.access_level}</Badge>
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


