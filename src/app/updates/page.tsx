'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import { useStudent } from '@/components/StudentProvider'
import { BarChart3, Brain, GraduationCap, Users } from 'lucide-react'

const DISCORD_INVITE_URL = 'https://discord.gg/RYNxDHvp'

const JoinButton = () => (
  <a
    href={DISCORD_INVITE_URL}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
  >
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
    Join de Discord
  </a>
)

const bentoItems = [
  {
    icon: BarChart3,
    title: 'Marktupdates & Charts',
    items: [
      'Wekelijkse marktupdates',
      'Live chart breakdowns',
      "Concrete scenario's & marktverwachtingen",
    ],
    color: 'accent',
  },
  {
    icon: Brain,
    title: 'Accountability & Mindset',
    items: [
      'Structuur en consistentie in je trading',
      'Accountability om discipline te waarborgen',
      'Focus op mentale groei & emotionele controle',
      'Reflectie en evaluatiemomenten',
    ],
    color: 'orange',
  },
  {
    icon: GraduationCap,
    title: 'Ondersteuning & Mentorship',
    items: [
      'Q&A momenten',
      'Inhoudelijke feedback',
      'Begeleiding bij je ontwikkeling',
      'Updates wanneer nieuwe content live staat',
    ],
    color: 'accent',
  },
  {
    icon: Users,
    title: 'Directe Toegang',
    items: [
      'Direct contact met andere serieuze traders',
      'Snelle communicatie binnen de community',
      'Samen sparren over setups en marktsituaties',
    ],
    color: 'orange',
  },
]

export default function CommunityPage() {
  const router = useRouter()
  const { student, status } = useStudent()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status !== 'ready') {
    return (
      <Container className="pb-20 pt-8 md:pt-12">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-4xl space-y-14">
        {/* Top CTA */}
        <div className="flex justify-center">
          <JoinButton />
        </div>

        {/* Headline */}
        <header className="space-y-5 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Trading is een solo game.
            <br />
            <span className="text-[var(--accent)]">Groeien hoeft dat niet te zijn.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-dim)] sm:text-lg">
            In deze community delen we marktupdates, setups, analyses en reflecties.
            <br />
            Niet om signalen te kopiëren, maar om je denkproces te scherpen.
          </p>
        </header>

        {/* Bento: Wat je krijgt binnen de community */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-[var(--text-dim)]">
            Wat je krijgt binnen de community:
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {bentoItems.map((card) => {
              const Icon = card.icon
              const isAccent = card.color === 'accent'
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-5 transition hover:border-[var(--accent)]/30"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${isAccent ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[#f88226]/20 text-[#f88226]'}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{card.title}</h3>
                  <ul className="space-y-1.5">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-[var(--text-dim)]"
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isAccent ? 'bg-[var(--accent)]' : 'bg-[#f88226]'}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-6 py-10 text-center md:px-10 md:py-12">
          <p className="mb-2 text-xl font-semibold text-white sm:text-2xl">
            Trading is individueel. Groei is collectief.
          </p>
          <p className="mb-6 text-sm text-[var(--text-dim)] sm:text-base">
            Als jij écht wilt groeien, dan weet je waar je moet zijn.
          </p>
          <JoinButton />
        </section>
      </div>
    </Container>
  )
}
