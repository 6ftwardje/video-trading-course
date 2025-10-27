import { supabase } from '@/lib/supabaseClient'

export async function getModulesSimple() {
  const { data } = await supabase.from('modules').select('id,title,description,order').order('order', { ascending: true })
  return data || []
}

export async function getLessonsForModules(moduleIds: number[]) {
  const { data } = await supabase.from('lessons').select('id,module_id,order,title').in('module_id', moduleIds)
  return data || []
}

export async function getWatchedLessonIds(studentId: string, lessonIds: number[]) {
  if (!studentId || lessonIds.length === 0) return new Set<number>()
  const { data } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('watched', true)
    .eq('student_id', studentId)
    .in('lesson_id', lessonIds)
  return new Set((data || []).map(r => r.lesson_id))
}

/** Eenvoudig: bepaal de eerstvolgende onvoltooide les binnen de LAAGSTE module-id (of de eerste module in volgorde). */
export function findNextLesson(modules: any[], lessons: any[], watched: Set<number>) {
  if (!modules.length) return null
  const orderedModules = [...modules].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
  for (const mod of orderedModules) {
    const modLessons = lessons.filter(l => l.module_id === mod.id).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    // eerste les die NIET watched is
    const next = modLessons.find(l => !watched.has(l.id))
    if (next) return { module: mod, lesson: next }
  }
  return null
}
