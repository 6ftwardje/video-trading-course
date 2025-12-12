'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeroDashboard from '@/components/HeroDashboard'
import Container from '@/components/ui/Container'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardModulesSection from '@/components/DashboardModulesSection'
import DashboardProgress from '@/components/DashboardProgress'
import TradingSessions from '@/components/TradingSessions'
import { useStudent } from '@/components/StudentProvider'
import { getLessonsForModules, getModulesSimple, getWatchedLessonIds, findNextLesson } from '@/lib/progress'
import { getExamByModuleId } from '@/lib/exam'
import { getSupabaseClient } from '@/lib/supabaseClient'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & { totalLessons: number; watchedCount: number; pct: number; examId: number | null }

export default function DashboardPage() {
  const router = useRouter()
  const { student, status } = useStudent()
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [activeModule, setActiveModule] = useState<ModuleWithProgress | null>(null)
  const [nextLessonHref, setNextLessonHref] = useState<string | null>(null)
  const [progressText, setProgressText] = useState<string>('Welkom terug')

  const accessLevel = student?.access_level ?? 1
  const studentId = student?.id ?? null
  const email = student?.email ?? null

  useEffect(() => {
    const run = async () => {
      if (status !== 'ready' || !student) {
        if (status === 'unauthenticated') {
          router.replace('/login')
        }
        return
      }

      setLoading(true)

      const mods = (await getModulesSimple()) as ModuleRow[]
      const moduleIds = mods.map(m => m.id)
      const lessons = (await getLessonsForModules(moduleIds)) as LessonRow[]

      const watchedSet = await getWatchedLessonIds(studentId || '', lessons.map(l => l.id))

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

      const next = findNextLesson(mods, lessons, watchedSet)
      if (accessLevel >= 2) {
        if (next?.lesson?.id) setNextLessonHref(`/lesson/${next.lesson.id}`)
        else if (mods[0]?.id) setNextLessonHref(`/module/${mods[0].id}`)
        else setNextLessonHref(null)
      } else {
        setNextLessonHref(null)
      }

      if (accessLevel < 2) {
        setProgressText('Je hebt Basic toegang. Upgrade voor alle videolessen.')
      } else if (next?.module && next?.lesson) {
        const modLessons = lessons.filter(l => l.module_id === next.module.id)
        const modWatched = modLessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        setProgressText(`Je staat op ${modWatched}/${modLessons.length} lessen in ${next.module.title}`)
      } else if (mods.length > 0 && byModule.length > 0) {
        const firstMod = byModule[0]
        setProgressText(`Je staat op ${firstMod.watchedCount}/${firstMod.totalLessons} lessen in ${firstMod.title}`)
      } else {
        setProgressText('Welkom terug')
      }

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
  }, [router, status, student])

  const progressPanel = {
    loading,
    activeModule: activeModule
      ? {
          title: activeModule.title,
          watchedCount: activeModule.watchedCount,
          totalLessons: activeModule.totalLessons,
          pct: activeModule.pct,
        }
      : null,
    totalCompleted: modules.reduce((acc, mod) => acc + mod.watchedCount, 0),
    totalLessons: modules.reduce((acc, mod) => acc + mod.totalLessons, 0),
    nextLessonUrl: nextLessonHref || undefined,
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 lg:gap-12">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Hero Dashboard - WITH card wrapper */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <HeroDashboard
              userName={student?.name ?? email ?? undefined}
              nextLessonUrl={nextLessonHref || undefined}
              progressText={progressText}
              accessLevel={accessLevel}
              progressPanel={progressPanel}
            />
          </div>

          {/* Intro Video - NO card wrapper */}
          <DashboardHeader thumbnailUrl="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/still%20intro%20vid.webp" />

          {/* Trading Sessions - appears here on mobile, after HeroDashboard */}
          <div className="lg:hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <TradingSessions />
          </div>

          {/* Progress Section - WITH card wrapper */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <DashboardProgress
              loading={progressPanel.loading}
              accessLevel={accessLevel}
              activeModule={progressPanel.activeModule}
              totalCompleted={progressPanel.totalCompleted}
              totalLessons={progressPanel.totalLessons}
              nextLessonUrl={progressPanel.nextLessonUrl}
            />
          </div>

          {/* Active Module - WITH card wrapper */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <DashboardModulesSection
              loading={loading}
              activeModule={activeModule}
              accessLevel={accessLevel}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8 lg:sticky lg:top-10 h-fit">
          {/* Trading Sessions - WITH card wrapper, sticky on desktop */}
          <div className="hidden lg:block rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <TradingSessions />
          </div>
        </div>
      </div>
    </div>
  )
}

