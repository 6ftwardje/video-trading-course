import Container from "@/components/ui/Container";
import { AccentButton } from "@/components/ui/Buttons";

type Props = {
  userName?: string;
  nextLessonUrl?: string; // bv. /lesson/1
  progressText?: string;  // bv. "3/5 lessen voltooid in Module 1"
};

export default function HeroDashboard({userName="Student", nextLessonUrl="/module/1", progressText="Welkom terug"}:Props){
  return (
    <section className="pt-24 pb-12 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[var(--accent)]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full bg-[var(--accent)]/5 blur-3xl" />
      <Container className="relative">
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-soft)] p-6 sm:p-10">
          <div className="flex flex-col gap-4">
            <span className="text-sm text-[var(--text-dim)]">Video Trading Course — powered by Cryptoriez</span>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">
              Goed bezig, {userName}! <span className="text-[var(--accent)]">Ga verder met je leertraject.</span>
            </h1>
            <p className="text-[var(--text-dim)]">{progressText}</p>
            <div className="flex items-center gap-3">
              <AccentButton href={nextLessonUrl || "/module/1"}>Verder kijken</AccentButton>
              <a href="/module/1" className="text-white/80 hover:text-[var(--accent)] underline-offset-4 hover:underline">Alle modules</a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

