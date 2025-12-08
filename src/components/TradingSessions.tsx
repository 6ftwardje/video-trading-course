"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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

  if (withinSession) return { state: "open", until: closeTime }

  // next open
  const next =
    now < openTime ? openTime : new Date(openTime.getTime() + 24 * 60 * 60 * 1000)

  return { state: "closed", until: next }
}

function formatCountdown(target: Date) {
  const diff = target.getTime() - new Date().getTime()
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  return `${hours}u ${minutes}m`
}

export default function TradingSessions() {
  const [now, setNow] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const int = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Trading Sessions</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Live status per marktsessie
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-dim)]">HUIDIGE TIJD</p>
          <p className="text-lg font-semibold">
            {mounted && now
              ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--"}
          </p>
        </div>
      </div>

      {/* Sessions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {sessions.map((s) => {
          const status = now ? getStatus(s.open, s.close) : { state: "closed" as const, until: new Date() }
          const countdown = now ? formatCountdown(status.until) : "--"

          return (
            <motion.div
              key={s.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-5 flex flex-col justify-between shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      status.state === "open" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></span>
                  {s.name}
                </h3>
              </div>

              <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight">{s.open}</p>
                <p className="text-sm text-[var(--text-dim)]">Openingstijd (jouw tijd)</p>
              </div>

              <div className="pt-3 text-sm font-medium text-[var(--text-dim)]">
                {status.state === "open" ? (
                  <span className="text-green-500">Open</span>
                ) : (
                  <>Opent over {countdown}</>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

