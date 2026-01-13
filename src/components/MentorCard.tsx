'use client'

import Image from 'next/image'

type Props = {
  name: string
  role: string
  image: string
  isDisabled: boolean
  isAlwaysLocked?: boolean
  requiresCompletion?: boolean
  overallProgress?: number
  onBook: () => void
}

export default function MentorCard({ 
  name, 
  role, 
  image, 
  isDisabled, 
  isAlwaysLocked = false,
  requiresCompletion = false,
  overallProgress = 0,
  onBook 
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-6 ${
        isDisabled
          ? 'opacity-70'
          : 'transition-all hover:border-[var(--accent)] hover:bg-[var(--card)]'
      }`}
    >
      <div className="space-y-4">
        {/* Mentor Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[var(--muted)]">
          {image ? (
            <Image
              src={image}
              alt={`${name} - ${role}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-[var(--text-dim)]">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Mentor Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{name}</h3>
          <p className="text-sm text-[var(--text-dim)]">{role}</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onBook}
          disabled={isDisabled}
          className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
            isDisabled
              ? 'cursor-not-allowed bg-gray-700 text-gray-500 opacity-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title={isDisabled ? 'Nog niet beschikbaar' : `Plan een gratis call met ${name}`}
        >
          {isDisabled ? (
            <span className="flex items-center justify-center gap-2">
              <span>Plan een gratis call</span>
              {requiresCompletion && overallProgress < 100 && (
                <span className="text-xs">({overallProgress}%)</span>
              )}
            </span>
          ) : (
            'Plan een gratis call'
          )}
        </button>

        {/* Disabled State Message */}
        {isDisabled && isAlwaysLocked && (
          <p className="text-xs text-[var(--text-dim)] text-center">
            Deze mentor is momenteel niet beschikbaar.
          </p>
        )}
        {isDisabled && requiresCompletion && overallProgress < 100 && (
          <p className="text-xs text-[#7C99E3] text-center">
            Beschikbaar na het doornemen van de volledige cursus (100% voltooid).
          </p>
        )}
        {isDisabled && !isAlwaysLocked && !requiresCompletion && (
          <p className="text-xs text-[#7C99E3] text-center">
            Vraag je mentor om een upgrade voor volledige toegang.
          </p>
        )}
      </div>
    </div>
  )
}

