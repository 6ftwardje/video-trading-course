'use client'

import { useEffect, useState } from 'react'
import { getStoredStudentEmail, getStoredStudentId } from '@/lib/student'
import { getLessonsForModules, getModulesSimple, getWatchedLessonIds, findNextLesson } from '@/lib/progress'
import { getExamByModuleId } from '@/lib/exam'
import HeroDashboard from '@/components/HeroDashboard'
import Container from '@/components/ui/Container'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & { totalLessons: number; watchedCount: number; pct: number; examId: number | null }

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [nextLessonHref, setNextLessonHref] = useState<string | null>(null)
  const [progressText, setProgressText] = useState<string>('Welkom terug')

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

      // 3) Per module progress berekenen (x/y en %) + examen ophalen
      const byModule: ModuleWithProgress[] = []
      for (const m of mods) {
        const ls = lessons.filter(l => l.module_id === m.id)
        const total = ls.length
        const watched = ls.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        const exam = await getExamByModuleId(m.id)
        byModule.push({ ...m, totalLessons: total, watchedCount: watched, pct, examId: exam?.id ?? null })
      }

      setModules(byModule)

      // 4) Bepaal "volgende les" simpele logica (eerste onvoltooide)
      const next = findNextLesson(mods, lessons, watchedSet)
      if (next?.lesson?.id) setNextLessonHref(`/lesson/${next.lesson.id}`)
      else if (mods[0]?.id) setNextLessonHref(`/module/${mods[0].id}`)

      // 5) Bepaal progressText voor Hero
      if (next?.module && next?.lesson) {
        const modLessons = lessons.filter(l => l.module_id === next.module.id)
        const modWatched = modLessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        setProgressText(`Je staat op ${modWatched}/${modLessons.length} lessen in ${next.module.title}`)
      } else if (mods.length > 0 && byModule.length > 0) {
        const firstMod = byModule[0]
        setProgressText(`Je staat op ${firstMod.watchedCount}/${firstMod.totalLessons} lessen in ${firstMod.title}`)
      }

      setLoading(false)
    }
    run()
  }, [])

  // Totale voortgang (over alle modules): simpel gemiddelde van module-percentages
  const overallPct =
    modules.length > 0 ? Math.round(modules.reduce((acc, m) => acc + m.pct, 0) / modules.length) : 0

  return (
    <>
      <HeroDashboard 
        userName={email?.split('@')[0] || undefined} 
        nextLessonUrl={nextLessonHref || undefined}
        progressText={progressText}
      />
      <Container className="pb-16">
        <div className="space-y-8">

          {/* MODULE GRID */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Jouw modules</h2>

            {loading ? (
              <div className="space-y-3">
                <div className="h-20 bg-[var(--card)]/60 rounded-lg animate-pulse" />
                <div className="h-20 bg-[var(--card)]/60 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m) => (
                  <div key={m.id}>
                    <a
                      href={`/module/${m.id}`}
                      className="block bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl hover:border-[var(--accent)] transition-all"
                      aria-label={`Open ${m.title}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold">{m.title}</h3>
                          {m.description && <p className="text-[var(--text-dim)] text-sm mt-1">{m.description}</p>}
                        </div>

                        <div className="text-right min-w-[10rem]">
                          <div className="text-sm text-white/90">
                            {m.watchedCount}/{m.totalLessons} lessen • {m.pct}%
                          </div>
                          <div className="mt-2 w-40 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent)]" style={{ width: `${m.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </a>
                    {m.pct === 100 && m.examId && (
                      <div className="mt-2 bg-[var(--card)] border border-[var(--border)] px-5 py-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">Examen beschikbaar</div>
                            <div className="text-xs text-[var(--text-dim)]">Test je kennis van deze module</div>
                          </div>
                          <a
                            href={`/exam/${m.examId}?module=${m.id}`}
                            className="px-4 py-2 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-sm text-white"
                          >
                            Start examen
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </>
  )
}
