import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole } from "lucide-react";
import { FREE_MODULE_ORDER_LIMIT } from "@/lib/access";

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

function getFirstName(userName: string) {
  const cleanName = userName.includes("@") ? userName.split("@")[0] : userName;
  return cleanName.split(" ")[0] || "Student";
}

export default function HeroDashboard({
  userName = "Student",
  nextLessonUrl = "/module/1",
  progressText = "Welkom terug",
  accessLevel = 1,
  progressPanel,
}: Props) {
  const isBasic = accessLevel < 2;
  const levelLabel = LEVEL_LABELS[accessLevel] ?? `Level ${accessLevel}`;
  const firstName = getFirstName(userName);
  const primaryHref = nextLessonUrl || "/modules";
  const primaryLabel = "Ga naar huidige module";

  const progressProps: ProgressPanelProps = progressPanel ?? {
    loading: true,
    activeModule: null,
    totalCompleted: 0,
    totalLessons: 0,
    nextLessonUrl,
  };
  const overallPct = progressProps.totalLessons > 0
    ? Math.round((progressProps.totalCompleted / progressProps.totalLessons) * 100)
    : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101722]/80 p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
            <span>Dashboard</span>
            <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
            <span>{userName}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
            <span className="text-[#9fb5ff]">Level: {levelLabel}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {isBasic ? (
              <>
                Goed bezig, {firstName}! <span className="text-[#9fb5ff]">Ontgrendel de volledige cursus.</span>
              </>
            ) : (
              "Ga verder met je leertraject."
            )}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/62 sm:text-base">
            {progressText}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
          {isBasic && (
            <Link
              href="/upgrade"
              className="relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-[linear-gradient(90deg,#4670db_0%,#7c99e3_50%,#4670db_100%)] bg-[length:200%_auto] px-5 py-3 text-sm font-bold text-white shadow-[0_0_32px_rgba(70,112,219,0.42)] transition hover:scale-[1.01] hover:shadow-[0_0_42px_rgba(124,153,227,0.58)]"
              style={{ animation: "shine 3s linear infinite, pulse-glow 2.4s ease-in-out infinite" }}
            >
              <LockKeyhole className="h-4 w-4" aria-hidden />
              Upgrade toegang
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          <Link
            href={primaryHref}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              isBasic
                ? "border border-[#7C99E3]/35 bg-[#7C99E3]/10 text-[#b9c8ff] hover:bg-[#7C99E3]/20"
                : "bg-[var(--accent)] text-black hover:bg-white"
            }`}
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/modules"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/72 transition hover:border-white/25 hover:text-white"
          >
            Alle modules
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-4 w-4 text-[#7C99E3]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-white">
              {progressProps.activeModule?.title || "Start met leren"}
            </p>
            <p className="mt-1 text-xs text-white/50">Huidige module</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Totale voortgang</span>
            <span className="font-semibold text-white/80">{overallPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#7C99E3]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-white">
              {isBasic ? `Module 1-${FREE_MODULE_ORDER_LIMIT}` : "Volledige cursus"}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {isBasic ? "Gratis beschikbaar" : "Toegang actief"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
