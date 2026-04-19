import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import AdminContentClient from './AdminContentClient'
import type { AdminLessonRow, AdminModuleRow, AdminPracticalRow } from './types'

export default async function AdminContentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectedFrom=/admin/content')
  }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('access_level')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (studentError || !student || student.access_level !== 3) {
    redirect('/dashboard')
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[var(--text-dim)]">
        Serverconfiguratie ontbreekt (Supabase service role).
      </div>
    )
  }

  const [modsRes, lessRes, pracRes] = await Promise.all([
    admin
      .from('modules')
      .select('id,title,description,order')
      .order('order', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true }),
    admin.from('lessons').select('id,module_id,title,description,order'),
    admin
      .from('practical_lessons')
      .select('id,module_id,title,description')
      .order('module_id', { ascending: true })
      .order('id', { ascending: true }),
  ])

  if (modsRes.error || lessRes.error || pracRes.error) {
    console.error('admin content load', modsRes.error, lessRes.error, pracRes.error)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[var(--text-dim)]">
        Kon cursusinhoud niet laden. Probeer later opnieuw.
      </div>
    )
  }

  const modules = (modsRes.data ?? []) as AdminModuleRow[]
  const lessonsRaw = (lessRes.data ?? []) as AdminLessonRow[]
  const practicalLessons = (pracRes.data ?? []) as AdminPracticalRow[]

  const lessons = [...lessonsRaw].sort((a, b) => {
    const ma = (a.module_id ?? 0) - (b.module_id ?? 0)
    if (ma !== 0) return ma
    const oa = a.order ?? 0
    const ob = b.order ?? 0
    if (oa !== ob) return oa - ob
    return (a.id ?? 0) - (b.id ?? 0)
  })

  const moduleTitleById: Record<number, string> = {}
  for (const m of modules) {
    moduleTitleById[m.id] = m.title?.trim() ? m.title : `Module ${m.id}`
  }

  return (
    <AdminContentClient
      initialModules={modules}
      initialLessons={lessons}
      initialPracticalLessons={practicalLessons}
      moduleTitleById={moduleTitleById}
    />
  )
}
