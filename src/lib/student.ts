import { getSupabaseClient } from './supabaseClient'

const LS_KEY = 'cryptoriez_student_id'
const LS_EMAIL = 'cryptoriez_student_email'
const LS_ACCESS = 'cryptoriez_student_access_level'
const LS_NAME = 'cryptoriez_student_name'

type Student = {
  id: string
  email: string
  access_level: number | null
  auth_user_id: string | null
  name: string | null
}

export type StoredStudent = {
  id: string
  email: string
  access_level: number
  name: string | null
}

export function getStoredStudentId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_KEY)
}

export function getStoredStudentEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_EMAIL)
}

export function getStoredStudentAccessLevel(): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(LS_ACCESS)
  if (!raw) return null
  const level = Number(raw)
  return Number.isFinite(level) ? level : null
}

export function getStoredStudentName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_NAME)
}

export function setStoredStudent(id: string, email: string, name?: string | null) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, id)
  localStorage.setItem(LS_EMAIL, email)
  if (name !== undefined) {
    if (name === null) {
      localStorage.removeItem(LS_NAME)
    } else {
      localStorage.setItem(LS_NAME, name)
    }
  }
}

export function setStoredStudentAccessLevel(level: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_ACCESS, String(level))
}

export function clearStoredStudent() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_EMAIL)
  localStorage.removeItem(LS_ACCESS)
  localStorage.removeItem(LS_NAME)
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

export async function getStudentByAuthUserId(authUserId: string): Promise<Student | null> {
  if (!authUserId) return null

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('students')
    .select('id,email,access_level,auth_user_id,name')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    console.error('[getStudentByAuthUserId] Supabase error:', error.message, 'code:', error.code, 'details:', error.details)
    return null
  }
  if (!data) {
    console.warn('[getStudentByAuthUserId] No student row for auth_user_id:', authUserId, '- ensure students.auth_user_id is set (e.g. in auth callback)')
  }
  return data
}

