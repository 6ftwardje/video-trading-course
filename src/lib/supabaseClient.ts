'use client'

import { createClient as createBrowserClient, type SupabaseBrowserClient } from '@/utils/supabase/client'

let cachedClient: SupabaseBrowserClient | null = null

export function getSupabaseClient(): SupabaseBrowserClient {
  if (cachedClient) return cachedClient

  cachedClient = createBrowserClient()
  return cachedClient
}
