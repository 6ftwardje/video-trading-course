'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
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

    if (!name || !name.trim()) {
      setErrorMessage('Vul je naam in.')
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
            name: name.trim(),
            phone: phone.trim() || null,
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

    // Registration successful - log metadata
    if (authUser) {
      console.log('Registration successful:', {
        name: name.trim(),
        phone: phone.trim() || null,
        authUserId: authUser.id,
      })
    }

    // Show confirmation message and hide form
    setRegistrationSuccess(true)
    setLoading(false)

    if (!authUser) {
      setInfoMessage('We konden je account nog niet activeren. Controleer je e-mail voor de bevestigingslink.')
      return
    }

    if (!session) {
      setInfoMessage(
        'Je account is aangemaakt! Bevestig je e-mailadres via de link in je mailbox. Na bevestiging word je automatisch ingelogd.',
      )
      return
    }

    // If session exists, redirect to dashboard
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
    setName('')
    setPhone('')
    setRegistrationSuccess(false)
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
      <div className="min-h-screen bg-[#0B0F17] text-white">
        {/* Navigation */}
        <nav className="w-full border-b border-slate-800/50 bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <Image 
                  src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The%20Trade%20Platform%20white.png"
                  alt="Het Trade Platform"
                  width={160}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Terug naar homepagina
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-800/50 bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Image 
                src="https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/public/HTP/The%20Trade%20Platform%20white.png"
                alt="Het Trade Platform"
                width={160}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Terug naar homepagina
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        {registrationSuccess && mode === 'register' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md text-center"
          >
            <div className="space-y-6 rounded-xl bg-gray-900 p-8 shadow-lg">
              {/* Check icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#7C99E3]/20 border border-[#7C99E3]/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#7C99E3]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-semibold text-[#7C99E3] mb-3">
                Registratie succesvol!
              </h1>

              {/* Message */}
              {infoMessage ? (
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  {infoMessage}
                </p>
              ) : (
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  Je account is aangemaakt! Bevestig je e-mailadres via de link in je mailbox. Na bevestiging word je automatisch ingelogd.
                </p>
              )}

              {/* CTA */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-2 bg-[#7C99E3] text-black font-semibold rounded-md hover:opacity-90 transition"
                >
                  Terug naar homepagina
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
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
              placeholder="Naam"
              className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
              value={name}
              autoComplete="name"
              onChange={e => setName(e.target.value)}
              required
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
            <>
              <input
                type="password"
                placeholder="Bevestig wachtwoord"
                className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <div className="space-y-1">
                <input
                  type="tel"
                  placeholder="+31 6 12345678"
                  className="w-full rounded bg-gray-800 p-2 outline-none transition focus:border-[#7C99E3] focus:ring-2 focus:ring-[#7C99E3]/40"
                  value={phone}
                  autoComplete="tel"
                  onChange={e => setPhone(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Optioneel – alleen gebruikt voor persoonlijke onboarding, geen spam.
                </p>
              </div>
            </>
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
        )}
      </div>
    </div>
  )
}

