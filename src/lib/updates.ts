import { getSupabaseClient } from './supabaseClient'
import { getStoredStudentId, getStoredStudentAccessLevel } from './student'

export type Update = {
  id: string
  author_id: string
  title: string | null
  content: string
  image_path: string | null
  created_at: string
  updated_at: string | null
}

export type UpdateWithAuthor = Update & {
  author_name: string // bijv. full_name of email
}

export async function fetchUpdatesWithAuthor(): Promise<UpdateWithAuthor[]> {
  const supabase = getSupabaseClient()

  // Fetch updates with author info via foreign key relationship
  // Using Supabase PostgREST syntax: students!author_id means join students table via author_id foreign key
  const { data, error } = await supabase
    .from('updates')
    .select(`
      id,
      author_id,
      title,
      content,
      image_path,
      created_at,
      updated_at,
      students!author_id (
        id,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching updates', error)
    throw error
  }

  const mapped: UpdateWithAuthor[] = (data ?? []).map((row: any) => {
    // Handle both possible response shapes: students array or students object
    const author = Array.isArray(row.students) ? row.students[0] : row.students
    return {
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      content: row.content,
      image_path: row.image_path ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_name: author?.email ?? 'Onbekende mentor',
    }
  })

  return mapped
}

export async function createUpdate(input: {
  title: string | null
  content: string
  image_path: string | null
}): Promise<UpdateWithAuthor> {
  const supabase = getSupabaseClient()
  const studentId = getStoredStudentId()

  if (!studentId) {
    throw new Error('Geen student-id gevonden. User lijkt niet ingelogd.')
  }

  const { data, error } = await supabase
    .from('updates')
    .insert({
      author_id: studentId,
      title: input.title,
      content: input.content,
      image_path: input.image_path,
    })
    .select(`
      id,
      author_id,
      title,
      content,
      image_path,
      created_at,
      updated_at,
      students!author_id (
        id,
        email
      )
    `)
    .single()

  if (error) {
    console.error('Error creating update', error)
    throw error
  }

  const author = Array.isArray(data.students) ? data.students[0] : data.students
  const mapped: UpdateWithAuthor = {
    id: data.id,
    author_id: data.author_id,
    title: data.title,
    content: data.content,
    image_path: data.image_path ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    author_name: author?.email ?? 'Onbekende mentor',
  }

  return mapped
}

export async function updateUpdate(
  id: string,
  input: { title: string | null; content: string; image_path: string | null }
): Promise<UpdateWithAuthor> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('updates')
    .update({
      title: input.title,
      content: input.content,
      image_path: input.image_path,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      id,
      author_id,
      title,
      content,
      image_path,
      created_at,
      updated_at,
      students!author_id (
        id,
        email
      )
    `)
    .single()

  if (error) {
    console.error('Error updating update', error)
    throw error
  }

  const author = Array.isArray(data.students) ? data.students[0] : data.students
  const mapped: UpdateWithAuthor = {
    id: data.id,
    author_id: data.author_id,
    title: data.title,
    content: data.content,
    image_path: data.image_path ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    author_name: author?.email ?? 'Onbekende mentor',
  }

  return mapped
}

export async function uploadUpdateImage(file: File): Promise<string> {
  const supabase = getSupabaseClient()
  const studentId = getStoredStudentId()

  if (!studentId) {
    throw new Error('Geen student-id gevonden. User lijkt niet ingelogd.')
  }

  // Determine file extension
  const fileName = file.name.toLowerCase()
  let ext: string
  if (fileName.endsWith('.png')) ext = 'png'
  else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) ext = 'jpg'
  else if (fileName.endsWith('.webp')) ext = 'webp'
  else {
    throw new Error('Alleen PNG, JPG, JPEG en WebP zijn toegestaan')
  }

  // Enforce max 1MB
  const maxSize = 1024 * 1024 // 1MB
  if (file.size > maxSize) {
    throw new Error('Bestand is te groot. Maximum grootte is 1MB.')
  }

  // Build path: students/{studentId}/{uuid}.{ext}
  const uuid = crypto.randomUUID()
  const path = `students/${studentId}/${uuid}.${ext}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('update-images')
    .upload(path, file, { upsert: false })

  if (error) {
    console.error('Error uploading image', error)
    throw error
  }

  // Return path (not URL)
  return data.path
}

export async function deleteUpdateImage(path: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage.from('update-images').remove([path])

  if (error) {
    console.error('Error deleting image', error)
    throw error
  }
}

export async function getSignedImageUrl(path: string): Promise<string> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from('update-images')
    .createSignedUrl(path, 60 * 60) // 1 hour

  if (error) {
    console.error('Error creating signed URL', error)
    throw error
  }

  if (!data?.signedUrl) {
    throw new Error('Geen signed URL ontvangen')
  }

  return data.signedUrl
}

export async function deleteUpdate(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('updates').delete().eq('id', id)

  if (error) {
    console.error('Error deleting update', error)
    throw error
  }

  return true
}

export async function getUnreadCount(studentId: string | null): Promise<number> {
  if (!studentId) return 0

  const accessLevel = getStoredStudentAccessLevel()
  
  // Only for access_level 2 and 3. For access_level 1: always return 0.
  if (accessLevel !== 2 && accessLevel !== 3) {
    return 0
  }

  const supabase = getSupabaseClient()

  // Get all update IDs
  const { data: allUpdates, error: updatesError } = await supabase
    .from('updates')
    .select('id')

  if (updatesError) {
    console.error('Error fetching updates for unread count', updatesError)
    return 0
  }

  if (!allUpdates || allUpdates.length === 0) {
    return 0
  }

  // Get read update IDs for this student
  const { data: readUpdates, error: readError } = await supabase
    .from('update_reads')
    .select('update_id')
    .eq('student_id', studentId)

  if (readError) {
    console.error('Error fetching read updates', readError)
    return 0
  }

  const readUpdateIds = new Set((readUpdates ?? []).map((r: any) => r.update_id))
  const unreadCount = allUpdates.filter((u: any) => !readUpdateIds.has(u.id)).length

  return unreadCount
}

export async function markAllAsRead(
  studentId: string | null,
  updateIds: string[]
): Promise<void> {
  if (!studentId || !updateIds || updateIds.length === 0) {
    return
  }

  const accessLevel = getStoredStudentAccessLevel()
  
  // Skip if access_level = 1
  if (accessLevel !== 2 && accessLevel !== 3) {
    return
  }

  const supabase = getSupabaseClient()

  // First, get already read update IDs to avoid duplicates
  const { data: existingReads, error: readError } = await supabase
    .from('update_reads')
    .select('update_id')
    .eq('student_id', studentId)
    .in('update_id', updateIds)

  if (readError) {
    console.error('Error checking existing reads', readError)
    // Continue anyway, try to insert
  }

  const existingUpdateIds = new Set((existingReads ?? []).map((r: any) => r.update_id))
  
  // Only insert updates that haven't been read yet
  const newReads = updateIds
    .filter((updateId) => !existingUpdateIds.has(updateId))
    .map((updateId) => ({
      student_id: studentId,
      update_id: updateId,
    }))

  if (newReads.length === 0) {
    // All updates already marked as read
    return
  }

  // Insert new read records
  const { error } = await supabase.from('update_reads').insert(newReads)

  if (error) {
    // Log detailed error information
    try {
      const errorInfo = {
        message: error.message || 'Unknown error',
        details: error.details || null,
        hint: error.hint || null,
        code: error.code || null,
      }
      console.error('Error marking updates as read:', errorInfo)
    } catch (logError) {
      // Fallback if error object can't be serialized
      console.error('Error marking updates as read:', String(error))
    }
    throw error
  }
}

