import ModuleProgressCard from './ModuleProgressCard'
import { WaveLoader } from './ui/wave-loader'

type ModuleWithProgress = {
  id: number
  title: string
  description: string | null
  order: number | null
  totalLessons: number
  watchedCount: number
  pct: number
  examId: number | null
}

type DashboardModulesSectionProps = {
  loading: boolean
  activeModule: ModuleWithProgress | null
  accessLevel: number
}

export default function DashboardModulesSection({
  loading,
  activeModule,
  accessLevel,
}: DashboardModulesSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Course</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Huidige module</h2>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            Werk verder waar je gebleven bent.
          </p>
        </div>
        <a
          href="/modules"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
        >
          Bekijk alle modules
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <WaveLoader message="Laden..." />
        </div>
      ) : activeModule ? (
        <ModuleProgressCard module={{ ...activeModule, accessLevel }} />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 text-sm text-[var(--text-dim)]">
          Nog geen modules beschikbaar. Kom later terug voor nieuwe content.
        </div>
      )}
    </section>
  )
}
