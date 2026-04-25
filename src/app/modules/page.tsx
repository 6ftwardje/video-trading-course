'use client'

import { useEffect, useState } from 'react'
import Container from '@/components/ui/Container'
import ModuleProgressCard from '@/components/ModuleProgressCard'
import { WaveLoader } from '@/components/ui/wave-loader'
import { useStudent } from '@/components/StudentProvider'
import { getModulesSimple, getLessonsForModules, getWatchedLessonIds } from '@/lib/progress'
import { getExamByModuleId } from '@/lib/exam'
import { getModuleGateStatuses } from '@/lib/moduleGate'
import { FREE_MODULE_ORDER_LIMIT } from '@/lib/access'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null; icon_url: string | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & {
  totalLessons: number
  watchedCount: number
  pct: number
  examId: number | null
  isLockedByExam?: boolean
  previousModuleOrder?: number | null
  previousModuleTitle?: string | null
}

export default function ModulesPage() {
  const { student, status } = useStudent()
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])

  const accessLevel = student?.access_level ?? 1
  const studentId = student?.id ?? null

  useEffect(() => {
    const run = async () => {
      if (status !== 'ready' || !student) {
        setLoading(false)
        return
      }

      setLoading(true)

      const mods = (await getModulesSimple()) as ModuleRow[]
      const moduleIds = mods.map(m => m.id)
      const lessons = (await getLessonsForModules(moduleIds)) as LessonRow[]
      const watchedSet = await getWatchedLessonIds(studentId || '', lessons.map(l => l.id))

      // Sort modules by order
      const sortedMods = [...mods].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))

      // OPTIMIZATION: Fetch all exams in parallel
      const examPromises = sortedMods.map(mod => getExamByModuleId(mod.id))
      const exams = await Promise.all(examPromises)
      const examMap = new Map(exams.map((exam, idx) => [sortedMods[idx].id, exam]))

      const gateMap = await getModuleGateStatuses(sortedMods, studentId, accessLevel)

      const withProgress: ModuleWithProgress[] = []
      for (let i = 0; i < sortedMods.length; i++) {
        const mod = sortedMods[i]
        const modLessons = lessons.filter(l => l.module_id === mod.id)
        const total = modLessons.length
        const watched = modLessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        const exam = examMap.get(mod.id) ?? null
        
        // Check if module is locked by exam
        const gate = gateMap.get(mod.id)
        const isLockedByExam = gate?.isLockedByExam ?? false
        const previousModuleOrder = gate?.previousModule?.order ?? null
        const previousModuleTitle = gate?.previousModule?.title ?? null
        
        withProgress.push({
          ...mod,
          totalLessons: total,
          watchedCount: watched,
          pct,
          examId: exam?.id ?? null,
          isLockedByExam,
          previousModuleOrder,
          previousModuleTitle,
        })
      }

      setModules(withProgress)
      setLoading(false)
    }

    run()
  }, [status, studentId, accessLevel]) // Use specific values instead of whole student object

  return (
    <Container className="pb-20 pt-6 md:pt-10">
      <div className="space-y-8">
        <header className="rounded-xl border border-white/10 bg-[#101722]/70 p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Course overzicht</span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Alle modules</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-dim)]">
            Bekijk je volledige leertraject. Gratis modules zijn direct beschikbaar binnen je account;
            betaalde modules blijven zichtbaar als preview.
          </p>
        </header>

        {!loading && accessLevel < 2 && (
          <div className="rounded-xl border border-[#7C99E3]/30 bg-[#7C99E3]/10 p-4 text-sm leading-6 text-[#b9c8ff]">
            Je gratis account geeft toegang tot module 1-{FREE_MODULE_ORDER_LIMIT}, inclusief lessen, praktijklessen en examens.
            Vanaf module {FREE_MODULE_ORDER_LIMIT + 1} heb je volledige toegang nodig.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <WaveLoader message="Laden..." />
          </div>
        ) : modules.length ? (
          <div className="space-y-4">
            {modules.map(module => (
              <ModuleProgressCard key={module.id} module={{ ...module, accessLevel }} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-8 text-sm text-[var(--text-dim)]">
            Er zijn nog geen modules beschikbaar. Kom binnenkort terug voor nieuwe content.
          </div>
        )}
      </div>
    </Container>
  )
}


