'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'

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

        // Try to find or create student profile
        let studentRecord: { id: string; email: string; access_level: number | null } | null = null

        // First, try to find by auth_user_id
        const { data: studentByAuth, error: findByAuthError } = await supabase
          .from('students')
          .select('id,email,access_level')
          .eq('auth_user_id', user.id)
          .single()

        if (studentByAuth) {
          studentRecord = studentByAuth
        } else if (findByAuthError && findByAuthError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine
          console.error('Error fetching student by auth_user_id:', findByAuthError)
        }

        // If not found by auth_user_id, try by email
        if (!studentRecord) {
          const { data: existingByEmail, error: findByEmailError } = await supabase
            .from('students')
            .select('id,email,access_level,auth_user_id')
            .eq('email', email)
            .maybeSingle()

          if (findByEmailError) {
            console.error('Error checking student by email:', findByEmailError)
          }

          if (existingByEmail) {
            if (!existingByEmail.auth_user_id) {
              // Link existing student to auth user
              const { data: updated, error: updateError } = await supabase
                .from('students')
                .update({ auth_user_id: user.id })
                .eq('id', existingByEmail.id)
                .select('id,email,access_level')
                .single()

              if (updateError || !updated) {
                console.error('Error updating student profile with auth user id:', updateError)
              } else {
                studentRecord = updated
              }
            } else {
              studentRecord = {
                id: existingByEmail.id,
                email: existingByEmail.email,
                access_level: existingByEmail.access_level ?? 1,
              }
            }
          }
        }

        // If still no student record, create one
        if (!studentRecord) {
          const { data: created, error: createError } = await supabase
            .from('students')
            .insert({
              email,
              auth_user_id: user.id,
              access_level: 1,
            })
            .select('id,email,access_level')
            .single()

          if (createError || !created) {
            console.error('Error creating fallback student profile:', createError)
            // Still redirect to dashboard even if student creation fails
            // The student sync will be retried on next login
          } else {
            studentRecord = created
          }
        }

        // Store student data in localStorage
        if (studentRecord) {
          setStoredStudent(studentRecord.id, studentRecord.email)
          setStoredStudentAccessLevel(studentRecord.access_level ?? 1)
        }

        // Redirect to dashboard
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
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#7C99E3] border-r-transparent"></div>
        </div>
        <p className="text-gray-400">Je wordt ingelogd...</p>
      </div>
    </div>
  )
}

