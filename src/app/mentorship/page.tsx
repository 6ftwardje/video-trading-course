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
    image: '', // Placeholder - will show initial letter
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
  },
  {
    name: 'Jason',
    role: 'Technical Trading Mentor',
    image: '', // Placeholder - will show initial letter
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
  },
  {
    name: 'Arno',
    role: 'Mindset Coach',
    image: '', // Placeholder - will show initial letter
    calendlyUrl: 'https://calendly.com/cryptoriez/30min',
  },
]

export default function MentorshipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accessLevel, setAccessLevel] = useState<number | null>(getStoredStudentAccessLevel())
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
          setStoredStudent(student.id, student.email)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          studentId = student.id
          level = student.access_level ?? 1
        }
      }

      if (level == null) level = 1
      setAccessLevel(level)
      setLoading(false)
    }

    run()
  }, [router])

  const handleBookSession = (mentor: Mentor) => {
    if ((accessLevel ?? 1) < 2) {
      return
    }

    // Directly open Calendly modal for level 2+ users
    setSelectedMentor(mentor)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedMentor(null)
  }

  return (
    <>
      <Container className="pb-20 pt-28">
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
              {Array.from({ length: 3 }).map((_, idx) => (
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
                  isDisabled={(accessLevel ?? 1) < 2}
                  onBook={() => handleBookSession(mentor)}
                />
              ))}
            </div>
          )}
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

