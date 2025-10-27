'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

  if (!lesson) return <p className="text-gray-400">Laden…</p>

  const embedUrl = lesson.video_url ? getVimeoEmbedUrl(lesson.video_url) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/module/${lesson.module_id}`}
          className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors"
          aria-label="Terug naar module"
        >
          ← Terug naar module
        </Link>
        <div className="text-sm text-gray-400">
          {saving ? 'Opslaan…' : saved ? 'Les voltooid ✅' : ' '}
        </div>
      </div>

      {/* Titel */}
      <h1 className="text-2xl font-semibold text-crypto-orange">{lesson.title}</h1>

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
        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black flex items-center justify-center text-gray-500">
          Geen video URL beschikbaar
        </div>
      )}

      {/* CTA na voltooiing */}
      {saved && (
        <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4 transition-opacity duration-300">
          <div className="text-sm text-gray-300">Mooi werk! Deze les is gemarkeerd als voltooid.</div>
          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-crypto-blue/20 border border-crypto-blue/40 hover:bg-crypto-blue/30 transition text-white"
              aria-label={`Ga verder naar ${nextLesson.title}`}
            >
              Volgende les → {nextLesson.title}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/module/${lesson.module_id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30 transition text-white"
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            Markeer de les als voltooid na het bekijken
          </p>
          <button
            onClick={markAsCompleted}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              saving
                ? 'bg-crypto-orange/50 text-white cursor-not-allowed'
                : 'bg-crypto-orange hover:bg-orange-500 text-white'
            }`}
          >
            <Check className="w-5 h-5" />
            {saving ? 'Opslaan…' : 'Markeer als voltooid'}
          </button>
        </div>
      )}
    </div>
  )
}

