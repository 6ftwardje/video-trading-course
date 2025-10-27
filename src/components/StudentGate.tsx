'use client'

import { useEffect, useState } from 'react'
import { ensureStudentByEmail, getStoredStudentId, getStoredStudentEmail, setStoredStudent } from '@/lib/student'

export default function StudentGate() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const existing = getStoredStudentId()
    const existingEmail = getStoredStudentEmail()
    if (!existing || !existingEmail) setOpen(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Geef een geldig e-mailadres op.')
      return
    }
    setLoading(true)
    try {
      const student = await ensureStudentByEmail(email.trim().toLowerCase())
      setStoredStudent(student.id, student.email)
      setOpen(false)
    } catch (err: any) {
      setError('Kon student niet registreren. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-2">Aanmelden met e-mail</h2>
        <p className="text-sm text-gray-400 mb-4">
          Vul je e-mail in zodat we je voortgang kunnen opslaan. Geen wachtwoord nodig.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.be"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-crypto-blue text-white"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-crypto-orange hover:bg-orange-500 transition-colors text-white font-medium rounded-lg py-2 disabled:opacity-50"
          >
            {loading ? 'Opslaan…' : 'Ga verder'}
          </button>
        </form>
      </div>
    </div>
  )
}

