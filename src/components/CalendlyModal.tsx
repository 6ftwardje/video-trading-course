'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  mentorName: string
  calendlyUrl: string
}

export default function CalendlyModal({ isOpen, onClose, mentorName, calendlyUrl }: Props) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Plan een sessie met {mentorName}</h2>
            <p className="text-sm text-[var(--text-dim)]">Kies een geschikt tijdstip voor je mentorship sessie</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-dim)] transition hover:bg-[var(--muted)] hover:text-white"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Calendly Embed */}
        <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-[var(--muted)]">
          <iframe
            src={calendlyUrl}
            className="h-full w-full border-0"
            title={`Calendly booking voor ${mentorName}`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

