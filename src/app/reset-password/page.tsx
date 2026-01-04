'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validate = (): boolean => {
    if (!password || !confirmPassword) {
      setError('Beide velden zijn verplicht')
      return false
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return false
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Supabase pikt automatisch de recovery session op uit de URL
      // via access_token en refresh_token parameters
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        // Check voor specifieke error types
        if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
          setError('Deze reset link is verlopen of ongeldig. Vraag een nieuwe aan.')
        } else if (updateError.message.includes('token')) {
          setError('Deze reset link is niet geldig. Vraag een nieuwe wachtwoord reset aan.')
        } else {
          setError(updateError.message || 'Er is een fout opgetreden bij het instellen van je wachtwoord')
        }
        setLoading(false)
        return
      }

      // Success!
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-[#1e2638] bg-[#121826] p-8 text-white shadow-lg">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Wachtwoord gewijzigd</h1>
            <p className="text-[#9aa4b2]">
              Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.
            </p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
            size="lg"
          >
            Naar inloggen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-[#1e2638] bg-[#121826] p-8 text-white shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Nieuw wachtwoord instellen</h1>
          <p className="text-[#9aa4b2]">
            Voer je nieuwe wachtwoord in om je account te herstellen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nieuw wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Voer je nieuwe wachtwoord in"
              required
              disabled={loading}
              className="bg-[#1a2234] border-[#1e2638] text-white placeholder:text-[#9aa4b2]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Bevestig je nieuwe wachtwoord"
              required
              disabled={loading}
              className="bg-[#1a2234] border-[#1e2638] text-white placeholder:text-[#9aa4b2]"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Bezig met opslaan...' : 'Wachtwoord opslaan'}
          </Button>
        </form>
      </div>
    </div>
  )
}

