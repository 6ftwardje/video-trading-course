'use client'

import { useEffect, useState, useRef } from 'react'
import { use } from 'react'
import Player from '@vimeo/player'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Container from '@/components/ui/Container'

type Lesson = {
  id: number
  module_id: number
  title: string
  video_url: string | null
  order: number
  description?: string | null
}

type LessonListItem = {
  id: number
  module_id: number
  title: string
  order: number
}

function getVimeoVideoId(videoUrl: string): string | null {
  // Extract Vimeo video ID from various URL formats
  const patterns = [
    /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456789
    /vimeo\.com\/video\/(\d+)/,     // https://vimeo.com/video/123456789
    /vimeo\.com\/(.*)\/(\d+)/,      // https://vimeo.com/channels/staffpicks/123456789
  ]
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern)
    if (match) {
      return match[match.length - 1] // Last captured group
    }
  }
  
  return null
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<LessonListItem[]>([])
  const [nextLesson, setNextLesson] = useState<LessonListItem | null>(null)
  const [prevLesson, setPrevLesson] = useState<LessonListItem | null>(null)
  const [progress, setProgress] = useState<Record<number, boolean>>({})
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let player: Player | null = null
    
    const init = async () => {
      try {
        const studentId = getStoredStudentId()
        
        const lessonIdNum = Number(id)
        if (isNaN(lessonIdNum)) {
          console.error('Invalid lesson ID:', id)
          return
        }
        
        // Huidige les ophalen
        const { data: current, error: currentError } = await supabase
          .from('lessons')
          .select('id,module_id,title,video_url,"order",description')
          .eq('id', lessonIdNum)
          .single()
        
        if (currentError) {
          console.error('Error fetching current lesson:', {
            message: currentError.message,
            details: currentError.details,
            hint: currentError.hint,
            code: currentError.code
          })
          return
        }
        
        if (!current) {
          console.error('Lesson not found:', lessonIdNum)
          return
        }
        
        setLesson(current)

        // Alle lessen in module
        const { data: all, error: allError } = await supabase
          .from('lessons')
          .select('id,module_id,title,"order"')
          .eq('module_id', current.module_id)
        
        if (allError) {
          console.error('Error fetching lessons in module:', allError)
        }
        
        // Sort manually to avoid PostgREST query string issues with 'order' column
        const sortedAll: LessonListItem[] = all ? [...all].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
        setLessons(sortedAll)

        // Progress van gebruiker ophalen
        if (studentId && sortedAll.length > 0) {
          const { data: pr, error: progressError } = await supabase
            .from('progress')
            .select('lesson_id,watched')
            .eq('student_id', studentId)
            .in('lesson_id', sortedAll.map(l => l.id))
          
          if (progressError) {
            console.error('Error fetching progress:', progressError)
          } else {
            const map: Record<number, boolean> = {}
            pr?.forEach(p => { 
              map[p.lesson_id] = p.watched 
            })
            setProgress(map)
          }
        }

        // Bepaal vorige/volgende
        if (sortedAll.length > 0) {
          const idx = sortedAll.findIndex(l => l.id === current.id)
          setPrevLesson(sortedAll[idx - 1] || null)
          setNextLesson(sortedAll[idx + 1] || null)
        }

        // Player instellen
        if (current.video_url && playerRef.current) {
          const videoId = getVimeoVideoId(current.video_url)
          if (videoId) {
            player = new Player(playerRef.current, { 
              id: parseInt(videoId),
              responsive: true 
            })

            player.on('ended', async () => {
              if (!studentId) return

              await supabase.from('progress').upsert({
                student_id: studentId,
                lesson_id: current.id,
                watched: true,
                watched_at: new Date().toISOString()
              }, { onConflict: 'student_id,lesson_id' })

              setProgress(prev => ({ ...prev, [current.id]: true }))
            })
          }
        }
      } catch (err) {
        console.error('Unexpected error loading lesson:', err)
      }
    }
    
    init()

    // Cleanup functie
    return () => {
      if (player) {
        player.destroy().catch(console.error)
      }
    }
  }, [id])

  if (!lesson) return <Container className="pt-20 pb-16"><p className="text-[var(--text-dim)]">Laden…</p></Container>

  return (
    <Container className="pt-20 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Video + inhoud */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header */}
          <Link
            href={`/module/${lesson.module_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--muted)] transition-all text-white group"
            aria-label="Terug naar module"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Terug naar module</span>
          </Link>

          {/* Video */}
          <div ref={playerRef} className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black" />

          {/* Titel en beschrijving */}
          <div>
            <h1 className="text-3xl font-semibold text-white">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-[var(--text-dim)] mt-2">
                {lesson.description}
              </p>
            )}
            {!lesson.description && (
              <p className="text-[var(--text-dim)] mt-2">
                In deze les leer je belangrijke concepten om beter te traden.
              </p>
            )}
          </div>

          {/* Navigatieknoppen */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
            {prevLesson ? (
              <Link
                href={`/lesson/${prevLesson.id}`}
                className="px-4 py-2 rounded-md bg-[var(--card)] hover:bg-[var(--muted)] border border-[var(--border)] transition text-white"
              >
                ← {prevLesson.title}
              </Link>
            ) : <div />}

            {nextLesson ? (
              progress[lesson.id] ? (
                <Link
                  href={`/lesson/${nextLesson.id}`}
                  className="px-4 py-2 rounded-md border transition bg-[var(--accent)]/20 border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 text-[var(--accent)]"
                >
                  Volgende →
                </Link>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-md border transition bg-[var(--card)] border-[var(--border)] text-[var(--text-dim)] cursor-not-allowed opacity-60"
                  title="Voltooi eerst deze les om door te gaan"
                >
                  Volgende →
                </button>
              )
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

        {/* Leslijst zijpaneel */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4 text-white/90">Lessen in deze module</h2>
            <ul className="space-y-3">
              {lessons.map(l => {
                // Les is unlocked als alle vorige lessen watched zijn
                const sorted = [...lessons].sort((a, b) => a.order - b.order)
                const currentIndex = sorted.findIndex(les => les.id === l.id)
                let isUnlocked = currentIndex === 0 // Eerste les is altijd unlocked
                
                if (!isUnlocked && currentIndex > 0) {
                  // Check of alle vorige lessen bekeken zijn
                  isUnlocked = sorted.slice(0, currentIndex).every(prevLesson => progress[prevLesson.id])
                }
                
                return (
                  <li key={l.id}>
                    <Link
                      href={isUnlocked ? `/lesson/${l.id}` : '#'}
                      onClick={(e) => {
                        if (!isUnlocked) {
                          e.preventDefault()
                        }
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                        l.id === lesson.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : isUnlocked
                          ? 'border-[var(--border)] hover:border-[var(--accent)]/50'
                          : 'border-[var(--border)] opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="relative w-16 h-10 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
                        <Image
                          src={(l as any).thumbnail_url || 'https://placehold.co/160x90?text=Lesson'}
                          alt={l.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-sm text-white/90 flex-1">{l.title}</span>
                      {progress[l.id] && (
                        <span className="text-[var(--accent)] text-xs">✓</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  )
}

