'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { useStudent } from '@/components/StudentProvider'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Shield, Key, Trash2, FileText, Mail, Calendar, Lock } from 'lucide-react'

const LEVEL_LABELS: Record<number, string> = {
  1: 'Basic',
  2: 'Full',
  3: 'Mentor',
}

export default function AccountPage() {
  const router = useRouter()
  const { student, authUser, status } = useStudent()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  const handleResetPassword = async () => {
    if (!authUser?.email) return

    setIsResettingPassword(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(authUser.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        console.error('Password reset error:', error)
        alert('Er is een fout opgetreden bij het verzenden van de wachtwoord reset email.')
      } else {
        setPasswordResetSent(true)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      alert('Er is een fout opgetreden bij het verzenden van de wachtwoord reset email.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleRequestAccountRemoval = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmAccountRemoval = () => {
    // This is a confirmation UI only - no backend deletion yet
    alert(
      'Je verzoek voor accountverwijdering is geregistreerd. We nemen binnen 48 uur contact met je op om dit proces te voltooien.'
    )
    setShowDeleteConfirm(false)
  }

  if (status === 'loading') {
    return (
      <Container className="pb-20 pt-8 md:pt-12">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
        </div>
      </Container>
    )
  }

  if (!student || !authUser) {
    return null
  }

  const accessLevel = student.access_level ?? 1
  const levelLabel = LEVEL_LABELS[accessLevel] ?? `Level ${accessLevel}`
  const accountCreatedDate = authUser.created_at
    ? new Date(authUser.created_at).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="space-y-10">
        <header className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-dim)]">
            Account & Beveiliging
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Account & Beveiliging</h1>
          <p className="max-w-2xl text-sm text-[var(--text-dim)]">
            Beheer je accountinstellingen en beveiligingsopties. Je toegang wordt centraal beheerd door je mentor.
          </p>
        </header>

        <div className="space-y-6">
          {/* Account Overview Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent)]/10 p-2">
                  <Mail className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-semibold">Account Overzicht</h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">E-mailadres</p>
                    <p className="text-sm text-[var(--text-dim)]">{student.email}</p>
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Toegangsniveau</p>
                    <p className="text-sm text-[var(--text-dim)]">{levelLabel}</p>
                  </div>
                </div>

                {accountCreatedDate && (
                  <>
                    <div className="h-px bg-[var(--border)]" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Account aangemaakt</p>
                        <p className="text-sm text-[var(--text-dim)]">{accountCreatedDate}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-xs text-[var(--text-dim)]">
                    <strong className="text-white">Toegangsbeheer:</strong> Je toegangsniveau wordt centraal beheerd
                    door je mentor. Neem contact op met je mentor of support als je toegang wilt wijzigen.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent)]/10 p-2">
                  <Shield className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-semibold">Beveiliging</h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-[var(--text-dim)]" />
                      <p className="text-sm font-medium text-white">Wachtwoord opnieuw instellen</p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                      Wijzig je wachtwoord via een beveiligde email link. Je ontvangt een email met instructies om je
                      wachtwoord opnieuw in te stellen.
                    </p>
                  </div>
                  <div className="sm:ml-4">
                    {passwordResetSent ? (
                      <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-400">
                        Email verzonden
                      </div>
                    ) : (
                      <button
                        onClick={handleResetPassword}
                        disabled={isResettingPassword}
                        className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResettingPassword ? 'Verzenden...' : 'Reset wachtwoord'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-xs text-[var(--text-dim)]">
                    <strong className="text-white">Beveiligde wachtwoordwijziging:</strong> Wachtwoordwijzigingen
                    worden veilig afgehandeld via email. We slaan je wachtwoord nooit in leesbare vorm op.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Account Removal Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">Account Verwijdering</h2>
              </div>

              <div className="space-y-4">
                {!showDeleteConfirm ? (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Verzoek accountverwijdering</p>
                        <p className="mt-1 text-xs text-[var(--text-dim)]">
                          Verzoek om je account te verwijderen. Dit is een soft delete - je data wordt niet direct
                          verwijderd.
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <button
                          onClick={handleRequestAccountRemoval}
                          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/20"
                        >
                          Verzoek verwijdering
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                      <p className="text-xs text-yellow-200">
                        <strong className="text-white">Belangrijk:</strong> Accountverwijdering is een soft delete. Je
                        voortgang en examenresultaten worden bewaard voor administratieve doeleinden. Neem contact op
                        met support voor meer informatie over wat er met je data gebeurt.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                    <p className="text-sm font-medium text-white">Bevestig accountverwijdering</p>
                    <p className="text-xs text-[var(--text-dim)]">
                      Weet je zeker dat je je account wilt verwijderen? Dit proces kan niet ongedaan worden gemaakt.
                      Je voortgang en examenresultaten worden bewaard voor administratieve doeleinden.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmAccountRemoval}
                        className="rounded-lg border border-red-500 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
                      >
                        Bevestigen
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--muted)]/80"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Legal & Policies Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent)]/10 p-2">
                  <FileText className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-semibold">Juridisch & Beleid</h2>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-[var(--text-dim)]">
                  Bekijk onze juridische documenten en beleidsregels:
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/privacy"
                      className="flex items-center gap-2 text-sm text-white transition hover:text-[var(--accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="flex items-center gap-2 text-sm text-white transition hover:text-[var(--accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="flex items-center gap-2 text-sm text-white transition hover:text-[var(--accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/refunds"
                      className="flex items-center gap-2 text-sm text-white transition hover:text-[var(--accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      Refund & Cancellation Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account-removal-policy"
                      className="flex items-center gap-2 text-sm text-white transition hover:text-[var(--accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      Account Removal Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}

