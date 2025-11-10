'use client'

import { useEffect, useState } from 'react'
import { getStoredStudentEmail, getStoredStudentId } from '@/lib/student'
import { getLessonsForModules, getModulesSimple, getWatchedLessonIds, findNextLesson } from '@/lib/progress'
import { getExamByModuleId } from '@/lib/exam'
import HeroDashboard from '@/components/HeroDashboard'
import Container from '@/components/ui/Container'
import ModuleProgressCard from '@/components/ModuleProgressCard'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & { totalLessons: number; watchedCount: number; pct: number; examId: number | null }

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [activeModule, setActiveModule] = useState<ModuleWithProgress | null>(null)
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

      // 6) Bepaal actieve module voor kaartweergave
      if (byModule.length > 0) {
        const byId = new Map(byModule.map(m => [m.id, m]))
        let candidate: ModuleWithProgress | null = null
        if (next?.module?.id) candidate = byId.get(next.module.id) ?? null
        if (!candidate) candidate = byModule.find(m => m.pct < 100) ?? null
        if (!candidate) candidate = byModule[byModule.length - 1] ?? null
        setActiveModule(candidate)
      } else {
        setActiveModule(null)
      }

      setLoading(false)
    }
    run()
  }, [])

  return (
    <>
      <HeroDashboard 
        userName={email?.split('@')[0] || undefined} 
        nextLessonUrl={nextLessonHref || undefined}
        progressText={progressText}
      />
      <Container className="pb-16">
        <div className="space-y-12">
          {/* MODULE SECTION */}
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-semibold">Jouw huidige module</h2>
                <p className="text-sm text-[var(--text-dim)]">
                  Werk verder waar je gebleven bent. Je kan steeds terugkeren naar het overzicht.
                </p>
              </div>
              <a
                href="/modules"
                className="text-sm font-medium text-[var(--accent)] underline-offset-4 transition hover:underline"
              >
                Bekijk alle modules
              </a>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-24 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 animate-pulse" />
                <div className="h-16 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 animate-pulse" />
              </div>
            ) : activeModule ? (
              <ModuleProgressCard module={activeModule} />
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 text-sm text-[var(--text-dim)]">
                Nog geen modules beschikbaar. Kom later terug voor nieuwe content.
              </div>
            )}
          </section>
        </div>
      </Container>
    </>
  )
}
