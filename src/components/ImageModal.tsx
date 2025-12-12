'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ImageModalProps {
  src: string
  onClose: () => void
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
        <img
          src={src}
          alt="Update image"
          className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 p-2 transition-colors"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  )
}





