'use client'

import { useEffect, useRef, useState } from 'react'
import { use } from 'react'
import Player from '@vimeo/player'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'

type Lesson = { id: number; title: string; video_url: string | null }

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const playerRef = useRef<HTMLDivElement>(null)
  const { id } = use(params)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('lessons').select('id,title,video_url').eq('id', id).single()
      setLesson(data as Lesson)
      if (!data?.video_url || !playerRef.current) return

      const player = new Player(playerRef.current, {
        url: data.video_url,
        responsive: true,
      })

      player.on('play', () => {
        console.log('▶️ Start:', data.title)
      })

      player.on('ended', async () => {
        const studentId = getStoredStudentId()
        if (!studentId) {
          console.warn('Geen student_id gevonden — voortgang niet opgeslagen.')
          return
        }
        setSaving(true)
        // Upsert voortgang (vereist unieke index student_id+lesson_id)
        const { error } = await supabase
          .from('progress')
          .upsert(
            [
              {
                student_id: studentId,
                lesson_id: data.id,
                watched: true,
                watched_at: new Date().toISOString(),
              },
            ],
            { onConflict: 'student_id,lesson_id' }
          )
        if (!error) setSaved(true)
        setSaving(false)
      })
    }
    init()
  }, [id])

  if (!lesson) return <p className="text-gray-400">Laden…</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-crypto-orange">{lesson.title}</h1>
        <div className="text-sm text-gray-400">
          {saving ? 'Opslaan…' : saved ? 'Voortgang opgeslagen ✅' : ' '}
        </div>
      </div>

      <div ref={playerRef} className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black" />

      <p className="text-gray-400 text-sm">
        De les wordt automatisch als voltooid gemarkeerd wanneer de video eindigt.
      </p>
    </div>
  )
}

