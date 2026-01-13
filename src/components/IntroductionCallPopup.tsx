'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IntroductionCallPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function IntroductionCallPopup({ isOpen, onClose }: IntroductionCallPopupProps) {
  useEffect(() => {
    if (!isOpen) return

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
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCallClick = () => {
    window.open('https://calendly.com/hettradeplatform/30min', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold text-white pr-4">Gratis kennismakingscall</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-dim)] transition hover:bg-[var(--muted)] hover:text-white flex-shrink-0"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            Je kan als gebruiker een gratis kennismakingscall inplannen met Rousso of een van de mentors.
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            In dit gesprek krijg je uitleg over het platform en denken we mee over hoe jij stap voor stap kan leren traden.
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            Je kiest zelf of en wanneer je dit gesprek inplant.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCallClick}
            className="flex-1 bg-[var(--accent)] text-black hover:opacity-90"
          >
            Plan mijn gratis call
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--muted)] hover:text-white"
          >
            Nu niet
          </Button>
        </div>
      </div>
    </div>
  )
}
