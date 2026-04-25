import IntroVideo from './IntroVideo'
import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

type DashboardHeaderProps = {
  thumbnailUrl?: string
  nextLessonUrl?: string
}

export default function DashboardHeader({ thumbnailUrl, nextLessonUrl = '/modules' }: DashboardHeaderProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101722]/70">
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7C99E3]/30 bg-[#7C99E3]/10 px-3 py-1 text-xs font-semibold text-[#b9c8ff]">
              <PlayCircle className="h-3.5 w-3.5" aria-hidden />
              Start hier
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Bekijk eerst hoe je het platform gebruikt.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              In deze introductie krijg je de volgorde, examens en manier van werken uitgelegd.
              Zo begin je met de juiste context voordat je de course induikt.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={nextLessonUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#7C99E3]/40 bg-[#7C99E3]/10 px-4 py-2.5 text-sm font-semibold text-[#b9c8ff] transition hover:bg-[#7C99E3]/20"
            >
              Daarna naar huidige module
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="text-xs leading-5 text-white/45">
              Tip: kijk deze video eenmalig volledig voordat je aan module 1 begint.
            </p>
          </div>
        </div>

        <div className="min-h-[240px] border-t border-white/10 bg-black/20 lg:min-h-full lg:border-l lg:border-t-0">
          <IntroVideo
            className="h-full overflow-hidden"
            thumbnailUrl={thumbnailUrl}
            fillContainer
          />
        </div>
      </div>
    </section>
  )
}
