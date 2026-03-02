import { getSupabaseClient } from '@/lib/supabaseClient'

export type PracticalLessonRecord = {
  id: number
  module_id: number
  title: string
  description?: string | null
  location?: string | null
  video_url?: string | null
  thumbnail_url?: string | null
}

const PRACTICAL_SELECT = 'id, module_id, title, description, location, thumbnail_url'
const PRACTICAL_SELECT_FALLBACK = 'id, module_id, title, description, location'

export async function getPracticalLessons(moduleId: number) {
  const supabase = getSupabaseClient()
  let { data, error } = await supabase
    .from('practical_lessons')
    .select(PRACTICAL_SELECT)
    .eq('module_id', moduleId)
    .order('id', { ascending: true })

  if (error) {
    const maybeMissingColumn = error.message?.toLowerCase().includes('thumbnail')
    if (maybeMissingColumn) {
      const fallback = await supabase
        .from('practical_lessons')
        .select(PRACTICAL_SELECT_FALLBACK)
        .eq('module_id', moduleId)
        .order('id', { ascending: true })
      if (fallback.error) {
        console.error('Error fetching practical lessons:', fallback.error)
        return []
      }
      data = fallback.data
    } else {
      console.error('Error fetching practical lessons:', error)
      return []
    }
  }

  return (data || []).map((row) => ({
    ...row,
    video_url: (row as any).video_url ?? (row as any).location ?? null,
    thumbnail_url: (row as any).thumbnail_url ?? null
  })) as PracticalLessonRecord[]
}

export async function getPracticalLessonById(id: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('practical_lessons')
    .select('id, module_id, title, description, location, thumbnail_url')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching practical lesson by id:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return null
  }

  if (!data) return null

  return {
    ...data,
    video_url: (data as any).video_url ?? data.location ?? null,
    thumbnail_url: (data as any).thumbnail_url ?? null
  } as PracticalLessonRecord
}

