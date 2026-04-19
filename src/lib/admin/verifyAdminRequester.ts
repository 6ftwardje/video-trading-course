import 'server-only'

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export type VerifyAdminOk = { ok: true }

export type VerifyAdminFail = { ok: false; response: NextResponse }

/**
 * Ensures the request has a logged-in Supabase user whose student row has access_level === 3.
 * Used by admin API routes before service-role writes.
 */
export async function verifyAdminRequester(): Promise<VerifyAdminOk | VerifyAdminFail> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: requesterStudent, error: requesterError } = await supabase
    .from('students')
    .select('access_level')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (requesterError) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Error fetching requester student record' }, { status: 500 }),
    }
  }

  if (!requesterStudent) {
    return { ok: false, response: NextResponse.json({ error: 'Student not found' }, { status: 404 }) }
  }

  if (requesterStudent.access_level !== 3) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true }
}
