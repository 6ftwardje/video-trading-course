'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { WaveLoader } from '@/components/ui/wave-loader'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a brief moment for middleware to process cookies
        await new Promise(resolve => setTimeout(resolve, 100))

        // Use getUser() to validate the session with the server
        // This ensures we have a valid session after email confirmation
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Error getting user after confirmation:', userError)
          setStatus('error')
          setTimeout(() => {
            router.replace('/login')
          }, 2000)
          return
        }

        // User exists - sync student profile
        const email = user.email

        if (!email) {
          console.error('User email not found')
          setStatus('error')
          setTimeout(() => {
            router.replace('/login')
          }, 2000)
          return
        }

        // Get full_name from user_metadata
        const fullName = user.user_metadata?.full_name as string | undefined

        // Try to find or create student profile
        let studentRecord: { id: string; email: string; access_level: number | null; name: string | null } | null = null

        // First, try to find by auth_user_id
        const { data: studentByAuth, error: findByAuthError } = await supabase
          .from('students')
          .select('id,email,access_level,name')
          .eq('auth_user_id', user.id)
          .single()

        if (studentByAuth) {
          studentRecord = studentByAuth
          // Sync name from user_metadata if missing
          if (!studentRecord.name && fullName) {
            const { data: updated } = await supabase
              .from('students')
              .update({ name: fullName })
              .eq('id', studentRecord.id)
              .select('id,email,access_level,name')
              .single()
            if (updated) {
              studentRecord = updated
            }
          }
        } else if (findByAuthError && findByAuthError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine
          console.error('Error fetching student by auth_user_id:', findByAuthError)
        }

        // If not found by auth_user_id, try by email
        if (!studentRecord) {
          const { data: existingByEmail, error: findByEmailError } = await supabase
            .from('students')
            .select('id,email,access_level,auth_user_id,name')
            .eq('email', email)
            .maybeSingle()

          if (findByEmailError) {
            console.error('Error checking student by email:', findByEmailError)
          }

          if (existingByEmail) {
            if (!existingByEmail.auth_user_id) {
              // Link existing student to auth user and update name if needed
              const updateData: { auth_user_id: string; name?: string } = { auth_user_id: user.id }
              if (fullName && !existingByEmail.name) {
                updateData.name = fullName
              }

              const { data: updated, error: updateError } = await supabase
                .from('students')
                .update(updateData)
                .eq('id', existingByEmail.id)
                .select('id,email,access_level,name')
                .single()

              if (updateError || !updated) {
                console.error('Error updating student profile with auth user id:', updateError)
              } else {
                studentRecord = updated
              }
            } else {
              // Update name if missing
              if (fullName && !existingByEmail.name) {
                const { data: updated } = await supabase
                  .from('students')
                  .update({ name: fullName })
                  .eq('id', existingByEmail.id)
                  .select('id,email,access_level,name')
                  .single()
                if (updated) {
                  studentRecord = updated
                } else {
                  studentRecord = {
                    id: existingByEmail.id,
                    email: existingByEmail.email,
                    access_level: existingByEmail.access_level ?? 1,
                    name: existingByEmail.name,
                  }
                }
              } else {
                studentRecord = {
                  id: existingByEmail.id,
                  email: existingByEmail.email,
                  access_level: existingByEmail.access_level ?? 1,
                  name: existingByEmail.name,
                }
              }
            }
          }
        }

        // Redirect to dashboard
        // Student record will be loaded by StudentProvider
        // DB trigger should handle student creation if needed
        router.replace('/dashboard')
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setTimeout(() => {
          router.replace('/login')
        }, 2000)
      }
    }

    handleCallback()
  }, [router, supabase])

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Er ging iets mis bij het bevestigen van je e-mailadres.</p>
          <p className="text-gray-400 text-sm">Je wordt doorgestuurd naar de login pagina...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
      <WaveLoader message="Je wordt ingelogd..." />
    </div>
  )
}

