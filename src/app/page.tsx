'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number }
type ProgressRow = { lesson_id: number }

type ModuleWithProgress = ModuleRow & {
  totalLessons: number
  watchedCount: number
  pct: number
}

export default function HomePage() {
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // 1) Haal alle modules
      const { data: mods } = await supabase.from('modules').select('id,title,description,order').order('order', { ascending: true })
      const modules = (mods || []) as ModuleRow[]
      if (!modules.length) {
        setModules([])
        setLoading(false)
        return
      }

      const moduleIds = modules.map(m => m.id)

      // 2) Haal alle lessen voor deze modules
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id,module_id')
        .in('module_id', moduleIds)
      const allLessons = (lessons || []) as LessonRow[]

      // 3) Haal voortgang voor huidige student
      const studentId = getStoredStudentId()
      let watchedByLessonId = new Set<number>()
      if (studentId) {
        const lessonIds = allLessons.map(l => l.id)
        const { data: prog } = await supabase
          .from('progress')
          .select('lesson_id')
          .eq('watched', true)
          .eq('student_id', studentId)
          .in('lesson_id', lessonIds.length ? lessonIds : [-1])
        const progress = (prog || []) as ProgressRow[]
        watchedByLessonId = new Set(progress.map(p => p.lesson_id))
      }

      // 4) Bouw per module de progress-samenvatting
      const byModule = modules.map(m => {
        const ls = allLessons.filter(l => l.module_id === m.id)
        const total = ls.length
        const watched = ls.reduce((acc, l) => acc + (watchedByLessonId.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        return { ...m, totalLessons: total, watchedCount: watched, pct }
      })

      setModules(byModule)
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-crypto-orange">Video Trading Course</h1>
      <p className="text-gray-400 mb-10">Powered by Cryptoriez</p>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-gray-800/60 rounded-lg animate-pulse" />
          <div className="h-20 bg-gray-800/60 rounded-lg animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((m) => (
            <a
              key={m.id}
              href={`/module/${m.id}`}
              className="block bg-gray-800 border border-gray-700 p-5 rounded-xl hover:border-crypto-orange transition-all"
              aria-label={`Open ${m.title}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{m.title}</h2>
                  {m.description && <p className="text-gray-400 text-sm mt-1">{m.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-gray-300 mb-2">
                    {m.watchedCount}/{m.totalLessons} lessen • {m.pct}%
                  </div>
                  <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-crypto-blue transition-all duration-300" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
