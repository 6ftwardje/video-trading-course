import Link from "next/link";
import { AccentButton } from "@/components/ui/Buttons";

type ProgressPanelProps = {
  loading: boolean;
  activeModule: {
    title: string;
    watchedCount: number;
    totalLessons: number;
    pct: number;
  } | null;
  totalCompleted: number;
  totalLessons: number;
  nextLessonUrl?: string | null;
};

type Props = {
  userName?: string;
  nextLessonUrl?: string; // bv. /lesson/1
  progressText?: string; // bv. "3/5 lessen voltooid in Module 1"
  accessLevel?: number;
  progressPanel?: ProgressPanelProps;
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Basic",
  2: "Full",
  3: "Mentor",
};

export default function HeroDashboard({
  userName = "Student",
  nextLessonUrl = "/module/1",
  progressText = "Welkom terug",
  accessLevel = 1,
  progressPanel,
}: Props) {
  const isBasic = accessLevel < 2;
  const levelLabel = LEVEL_LABELS[accessLevel] ?? `Level ${accessLevel}`;
  const primaryHref = isBasic ? "/upgrade" : nextLessonUrl || "/module/1";
  const primaryLabel = isBasic ? "Upgrade toegang" : "Verder kijken";

  const progressProps: ProgressPanelProps = progressPanel ?? {
    loading: true,
    activeModule: null,
    totalCompleted: 0,
    totalLessons: 0,
    nextLessonUrl,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-dim)]">
        <span>Het Trade Platform</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#7C99E3]/50 bg-[#7C99E3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#7C99E3]">
          Level: {levelLabel}
        </span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
        Goed bezig, {userName}!{" "}
        <span className="text-[var(--accent)]">
          {isBasic ? "Ontgrendel de volledige cursus." : "Ga verder met je leertraject."}
        </span>
      </h1>
      <p className="text-[var(--text-dim)]">{progressText}</p>
      <div className="flex flex-wrap items-center gap-3">
        {isBasic ? (
          <div className="relative">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
              style={{ 
                background: 'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                backgroundSize: '200% auto',
                animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
              }}
            >
              <span className="relative z-20">{primaryLabel}</span>
            </Link>
            <div 
              className="absolute inset-0 bg-[rgba(70,112,219,0.2)] blur-xl rounded-lg -z-0"
              style={{
                animation: 'pulse-glow-bg 2s ease-in-out infinite',
              }}
            ></div>
          </div>
        ) : (
          <AccentButton href={primaryHref}>{primaryLabel}</AccentButton>
        )}
        <a
          href="/modules"
          className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
        >
          Alle modules
        </a>
      </div>
    </div>
  );
}
