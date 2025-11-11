import { getSupabaseClient } from '@/lib/supabaseClient'

export type PracticalLessonRecord = {
  id: number
  module_id: number
  title: string
  description?: string | null
  location?: string | null
  video_url?: string | null
}

export async function getPracticalLessons(moduleId: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('practical_lessons')
    .select('id, module_id, title, description, location')
    .eq('module_id', moduleId)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching practical lessons:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  return (data || []).map((row) => ({
    ...row,
    video_url: (row as any).video_url ?? row.location ?? null
  })) as PracticalLessonRecord[]
}

export async function getPracticalLessonById(id: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('practical_lessons')
    .select('id, module_id, title, description, location')
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
    video_url: (data as any).video_url ?? data.location ?? null
  } as PracticalLessonRecord
}

