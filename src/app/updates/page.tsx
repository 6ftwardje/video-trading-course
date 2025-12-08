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
  uploadUpdateImage,
  deleteUpdateImage,
  getSignedImageUrl,
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
import { Edit2, Trash2, X, Save, Plus, Upload, Image as ImageIcon } from 'lucide-react'
import ImageModal from '@/components/ImageModal'
import MarkdownRenderer from '@/components/MarkdownRenderer'

// Helper component to display update images
function UpdateImageDisplay({
  imagePath,
  onImageClick,
  loadImageUrl,
}: {
  imagePath: string
  onImageClick: (url: string) => void
  loadImageUrl: (path: string) => Promise<string>
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    loadImageUrl(imagePath)
      .then((url) => {
        if (mounted) {
          setImageUrl(url)
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [imagePath, loadImageUrl])

  if (loading || !imageUrl) {
    return (
      <div className="h-40 w-full bg-muted rounded-lg flex items-center justify-center mt-3">
        <span className="text-xs text-[var(--text-dim)]">Afbeelding laden...</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt="Update image"
      className="w-full max-w-full rounded-lg shadow-md cursor-pointer mt-3"
      onClick={() => onImageClick(imageUrl)}
    />
  )
}

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
  const [newImagePath, setNewImagePath] = useState<string | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editImagePath, setEditImagePath] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [originalEditImagePath, setOriginalEditImagePath] = useState<string | null>(null)

  // Modal state
  const [modalImage, setModalImage] = useState<string | null>(null)

  // Image URLs cache
  const [imageUrlCache, setImageUrlCache] = useState<Record<string, string>>({})

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
          } catch (readError: any) {
            // Log error details for debugging
            if (readError) {
              console.error('Error marking updates as read:', {
                message: readError?.message || String(readError),
                details: readError?.details,
                hint: readError?.hint,
                code: readError?.code,
                error: readError,
              })
            } else {
              console.error('Error marking updates as read: Unknown error occurred')
            }
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
        image_path: newImagePath,
      })
      setUpdates((prev) => (prev ? [created, ...prev] : [created]))
      setNewTitle('')
      setNewContent('')
      setNewImagePath(null)
      setNewImagePreview(null)
      setIsCreating(false)
    } catch (err) {
      console.error('Error creating update:', err)
      setError('Fout bij het aanmaken van de update')
    } finally {
      setCreating(false)
    }
  }

  const handleStartEdit = async (update: UpdateWithAuthor) => {
    setEditingId(update.id)
    setEditTitle(update.title ?? '')
    setEditContent(update.content)
    setOriginalEditImagePath(update.image_path)
    setEditImagePath(update.image_path)
    setEditImagePreview(null)
    setError(null)

    // Load preview if image exists
    if (update.image_path) {
      try {
        const url = await getSignedImageUrl(update.image_path)
        setEditImagePreview(url)
      } catch (err) {
        console.error('Error loading image preview:', err)
      }
    }
  }

  const handleCancelEdit = async () => {
    // If user uploaded a new image but canceled, delete it
    if (editImagePath && editImagePath !== originalEditImagePath) {
      try {
        await deleteUpdateImage(editImagePath)
      } catch (err) {
        console.error('Error cleaning up canceled image:', err)
      }
    }

    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditImagePath(null)
    setEditImagePreview(null)
    setOriginalEditImagePath(null)
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
      // If old image was deleted and new one uploaded, delete old one
      if (originalEditImagePath && originalEditImagePath !== editImagePath) {
        try {
          await deleteUpdateImage(originalEditImagePath)
        } catch (err) {
          console.error('Error deleting old image:', err)
          // Continue anyway
        }
      }

      const updated = await updateUpdate(id, {
        title: editTitle.trim() || null,
        content: editContent.trim(),
        image_path: editImagePath,
      })
      setUpdates((prev) =>
        prev ? prev.map((u) => (u.id === id ? updated : u)) : null
      )
      setEditingId(null)
      setEditTitle('')
      setEditContent('')
      setEditImagePath(null)
      setEditImagePreview(null)
      setOriginalEditImagePath(null)
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

  const handleImageUpload = async (file: File, isEdit: boolean = false) => {
    // Validate file size (1MB max)
    const maxSize = 1024 * 1024
    if (file.size > maxSize) {
      setError('Bestand is te groot. Maximum grootte is 1MB.')
      return
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Alleen PNG, JPG, JPEG en WebP zijn toegestaan')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      // If editing and there's an existing image, delete it first
      if (isEdit && editImagePath && editImagePath !== originalEditImagePath) {
        try {
          await deleteUpdateImage(editImagePath)
        } catch (err) {
          console.error('Error deleting old image:', err)
        }
      }

      const path = await uploadUpdateImage(file)
      const signedUrl = await getSignedImageUrl(path)

      if (isEdit) {
        setEditImagePath(path)
        setEditImagePreview(signedUrl)
      } else {
        setNewImagePath(path)
        setNewImagePreview(signedUrl)
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Fout bij het uploaden van de afbeelding')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async (isEdit: boolean = false) => {
    const pathToDelete = isEdit ? editImagePath : newImagePath
    if (!pathToDelete) return

    try {
      await deleteUpdateImage(pathToDelete)
      if (isEdit) {
        setEditImagePath(null)
        setEditImagePreview(null)
      } else {
        setNewImagePath(null)
        setNewImagePreview(null)
      }
    } catch (err) {
      console.error('Error deleting image:', err)
      setError('Fout bij het verwijderen van de afbeelding')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, isEdit)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isEdit: boolean = false) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleImageUpload(file, isEdit)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Load image URL for display
  const loadImageUrl = async (path: string): Promise<string> => {
    if (imageUrlCache[path]) {
      return imageUrlCache[path]
    }

    try {
      const url = await getSignedImageUrl(path)
      setImageUrlCache((prev) => ({ ...prev, [path]: url }))
      return url
    } catch (err) {
      console.error('Error loading image URL:', err)
      return ''
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
                    setNewImagePath(null)
                    setNewImagePreview(null)
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
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Afbeelding (optioneel)
                </label>
                {newImagePreview ? (
                  <div className="relative">
                    <img
                      src={newImagePreview}
                      alt="Preview"
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => handleDeleteImage(false)}
                      disabled={uploadingImage}
                      className="absolute top-2 right-2 rounded-full bg-red-500/80 hover:bg-red-500 p-2 transition-colors"
                      aria-label="Verwijder afbeelding"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={(e) => handleDrop(e, false)}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--accent)] transition-colors"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileInputChange(e, false)}
                      disabled={uploadingImage}
                      className="hidden"
                      id="new-image-upload"
                    />
                    <label
                      htmlFor="new-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-6 w-6 text-[var(--text-dim)]" />
                      <span className="text-sm text-[var(--text-dim)]">
                        {uploadingImage
                          ? 'Uploaden...'
                          : 'Sleep een afbeelding hierheen of klik om te uploaden'}
                      </span>
                      <span className="text-xs text-[var(--text-dim)]">
                        PNG, JPG, JPEG, WebP (max 1MB)
                      </span>
                    </label>
                  </div>
                )}
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
                    setNewImagePath(null)
                    setNewImagePreview(null)
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
                      <>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Inhoud"
                          rows={8}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none resize-y"
                        />
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white mb-1.5">
                            Afbeelding (optioneel)
                          </label>
                          {editImagePreview ? (
                            <div className="relative">
                              <img
                                src={editImagePreview}
                                alt="Preview"
                                className="w-full max-w-md rounded-lg shadow-md"
                              />
                              <button
                                onClick={() => handleDeleteImage(true)}
                                disabled={uploadingImage}
                                className="absolute top-2 right-2 rounded-full bg-red-500/80 hover:bg-red-500 p-2 transition-colors"
                                aria-label="Verwijder afbeelding"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDrop={(e) => handleDrop(e, true)}
                              onDragOver={handleDragOver}
                              className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--accent)] transition-colors"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileInputChange(e, true)}
                                disabled={uploadingImage}
                                className="hidden"
                                id={`edit-image-upload-${update.id}`}
                              />
                              <label
                                htmlFor={`edit-image-upload-${update.id}`}
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <Upload className="h-6 w-6 text-[var(--text-dim)]" />
                                <span className="text-sm text-[var(--text-dim)]">
                                  {uploadingImage
                                    ? 'Uploaden...'
                                    : 'Sleep een afbeelding hierheen of klik om te uploaden'}
                                </span>
                                <span className="text-xs text-[var(--text-dim)]">
                                  PNG, JPG, JPEG, WebP (max 1MB)
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </>
                    ) : canSeeFullContent ? (
                      <>
                        <div className="mt-3">
                          <MarkdownRenderer content={update.content} />
                        </div>
                        {update.image_path && (
                          <UpdateImageDisplay
                            imagePath={update.image_path}
                            onImageClick={(url) => setModalImage(url)}
                            loadImageUrl={loadImageUrl}
                          />
                        )}
                      </>
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
                        {update.image_path && (
                          <div className="h-40 w-full bg-[var(--muted)] rounded-lg blur-sm" />
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
      {modalImage && (
        <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      )}
    </Container>
  )
}
