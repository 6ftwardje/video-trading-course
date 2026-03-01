'use client'

import { useRouter } from 'next/navigation'
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
  examPassed?: boolean
  icon_url?: string | null
}

type Props = {
  module: ModuleProgress
}

function ExamCallout({
  module,
  isLocked,
}: {
  module: ModuleProgress
  isLocked: boolean
}) {
  const router = useRouter()
  const hasExam = Boolean(module.examId)
  const canStartExam = !isLocked && module.pct === 100 && hasExam

  if (!hasExam) return null

  const badgeLabel = module.examPassed
    ? 'Geslaagd'
    : canStartExam
      ? 'Beschikbaar'
      : 'Vergrendeld'

  const badgeStyle = module.examPassed
    ? 'bg-white/15 text-white/90'
    : canStartExam
      ? 'bg-white/10 text-white/85'
      : 'bg-white/10 text-[var(--text-dim)]'

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-dim)]" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-white">Examen</span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeStyle}`}
              >
                {module.examPassed && (
                  <CheckCircle2 className="mr-1.5 h-3 w-3 shrink-0" aria-hidden />
                )}
                {badgeLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              {module.examPassed
                ? 'Je hebt dit examen behaald.'
                : canStartExam
                  ? 'Test je kennis van deze module.'
                  : 'Voltooi alle lessen om het examen te ontgrendelen.'}
            </p>
          </div>
        </div>
        {!module.examPassed &&
          (canStartExam ? (
            <button
              type="button"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/exam/${module.examId}?module=${module.id}`)
              }}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              Start examen
            </button>
          ) : (
            <span
              aria-disabled
              className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-[var(--text-dim)] opacity-70"
            >
              Start examen
            </span>
          ))}
      </div>
    </div>
  )
}

export default function ModuleProgressCard({ module }: Props) {
  const router = useRouter()
  const isLockedByAccess = typeof module.accessLevel === 'number' && module.accessLevel < 2
  const isLocked = isLockedByAccess || (module.isLockedByExam ?? false)
  const previousModuleLabel = module.previousModuleOrder
    ? `Module ${module.previousModuleOrder}`
    : module.previousModuleTitle || 'de vorige module'

  const cardContent = (
    <>
      {/* Header: icon + title block left, progress right */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          {module.icon_url ? (
            <img
              src={module.icon_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <BookOpen
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-dim)]"
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
            {module.description && (
              <p className="mt-2 text-sm text-white/70">{module.description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col text-left sm:text-right">
          <div className="text-sm text-white/70">
            {module.watchedCount}/{module.totalLessons} lessen • {module.pct}%
          </div>
          <div className="mt-4 h-2 w-full min-w-[10rem] rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${module.pct}%` }}
            />
          </div>
        </div>
      </div>

      {module.examId && (
        <>
          <div className="my-6 border-t border-white/10" />
          <ExamCallout module={module} isLocked={isLocked} />
        </>
      )}
    </>
  )

  const cardWrapperClass = `relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 ${
    isLocked ? '' : 'hover:bg-white/[0.07]'
  }`

  const inner = (
    <div className={`p-5 md:p-6 ${isLockedByAccess ? 'opacity-50 blur-sm' : ''}`}>
      {cardContent}
    </div>
  )

  return (
    <div className={cardWrapperClass}>
      {isLocked ? (
        inner
      ) : (
        <a href={`/module/${module.id}`} className="block" aria-label={`Open ${module.title}`}>
          {inner}
        </a>
      )}

      {isLockedByAccess && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm">
          <div className="space-y-3 p-4 text-center">
            <Lock className="mx-auto h-6 w-6 text-[#7C99E3]" aria-hidden />
            <p className="text-sm font-medium text-white">Beschikbaar bij volledige toegang</p>
            <button
              type="button"
              onClick={() => router.push('/upgrade')}
              className="inline-flex items-center justify-center rounded-lg bg-[#7C99E3] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#7C99E3]/90"
            >
              Ontgrendelen
            </button>
          </div>
        </div>
      )}

      {!isLockedByAccess && module.isLockedByExam && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm">
          <div className="space-y-2 p-4 text-center">
            <Lock className="mx-auto h-6 w-6 text-[#7C99E3]" aria-hidden />
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
