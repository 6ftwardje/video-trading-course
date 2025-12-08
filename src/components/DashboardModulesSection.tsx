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
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold">Jouw huidige module</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Werk verder waar je gebleven bent. Je kan steeds terugkeren naar het overzicht.
          </p>
        </div>
        <a
          href="/modules"
          className="text-sm font-medium text-[var(--accent)] underline-offset-4 transition-colors hover:text-[var(--accent)]/80 hover:underline"
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
    </div>
  )
}

