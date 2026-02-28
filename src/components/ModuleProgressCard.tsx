'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react'

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
  previousModuleOrder?: number | null
  previousModuleTitle?: string | null
  icon_url?: string | null
}

type Props = {
  module: ModuleProgress
}

function ExamBadge({
  available,
}: { available: boolean }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400/90">
        <CheckCircle2 className="h-3 w-3" aria-hidden />
        Beschikbaar
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-[var(--text-dim)]">
      <Lock className="h-3 w-3" aria-hidden />
      Vergrendeld
    </span>
  )
}

export default function ModuleProgressCard({ module }: Props) {
  const router = useRouter()
  const isLockedByAccess = typeof module.accessLevel === 'number' && module.accessLevel < 2
  const isLocked = isLockedByAccess || module.isLockedByExam
  const previousModuleLabel = module.previousModuleOrder
    ? `Module ${module.previousModuleOrder}`
    : module.previousModuleTitle || 'de vorige module'

  const hasExam = Boolean(module.examId)
  const examAvailable = hasExam && module.pct === 100 && !isLocked

  const iconEl = module.icon_url ? (
    <Image
      src={module.icon_url}
      alt={module.title}
      width={40}
      height={40}
      className="rounded-md object-contain flex-shrink-0"
    />
  ) : (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--muted)]/60" aria-hidden>
      <BookOpen className="h-5 w-5 text-[var(--text-dim)]" />
    </div>
  )

  const cardContent = (
    <>
      {/* Header: icon + title (left), progress (right) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          {iconEl}
          <div className="space-y-1 min-w-0">
            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-[var(--text-dim)]">{module.description}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-left sm:text-right min-w-[10rem]">
          <div className="text-sm text-white/90">
            {module.watchedCount}/{module.totalLessons} lessen • {module.pct}%
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width]"
              style={{ width: `${module.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider + Footer: exam callout + primary CTA */}
      <div className="border-t border-white/10 pt-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Exam callout (nested section) */}
          {hasExam ? (
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white/5 border border-white/5 p-4 sm:p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                  <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-[var(--text-dim)]" aria-hidden />
                    Examen
                  </span>
                  <ExamBadge available={examAvailable} />
                </div>
                <p className="mt-1 text-xs text-[var(--text-dim)]">Test je kennis van deze module</p>
              </div>
              <div className="flex-shrink-0">
                {examAvailable ? (
                  <Link
                    href={`/exam/${module.examId}?module=${module.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/20 px-4 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)] hover:bg-[var(--accent)]/30"
                  >
                    Start examen
                  </Link>
                ) : (
                  <span
                    aria-disabled
                    className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-[var(--text-dim)] opacity-60"
                  >
                    Start examen
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Primary CTA */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <span className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--muted)]/40 px-4 text-sm font-medium text-[var(--text-dim)] cursor-default">
                Vergrendeld
              </span>
            ) : (
              <Link
                href={`/module/${module.id}`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-black transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)] hover:opacity-95"
                aria-label={`Open ${module.title}`}
              >
                Open module
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-[border-color,box-shadow] hover:border-white/15 hover:shadow-lg hover:shadow-black/10 ${
        isLockedByAccess ? 'opacity-60' : ''
      }`}
    >
      <div className={isLockedByAccess ? 'pointer-events-none select-none blur-sm' : undefined}>
        {cardContent}
      </div>

      {/* Lock overlay: access level */}
      {isLockedByAccess && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center space-y-3 p-4">
            <Lock className="h-6 w-6 text-[#7C99E3] mx-auto" />
            <p className="text-sm font-medium text-white">Beschikbaar bij volledige toegang</p>
            <button
              onClick={() => router.push('/upgrade')}
              className="inline-flex items-center justify-center rounded-lg bg-[#7C99E3] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#7C99E3]/90 focus:outline-none focus:ring-2 focus:ring-[#7C99E3] focus:ring-offset-2"
            >
              Ontgrendelen
            </button>
          </div>
        </div>
      )}

      {/* Lock overlay: exam gate (previous module not passed) */}
      {!isLockedByAccess && module.isLockedByExam && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center space-y-2 p-4">
            <Lock className="h-6 w-6 text-[#7C99E3] mx-auto" />
            <p className="text-sm font-medium text-white">Vergrendeld</p>
            <p className="text-xs text-[var(--text-dim)]">
              Voltooi eerst het examen van {previousModuleLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
