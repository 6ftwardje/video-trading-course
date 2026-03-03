'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useStudent } from '@/components/StudentProvider'

export default function PaymentConfirmedPage() {
  const router = useRouter()
  const { status } = useStudent()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status !== 'ready' && status !== 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex justify-center mb-8">
          <Image
            src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The Trade Platform white.png"
            alt="The Trade Platform Logo"
            width={300}
            height={60}
            className="h-auto w-auto max-w-full"
            priority
            unoptimized
          />
        </div>

        <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-8 shadow-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 p-4">
              <svg
                className="w-12 h-12 text-[var(--accent)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Bedankt voor je aankoop
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Je betaling is ontvangen. We zetten binnen 24 uur je account op full access.
            </p>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Bij vragen kun je je{' '}
              <Link href="/mentorship" className="text-[var(--accent)] hover:underline">
                mentor contacteren
              </Link>
              .
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <div className="relative">
              <Link
                href="/dashboard"
                className="block w-full py-5 px-6 rounded-xl text-primary-foreground font-bold text-xl relative z-10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(70, 112, 219, 1) 0%, rgba(107, 138, 240, 1) 50%, rgba(70, 112, 219, 1) 100%)',
                  backgroundSize: '200% auto',
                  animation: 'pulse-glow 2s ease-in-out infinite, shine 3s linear infinite',
                }}
              >
                <span className="relative z-20">Naar dashboard</span>
              </Link>
              <div
                className="absolute inset-0 bg-primary/20 blur-xl rounded-xl -z-0"
                style={{
                  animation: 'pulse-glow-bg 2s ease-in-out infinite',
                }}
              />
            </div>

            <div className="text-center">
              <Link
                href="/mentorship"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ga naar mentorship
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
