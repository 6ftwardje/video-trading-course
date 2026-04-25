'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeroDashboard from '@/components/HeroDashboard'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardModulesSection from '@/components/DashboardModulesSection'
import DashboardProgress from '@/components/DashboardProgress'
import TradingSessions from '@/components/TradingSessions'
import IntroductionCallCTA from '@/components/IntroductionCallCTA'
import { useStudent } from '@/components/StudentProvider'
import { getLessonsForModules, getModulesSimple, getWatchedLessonIds, findNextLesson } from '@/lib/progress'
import { getExamByModuleId } from '@/lib/exam'
import { FREE_MODULE_ORDER_LIMIT, canAccessModuleByOrder } from '@/lib/access'
import { getModuleGateStatuses } from '@/lib/moduleGate'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null; icon_url: string | null }
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

      // OPTIMIZATION: Fetch all exams in parallel
      const examPromises = mods.map(m => getExamByModuleId(m.id))
      const exams = await Promise.all(examPromises)
      const examMap = new Map(exams.map((exam, idx) => [mods[idx].id, exam]))

      const gateMap = await getModuleGateStatuses(mods, studentId, accessLevel)
      const byModule: ModuleWithProgress[] = []
      for (const m of mods) {
        const ls = lessons.filter(l => l.module_id === m.id)
        const total = ls.length
        const watched = ls.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        const exam = examMap.get(m.id) ?? null
        byModule.push({ ...m, totalLessons: total, watchedCount: watched, pct, examId: exam?.id ?? null })
      }

      setModules(byModule)

      const accessibleMods = mods.filter(m => {
        const gate = gateMap.get(m.id)
        return canAccessModuleByOrder(accessLevel, m.order) && !gate?.isLockedByExam
      })
      const accessibleModuleIds = new Set(accessibleMods.map(m => m.id))
      const accessibleLessons = lessons.filter(l => accessibleModuleIds.has(l.module_id))
      const next = findNextLesson(accessibleMods, accessibleLessons, watchedSet)
      if (next?.lesson?.id) setNextLessonHref(`/lesson/${next.lesson.id}`)
      else if (accessibleMods[0]?.id) setNextLessonHref(`/module/${accessibleMods[0].id}`)
      else setNextLessonHref('/modules')

      if (accessLevel < 2) {
        setProgressText(`Je hebt gratis toegang tot module 1-${FREE_MODULE_ORDER_LIMIT}. Upgrade wanneer je verder wil met de volledige video course, alle modules en de extra materialen.`)
      } else if (next?.module && next?.lesson) {
        const modLessons = accessibleLessons.filter(l => l.module_id === next.module.id)
        const modWatched = modLessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        setProgressText(`Je staat op ${modWatched}/${modLessons.length} lessen in ${next.module.title}`)
      } else if (accessibleMods.length > 0 && byModule.length > 0) {
        const firstMod = byModule.find(m => canAccessModuleByOrder(accessLevel, m.order) && !gateMap.get(m.id)?.isLockedByExam) ?? byModule[0]
        setProgressText(`Je staat op ${firstMod.watchedCount}/${firstMod.totalLessons} lessen in ${firstMod.title}`)
      } else {
        setProgressText('Welkom terug')
      }

      if (byModule.length > 0) {
        const byId = new Map(byModule.map(m => [m.id, m]))
        let candidate: ModuleWithProgress | null = null
        if (next?.module?.id) candidate = byId.get(next.module.id) ?? null
        if (candidate && gateMap.get(candidate.id)?.isLockedByExam) candidate = null
        if (!candidate) candidate = byModule.find(m => canAccessModuleByOrder(accessLevel, m.order) && !gateMap.get(m.id)?.isLockedByExam && m.pct < 100) ?? null
        if (!candidate) candidate = byModule.find(m => canAccessModuleByOrder(accessLevel, m.order) && !gateMap.get(m.id)?.isLockedByExam) ?? byModule[byModule.length - 1] ?? null
        setActiveModule(candidate)
      } else {
        setActiveModule(null)
      }

      setLoading(false)
    }

    run()
  }, [router, status, studentId, accessLevel]) // Use specific values instead of whole student object

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
    totalCompleted: modules
      .filter(mod => canAccessModuleByOrder(accessLevel, mod.order))
      .reduce((acc, mod) => acc + mod.watchedCount, 0),
    totalLessons: modules
      .filter(mod => canAccessModuleByOrder(accessLevel, mod.order))
      .reduce((acc, mod) => acc + mod.totalLessons, 0),
    nextLessonUrl: nextLessonHref || undefined,
  }

  return (
    <div className="w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="space-y-7">
          <HeroDashboard
            userName={student?.name ?? email ?? undefined}
            nextLessonUrl={nextLessonHref || undefined}
            progressText={progressText}
            accessLevel={accessLevel}
            progressPanel={progressPanel}
          />

          <DashboardHeader
            thumbnailUrl="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/still intro vid.webp"
            nextLessonUrl={nextLessonHref || undefined}
          />

          <div className="lg:hidden">
            <TradingSessions accessLevel={accessLevel} />
          </div>

          <DashboardProgress
            loading={progressPanel.loading}
            accessLevel={accessLevel}
            activeModule={progressPanel.activeModule}
            totalCompleted={progressPanel.totalCompleted}
            totalLessons={progressPanel.totalLessons}
            nextLessonUrl={progressPanel.nextLessonUrl}
          />

          <DashboardModulesSection
            loading={loading}
            activeModule={activeModule}
            accessLevel={accessLevel}
          />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-8 lg:h-fit">
          <div className="hidden lg:block">
            <TradingSessions accessLevel={accessLevel} />
          </div>
          <IntroductionCallCTA />
        </aside>
      </div>
    </div>
  )
}
