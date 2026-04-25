"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Clock3, PhoneCall } from "lucide-react"

type Session = {
  name: string
  open: string // "HH:MM"
  close: string // "HH:MM"
}

const sessions: Session[] = [
  { name: "Sydney", open: "22:00", close: "07:00" },
  { name: "Tokyo", open: "01:00", close: "10:00" },
  { name: "London", open: "09:00", close: "18:00" },
  { name: "New York", open: "15:30", close: "22:00" },
]

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const now = new Date()
  const dt = new Date(now)
  dt.setHours(h, m, 0, 0)
  return dt
}

function getStatus(open: string, close: string) {
  const now = new Date()
  const openTime = parseTime(open)
  const closeTime = parseTime(close)

  const isOverMidnight = closeTime < openTime
  const withinSession =
    (!isOverMidnight && now >= openTime && now <= closeTime) ||
    (isOverMidnight && (now >= openTime || now <= closeTime))

  if (withinSession) {
    const closeTarget = new Date(closeTime)
    if (isOverMidnight && now >= openTime) {
      closeTarget.setDate(closeTarget.getDate() + 1)
    }
    return { state: "open" as const, until: closeTarget }
  }

  // next open
  const next =
    now < openTime ? openTime : new Date(openTime.getTime() + 24 * 60 * 60 * 1000)

  return { state: "closed" as const, until: next }
}

function formatCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - new Date().getTime())
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  return `${hours}u ${minutes}m`
}

type TradingSessionsProps = {
  accessLevel?: number
}

export default function TradingSessions({ accessLevel = 2 }: TradingSessionsProps) {
  const [now, setNow] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const int = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(int)
  }, [])

  const sessionRows = sessions.map((session) => {
    const status = now ? getStatus(session.open, session.close) : { state: "closed" as const, until: new Date() }
    return {
      ...session,
      status,
      countdown: now ? formatCountdown(status.until) : "--",
    }
  })
  const openSessions = sessionRows.filter((session) => session.status.state === "open")
  const nextSession = [...sessionRows]
    .filter((session) => session.status.state === "closed")
    .sort((a, b) => a.status.until.getTime() - b.status.until.getTime())[0]
  const isBasic = accessLevel < 2

  const handleCallClick = () => {
    window.open('https://calendly.com/hettradeplatform/30min', '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101722]/75">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Tool</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Trading sessions</h2>
            <p className="mt-1 text-sm leading-5 text-white/55">
              Bekijk welke marktsessies nu open zijn.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/60">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {mounted && now
                ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "--:--"}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[#7C99E3]/25 bg-[#7C99E3]/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9c8ff]">
            Nu open
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {openSessions.length ? openSessions.map((session) => session.name).join(" + ") : "Geen grote sessie open"}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {openSessions.length
              ? `Sluit over ${openSessions[0]?.countdown ?? "--"}`
              : nextSession
                ? `${nextSession.name} opent over ${nextSession.countdown}`
                : "Tijden worden geladen"}
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {sessionRows.map((session, index) => (
          <motion.div
            key={session.name}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  session.status.state === "open" ? "bg-emerald-400" : "bg-white/25"
                }`}
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-white">{session.name}</p>
                <p className="text-xs text-white/45">
                  {session.open} - {session.close}
                </p>
              </div>
            </div>
            <p className={`text-right text-xs font-medium ${
              session.status.state === "open" ? "text-emerald-300" : "text-white/50"
            }`}>
              {session.status.state === "open" ? "Open" : `Over ${session.countdown}`}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-black/15 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F79939]" aria-hidden />
          <div className="space-y-3">
            <p className="text-xs leading-5 text-white/58">
              Gebruik deze tijden om te leren observeren. Trade niet met echt kapitaal zonder
              plan, risicomanagement of begeleiding{isBasic ? " vanuit mentorship" : ""}.
            </p>
            <button
              type="button"
              onClick={handleCallClick}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#b9c8ff] transition hover:text-white"
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden />
              Plan gratis call
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
