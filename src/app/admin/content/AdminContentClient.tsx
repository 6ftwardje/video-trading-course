'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import type { AdminLessonRow, AdminModuleRow, AdminPracticalRow } from './types'

type TabKey = 'modules' | 'lessons' | 'practical'

function normDescription(d: string | null | undefined): string | null {
  if (d === null || d === undefined) return null
  const t = d.trim()
  return t === '' ? null : t
}

function descriptionsEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  return normDescription(a) === normDescription(b)
}

type Props = {
  initialModules: AdminModuleRow[]
  initialLessons: AdminLessonRow[]
  initialPracticalLessons: AdminPracticalRow[]
  moduleTitleById: Record<number, string>
}

export default function AdminContentClient({
  initialModules,
  initialLessons,
  initialPracticalLessons,
  moduleTitleById: initialModuleTitles,
}: Props) {
  const [modules, setModules] = useState(initialModules)
  const [lessons, setLessons] = useState(initialLessons)
  const [practicalLessons, setPracticalLessons] = useState(initialPracticalLessons)
  const [moduleTitleById, setModuleTitleById] = useState(initialModuleTitles)

  const [tab, setTab] = useState<TabKey>('modules')
  const [filter, setFilter] = useState('')

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
    initialModules[0]?.id ?? null,
  )
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    initialLessons[0]?.id ?? null,
  )
  const [selectedPracticalId, setSelectedPracticalId] = useState<number | null>(
    initialPracticalLessons[0]?.id ?? null,
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  )
  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  )
  const selectedPractical = useMemo(
    () => practicalLessons.find((p) => p.id === selectedPracticalId) ?? null,
    [practicalLessons, selectedPracticalId],
  )

  const applySelectionToForm = useCallback(() => {
    setError(null)
    setSuccess(null)
    if (tab === 'modules' && selectedModule) {
      setTitle(selectedModule.title ?? '')
      setDescription(selectedModule.description ?? '')
    } else if (tab === 'lessons' && selectedLesson) {
      setTitle(selectedLesson.title ?? '')
      setDescription(selectedLesson.description ?? '')
    } else if (tab === 'practical' && selectedPractical) {
      setTitle(selectedPractical.title ?? '')
      setDescription(selectedPractical.description ?? '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [tab, selectedModule, selectedLesson, selectedPractical])

  useEffect(() => {
    applySelectionToForm()
  }, [applySelectionToForm, selectedModuleId, selectedLessonId, selectedPracticalId, tab])

  const filterLower = filter.trim().toLowerCase()

  const filteredModules = useMemo(() => {
    if (!filterLower) return modules
    return modules.filter(
      (m) =>
        String(m.id).includes(filterLower) ||
        (m.title ?? '').toLowerCase().includes(filterLower),
    )
  }, [modules, filterLower])

  const filteredLessons = useMemo(() => {
    if (!filterLower) return lessons
    return lessons.filter((l) => {
      const mt = moduleTitleById[l.module_id] ?? ''
      return (
        String(l.id).includes(filterLower) ||
        (l.title ?? '').toLowerCase().includes(filterLower) ||
        mt.toLowerCase().includes(filterLower)
      )
    })
  }, [lessons, filterLower, moduleTitleById])

  const filteredPractical = useMemo(() => {
    if (!filterLower) return practicalLessons
    return practicalLessons.filter((p) => {
      const mt = moduleTitleById[p.module_id] ?? ''
      return (
        String(p.id).includes(filterLower) ||
        (p.title ?? '').toLowerCase().includes(filterLower) ||
        mt.toLowerCase().includes(filterLower)
      )
    })
  }, [practicalLessons, filterLower, moduleTitleById])

  const baselineTitle =
    tab === 'modules'
      ? selectedModule?.title
      : tab === 'lessons'
        ? selectedLesson?.title
        : selectedPractical?.title

  const baselineDescription =
    tab === 'modules'
      ? selectedModule?.description
      : tab === 'lessons'
        ? selectedLesson?.description
        : selectedPractical?.description

  const titleTrimmed = title.trim()
  const canSave =
    titleTrimmed.length > 0 &&
    (titleTrimmed !== (baselineTitle ?? '').trim() ||
      !descriptionsEqual(description, baselineDescription))

  const trySelect = (next: () => void) => {
    if (canSave) {
      const ok = window.confirm('Je hebt niet-opgeslagen wijzigingen. Toch doorgaan?')
      if (!ok) return
    }
    next()
  }

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    const payload = {
      title: titleTrimmed,
      description: normDescription(description),
    }

    try {
      let url: string
      let id: number
      if (tab === 'modules' && selectedModuleId !== null) {
        url = `/api/admin/content/modules/${selectedModuleId}`
        id = selectedModuleId
      } else if (tab === 'lessons' && selectedLessonId !== null) {
        url = `/api/admin/content/lessons/${selectedLessonId}`
        id = selectedLessonId
      } else if (tab === 'practical' && selectedPracticalId !== null) {
        url = `/api/admin/content/practical-lessons/${selectedPracticalId}`
        id = selectedPracticalId
      } else {
        setSaving(false)
        return
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
        }),
      })

      const json = (await res.json().catch(() => ({}))) as {
        error?: string
        id?: number
        title?: string
        description?: string | null
      }

      if (!res.ok) {
        setError(json.error ?? `Opslaan mislukt (${res.status})`)
        setSaving(false)
        return
      }

      if (json.title !== undefined) {
        if (tab === 'modules') {
          setModules((rows) =>
            rows.map((m) =>
              m.id === id ? { ...m, title: json.title!, description: json.description ?? null } : m,
            ),
          )
          setModuleTitleById((prev) => ({ ...prev, [id]: json.title! }))
        } else if (tab === 'lessons') {
          setLessons((rows) =>
            rows.map((l) =>
              l.id === id ? { ...l, title: json.title!, description: json.description ?? null } : l,
            ),
          )
        } else {
          setPracticalLessons((rows) =>
            rows.map((p) =>
              p.id === id ? { ...p, title: json.title!, description: json.description ?? null } : p,
            ),
          )
        }
        setTitle(json.title)
        setDescription(json.description ?? '')
      }

      setSuccess('Opgeslagen.')
      setSaving(false)
      window.setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Netwerkfout bij opslaan.')
      setSaving(false)
    }
  }

  const listShell = (
    items: { id: number; primary: string; secondary?: string }[],
    selectedId: number | null,
    onSelect: (id: number) => void,
  ) => (
    <div className="max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)]">
      {items.length === 0 ? (
        <p className="p-4 text-sm text-[var(--text-dim)]">Geen resultaten.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {items.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => trySelect(() => onSelect(row.id))}
                className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--muted)]/40 ${
                  selectedId === row.id ? 'bg-[var(--accent)]/15 text-white' : 'text-[var(--text-dim)]'
                }`}
              >
                <span className="font-mono text-xs text-[var(--text-dim)]">#{row.id}</span>{' '}
                <span className="text-white">{row.primary}</span>
                {row.secondary ? (
                  <span className="mt-0.5 block text-xs text-[var(--text-dim)]">{row.secondary}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const editorForm = (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-dim)]" htmlFor="content-title">
          Titel
        </label>
        <Input
          id="content-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-[var(--border)] bg-[var(--bg)] text-white"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-dim)]" htmlFor="content-desc">
          Beschrijving
        </label>
        <textarea
          id="content-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
      <Button
        type="button"
        disabled={!canSave || saving}
        onClick={() => void handleSave()}
        className="w-full sm:w-auto"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Opslaan…
          </>
        ) : (
          'Opslaan'
        )}
      </Button>
    </>
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Content beheren</h1>
          <p className="text-sm text-[var(--text-dim)]">
            Bewerk titels en beschrijvingen van modules, lessen en praktijklessen. Wijzigingen zijn direct zichtbaar
            voor iedereen.
          </p>
        </div>
        <Button variant="outline" asChild className="border-[var(--border)] text-[var(--text-dim)]">
          <Link href="/dashboard">Terug naar dashboard</Link>
        </Button>
      </div>

      <Card className="border-[var(--border)] bg-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Editor</CardTitle>
          <CardDescription className="text-[var(--text-dim)]">
            Alleen titel en beschrijving; overige velden blijven ongewijzigd.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <label className="sr-only" htmlFor="content-filter">
              Zoeken
            </label>
            <Input
              id="content-filter"
              placeholder="Zoek op id of titel (of modulenaam)…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-[var(--border)] bg-[var(--bg)] text-white"
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => trySelect(() => setTab(v as TabKey))}>
            <TabsList className="flex w-full flex-wrap gap-1 bg-[var(--muted)]/30">
              <TabsTrigger value="modules" className="flex-1 sm:flex-none">
                Modules
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex-1 sm:flex-none">
                Lessen
              </TabsTrigger>
              <TabsTrigger value="practical" className="flex-1 sm:flex-none">
                Praktijklessen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Modules
                  </h3>
                  {listShell(
                    filteredModules.map((m) => ({
                      id: m.id,
                      primary: m.title || '(Geen titel)',
                    })),
                    selectedModuleId,
                    (id) => setSelectedModuleId(id),
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Bewerken
                  </h3>
                  {selectedModule ? editorForm : <p className="text-sm text-[var(--text-dim)]">Selecteer een module.</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Lessen
                  </h3>
                  {listShell(
                    filteredLessons.map((l) => ({
                      id: l.id,
                      primary: l.title || '(Geen titel)',
                      secondary: `Module: ${moduleTitleById[l.module_id] ?? l.module_id}`,
                    })),
                    selectedLessonId,
                    (id) => setSelectedLessonId(id),
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Bewerken
                  </h3>
                  {selectedLesson ? (
                    editorForm
                  ) : (
                    <p className="text-sm text-[var(--text-dim)]">Selecteer een les.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="practical" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Praktijklessen
                  </h3>
                  {listShell(
                    filteredPractical.map((p) => ({
                      id: p.id,
                      primary: p.title || '(Geen titel)',
                      secondary: `Module: ${moduleTitleById[p.module_id] ?? p.module_id}`,
                    })),
                    selectedPracticalId,
                    (id) => setSelectedPracticalId(id),
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Bewerken
                  </h3>
                  {selectedPractical ? (
                    editorForm
                  ) : (
                    <p className="text-sm text-[var(--text-dim)]">Selecteer een praktijkles.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
