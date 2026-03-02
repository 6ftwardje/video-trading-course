'use client'

import { useState } from 'react'
import Container from '@/components/ui/Container'
import MentorCard from '@/components/MentorCard'
import CalendlyModal from '@/components/CalendlyModal'
import { useStudent } from '@/components/StudentProvider'

type Mentor = {
  name: string
  role: string
  image: string
  calendlyUrl: string
}

const MENTORS: Mentor[] = [
  {
    name: 'Rousso',
    role: 'Technical Trading Mentor',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/rousso.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
  },
  {
    name: 'Jason',
    role: 'Technical Trading Mentor',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/jason.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
  },
]

export default function MentorshipPage() {
  const { student, status } = useStudent()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  const isLoggedIn = status === 'ready' && !!student

  const handleBookSession = (mentor: Mentor) => {
    if (!isLoggedIn) return
    setSelectedMentor(mentor)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedMentor(null)
  }

  return (
    <>
      <Container className="pb-20 pt-8 md:pt-12">
        <div className="space-y-10">
          <header className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-dim)]">Mentorship</span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mentorship</h1>
            <p className="max-w-2xl text-sm text-[var(--text-dim)]">
              Plan een-op-een sessies met onze ervaren mentors om je trading skills naar het volgende niveau te brengen.
              Krijg persoonlijke begeleiding op het gebied van technische analyse of mindset coaching.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            {MENTORS.map(mentor => (
              <MentorCard
                key={mentor.name}
                name={mentor.name}
                role={mentor.role}
                image={mentor.image}
                isDisabled={!isLoggedIn}
                showLoginPrompt={status === 'unauthenticated'}
                onBook={() => handleBookSession(mentor)}
              />
            ))}
          </div>

          {/* TradeZella Section */}
          <section className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 md:p-8">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">TradeZella — jouw edge in trade journaling</h2>

              <div className="space-y-3 text-sm leading-relaxed text-[var(--text-dim)]">
                <p>
                  TradeZella is veel meer dan een trade-journal: het zet prestaties om in heldere data. Winrates, R-multiple, setup-kwaliteit en gedragspatronen worden inzichtelijk, zodat je gericht kunt verbeteren.
                </p>
                <p>
                  Als mentor gebruik ik TradeZella om gericht te coachen op data in plaats van gevoel. Gebruik onze link en code voor voordeel.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-3 border-t border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
                <a
                  href="https://refer.tradezella.com/cryptoriez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-white"
                >
                  Ga naar TradeZella met onze link
                </a>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[var(--text-dim)]">Gebruik code:</span>
                  <code className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 font-mono text-base font-semibold text-[var(--accent)]">
                    Cryptoriez
                  </code>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>

      {selectedMentor && (
        <CalendlyModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          mentorName={selectedMentor.name}
          calendlyUrl={selectedMentor.calendlyUrl}
        />
      )}
    </>
  )
}

