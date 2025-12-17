import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaveLoader } from "@/components/ui/wave-loader";

type ActiveModule = {
  title: string;
  watchedCount: number;
  totalLessons: number;
  pct: number;
};

type Props = {
  className?: string;
  loading: boolean;
  accessLevel: number;
  activeModule: ActiveModule | null;
  totalCompleted: number;
  totalLessons: number;
  nextLessonUrl?: string | null;
};

function LoadingState({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur flex items-center justify-center min-h-[200px] ${className ?? ""
        }`}
    >
      <WaveLoader message="Laden..." />
    </div>
  );
}

export default function DashboardProgress({
  className = "",
  loading,
  accessLevel,
  activeModule,
  totalCompleted,
  totalLessons,
  nextLessonUrl,
}: Props) {
  if (loading) {
    return <LoadingState className={className} />;
  }

  // Don't show progress for level 1 users
  if (accessLevel < 2) {
    return null;
  }

  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const modulePct = activeModule?.totalLessons
    ? Math.round((activeModule.watchedCount / activeModule.totalLessons) * 100)
    : 0;

  if (!totalLessons) {
    return (
      <div
        className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur ${className}`}
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Start jouw eerste module</h3>
          <p className="text-sm text-[var(--text-dim)]">
            We hebben de modules klaarstaan. Bekijk het overzicht en kies jouw eerste les om te beginnen.
          </p>
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            Bekijk alle modules
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const nextHref = nextLessonUrl || "/modules";

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Jouw voortgang</p>
          <h3 className="text-lg font-semibold text-white">Zet de volgende stap</h3>
        </div>
        <span className="inline-flex min-w-[3.5rem] justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-3 py-1 text-sm font-semibold text-[var(--accent)]">
          {overallPct}%
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
          <span>Totaal afgerond</span>
          <span>
            {totalCompleted}/{totalLessons} lessen
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]/60">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">Actieve module</p>
            <p className="text-sm font-semibold text-white">
              {activeModule?.title || "Ga naar het module-overzicht"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-dim)]">
              {activeModule
                ? `${activeModule.watchedCount}/${activeModule.totalLessons} lessen voltooid`
                : "Selecteer een module om te beginnen met leren."}
            </p>
          </div>
          {activeModule && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              {modulePct}%
            </span>
          )}
        </div>

        <Link
          href={nextHref}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
        >
          {activeModule ? "Ga verder met de les" : "Start met leren"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

