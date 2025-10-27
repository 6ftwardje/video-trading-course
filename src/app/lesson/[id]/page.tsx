'use client'

import { useEffect, useRef } from 'react'
import { use } from 'react'
import Player from '@vimeo/player'
import { supabase } from '@/lib/supabaseClient'

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const playerRef = useRef<HTMLDivElement>(null)
  const { id } = use(params)

  useEffect(() => {
    const fetchLesson = async () => {
      const { data } = await supabase.from('lessons').select('*').eq('id', id).single()
      if (!data || !playerRef.current) return

      const player = new Player(playerRef.current, {
        url: data.video_url,
        responsive: true,
      })

      player.on('ended', async () => {
        console.log('🎉 Video voltooid!')
        await supabase.from('progress').insert({
          lesson_id: data.id,
          watched: true,
        })
      })
    }

    fetchLesson()
  }, [id])

  return <div ref={playerRef} className="aspect-video w-full rounded-xl overflow-hidden" />
}

