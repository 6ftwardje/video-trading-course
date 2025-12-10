'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import MentorCard from '@/components/MentorCard'
import CalendlyModal from '@/components/CalendlyModal'
import {
  getStoredStudentId,
  getStoredStudentAccessLevel,
  getStudentByAuthUserId,
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getModulesSimple, getLessonsForModules, getWatchedLessonIds } from '@/lib/progress'

type Mentor = {
  name: string
  role: string
  image: string
  calendlyUrl: string
  isAlwaysLocked?: boolean
  requiresCompletion?: boolean
}

const MENTORS: Mentor[] = [
  {
    name: 'Rousso',
    role: 'Technical Trading Mentor',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/rousso.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
    requiresCompletion: true,
  },
  {
    name: 'Jason',
    role: 'Technical Trading Mentor',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/jason.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
    requiresCompletion: true,
  },
  {
    name: 'Arno',
    role: 'Mindset Coach',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/arno.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
    isAlwaysLocked: true,
  },
  {
    name: 'Chris Henry',
    role: 'Mindset Coach',
    image: 'https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/mentor-photos/chris.jpg',
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
    isAlwaysLocked: true,
  },
]

export default function MentorshipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accessLevel, setAccessLevel] = useState<number | null>(getStoredStudentAccessLevel())
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      let studentId = getStoredStudentId()
      let level = getStoredStudentAccessLevel()

      if (!studentId || level == null) {
        const student = await getStudentByAuthUserId(user.id)
        if (student?.id) {
          setStoredStudent(student.id, student.email, student.name ?? null)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          studentId = student.id
          level = student.access_level ?? 1
        }
      }

      if (level == null) level = 1
      setAccessLevel(level)

      // Calculate overall progress
      if (studentId && level >= 2) {
        try {
          const mods = await getModulesSimple()
          const moduleIds = mods.map(m => m.id)
          const lessons = await getLessonsForModules(moduleIds)
          const watchedSet = await getWatchedLessonIds(studentId, lessons.map(l => l.id))

          const totalLessons = lessons.length
          const totalCompleted = lessons.reduce((acc, l) => acc + (watchedSet.has(l.id) ? 1 : 0), 0)
          const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0
          setOverallProgress(progress)
        } catch (error) {
          console.error('Error calculating progress:', error)
          setOverallProgress(0)
        }
      } else {
        setOverallProgress(0)
      }

      setLoading(false)
    }

    run()
  }, [router])

  const handleBookSession = (mentor: Mentor) => {
    if ((accessLevel ?? 1) < 2) {
      return
    }

    // Check if mentor is locked
    if (mentor.isAlwaysLocked) {
      return
    }

    if (mentor.requiresCompletion && overallProgress < 100) {
      return
    }

    // Directly open Calendly modal for unlocked mentors
    setSelectedMentor(mentor)
    setModalOpen(true)
  }

  const isMentorDisabled = (mentor: Mentor): boolean => {
    // Always disabled if access level is too low
    if ((accessLevel ?? 1) < 2) {
      return true
    }

    // Always disabled if mentor is always locked
    if (mentor.isAlwaysLocked) {
      return true
    }

    // Disabled if mentor requires completion and progress is not 100%
    if (mentor.requiresCompletion && overallProgress < 100) {
      return true
    }

    return false
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

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 w-full animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]/70"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MENTORS.map(mentor => (
                <MentorCard
                  key={mentor.name}
                  name={mentor.name}
                  role={mentor.role}
                  image={mentor.image}
                  isDisabled={isMentorDisabled(mentor)}
                  isAlwaysLocked={mentor.isAlwaysLocked ?? false}
                  requiresCompletion={mentor.requiresCompletion ?? false}
                  overallProgress={overallProgress}
                  onBook={() => handleBookSession(mentor)}
                />
              ))}
            </div>
          )}

          {/* Tradezella Section */}
          <section className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 md:p-8">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Waarom Tradezella een gamechanger is voor iedere serieuze trader</h2>
              
              <div className="space-y-3 text-sm leading-relaxed text-[var(--text-dim)]">
                <p>
                  Tradezella is veel meer dan een trade-journal — het is een compleet performance-systeem dat alles omzet in harde data: winrates, R-multiple, setup-kwaliteit, emotionele fouten, patronen… alles wordt zichtbaar.
                </p>

                <div className="space-y-2">
                  <p className="font-medium text-white">Door Tradezella kunnen mijn studenten:</p>
                  <ul className="ml-5 space-y-1.5 list-disc text-[var(--text-dim)]">
                    <li>hun fouten objectief analyseren</li>
                    <li>exact zien welke setups wel en niet werken</li>
                    <li>hun gedrag en emoties meten in plaats van raden</li>
                    <li>een duidelijk stappenplan bouwen naar meer consistentie</li>
                  </ul>
                </div>

                <p>
                  Voor mij als mentor is Tradezella nog waardevoller: ik zie direct waar jij struikelt, welke patronen terugkomen en waar je discipline breekt. Daardoor kan ik veel gerichter en persoonlijker coachen — niet op gevoel, maar op data.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
                <a
                  href="https://tradezella.com?fpr=htp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
                >
                  Bezoek Tradezella
                </a>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[var(--text-dim)]">20% korting met code:</span>
                  <code className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 font-mono font-semibold text-[var(--accent)]">
                    HTP
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

