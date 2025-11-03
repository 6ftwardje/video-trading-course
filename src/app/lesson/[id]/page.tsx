'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Container from '@/components/ui/Container'

type Lesson = { id: number; title: string; video_url: string | null; module_id: number; order: number }
type NextLesson = { id: number; title: string } | null

function getVimeoEmbedUrl(videoUrl: string): string {
  // Extract Vimeo video ID from various URL formats
  const patterns = [
    /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456789
    /vimeo\.com\/video\/(\d+)/,     // https://vimeo.com/video/123456789
    /vimeo\.com\/(.*)\/(\d+)/,      // https://vimeo.com/channels/staffpicks/123456789
  ]
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern)
    if (match) {
      const videoId = match[match.length - 1] // Last captured group
      return `https://player.vimeo.com/video/${videoId}`
    }
  }
  
  // If already an embed URL, return as is
  if (videoUrl.includes('player.vimeo.com')) {
    return videoUrl
  }
  
  return videoUrl
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alreadyWatched, setAlreadyWatched] = useState(false)
  const [nextLesson, setNextLesson] = useState<NextLesson>(null)

  useEffect(() => {
    const init = async () => {
      // 1) Haal huidige les met module_id en order op
      const { data } = await supabase
        .from('lessons')
        .select('id,title,video_url,module_id,order')
        .eq('id', id)
        .single()
      
      if (!data) return
      setLesson(data as Lesson)

      // 2) Bepaal "volgende les" (eerstvolgende hogere order binnen dezelfde module)
      const { data: nextLs } = await supabase
        .from('lessons')
        .select('id,title,order')
        .eq('module_id', data.module_id)
        .gt('order', data.order)
        .order('order', { ascending: true })
        .limit(1)
      setNextLesson((nextLs && nextLs[0]) || null)

      // Check if already watched
      const studentId = getStoredStudentId()
      if (studentId) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('id')
          .eq('student_id', studentId)
          .eq('lesson_id', data.id)
          .eq('watched', true)
          .single()

        if (progressData) {
          setAlreadyWatched(true)
          setSaved(true)
        }
      }
    }
    init()
  }, [id])

  const markAsCompleted = async () => {
    if (!lesson) return

    const studentId = getStoredStudentId()
    if (!studentId) {
      alert('Geen student ID gevonden. Probeer de pagina te verversen.')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('progress')
      .upsert(
        [
          {
            student_id: studentId,
            lesson_id: lesson.id,
            watched: true,
            watched_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'student_id,lesson_id' }
      )

    if (!error) {
      setSaved(true)
      setAlreadyWatched(true)
    } else {
      console.error('Error saving progress:', error)
    }
    setSaving(false)
  }

  if (!lesson) return <Container className="pt-20 pb-16"><p className="text-[var(--text-dim)]">Laden…</p></Container>

  const embedUrl = lesson.video_url ? getVimeoEmbedUrl(lesson.video_url) : null

  return (
    <Container className="pt-20 pb-16">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/module/${lesson.module_id}`}
            className="text-sm text-[var(--text-dim)] hover:text-white underline underline-offset-4 transition-colors"
            aria-label="Terug naar module"
          >
            ← Terug naar module
          </Link>
          <div className="text-sm text-[var(--text-dim)]">
            {saving ? 'Opslaan…' : saved ? 'Les voltooid ✅' : ' '}
          </div>
        </div>

        {/* Titel */}
        <h1 className="text-2xl font-semibold text-[var(--accent)]">{lesson.title}</h1>

      {/* Video */}
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={lesson.title}
        />
      ) : (
        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black flex items-center justify-center text-[var(--text-dim)]">
          Geen video URL beschikbaar
        </div>
      )}

        {/* CTA na voltooiing */}
        {saved && (
          <div className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 transition-opacity duration-300">
            <div className="text-sm text-white/90">Mooi werk! Deze les is gemarkeerd als voltooid.</div>
            {nextLesson ? (
              <Link
                href={`/lesson/${nextLesson.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-white"
                aria-label={`Ga verder naar ${nextLesson.title}`}
              >
                Volgende les → {nextLesson.title}
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/module/${lesson.module_id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-white"
                aria-label="Terug naar module"
              >
                Terug naar module
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {/* Markeer als voltooid knop (alleen als nog niet voltooid) */}
        {!saved && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <p className="text-[var(--text-dim)] text-sm">
              Markeer de les als voltooid na het bekijken
            </p>
            <button
              onClick={markAsCompleted}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-[var(--accent)]/50 text-white cursor-not-allowed'
                  : 'bg-[var(--accent)] hover:opacity-90 text-black'
              }`}
            >
              <Check className="w-5 h-5" />
              {saving ? 'Opslaan…' : 'Markeer als voltooid'}
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}

