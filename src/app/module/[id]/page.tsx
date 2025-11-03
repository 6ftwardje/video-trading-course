'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import { getExamByModuleId } from '@/lib/exam'
import { CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'

type Lesson = { id: number; title: string; order: number; module_id: number }
type ProgressRow = { lesson_id: number; watched: boolean }

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const [moduleId, setModuleId] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [examId, setExamId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        setModuleId(id)
        
        const moduleIdNum = Number(id)
        if (isNaN(moduleIdNum)) {
          console.error('Invalid module ID:', id)
          setLessons([])
          setLoading(false)
          return
        }
        
        setLoading(true)
        const { data: ls, error: lessonsError } = await supabase
          .from('lessons')
          .select('id,title,"order",module_id')
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

        const studentId = getStoredStudentId()
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  useEffect(() => {
    const fetchExam = async () => {
      const { id } = await params
      const exam = await getExamByModuleId(Number(id))
      setExamId(exam?.id ?? null)
    }
    fetchExam()
  }, [params])

  const unlockedIds = useMemo(() => {
    // Regel: les n is unlocked als alle vorige lessen watched zijn
    const sorted = [...lessons].sort((a, b) => a.order - b.order)
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
  }, [lessons, progress])

  const watchedCount = Object.values(progress).filter(Boolean).length
  const total = lessons.length
  const pct = total ? Math.round((watchedCount / total) * 100) : 0

  return (
    <Container className="pt-20 pb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--accent)]">Module {moduleId}</h1>
          <p className="text-[var(--text-dim)] text-sm">Voortgang: {watchedCount}/{total} • {pct}%</p>
        </div>
        <div className="w-44 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--text-dim)]">Laden…</p>
      ) : (
        <>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isWatched = !!progress[lesson.id]
              const isUnlocked = unlockedIds.has(lesson.id)
              
              if (isUnlocked) {
                return (
                  <Link
                    key={lesson.id}
                    href={`/lesson/${lesson.id}`}
                    className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition cursor-pointer"
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
                )
              }
              
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 opacity-60"
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
                      <Lock className="text-[var(--text-dim)] flex-shrink-0" />
                      <div>
                        <div className="font-medium text-white">{lesson.title}</div>
                        <div className="text-xs text-[var(--text-dim)]">Les {lesson.order}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled
                    className="px-4 py-2 rounded-md bg-[var(--muted)] border border-[var(--border)] text-[var(--text-dim)] cursor-not-allowed"
                    title="Deze les wordt ontgrendeld nadat je de vorige volledig bekeek."
                  >
                    Vergrendeld
                  </button>
                </div>
              )
            })}
          </div>

          {/* EXAMEN CTA (zichtbaar als alle lessen watched zijn) */}
          {lessons.length > 0 && watchedCount === total && examId && (
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
          )}
        </>
      )}
    </Container>
  )
}

