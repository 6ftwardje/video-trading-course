import { getSupabaseClient } from './supabaseClient'

const LS_KEY = 'cryptoriez_student_id'
const LS_EMAIL = 'cryptoriez_student_email'

export function getStoredStudentId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_KEY)
}

export function getStoredStudentEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_EMAIL)
}

export function setStoredStudent(id: string, email: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, id)
  localStorage.setItem(LS_EMAIL, email)
}

export async function ensureStudentByEmail(email: string): Promise<{ id: string; email: string }> {
  // 1) Probeer bestaande student te vinden
  const supabase = getSupabaseClient()
  const { data: found, error: findErr } = await supabase
    .from('students')
    .select('id,email')
    .eq('email', email)
    .single()

  if (found?.id) return found

  // 2) Maak aan indien niet gevonden
  const { data: created, error: createErr } = await supabase
    .from('students')
    .insert({ email })
    .select('id,email')
    .single()

  if (createErr) throw createErr
  return created!
}

