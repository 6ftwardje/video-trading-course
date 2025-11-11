'use client'

import { useEffect, useMemo, useState } from 'react'

type SessionDefinition = {
  id: 'sydney' | 'tokyo' | 'london' | 'newYork'
  name: string
  startMinutes: number
  endMinutes: number
}

type SessionStatus = 'open' | 'overlap' | 'closed'

const SESSION_CONFIG: SessionDefinition[] = [
  { id: 'sydney', name: 'Sydney', startMinutes: toMinutes(21, 0), endMinutes: toMinutes(6, 0) },
  { id: 'tokyo', name: 'Tokyo', startMinutes: toMinutes(23, 0), endMinutes: toMinutes(8, 0) },
  { id: 'london', name: 'London', startMinutes: toMinutes(7, 0), endMinutes: toMinutes(16, 0) },
  { id: 'newYork', name: 'New York', startMinutes: toMinutes(12, 0), endMinutes: toMinutes(21, 0) },
]

function toMinutes(hours: number, minutes: number) {
  return hours * 60 + minutes
}

function getUtcMinutes(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes()
}

function getUtcDateFromMinutes(reference: Date, totalMinutes: number) {
  const base = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate(), 0, 0, 0, 0)
  const offsetMs = totalMinutes * 60 * 1000
  return new Date(base + offsetMs)
}

export function isSessionOpen(session: SessionDefinition, utcMinutes: number = getUtcMinutes(new Date())) {
  const wraps = session.startMinutes > session.endMinutes

  if (!wraps) {
    return utcMinutes >= session.startMinutes && utcMinutes < session.endMinutes
  }

  return utcMinutes >= session.startMinutes || utcMinutes < session.endMinutes
}

function resolveStatus(
  session: SessionDefinition,
  utcMinutes: number,
  concurrentlyOpenCount: number
): SessionStatus {
  const open = isSessionOpen(session, utcMinutes)
  if (!open) return 'closed'
  return concurrentlyOpenCount > 1 ? 'overlap' : 'open'
}

const STATUS_METADATA: Record<SessionStatus, { dotClass: string }> = {
  open: { dotClass: 'bg-[#3FCF8E]' },
  overlap: { dotClass: 'bg-[#3FCF8E]' },
  closed: { dotClass: 'bg-white/30' },
}

export default function TradingSessionClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [])

  const currentTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    []
  )

  const hourMinuteFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  )

  const tooltipFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  )

  const utcMinutes = now ? getUtcMinutes(now) : null
  const openSessions =
    utcMinutes == null ? [] : SESSION_CONFIG.filter((session) => isSessionOpen(session, utcMinutes))

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Trading Sessions</h2>
            <p className="text-xs text-[var(--text-dim)]">Live status per marktsessie</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 text-sm text-white/70 sm:items-end">
          <div className="text-[10px] uppercase tracking-wide text-white/60">Huidige tijd</div>
          <div className="text-lg font-semibold text-white">
            {now ? currentTimeFormatter.format(now) : '--:--:--'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SESSION_CONFIG.map((session) => {
          const status =
            utcMinutes == null ? 'closed' : resolveStatus(session, utcMinutes, openSessions.length)
          const meta = STATUS_METADATA[status]

          const isActive = status !== 'closed'
          const localOpenLabel =
            now == null ? '--:--' : getLocalSessionStartLabel(session, now, hourMinuteFormatter)
          const minutesUntilOpen =
            utcMinutes == null ? null : minutesUntilSessionOpens(session, utcMinutes)

          let statusText = 'Synchroniseren...'
          if (utcMinutes != null) {
            if (status === 'closed') {
              statusText =
                minutesUntilOpen === 0
                  ? 'Open'
                  : `Opent over ${formatDuration(minutesUntilOpen ?? 0)}`
            } else {
              statusText = 'Open'
            }
          }

          const tooltipRange = now ? getTooltipRange(session, now, tooltipFormatter) : null
          const tooltipText = tooltipRange
            ? `${session.name}: ${tooltipRange.startLabel} – ${tooltipRange.endLabel}`
            : undefined

          return (
            <div
              key={session.id}
              className={[
                'rounded-2xl border border-white/5 bg-[var(--card)]/85 p-5 transition-colors hover:border-[#3FCF8E]/30',
                isActive ? 'border-[#3FCF8E]/35 shadow-[0_10px_32px_rgba(63,207,142,0.18)]' : '',
              ].join(' ')}
              title={tooltipText}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'h-2.5 w-2.5 rounded-full transition-all duration-500',
                      meta.dotClass,
                      isActive ? 'shadow-[0_0_0_6px_rgba(63,207,142,0.2)]' : '',
                    ].join(' ')}
                  />
                  <span className="text-sm font-semibold text-white/80">{session.name}</span>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold">{localOpenLabel}</div>
                  <div className="text-xs text-[var(--text-dim)]">Lokale opening</div>
                </div>
                <div className="text-sm text-white/70">{statusText}</div>
              </div>

              <div className="mt-4 text-xs text-[var(--text-dim)]">UTC {formatUtcRange(session)}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function formatUtcRange(session: SessionDefinition) {
  const startHour = Math.floor(session.startMinutes / 60)
  const startMinute = session.startMinutes % 60
  const endHour = Math.floor(session.endMinutes / 60)
  const endMinute = session.endMinutes % 60

  return `${pad(startHour)}:${pad(startMinute)} – ${pad(endHour)}:${pad(endMinute)}`
}

function getLocalSessionStartLabel(
  session: SessionDefinition,
  reference: Date,
  formatter: Intl.DateTimeFormat
) {
  const startDate = getUtcDateFromMinutes(reference, session.startMinutes)
  return formatter.format(startDate)
}

function getTooltipRange(session: SessionDefinition, reference: Date, formatter: Intl.DateTimeFormat) {
  const wraps = session.startMinutes > session.endMinutes

  const startDate = getUtcDateFromMinutes(reference, session.startMinutes)
  const endDate = getUtcDateFromMinutes(
    reference,
    session.endMinutes + (wraps ? 24 * 60 : 0)
  )

  return {
    startLabel: formatter.format(startDate),
    endLabel: formatter.format(endDate),
  }
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function minutesUntilSessionOpens(session: SessionDefinition, utcMinutes: number) {
  if (isSessionOpen(session, utcMinutes)) return 0
  return moduloMinutes(session.startMinutes - utcMinutes)
}

function moduloMinutes(value: number) {
  const minutesInDay = 24 * 60
  const result = ((value % minutesInDay) + minutesInDay) % minutesInDay
  return result === 0 ? 0 : result
}

function formatDuration(totalMinutes: number) {
  if (totalMinutes <= 0) return 'nu'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours && minutes) return `${hours}u ${minutes}m`
  if (hours) return `${hours}u`
  return `${minutes}m`
}

