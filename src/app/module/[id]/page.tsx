'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import { getExamByModuleId } from '@/lib/exam'
import { CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'

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
      const { id } = await params
      setModuleId(id)
      
      setLoading(true)
      const { data: ls } = await supabase
        .from('lessons')
        .select('id,title,order,module_id')
        .eq('module_id', id)
        .order('order', { ascending: true })

      setLessons(ls || [])

      const studentId = getStoredStudentId()
      if (studentId) {
        const { data: prs } = await supabase
          .from('progress')
          .select('lesson_id,watched')
          .eq('watched', true)
          .eq('student_id', studentId)
          .in('lesson_id', (ls || []).map(l => l.id))

        const map: Record<number, boolean> = {}
        ;(prs || []).forEach((row: ProgressRow) => {
          map[row.lesson_id] = true
        })
        setProgress(map)
      }
      setLoading(false)
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
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crypto-orange">Module {moduleId}</h1>
          <p className="text-gray-400 text-sm">Voortgang: {watchedCount}/{total} • {pct}%</p>
        </div>
        <div className="w-44 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-crypto-blue" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Laden…</p>
      ) : (
        <>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isWatched = !!progress[lesson.id]
              const isUnlocked = unlockedIds.has(lesson.id)
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    {isWatched ? (
                      <CheckCircle2 className="text-crypto-orange" />
                    ) : isUnlocked ? (
                      <div className="w-5 h-5 rounded-full border border-gray-600" />
                    ) : (
                      <Lock className="text-gray-500" />
                    )}
                    <div>
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-xs text-gray-500">Les {lesson.order}</div>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <a
                      href={`/lesson/${lesson.id}`}
                      className="px-4 py-2 rounded-md bg-crypto-blue/20 border border-crypto-blue/40 hover:bg-crypto-blue/30 transition text-white"
                    >
                      Openen
                    </a>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
                      title="Deze les wordt ontgrendeld nadat je de vorige volledig bekeek."
                    >
                      Vergrendeld
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* EXAMEN CTA (zichtbaar als alle lessen watched zijn) */}
          {lessons.length > 0 && watchedCount === total && examId && (
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">Examen van deze module is klaar</div>
                <div className="text-sm text-gray-400">Je hebt alle lessen bekeken. Start het examen om door te gaan.</div>
              </div>
              <Link
                href={`/exam/${examId}?module=${moduleId}`}
                className="px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30 transition"
                aria-label="Start examen"
              >
                Start examen
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

