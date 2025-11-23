import DashboardProgress from "@/components/DashboardProgress";
import TradingSessionClock from "@/components/TradingSessionClock";
import { AccentButton } from "@/components/ui/Buttons";
import Container from "@/components/ui/Container";

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
  const primaryHref = isBasic ? "mailto:support@cryptoriez.com" : nextLessonUrl || "/module/1";
  const primaryLabel = isBasic ? "Upgrade toegang" : "Verder kijken";

  const progressProps: ProgressPanelProps = progressPanel ?? {
    loading: true,
    activeModule: null,
    totalCompleted: 0,
    totalLessons: 0,
    nextLessonUrl,
  };

  return (
    <section className="relative overflow-hidden pb-12 pt-8 md:pt-12">
      <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[var(--accent)]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full bg-[var(--accent)]/5 blur-3xl" />
      <Container className="relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:p-10">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-dim)]">
                  <span>Het Trade Platform — powered by Cryptoriez</span>
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
                  <AccentButton href={primaryHref}>{primaryLabel}</AccentButton>
                  <a
                    href="/modules"
                    className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
                  >
                    Alle modules
                  </a>
                </div>
                {isBasic && (
                  <p className="text-xs text-[#7C99E3]/80">
                    Wil je toegang tot alle videolessen? Neem contact op met je mentor voor een upgrade.
                  </p>
                )}
              </div>
            </div>
            <DashboardProgress
              loading={progressProps.loading}
              accessLevel={accessLevel}
              activeModule={progressProps.activeModule}
              totalCompleted={progressProps.totalCompleted}
              totalLessons={progressProps.totalLessons}
              nextLessonUrl={progressProps.nextLessonUrl}
              className="lg:mt-0"
            />
          </div>
          <div className="h-full">
            <TradingSessionClock />
          </div>
        </div>
      </Container>
    </section>
  );
}
