'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import { useStudent } from '@/components/StudentProvider'

const DISCORD_INVITE_URL = 'https://discord.gg/RYNxDHvp'

export default function CommunityPage() {
  const router = useRouter()
  const { student, status } = useStudent()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status !== 'ready') {
    return (
      <Container className="pb-20 pt-8 md:pt-12">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-dim)]">
            Community
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Community</h1>
          <p className="text-sm text-[var(--text-dim)]">
            Sluit je aan bij de community van traders. Deel live marktupdates, bespreek setups, stel
            vragen in Q&A en houd elkaar scherp met accountability. Iedereen is welkom.
          </p>
        </header>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Join de Discord
        </a>
      </div>
    </Container>
  )
}
