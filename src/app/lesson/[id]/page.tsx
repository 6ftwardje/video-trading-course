'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'
import { Check } from 'lucide-react'

type Lesson = { id: number; title: string; video_url: string | null }

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

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('lessons').select('id,title,video_url').eq('id', id).single()
      setLesson(data as Lesson)

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-crypto-orange">{lesson.title}</h1>
      </div>

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

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <p className="text-gray-400 text-sm">
          {saved ? '✅ Deze les is als voltooid gemarkeerd' : 'Markeer de les als voltooid na het bekijken'}
        </p>
        <button
          onClick={markAsCompleted}
          disabled={saving || saved}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : saving
              ? 'bg-crypto-orange/50 text-white cursor-not-allowed'
              : 'bg-crypto-orange hover:bg-orange-500 text-white'
          }`}
        >
          <Check className="w-5 h-5" />
          {saving ? 'Opslaan…' : saved ? 'Voltooid' : 'Markeer als voltooid'}
        </button>
      </div>
    </div>
  )
}

