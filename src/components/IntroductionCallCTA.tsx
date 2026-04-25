'use client'

import { ArrowRight, PhoneCall } from 'lucide-react'

export default function IntroductionCallCTA() {
  const handleCallClick = () => {
    window.open('https://calendly.com/hettradeplatform/30min', '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#7C99E3]/25 bg-[#7C99E3]/10 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7C99E3]/15 text-[#b9c8ff]">
          <PhoneCall className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b9c8ff]">
            Gratis begeleiding
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Plan een kennismakingscall</h2>
          <p className="mt-2 text-sm leading-6 text-white/62">
            Bespreek je start, je doelen en hoe je veilig door de eerste modules werkt.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCallClick}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-white"
      >
        Plan gratis call
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  )
}
