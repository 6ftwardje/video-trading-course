'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

type IntroVideoProps = {
  className?: string
  thumbnailUrl?: string
}

export default function IntroVideo({ className = '', thumbnailUrl }: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Vimeo player script if not already loaded
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="player.vimeo.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://player.vimeo.com/api/player.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handlePlay = () => {
    setIsPlaying(true)
    // Add autoplay parameter to iframe src when play is clicked
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src
      if (!currentSrc.includes('autoplay=1')) {
        iframeRef.current.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'autoplay=1'
      }
    }
  }

  // Use placeholder for now, will be replaced with Supabase storage link
  const thumbnail = thumbnailUrl || 'https://placehold.co/1920x1080?text=Intro+Video+Thumbnail'

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1144453792?badge=0&autopause=0&player_id=0&app_id=58479"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          title="final"
        />
        {!isPlaying && (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={handlePlay}
            style={{ zIndex: 10 }}
          >
            <div className="relative h-full w-full">
              <Image
                src={thumbnail}
                alt="Intro video thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white/90 p-4 group-hover:bg-white group-hover:scale-110 transition-all shadow-lg">
                  <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

