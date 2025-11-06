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

const STATUS_METADATA: Record<SessionStatus, { indicator: string; label: string }> = {
  open: { indicator: 'bg-[#7C99E3] shadow-[0_0_0_6px_rgba(124,153,227,0.2)]', label: 'Open' },
  overlap: { indicator: 'bg-[#E9CF80] shadow-[0_0_0_6px_rgba(233,207,128,0.18)]', label: 'Overlap' },
  closed: { indicator: 'bg-white/25', label: 'Gesloten' },
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
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className="flex items-center gap-2 rounded-full border border-[#7C99E3]/50 bg-[#7C99E3]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#7C99E3]"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C99E3] animate-pulse" />
            Live
          </span>
          <div className="text-sm text-white/70">
            <div className="text-[10px] uppercase tracking-wide text-white/60">Huidige tijd</div>
            <div className="text-lg font-semibold text-white">
              {now ? currentTimeFormatter.format(now) : '--:--:--'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SESSION_CONFIG.map((session) => {
          const status =
            utcMinutes == null ? 'closed' : resolveStatus(session, utcMinutes, openSessions.length)
          const meta = STATUS_METADATA[status]

          const { startLabel, endLabel } = now
            ? getTooltipRange(session, now, tooltipFormatter)
            : { startLabel: '--:--', endLabel: '--:--' }

          const isActive = status !== 'closed'
          const localOpenLabel =
            now == null ? '--:--' : getLocalSessionStartLabel(session, now, hourMinuteFormatter)
          const minutesUntilOpen =
            utcMinutes == null ? null : minutesUntilSessionOpens(session, utcMinutes)
          const minutesUntilClose =
            utcMinutes == null ? null : minutesUntilSessionCloses(session, utcMinutes)
          const timingLabel =
            utcMinutes == null
              ? 'Synchroniseren...'
              : status === 'closed'
              ? minutesUntilOpen === 0
                ? 'Opent nu'
                : `Opent over ${formatDuration(minutesUntilOpen ?? 0)}`
              : minutesUntilClose === 0
              ? 'Sluit nu'
              : `Sluit over ${formatDuration(minutesUntilClose ?? 0)}`

          return (
            <div
              key={session.id}
              className={[
                'group relative rounded-xl border bg-[var(--card)]/95 p-4 transition-all',
                isActive
                  ? 'border-[#7C99E3]/40 ring-1 ring-[#7C99E3]/30 shadow-[0_0_18px_rgba(124,153,227,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,153,227,0.25)]'
                  : 'border-[var(--border)] hover:border-white/15',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      'mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-500',
                      meta.indicator,
                      isActive ? 'animate-pulse' : '',
                    ].join(' ')}
                  />
                  <div>
                    <div className="text-base font-semibold">{session.name}</div>
                    <div
                      className={[
                        'text-xs font-medium',
                        status === 'closed' ? 'text-[var(--text-dim)]' : 'text-[#7C99E3]',
                      ].join(' ')}
                    >
                      {meta.label}
                    </div>
                    <div className="mt-1 text-xs text-white/70">{timingLabel}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold">{localOpenLabel}</div>
                  <div className="text-xs text-[var(--text-dim)]">Lokale opening</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-dim)]">
                <span>UTC {formatUtcRange(session)}</span>
                {status !== 'closed' && (
                  <span className="text-[10px] uppercase tracking-wide text-[#7C99E3]">
                    Liquiditeit verhoogd
                  </span>
                )}
              </div>

              <div className="pointer-events-none absolute left-4 top-full z-10 hidden w-max -translate-y-1 rounded-lg border border-white/5 bg-black/85 px-3 py-2 text-xs text-white shadow-lg transition-all group-hover:block">
                {session.name}: {startLabel} – {endLabel}
              </div>
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

function minutesUntilSessionCloses(session: SessionDefinition, utcMinutes: number) {
  if (!isSessionOpen(session, utcMinutes)) return 0
  const wraps = session.startMinutes > session.endMinutes
  const adjustedEnd =
    wraps && utcMinutes >= session.startMinutes ? session.endMinutes + 24 * 60 : session.endMinutes
  return moduloMinutes(adjustedEnd - utcMinutes)
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

