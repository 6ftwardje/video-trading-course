'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Player from '@vimeo/player'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { ArrowLeft } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getPracticalLessons, type PracticalLessonRecord } from '@/lib/practical'
import { getModulesSimple } from '@/lib/progress'
import { getModuleGateStatus } from '@/lib/moduleGate'
import { useStudent } from '@/components/StudentProvider'
import { RequireAccess } from '@/components/RequireAccess'
import { FREE_MODULE_ORDER_LIMIT, canAccessModuleByOrder } from '@/lib/access'

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

export default function PracticalLessonPage({ params }: { params: { id: string } }) {
  const id = params.id
  const { student, status } = useStudent()
  const [lesson, setLesson] = useState<PracticalLesson | null>(null)
  const [lessons, setLessons] = useState<PracticalLesson[]>([])
  const [moduleOrder, setModuleOrder] = useState<number | null>(null)
  const [moduleLocked, setModuleLocked] = useState(false)
  const [previousModuleOrder, setPreviousModuleOrder] = useState<number | null>(null)
  const [previousModuleTitle, setPreviousModuleTitle] = useState<string | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  const accessLevel = student?.access_level ?? 1
  const studentId = student?.id ?? null

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
        .select('id, module_id, title, description, location, thumbnail_url')
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
        video_url: (data as any).video_url ?? data.location ?? extractFirstUrl(data.description),
        thumbnail_url: (data as any).thumbnail_url ?? null
      }

      if (status !== 'ready' || !student) {
        return
      }

      setLesson(resolvedLesson)

      const { data: moduleData } = await supabase
        .from('modules')
        .select('title,"order"')
        .eq('id', resolvedLesson.module_id)
        .single()

      const resolvedModuleOrder = moduleData?.order ?? null
      setModuleOrder(resolvedModuleOrder)

      if (studentId && canAccessModuleByOrder(accessLevel, resolvedModuleOrder)) {
        const allModules = await getModulesSimple()
        const gateStatus = await getModuleGateStatus(allModules, resolvedLesson.module_id, studentId, accessLevel)
        setModuleLocked(gateStatus.isLockedByExam)
        setPreviousModuleOrder(gateStatus.previousModule?.order ?? null)
        setPreviousModuleTitle(gateStatus.previousModule?.title ?? null)
      } else {
        setModuleLocked(true)
        setPreviousModuleOrder(null)
        setPreviousModuleTitle(null)
      }

      const modulePracticals = await getPracticalLessons(resolvedLesson.module_id)
      setLessons(modulePracticals)
    }

    load()
  }, [id, status, student, studentId, accessLevel])

  useEffect(() => {
    if (!lesson || !lesson.video_url || !playerRef.current || !canAccessModuleByOrder(accessLevel, moduleOrder) || moduleLocked) return

    const videoId = getVimeoVideoId(lesson.video_url)
    if (!videoId) return

    const player = new Player(playerRef.current, {
      id: Number(videoId),
      responsive: true
    })

    return () => {
      player.destroy().catch(console.error)
    }
  }, [lesson, accessLevel, moduleOrder, moduleLocked])

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
      <Container className="pt-8 md:pt-12 pb-16">
        <p className="text-[var(--text-dim)]">Laden…</p>
      </Container>
    )
  }

  const isLockedByAccess = moduleOrder !== null && !canAccessModuleByOrder(accessLevel, moduleOrder)
  const requiredAccessLevel = isLockedByAccess ? 2 : 1
  const previousModuleLabel = previousModuleOrder
    ? `Module ${previousModuleOrder}`
    : previousModuleTitle || 'de vorige module'

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

          {moduleLocked && previousModuleOrder ? (
            <div className="rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-5 text-sm text-[#7C99E3]">
              Deze praktijkles is nog vergrendeld. Voltooi eerst het examen van {previousModuleLabel}.
            </div>
          ) : isLockedByAccess ? (
            <div className="rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-5 text-sm text-[#7C99E3]">
              Module {FREE_MODULE_ORDER_LIMIT + 1} en verder horen bij de volledige cursus.
              <Link href="/upgrade" className="ml-2 font-semibold underline underline-offset-4">
                Volledige cursus ontgrendelen
              </Link>
            </div>
          ) : (
            <RequireAccess requiredLevel={requiredAccessLevel} accessLevel={accessLevel}>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black" ref={playerRef}>
                {!lesson.video_url ? (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-dim)]">
                    Geen video beschikbaar voor deze praktijkles.
                  </div>
                ) : null}
              </div>
            </RequireAccess>
          )}

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

          <RequireAccess requiredLevel={requiredAccessLevel} accessLevel={accessLevel}>
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
              {navigation.prev ? (
                <Link
                  href={`/praktijk/${navigation.prev.id}`}
                  className="px-4 py-2 rounded-md border transition bg-[var(--card)] hover:bg-[var(--muted)] border-[var(--border)] text-white"
                >
                  ← {navigation.prev.title}
                </Link>
              ) : (
                <div />
              )}

              {navigation.next ? (
                <Link
                  href={`/praktijk/${navigation.next.id}`}
                  className="px-4 py-2 rounded-md border transition bg-[#7C99E3]/10 border-[#7C99E3]/30 hover:bg-[#7C99E3]/20 text-[#7C99E3]"
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
          </RequireAccess>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4 text-white/90">Praktijklessen</h2>
            <ul className="space-y-3">
              {orderedLessons.map((item) => (
                <li key={item.id}>
                  <RequireAccess requiredLevel={requiredAccessLevel} accessLevel={accessLevel}>
                    <Link
                      href={`/praktijk/${item.id}`}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                        item.id === lesson.id
                          ? 'border-[#7C99E3] bg-[#7C99E3]/10'
                          : 'border-[var(--border)] hover:border-[#7C99E3]/40'
                      }`}
                    >
                      <div className="relative w-16 h-10 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                        <Image
                          src={item.thumbnail_url || 'https://placehold.co/160x90?text=Praktijk'}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-sm text-white/90 flex-1">{item.title}</span>
                    </Link>
                  </RequireAccess>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  )
}
