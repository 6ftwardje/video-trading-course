'use client'

import { Lock } from 'lucide-react'

type ModuleProgress = {
  id: number
  title: string
  description: string | null
  totalLessons: number
  watchedCount: number
  pct: number
  examId: number | null
  accessLevel?: number
  isLockedByExam?: boolean
  previousModuleId?: number | null
}

type Props = {
  module: ModuleProgress
}

export default function ModuleProgressCard({ module }: Props) {
  const isLockedByAccess = typeof module.accessLevel === 'number' && module.accessLevel < 2
  const isLocked = isLockedByAccess || module.isLockedByExam

  return (
    <div className="space-y-3">
      {isLocked ? (
        <div className="block rounded-2xl border border-dashed border-[#7C99E3]/40 bg-[var(--card)]/60 p-6 opacity-70">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#7C99E3]">
                <Lock className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">
                  {isLockedByAccess ? 'Alleen voor Full members' : 'Vergrendeld'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{module.title}</h3>
              {module.description && <p className="text-sm text-[var(--text-dim)]">{module.description}</p>}
              {isLockedByAccess ? (
                <p className="text-sm text-[#7C99E3]">Vraag je mentor om een upgrade voor volledige toegang.</p>
              ) : module.isLockedByExam && module.previousModuleId ? (
                <p className="text-sm text-[#7C99E3]">Voltooi eerst het examen van module {module.previousModuleId} om deze module te ontgrendelen.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <a
          href={`/module/${module.id}`}
          className="block rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 transition-all hover:border-[var(--accent)] hover:bg-[var(--card)]"
          aria-label={`Open ${module.title}`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{module.title}</h3>
              {module.description && <p className="text-sm text-[var(--text-dim)]">{module.description}</p>}
            </div>

            <div className="min-w-[10rem] text-left md:text-right">
              <div className="text-sm text-white/90">
                {module.watchedCount}/{module.totalLessons} lessen • {module.pct}%
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${module.pct}%` }} />
              </div>
            </div>
          </div>
        </a>
      )}

      {!isLocked && module.pct === 100 && module.examId && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Examen beschikbaar</div>
              <div className="text-xs text-[var(--text-dim)]">Test je kennis van deze module</div>
            </div>
            <a
              href={`/exam/${module.examId}?module=${module.id}`}
              className="inline-flex items-center justify-center rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/20 px-4 py-2 text-sm text-white transition hover:bg-[var(--accent)]/30"
            >
              Start examen
            </a>
          </div>
        </div>
      )}
    </div>
  )
}




