'use client'

import { createClient } from '@/utils/supabase/client'

/**
 * Sends a password reset email to the specified email address.
 * 
 * @param email - The email address to send the reset link to
 * @param redirectTo - Optional redirect URL after password reset. Defaults to /confirmed
 * @returns Promise that resolves if successful, rejects with error if failed
 */
export async function sendPasswordResetEmail(
  email: string,
  redirectTo?: string
): Promise<void> {
  if (!email || !email.trim()) {
    throw new Error('E-mailadres is verplicht.')
  }

  const supabase = createClient()
  const redirectUrl = redirectTo || `${window.location.origin}/confirmed`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    throw error
  }
}





