import Container from '@/components/ui/Container'
import { AccentButton } from '@/components/ui/Buttons'
import TradingSessionClock from '@/components/TradingSessionClock'

type Props = {
  userName?: string
  nextLessonUrl?: string // bv. /lesson/1
  progressText?: string // bv. "3/5 lessen voltooid in Module 1"
}

export default function HeroDashboard({
  userName = 'Student',
  nextLessonUrl = '/module/1',
  progressText = 'Welkom terug',
}: Props) {
  return (
    <section className="relative overflow-hidden pb-12 pt-24">
      <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[var(--accent)]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full bg-[var(--accent)]/5 blur-3xl" />
      <Container className="relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:p-10">
            <div className="flex flex-col gap-5">
              <span className="text-sm text-[var(--text-dim)]">Video Trading Course — powered by Cryptoriez</span>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                Goed bezig, {userName}!{' '}
                <span className="text-[var(--accent)]">Ga verder met je leertraject.</span>
              </h1>
              <p className="text-[var(--text-dim)]">{progressText}</p>
              <div className="flex flex-wrap items-center gap-3">
                <AccentButton href={nextLessonUrl || '/module/1'}>Verder kijken</AccentButton>
                <a
                  href="/modules"
                  className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
                >
                  Alle modules
                </a>
              </div>
            </div>
          </div>
          <div className="h-full">
            <TradingSessionClock />
          </div>
        </div>
      </Container>
    </section>
  )
}

