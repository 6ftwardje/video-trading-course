'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { BRAND } from '@/components/ui/Brand'
import {
  clearStoredStudent,
} from '@/lib/student'
import { sendPasswordResetEmail } from '@/lib/auth/resetPassword'

type Mode = 'login' | 'register'

const MIN_PASSWORD_LENGTH = 6

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const initialMode = useMemo<Mode>(() => {
    const modeParam = searchParams.get('mode')
    const inviteType = searchParams.get('type')
    if (modeParam === 'register' || inviteType === 'signup') return 'register'
    return 'login'
  }, [searchParams])

  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      // Use getSession() instead of getUser() to avoid unnecessary server requests
      // getSession() reads from local storage/cookies without validating with server
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        router.replace('/dashboard')
      } else {
        clearStoredStudent()
      }
    }

    checkSession()
  }, [router, supabase])

  // Cooldown timer for rate limit
  useEffect(() => {
    if (rateLimitCooldown === null) return

    const interval = setInterval(() => {
      setRateLimitCooldown(prev => {
        if (prev === null) return null
        const newValue = prev - 1
        return newValue <= 0 ? null : newValue
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [rateLimitCooldown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    // Prevent double submission
    if (loading) {
      return
    }

    // Prevent submission during cooldown
    if (rateLimitCooldown !== null && rateLimitCooldown > 0) {
      const minutes = Math.floor(rateLimitCooldown / 60)
      const seconds = rateLimitCooldown % 60
      setErrorMessage(
        `Wacht even... Je kunt over ${minutes}:${seconds.toString().padStart(2, '0')} opnieuw proberen.`
      )
      return
    }

    if (!email || !password) {
      setErrorMessage('Vul je e-mailadres en wachtwoord in.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Handle rate limit specifically (429 status or related error messages)
        const errorMsg = error.message?.toLowerCase() || ''
        const isRateLimit =
          error.status === 429 ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('too many requests') ||
          errorMsg.includes('too many') ||
          errorMsg.includes('rate limit exceeded')

        if (isRateLimit) {
          // Set 5 minute cooldown (300 seconds)
          setRateLimitCooldown(300)
          setErrorMessage(
            'Te veel pogingen. Wacht even voordat je opnieuw probeert in te loggen. Probeer het over een paar minuten opnieuw.'
          )
        } else {
          setErrorMessage(error.message)
        }
        setLoading(false)
        return
      }
    } catch (err: any) {
      // Handle network errors or other unexpected errors
      const errorMsg = err?.message?.toLowerCase() || ''
      const isRateLimit =
        err?.status === 429 ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests') ||
        errorMsg.includes('too many') ||
        errorMsg.includes('rate limit exceeded')

      if (isRateLimit) {
        // Set 5 minute cooldown (300 seconds)
        setRateLimitCooldown(300)
        setErrorMessage(
          'Te veel pogingen. Wacht even voordat je opnieuw probeert in te loggen. Probeer het over een paar minuten opnieuw.'
        )
      } else {
        setErrorMessage('Er ging iets mis bij het inloggen. Probeer het later opnieuw.')
      }
      setLoading(false)
      return
    }

    // Authentication successful - redirect to dashboard
    // Student record will be loaded by StudentProvider
    router.push('/dashboard')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    // Prevent double submission
    if (loading) {
      return
    }

    // Prevent submission during cooldown
    if (rateLimitCooldown !== null && rateLimitCooldown > 0) {
      const minutes = Math.floor(rateLimitCooldown / 60)
      const seconds = rateLimitCooldown % 60
      setErrorMessage(
        `Wacht even... Je kunt over ${minutes}:${seconds.toString().padStart(2, '0')} opnieuw proberen.`
      )
      return
    }

    if (!email || !password || !confirmPassword) {
      setErrorMessage('Vul je e-mailadres en wachtwoord in.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Wachtwoorden komen niet overeen.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Je wachtwoord moet minimaal ${MIN_PASSWORD_LENGTH} karakters lang zijn.`)
      return
    }

    setLoading(true)

    let signUpData: any = null

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      signUpData = result.data
      const signUpError = result.error

      if (signUpError) {
        // Handle rate limit specifically
        const errorMsg = signUpError.message?.toLowerCase() || ''
        const isRateLimit =
          signUpError.status === 429 ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('too many requests') ||
          errorMsg.includes('too many') ||
          errorMsg.includes('rate limit exceeded')

        if (isRateLimit) {
          setRateLimitCooldown(300)
          setErrorMessage(
            'Te veel pogingen. Wacht even voordat je opnieuw probeert te registreren. Probeer het over een paar minuten opnieuw.'
          )
        } else {
          setErrorMessage(signUpError.message)
        }
        setLoading(false)
        return
      }
    } catch (err: any) {
      // Handle network errors or other unexpected errors
      const errorMsg = err?.message?.toLowerCase() || ''
      const isRateLimit =
        err?.status === 429 ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests') ||
        errorMsg.includes('too many') ||
        errorMsg.includes('rate limit exceeded')

      if (isRateLimit) {
        setRateLimitCooldown(300)
        setErrorMessage(
          'Te veel pogingen. Wacht even voordat je opnieuw probeert te registreren. Probeer het over een paar minuten opnieuw.'
        )
      } else {
        setErrorMessage('Er ging iets mis bij het registreren. Probeer het later opnieuw.')
      }
      setLoading(false)
      return
    }

    if (!signUpData) {
      setErrorMessage('Er ging iets mis bij het registreren. Probeer het later opnieuw.')
      setLoading(false)
      return
    }

    const authUser = signUpData.user
    const session = signUpData.session

    if (!authUser) {
      setInfoMessage('We konden je account nog niet activeren. Controleer je e-mail voor de bevestigingslink.')
      setLoading(false)
      return
    }

    if (!session) {
      setInfoMessage(
        'Je account is aangemaakt! Bevestig je e-mailadres via de link in je mailbox. Na bevestiging word je automatisch ingelogd.',
      )
      setLoading(false)
      return
    }

    // Registration successful - redirect to dashboard
    // Student record will be created by DB trigger and loaded by StudentProvider
    router.push('/dashboard')
  }

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister

  const toggleMode = (nextMode: Mode) => {
    if (mode === nextMode) return
    setMode(nextMode)
    setErrorMessage(null)
    setInfoMessage(null)
    setPassword('')
    setConfirmPassword('')
    setShowResetForm(false)
    setResetEmail('')
    setResetSuccess(false)
  }

  const handleShowResetForm = () => {
    setShowResetForm(true)
    setResetEmail(email) // Pre-fill with current email if available
    setErrorMessage(null)
    setInfoMessage(null)
    setResetSuccess(false)
  }

  const handleCancelReset = () => {
    setShowResetForm(false)
    setResetEmail('')
    setResetSuccess(false)
    setErrorMessage(null)
    setInfoMessage(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    if (!resetEmail || !resetEmail.trim()) {
      setErrorMessage('Vul je e-mailadres in.')
      return
    }

    setResetLoading(true)

    try {
      await sendPasswordResetEmail(resetEmail)
      setResetSuccess(true)
      setErrorMessage(null)
      setInfoMessage(null)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setErrorMessage('Er is een fout opgetreden bij het verzenden van de reset link. Probeer het later opnieuw.')
      setResetSuccess(false)
    } finally {
      setResetLoading(false)
    }
  }

  // Show reset form if active
  if (showResetForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
        <div className="w-full max-w-sm space-y-6 rounded-xl bg-gray-900 p-8 shadow-lg">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <Image 
                src={BRAND.logoWithTextUrl} 
                alt="Het Trade Platform Logo" 
                width={232} 
                height={40} 
                className="h-10 w-auto"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-center text-2xl font-semibold text-[#7C99E3]">
                Wachtwoord vergeten?
              </h1>
              <p className="text-center text-sm text-gray-400">
                Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
              </p>
            </div>
          </div>

          {resetSuccess ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#7C99E3]/10 border border-[#7C99E3]/30 p-4">
                <p className="text-sm text-[#7C99E3]" role="alert">
                  Als dit e-mailadres bestaat, ontvang je een reset link.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelReset}
                className="w-full rounded bg-[#7C99E3] py-2 font-semibold text-black transition hover:opacity-90"
              >
                Terug naar login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                placeholder="E-mailadres"
                className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
                value={resetEmail}
                autoComplete="email"
                onChange={e => setResetEmail(e.target.value)}
                disabled={resetLoading}
                required
              />

              {errorMessage && (
                <p className="text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 rounded bg-[#7C99E3] py-2 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetLoading ? 'Verzenden...' : 'Reset link versturen'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelReset}
                  disabled={resetLoading}
                  className="rounded border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Annuleren
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-xl bg-gray-900 p-8 shadow-lg">
        <div className="space-y-3">
          <div className="flex justify-center mb-4">
            <Image 
              src={BRAND.logoWithTextUrl} 
              alt="Het Trade Platform Logo" 
              width={232} 
              height={40} 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex gap-2 rounded-lg bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => toggleMode('login')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'login' ? 'bg-[#7C99E3] text-black' : 'text-gray-300 hover:text-white'
              }`}
            >
              Inloggen
            </button>
            <button
              type="button"
              onClick={() => toggleMode('register')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'register' ? 'bg-[#7C99E3] text-black' : 'text-gray-300 hover:text-white'
              }`}
            >
              Registreren
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-center text-2xl font-semibold text-[#7C99E3]">
              {mode === 'login' ? 'Login' : 'Maak je account aan'}
            </h1>
            <p className="text-center text-sm text-gray-400">
              {mode === 'login'
                ? 'Gebruik je inloggegevens voor het Cryptoriez Trade Platform.'
                : 'Registreer jezelf en krijg direct toegang tot de basiscontent.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Naam (optioneel)"
              className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
              value={fullName}
              autoComplete="name"
              onChange={e => setFullName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="E-mailadres"
            className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
            value={email}
            autoComplete={mode === 'login' ? 'email' : 'new-email'}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Wachtwoord"
              className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
              value={password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onChange={e => setPassword(e.target.value)}
            />
            {mode === 'login' && (
              <button
                type="button"
                onClick={handleShowResetForm}
                className="text-xs text-gray-400 hover:text-[#7C99E3] transition underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#7C99E3]/40 focus:rounded"
              >
                Wachtwoord vergeten?
              </button>
            )}
          </div>
          {mode === 'register' && (
            <input
              type="password"
              placeholder="Bevestig wachtwoord"
              className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={e => setConfirmPassword(e.target.value)}
            />
          )}
        </div>

        {errorMessage && (
          <div className="space-y-2">
            <p className="text-sm text-red-400" role="alert">
              {errorMessage}
            </p>
            {rateLimitCooldown !== null && rateLimitCooldown > 0 && (
              <p className="text-xs text-gray-400">
                Cooldown: {Math.floor(rateLimitCooldown / 60)}:{String(rateLimitCooldown % 60).padStart(2, '0')}
              </p>
            )}
          </div>
        )}

        {infoMessage && (
          <div className="space-y-2 rounded-lg bg-[#7C99E3]/10 border border-[#7C99E3]/30 p-3">
            <p className="text-sm text-[#7C99E3]" role="alert">
              {infoMessage}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
          className="w-full rounded bg-[#7C99E3] py-2 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? mode === 'login'
              ? 'Bezig met inloggen…'
              : 'Account wordt aangemaakt…'
            : mode === 'login'
            ? 'Inloggen'
            : 'Registreren'}
        </button>

        {mode === 'login' ? (
          <p className="text-center text-xs text-gray-500">
            Nog geen account?{' '}
            <button
              type="button"
              onClick={() => toggleMode('register')}
              className="text-[#7C99E3] underline-offset-4 hover:underline"
            >
              Registreer je direct
            </button>
          </p>
        ) : (
          <p className="text-center text-xs text-gray-500">
            Al een account?{' '}
            <button
              type="button"
              onClick={() => toggleMode('login')}
              className="text-[#7C99E3] underline-offset-4 hover:underline"
            >
              Log hier in
            </button>
          </p>
        )}
      </form>
    </div>
  )
}

