'use client'

import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const isLockedByAccess = typeof module.accessLevel === 'number' && module.accessLevel < 2
  const isLocked = isLockedByAccess || module.isLockedByExam

  return (
    <div className="space-y-3">
      {isLocked ? (
        <div className="relative block rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 overflow-hidden">
          <div className={`flex flex-col gap-5 md:flex-row md:items-center md:justify-between ${isLockedByAccess ? 'opacity-50 blur-sm' : ''}`}>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{module.title}</h3>
              {module.description && <p className="text-sm text-[var(--text-dim)]">{module.description}</p>}
              <div className="min-w-[10rem] text-left md:text-right">
                <div className="text-sm text-white/90">
                  {module.watchedCount}/{module.totalLessons} lessen • {module.pct}%
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-[var(--muted)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${module.pct}%` }} />
                </div>
              </div>
            </div>
          </div>
          {isLockedByAccess && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center space-y-3 p-4">
                <Lock className="h-6 w-6 text-[#7C99E3] mx-auto" />
                <p className="text-sm font-medium text-white">Beschikbaar bij volledige toegang</p>
                <button
                  onClick={() => router.push("/upgrade")}
                  className="inline-flex items-center justify-center rounded-lg bg-[#7C99E3] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#7C99E3]/90"
                >
                  Ontgrendelen
                </button>
              </div>
            </div>
          )}
          {!isLockedByAccess && module.isLockedByExam && module.previousModuleId && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center space-y-2 p-4">
                <Lock className="h-6 w-6 text-[#7C99E3] mx-auto" />
                <p className="text-sm font-medium text-white">Vergrendeld</p>
                <p className="text-xs text-[var(--text-dim)]">Voltooi eerst het examen van module {module.previousModuleId}</p>
              </div>
            </div>
          )}
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




