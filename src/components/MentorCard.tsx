'use client'

import Image from 'next/image'

type Props = {
  name: string
  role: string
  image: string
  isDisabled: boolean
  /** When true, show "Log in to book" message under the button. Use when user is known to be unauthenticated. */
  showLoginPrompt?: boolean
  onBook: () => void
}

export default function MentorCard({
  name,
  role,
  image,
  isDisabled,
  showLoginPrompt = false,
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
          title={isDisabled ? (showLoginPrompt ? 'Log in om een call in te plannen' : 'Laden…') : `Plan een gratis call met ${name}`}
        >
          {isDisabled ? (showLoginPrompt ? 'Log in om een call in te plannen' : 'Plan een gratis call') : 'Plan een gratis call'}
        </button>

        {isDisabled && showLoginPrompt && (
          <p className="text-xs text-[var(--text-dim)] text-center">
            Log in om een gratis kennismakingscall in te plannen.
          </p>
        )}
      </div>
    </div>
  )
}

