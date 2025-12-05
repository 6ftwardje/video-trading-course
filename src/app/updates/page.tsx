'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import {
  fetchUpdatesWithAuthor,
  createUpdate,
  updateUpdate,
  deleteUpdate,
  markAllAsRead,
  UpdateWithAuthor,
} from '@/lib/updates'
import {
  getStoredStudentAccessLevel,
  getStoredStudentId,
  getStudentByAuthUserId,
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { WaveLoader } from '@/components/ui/wave-loader'
import { AccentButton } from '@/components/ui/Buttons'
import { Edit2, Trash2, X, Save, Plus } from 'lucide-react'

export default function UpdatesPage() {
  const router = useRouter()
  const [updates, setUpdates] = useState<UpdateWithAuthor[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessLevel, setAccessLevel] = useState<number | null>(null)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false)

  // Create state
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Error state
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      // Haal access level uit localStorage of via bestaande student helpers
      let storedAccessLevel = getStoredStudentAccessLevel()
      let studentId = getStoredStudentId()

      if (!studentId || storedAccessLevel == null) {
        const student = await getStudentByAuthUserId(session.user.id)
        if (student?.id) {
          setStoredStudent(student.id, student.email)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          studentId = student.id
          storedAccessLevel = student.access_level ?? 1
        }
      }

      if (storedAccessLevel == null) storedAccessLevel = 1
      setAccessLevel(storedAccessLevel)
      setCurrentStudentId(studentId)

      try {
        const data = await fetchUpdatesWithAuthor()
        setUpdates(data)

        // Mark all updates as read for access level 2 and 3
        // Only run once on initial load, not during edit/create actions
        if (studentId && (storedAccessLevel === 2 || storedAccessLevel === 3) && data.length > 0) {
          const updateIds = data.map((u) => u.id)
          try {
            await markAllAsRead(studentId, updateIds)
            setHasMarkedAsRead(true)
            // Trigger navbar refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('updates-read'))
          } catch (readError) {
            console.error('Error marking updates as read:', readError)
            // Don't show error to user, this is a background operation
          }
        }
      } catch (err) {
        console.error('Error fetching updates:', err)
        setError('Fout bij het laden van updates')
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [router])

  const handleCreate = async () => {
    if (!newContent.trim()) {
      setError('Content is verplicht')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const created = await createUpdate({
        title: newTitle.trim() || null,
        content: newContent.trim(),
      })
      setUpdates((prev) => (prev ? [created, ...prev] : [created]))
      setNewTitle('')
      setNewContent('')
      setIsCreating(false)
    } catch (err) {
      console.error('Error creating update:', err)
      setError('Fout bij het aanmaken van de update')
    } finally {
      setCreating(false)
    }
  }

  const handleStartEdit = (update: UpdateWithAuthor) => {
    setEditingId(update.id)
    setEditTitle(update.title ?? '')
    setEditContent(update.content)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setError(null)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) {
      setError('Content is verplicht')
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const updated = await updateUpdate(id, {
        title: editTitle.trim() || null,
        content: editContent.trim(),
      })
      setUpdates((prev) =>
        prev ? prev.map((u) => (u.id === id ? updated : u)) : null
      )
      setEditingId(null)
      setEditTitle('')
      setEditContent('')
    } catch (err) {
      console.error('Error updating update:', err)
      setError('Fout bij het bijwerken van de update')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze update wilt verwijderen?')) {
      return
    }

    setDeleting(id)
    setError(null)

    try {
      await deleteUpdate(id)
      setUpdates((prev) => (prev ? prev.filter((u) => u.id !== id) : null))
    } catch (err) {
      console.error('Error deleting update:', err)
      setError('Fout bij het verwijderen van de update')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Container className="pb-20 pt-8 md:pt-12">
        <div className="flex items-center justify-center py-12">
          <WaveLoader message="Updates laden..." />
        </div>
      </Container>
    )
  }

  const isMentor = accessLevel === 3
  const isBasic = accessLevel === 1
  const canSeeFullContent = accessLevel === 2 || accessLevel === 3

  return (
    <Container className="pb-20 pt-8 md:pt-12">
      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-dim)]">
                Updates
              </span>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl mt-1">
                Updates
              </h1>
              <p className="max-w-2xl text-sm text-[var(--text-dim)] mt-2">
                Blijf op de hoogte van nieuwe inzichten en aankondigingen van de mentors.
              </p>
            </div>
            {isMentor && (
              <button
                onClick={() => {
                  setIsCreating(!isCreating)
                  setError(null)
                  if (isCreating) {
                    setNewTitle('')
                    setNewContent('')
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                {isCreating ? (
                  <>
                    <X className="h-4 w-4" />
                    Annuleren
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Nieuwe update
                  </>
                )}
              </button>
            )}
          </div>
          {isBasic && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-500">
              Je hebt momenteel geen volledige toegang tot de inhoud van deze updates. Upgrade je
              toegang om alles te zien.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
        </header>

        {/* Create form */}
        {isMentor && isCreating && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Nieuwe update aanmaken</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Titel (optioneel)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Bijv. Nieuwe trading strategie"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Inhoud <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Schrijf hier je update..."
                  rows={6}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newContent.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Aanmaken...' : 'Aanmaken'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewTitle('')
                    setNewContent('')
                    setError(null)
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--muted)]"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Updates list */}
        {!updates || updates.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 text-sm text-[var(--text-dim)]">
            {isMentor
              ? 'Er zijn nog geen updates geplaatst. Maak je eerste update aan!'
              : 'Er zijn nog geen updates geplaatst.'}
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => {
              const isAuthor = isMentor && update.author_id === currentStudentId
              const isEditing = editingId === update.id
              const isDeleting = deleting === update.id

              return (
                <article
                  key={update.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Titel (optioneel)"
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-semibold text-white placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      ) : (
                        <h2 className="text-lg font-semibold text-white">
                          {update.title ?? 'Update'}
                        </h2>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                        <span>Door {update.author_name}</span>
                        <span>•</span>
                        <span>
                          {new Date(update.created_at).toLocaleString('nl-BE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        {update.updated_at && update.updated_at !== update.created_at && (
                          <>
                            <span>•</span>
                            <span className="italic">bewerkt</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isAuthor && !isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(update)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--muted)]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
                        </button>
                      </div>
                    )}
                    {isAuthor && isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(update.id)}
                          disabled={updating || !editContent.trim()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {updating ? 'Opslaan...' : 'Opslaan'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--muted)] disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Annuleren
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-sm leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Inhoud"
                        rows={8}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none resize-y"
                      />
                    ) : canSeeFullContent ? (
                      <p className="text-[var(--text-dim)] whitespace-pre-wrap">
                        {update.content}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative h-24 w-full rounded-md overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--muted)] to-[var(--muted)]/50 blur-sm" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-[var(--text-dim)]">Inhoud verborgen</span>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                          Deze update is enkel volledig zichtbaar voor leden met volledige toegang.
                          Upgrade je account om de volledige inhoud te lezen.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </Container>
  )
}
