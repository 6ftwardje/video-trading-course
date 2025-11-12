'use client'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SupabaseBrowserClient = SupabaseClient<any, any, any, any, any>

let client: SupabaseBrowserClient | null = null

export function createClient(): SupabaseBrowserClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  client = createBrowserSupabaseClient({
    supabaseUrl,
    supabaseKey,
  }) as SupabaseBrowserClient

  return client
}

