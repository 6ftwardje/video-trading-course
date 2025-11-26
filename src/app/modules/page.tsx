'use client'

import { useEffect, useState } from 'react'
import Container from '@/components/ui/Container'
import ModuleProgressCard from '@/components/ModuleProgressCard'
import { getModulesSimple, getLessonsForModules, getWatchedLessonIds } from '@/lib/progress'
import { getExamByModuleId, hasPassedExamForModule } from '@/lib/exam'
import {
  getStoredStudentId,
  getStoredStudentAccessLevel,
  getStudentByAuthUserId,
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'
import { getSupabaseClient } from '@/lib/supabaseClient'

type ModuleRow = { id: number; title: string; description: string | null; order: number | null }
type LessonRow = { id: number; module_id: number; order: number | null; title: string }
type ModuleWithProgress = ModuleRow & {
  totalLessons: number
  watchedCount: number
  pct: number
  examId: number | null
  isLockedByExam?: boolean
  previousModuleId?: number | null
}

export default function ModulesPage() {
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [accessLevel, setAccessLevel] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const supabase = getSupabaseClient()
      // Use getSession() instead of getUser() - middleware already validates access
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setModules([])
        setLoading(false)
        return
      }

      let studentId = getStoredStudentId()
      let level = getStoredStudentAccessLevel()

      if (!studentId || level == null) {
        const student = await getStudentByAuthUserId(user.id)
        if (student?.id) {
          setStoredStudent(student.id, student.email)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          studentId = student.id
          level = student.access_level ?? 1
        }
      }

      if (level == null) level = 1
      setAccessLevel(level)

      const mods = (await getModulesSimple()) as ModuleRow[]
      const moduleIds = mods.map(m => m.id)
      const lessons = (await getLessonsForModules(moduleIds)) as LessonRow[]
      const watchedSet = await getWatchedLessonIds(studentId || '', lessons.map(l => l.id))

      // Sort modules by order
      const sortedMods = [...mods].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))

      const withProgress: ModuleWithProgress[] = []
      for (let i = 0; i < sortedMods.length; i++) {
        const mod = sortedMods[i]
        const modLessons = lessons.filter(l => l.module_id === mod.id)
        const total = modLessons.length
        const watched = modLessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
        const pct = total ? Math.round((watched / total) * 100) : 0
        const exam = await getExamByModuleId(mod.id)
        
        // Check if module is locked by exam
        let isLockedByExam = false
        let previousModuleId: number | null = null
        
        if (studentId && (level ?? 1) >= 2) {
          // Module 1 is always unlocked for access level 2+
          if (i > 0) {
            const prevModule = sortedMods[i - 1]
            previousModuleId = prevModule.id
            console.log(`[ModulesPage] Checking if module ${mod.id} is locked - previous module: ${prevModule.id}, studentId: ${studentId}`)
            const prevExamPassed = await hasPassedExamForModule(studentId, prevModule.id)
            isLockedByExam = !prevExamPassed
            console.log(`[ModulesPage] Module ${mod.id} - prevExamPassed: ${prevExamPassed}, isLockedByExam: ${isLockedByExam}`)
          } else {
            console.log(`[ModulesPage] Module ${mod.id} is module 1, always unlocked for access level 2+`)
          }
        } else {
          // Access level < 2 means locked by access (not by exam)
          isLockedByExam = false
          console.log(`[ModulesPage] Module ${mod.id} - access level < 2, locked by access`)
        }
        
        withProgress.push({
          ...mod,
          totalLessons: total,
          watchedCount: watched,
          pct,
          examId: exam?.id ?? null,
          isLockedByExam,
          previousModuleId,
        })
      }

      setModules(withProgress)
      setLoading(false)
    }

    run()
  }, [])

  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="space-y-10">
        <header className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-dim)]">Overzicht</span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Alle modules</h1>
          <p className="max-w-2xl text-sm text-[var(--text-dim)]">
            Bekijk jouw volledige traject. Je kan een module openen om verder te kijken, of herhaal een voltooid hoofdstuk
            wanneer je dat nodig hebt.
          </p>
        </header>

        {!loading && (accessLevel ?? 1) < 2 && (
          <div className="rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-4 text-sm text-[#7C99E3]">
            🔒 Je hebt momenteel Basic toegang. Modules zijn zichtbaar zodat je weet wat er komt, maar video's en examens worden
            ontgrendeld zodra je mentor je account upgrade naar Full.
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-24 w-full animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]/70"
              />
            ))}
          </div>
        ) : modules.length ? (
          <div className="space-y-6">
            {modules.map(module => (
              <ModuleProgressCard key={module.id} module={{ ...module, accessLevel: accessLevel ?? 1 }} />
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




