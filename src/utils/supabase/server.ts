import 'server-only'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SupabaseServerClient = SupabaseClient<any, any, any, any, any>

export function createClient(): SupabaseServerClient {
  const cookieStore = cookies()

  return createServerComponentClient({
    cookies: () => cookieStore,
  }) as SupabaseServerClient
}

