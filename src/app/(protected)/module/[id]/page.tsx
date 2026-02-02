'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useStudent } from '@/components/StudentProvider'
import { getExamByModuleId } from '@/lib/exam'
import { getPracticalLessons, type PracticalLessonRecord } from '@/lib/practical'
import { getModulesSimple } from '@/lib/progress'
import { getModuleGateStatus } from '@/lib/moduleGate'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { WaveLoader } from '@/components/ui/wave-loader'
import { RequireAccess } from '@/components/RequireAccess'

type Lesson = { id: number; title: string; order: number; module_id: number; thumbnail_url?: string | null }
type ProgressRow = { lesson_id: number; watched: boolean }
type PracticalLesson = PracticalLessonRecord

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { student, status } = useStudent()
  const [moduleId, setModuleId] = useState<string>('')
  const [moduleTitle, setModuleTitle] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [examId, setExamId] = useState<number | null>(null)
  const [practicalLessons, setPracticalLessons] = useState<PracticalLesson[]>([])
  const [moduleLocked, setModuleLocked] = useState<boolean>(false)
  const [previousModuleOrder, setPreviousModuleOrder] = useState<number | null>(null)
  const [previousModuleTitle, setPreviousModuleTitle] = useState<string | null>(null)

  const accessLevel = student?.access_level ?? 1
  const studentId = student?.id ?? null

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        setModuleId(id)
        
        const moduleIdNum = Number(id)
        if (isNaN(moduleIdNum)) {
          console.error('Invalid module ID:', id)
          setLessons([])
          setPracticalLessons([])
          setLoading(false)
          return
        }
        
        setLoading(true)
        const supabase = getSupabaseClient()
        
        // Fetch module information
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('title')
          .eq('id', moduleIdNum)
          .single()
        
        if (moduleError) {
          console.error('Error fetching module:', moduleError)
        } else if (moduleData) {
          setModuleTitle(moduleData.title || '')
        }
        
        const { data: ls, error: lessonsError } = await supabase
          .from('lessons')
          .select('id,title,"order",module_id,thumbnail_url')
          .eq('module_id', moduleIdNum)
        
        // Sort manually to avoid PostgREST query string issues
        const sortedLessons = ls ? [...ls].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : null
        
        if (lessonsError) {
          console.error('Error fetching lessons:', {
            message: lessonsError.message,
            details: lessonsError.details,
            hint: lessonsError.hint,
            code: lessonsError.code
          })
          setLessons([])
          setLoading(false)
          return
        }

        setLessons(sortedLessons || [])

        const practicals = await getPracticalLessons(moduleIdNum)
        setPracticalLessons(practicals)

        if (status !== 'ready' || !student) {
          setLoading(false)
          return
        }

        // Check module locking: Module 1 is always unlocked for access level 2+
        // Module N is only unlocked if exam of module N-1 is passed
        if (studentId && accessLevel >= 2) {
          const allModules = await getModulesSimple()
          const gateStatus = await getModuleGateStatus(allModules, moduleIdNum, studentId, accessLevel)
          setModuleLocked(gateStatus.isLockedByExam)
          setPreviousModuleOrder(gateStatus.previousModule?.order ?? null)
          setPreviousModuleTitle(gateStatus.previousModule?.title ?? null)
        } else {
          // Access level < 2 means locked by access
          setModuleLocked(true)
          setPreviousModuleOrder(null)
          setPreviousModuleTitle(null)
        }

        if (studentId && sortedLessons && sortedLessons.length > 0) {
          const { data: prs, error: progressError } = await supabase
            .from('progress')
            .select('lesson_id,watched')
            .eq('watched', true)
            .eq('student_id', studentId)
            .in('lesson_id', sortedLessons.map(l => l.id))

          if (progressError) {
            console.error('Error fetching progress:', progressError)
          } else {
            const map: Record<number, boolean> = {}
            ;(prs || []).forEach((row: ProgressRow) => {
              map[row.lesson_id] = true
            })
            setProgress(map)
          }
        }
      } catch (err) {
        console.error('Unexpected error loading module:', err)
        setLessons([])
        setPracticalLessons([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params, status, studentId, accessLevel]) // Use specific values instead of whole student object

  useEffect(() => {
    const fetchExam = async () => {
      const { id } = await params
      const exam = await getExamByModuleId(Number(id))
      setExamId(exam?.id ?? null)
    }
    fetchExam()
  }, [params])

  const unlockedIds = useMemo(() => {
    if (moduleLocked) return new Set<number>()
    // Regel: les n is unlocked als alle vorige lessen watched zijn
    const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const ids: number[] = []
    let gateOpen = true
    for (const lesson of sorted) {
      if (gateOpen) {
        ids.push(lesson.id)
        // volgende les wordt alleen unlocked als deze bekeken is
        gateOpen = !!progress[lesson.id]
      }
    }
    return new Set(ids)
  }, [lessons, progress, accessLevel, moduleLocked])

  const watchedCount = Object.values(progress).filter(Boolean).length
  const total = lessons.length
  const pct = total ? Math.round((watchedCount / total) * 100) : 0
  const previousModuleLabel = previousModuleOrder
    ? `Module ${previousModuleOrder}`
    : previousModuleTitle || 'de vorige module'

  return (
    <Container className="pt-8 md:pt-12 pb-16">
      <div className="mb-6 space-y-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)]/80 px-3 py-2 text-sm text-[var(--text-dim)] transition hover:text-white hover:border-[var(--accent)]/40"
          aria-label="Terug naar alle modules"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle modules
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--accent)]">
              {moduleTitle || `Module ${moduleId}`}
            </h1>
            <p className="text-[var(--text-dim)] text-sm">
              Voortgang: {watchedCount}/{total} • {pct}%
            </p>
          </div>
          <div className="w-44 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>


      {moduleLocked && (previousModuleOrder || previousModuleTitle) && (
        <div className="mb-6 rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-4 text-sm text-[#7C99E3]">
          🔒 Deze module is vergrendeld. Voltooi eerst het examen van {previousModuleLabel} om deze module te ontgrendelen.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <WaveLoader message="Laden..." />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isWatched = !!progress[lesson.id]
              const isUnlocked = unlockedIds.has(lesson.id)
              const lessonLocked = moduleLocked || !isUnlocked
              
              if (!lessonLocked) {
                return (
                  <RequireAccess key={lesson.id} requiredLevel={2} accessLevel={accessLevel}>
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-16 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                          <Image
                            src={lesson.thumbnail_url || 'https://placehold.co/320x180?text=Thumbnail'}
                            alt={lesson.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          {isWatched ? (
                            <CheckCircle2 className="text-[var(--accent)] flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-[var(--border)] flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-white">{lesson.title}</div>
                            <div className="text-xs text-[var(--text-dim)]">Les {lesson.order}</div>
                          </div>
                        </div>
                      </div>

                      {isWatched ? (
                        <span className="text-[var(--accent)] text-sm">✓ Voltooid</span>
                      ) : (
                        <span className="px-3 py-1 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-[var(--accent)] text-sm">
                          Start
                        </span>
                      )}
                    </Link>
                  </RequireAccess>
                )
              }
              
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-xl border border-dashed border-[#7C99E3]/30 bg-[var(--card)]/70 p-4 opacity-70"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-16 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                      <Image
                        src={(lesson as any).thumbnail_url || 'https://placehold.co/320x180?text=Thumbnail'}
                        alt={lesson.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-white">{lesson.title}</div>
                        <div className="text-xs text-[var(--text-dim)]">Les {lesson.order}</div>
                        {moduleLocked && (previousModuleOrder || previousModuleTitle) && (
                          <div className="text-xs text-[#7C99E3]">
                            Voltooi eerst het examen van {previousModuleLabel}
                          </div>
                        )}
                        {!moduleLocked && (
                          <div className="text-xs text-[#7C99E3]">Deze les wordt ontgrendeld nadat je de vorige volledig bekeek.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled
                    className="cursor-not-allowed rounded-md border border-[#7C99E3]/40 bg-[#7C99E3]/10 px-4 py-2 text-sm text-[#7C99E3]"
                    title={
                      moduleLocked 
                        ? previousModuleOrder || previousModuleTitle
                          ? `Voltooi eerst het examen van ${previousModuleLabel}`
                          : 'Module vergrendeld.'
                        : 'Deze les wordt ontgrendeld nadat je de vorige volledig bekeek.'
                    }
                  >
                    {moduleLocked ? 'Module vergrendeld' : 'Vergrendeld'}
                  </button>
                </div>
              )
            })}
          </div>

          {practicalLessons.length > 0 && !moduleLocked && (
            <RequireAccess requiredLevel={2} accessLevel={accessLevel}>
              <section className="mt-10">
                <h2 className="text-xl font-semibold mb-4 text-[#7C99E3]">Praktijklessen</h2>
                <div className="space-y-3">
                  {practicalLessons.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/praktijk/${pl.id}`}
                      className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[#7C99E3]/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-16 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                          <Image
                            src={(pl as any).thumbnail_url || 'https://placehold.co/320x180?text=Praktijk'}
                            alt={pl.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">{pl.title}</div>
                          {pl.description && (
                            <div className="text-xs text-[var(--text-dim)] line-clamp-2">{pl.description}</div>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-md bg-[#7C99E3]/10 border border-[#7C99E3]/30 text-[#7C99E3] text-sm">
                        Bekijk
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </RequireAccess>
          )}

          {/* EXAMEN CTA (zichtbaar als alle lessen watched zijn) */}
          {lessons.length > 0 && watchedCount === total && practicalLessons.length > 0 && !moduleLocked && (
            <RequireAccess requiredLevel={2} accessLevel={accessLevel}>
              <div className="mt-8 rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-4 text-sm text-[#7C99E3]">
                ✅ Je hebt alle lessen bekeken. Vergeet niet de praktijklessen van deze module door te nemen.
              </div>
            </RequireAccess>
          )}
          {lessons.length > 0 && watchedCount === total && examId && !moduleLocked && (
            <RequireAccess requiredLevel={2} accessLevel={accessLevel}>
            <div className="mt-8 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">Examen van deze module is klaar</div>
                <div className="text-sm text-[var(--text-dim)]">Je hebt alle lessen bekeken. Start het examen om door te gaan.</div>
              </div>
              <Link
                href={`/exam/${examId}?module=${moduleId}`}
                className="px-4 py-2 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-white"
                aria-label="Start examen"
              >
                Start examen
              </Link>
            </div>
            </RequireAccess>
          )}
        </>
      )}
    </Container>
  )
}

