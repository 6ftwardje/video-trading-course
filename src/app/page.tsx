'use client'

import { useEffect, useState } from 'react'
import { getStoredStudentEmail, getStoredStudentId } from '@/lib/student'
import { getLessonsForModules, getModulesSimple, getWatchedLessonIds, findNextLesson } from '@/lib/progress'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & { totalLessons: number; watchedCount: number; pct: number }

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [nextLessonHref, setNextLessonHref] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const studentId = getStoredStudentId()
      const studentEmail = getStoredStudentEmail()
      setEmail(studentEmail)

      // 1) Modules + alle lessen
      const mods = (await getModulesSimple()) as ModuleRow[]
      const moduleIds = mods.map(m => m.id)
      const lessons = (await getLessonsForModules(moduleIds)) as LessonRow[]

      // 2) Watched set
      const watchedSet = await getWatchedLessonIds(studentId || '', lessons.map(l => l.id))

      // 3) Per module progress berekenen (x/y en %)
      const byModule: ModuleWithProgress[] = mods.map((m) => {
        const ls = lessons.filter(l => l.module_id === m.id)
        const total = ls.length
        const watched = ls.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        return { ...m, totalLessons: total, watchedCount: watched, pct }
      })

      setModules(byModule)

      // 4) Bepaal "volgende les" simpele logica (eerste onvoltooide)
      const next = findNextLesson(mods, lessons, watchedSet)
      if (next?.lesson?.id) setNextLessonHref(`/lesson/${next.lesson.id}`)
      else if (mods[0]?.id) setNextLessonHref(`/module/${mods[0].id}`)

      setLoading(false)
    }
    run()
  }, [])

  // Totale voortgang (over alle modules): simpel gemiddelde van module-percentages
  const overallPct =
    modules.length > 0 ? Math.round(modules.reduce((acc, m) => acc + m.pct, 0) / modules.length) : 0

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welkom{email ? `, ${email}` : ''} 👋
            </h1>
            <p className="text-gray-400 mt-1">
              Blijf bouwen aan je skillset. Je leert traden via video modules.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Totale voortgang</div>
            <div className="mt-2 w-44 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-crypto-blue" style={{ width: `${overallPct}%` }} />
            </div>
            <div className="text-sm text-gray-400 mt-1">{overallPct}%</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {nextLessonHref && (
            <a
              href={nextLessonHref}
              className="px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30 transition text-white"
            >
              Ga verder →
            </a>
          )}
          <a
            href={modules[0] ? `/module/${modules[0].id}` : '#'}
            className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 transition text-white"
          >
            Bekijk modules
          </a>
        </div>
      </section>

      {/* MODULE GRID */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Jouw modules</h2>

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
                className="block bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-crypto-orange transition-all"
                aria-label={`Open ${m.title}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">{m.title}</h3>
                    {m.description && <p className="text-gray-400 text-sm mt-1">{m.description}</p>}
                  </div>

                  <div className="text-right min-w-[10rem]">
                    <div className="text-sm text-gray-300">
                      {m.watchedCount}/{m.totalLessons} lessen • {m.pct}%
                    </div>
                    <div className="mt-2 w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-crypto-blue" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
