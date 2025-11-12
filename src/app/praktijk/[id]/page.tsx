'use client'

import { useEffect, useMemo, useRef, useState, use } from 'react'
import Player from '@vimeo/player'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { ArrowLeft, Lock } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getPracticalLessons, type PracticalLessonRecord } from '@/lib/practical'
import {
  getStoredStudentAccessLevel,
  getStoredStudentId,
  getStudentByAuthUserId,
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'

type PracticalLesson = PracticalLessonRecord

function getVimeoVideoId(videoUrl: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/(.*)\/(\d+)/
  ]

  for (const pattern of patterns) {
    const match = videoUrl.match(pattern)
    if (match) {
      return match[match.length - 1]
    }
  }

  return null
}

function extractFirstUrl(text?: string | null) {
  if (!text) return null
  const match = text.match(/https?:\/\/\S+/)
  return match ? match[0] : null
}

export default function PracticalLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lesson, setLesson] = useState<PracticalLesson | null>(null)
  const [lessons, setLessons] = useState<PracticalLesson[]>([])
  const playerRef = useRef<HTMLDivElement>(null)
  const [accessLevel, setAccessLevel] = useState<number | null>(getStoredStudentAccessLevel())

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseClient()
      const practicalId = Number(id)

      if (isNaN(practicalId)) {
        console.error('Invalid practical lesson id:', id)
        return
      }

      const { data, error } = await supabase
        .from('practical_lessons')
        .select('id, module_id, title, description, location')
        .eq('id', practicalId)
        .single()

      if (error) {
        console.error('Error fetching practical lesson:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      if (!data) return

      const resolvedLesson: PracticalLesson = {
        ...data,
        video_url: (data as any).video_url ?? data.location ?? extractFirstUrl(data.description)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      let studentId = getStoredStudentId()
      let level = getStoredStudentAccessLevel()

      if (user && (!studentId || level == null)) {
        const student = await getStudentByAuthUserId(user.id)
        if (student?.id) {
          setStoredStudent(student.id, student.email)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          level = student.access_level ?? 1
        }
      }

      if (level == null) level = 1
      setAccessLevel(level)

      setLesson(resolvedLesson)

      const modulePracticals = await getPracticalLessons(resolvedLesson.module_id)
      setLessons(modulePracticals)
    }

    load()
  }, [id])

  useEffect(() => {
    if (!lesson || !lesson.video_url || !playerRef.current || (accessLevel ?? 1) < 2) return

    const videoId = getVimeoVideoId(lesson.video_url)
    if (!videoId) return

    const player = new Player(playerRef.current, {
      id: Number(videoId),
      responsive: true
    })

    return () => {
      player.destroy().catch(console.error)
    }
  }, [lesson, accessLevel])

  const orderedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => a.id - b.id)
  }, [lessons])

  const navigation = useMemo(() => {
    if (!lesson) return { prev: null as PracticalLesson | null, next: null as PracticalLesson | null }
    const index = orderedLessons.findIndex((l) => l.id === lesson.id)
    return {
      prev: index > 0 ? orderedLessons[index - 1] : null,
      next: index >= 0 && index < orderedLessons.length - 1 ? orderedLessons[index + 1] : null
    }
  }, [lesson, orderedLessons])

  if (!lesson) {
    return (
      <Container className="pt-20 pb-16">
        <p className="text-[var(--text-dim)]">Laden…</p>
      </Container>
    )
  }

  const isBasic = (accessLevel ?? 1) < 2

  return (
    <Container className="pt-20 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Link
            href={`/module/${lesson.module_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[#7C99E3]/40 hover:bg-[var(--muted)] transition-all text-white group"
            aria-label="Terug naar module"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Terug naar module</span>
          </Link>

          <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black" ref={isBasic ? undefined : playerRef}>
            {isBasic ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0B0F17] text-center text-[#7C99E3]">
                <Lock className="h-10 w-10" />
                <p className="max-w-sm text-sm">
                  Praktijklessen zijn alleen beschikbaar voor leden met volledige toegang. Neem contact op met je mentor
                  om te upgraden.
                </p>
              </div>
            ) : !lesson.video_url ? (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
                Geen video beschikbaar voor deze praktijkles.
              </div>
            ) : null}
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-white">{lesson.title}</h1>
            {lesson.description ? (
              <p className="text-[var(--text-dim)] mt-2 whitespace-pre-line">{lesson.description}</p>
            ) : (
              <p className="text-[var(--text-dim)] mt-2">
                Deze praktijkles hoort bij module {lesson.module_id}.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
            {navigation.prev ? (
              <Link
                href={isBasic ? '#' : `/praktijk/${navigation.prev.id}`}
                onClick={e => {
                  if (isBasic) e.preventDefault()
                }}
                className={`px-4 py-2 rounded-md border transition ${
                  isBasic
                    ? 'cursor-not-allowed border-[#7C99E3]/40 bg-[#7C99E3]/10 text-[#7C99E3]'
                    : 'bg-[var(--card)] hover:bg-[var(--muted)] border-[var(--border)] text-white'
                }`}
              >
                ← {navigation.prev.title}
              </Link>
            ) : (
              <div />
            )}

            {navigation.next ? (
              <Link
                href={isBasic ? '#' : `/praktijk/${navigation.next.id}`}
                onClick={e => {
                  if (isBasic) e.preventDefault()
                }}
                className={`px-4 py-2 rounded-md border transition ${
                  isBasic
                    ? 'cursor-not-allowed border-[#7C99E3]/40 bg-[#7C99E3]/10 text-[#7C99E3]'
                    : 'bg-[#7C99E3]/10 border-[#7C99E3]/30 hover:bg-[#7C99E3]/20 text-[#7C99E3]'
                }`}
              >
                Volgende →
              </Link>
            ) : (
              <Link
                href={`/module/${lesson.module_id}`}
                className="px-4 py-2 rounded-md bg-[var(--card)] hover:bg-[var(--muted)] border border-[var(--border)] transition text-white"
              >
                Terug naar module
              </Link>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4 text-white/90">Praktijklessen</h2>
            <ul className="space-y-3">
              {orderedLessons.map((item) => (
                <li key={item.id}>
                  <Link
                    href={isBasic ? '#' : `/praktijk/${item.id}`}
                    onClick={e => {
                      if (isBasic) e.preventDefault()
                    }}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                      item.id === lesson.id
                        ? 'border-[#7C99E3] bg-[#7C99E3]/10'
                        : isBasic
                        ? 'border-[#7C99E3]/40 bg-[#7C99E3]/10 text-[#7C99E3]'
                        : 'border-[var(--border)] hover:border-[#7C99E3]/40'
                    }`}
                  >
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                      <Image
                        src={(item as any).thumbnail_url || 'https://placehold.co/160x90?text=Praktijk'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-sm text-white/90 flex-1">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  )
}

