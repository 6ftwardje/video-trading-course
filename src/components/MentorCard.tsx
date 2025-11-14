'use client'

type Props = {
  name: string
  role: string
  image: string
  isDisabled: boolean
  onBook: () => void
}

export default function MentorCard({ name, role, image, isDisabled, onBook }: Props) {
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
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: image ? `url(${image})` : undefined,
              backgroundColor: image ? 'transparent' : 'var(--muted)',
            }}
          >
            {!image && (
              <div className="flex h-full items-center justify-center text-4xl text-[var(--text-dim)]">
                {name.charAt(0)}
              </div>
            )}
          </div>
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
          title={isDisabled ? 'Beschikbaar voor Premium leden' : `Plan een sessie met ${name}`}
        >
          {isDisabled ? (
            <span className="flex items-center justify-center gap-2">
              <span>Plan een sessie</span>
              <span className="text-xs">(Premium)</span>
            </span>
          ) : (
            'Plan een sessie'
          )}
        </button>

        {/* Disabled State Message */}
        {isDisabled && (
          <p className="text-xs text-[#7C99E3] text-center">
            Vraag je mentor om een upgrade voor volledige toegang.
          </p>
        )}
      </div>
    </div>
  )
}

