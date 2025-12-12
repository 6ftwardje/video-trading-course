'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getStudentByAuthUserId } from '@/lib/student'

type Student = {
  id: string
  email: string
  access_level: number | null
  auth_user_id: string | null
  name: string | null
  updated_at?: string
}

type StudentContextType = {
  authUser: User | null
  student: Student | null
  status: 'loading' | 'ready' | 'unauthenticated' | 'error'
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider')
  }
  return context
}

type StudentProviderProps = {
  children: ReactNode
}

export function StudentProvider({ children }: StudentProviderProps) {
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unauthenticated' | 'error'>('loading')
  const statusRef = useRef(status)
  
  // Keep ref in sync with state
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Redirect to login if unauthenticated on protected routes
  useEffect(() => {
    if (status === 'unauthenticated') {
      const protectedPaths = ['/dashboard', '/module', '/lesson', '/exam', '/praktijk', '/mentorship', '/course-material']
      const isProtected = protectedPaths.some(path => pathname?.startsWith(path))
      
      if (isProtected) {
        console.log('[StudentProvider] Unauthenticated on protected route, redirecting to login')
        // Use window.location for immediate redirect
        window.location.href = '/login'
      }
    }
  }, [status, pathname])

  useEffect(() => {
    const supabase = getSupabaseClient()
    let subscription: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout | null = null
    let isLoading = false

    const loadStudent = async () => {
      // Prevent concurrent loads
      if (isLoading) {
        console.log('[StudentProvider] Already loading, skipping...')
        return
      }
      
      isLoading = true
      
      try {
        console.log('[StudentProvider] Loading student...')
        
        // Clean up existing subscription before loading new student
        if (subscription) {
          await subscription.unsubscribe()
          subscription = null
        }

        // Use getSession() first to avoid unnecessary server requests
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) {
          isLoading = false
          return
        }

        if (!session?.user) {
          console.log('[StudentProvider] No session found, setting unauthenticated')
          setAuthUser(null)
          setStudent(null)
          setStatus('unauthenticated')
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
            loadingTimeout = null
          }
          isLoading = false
          return
        }

        console.log('[StudentProvider] Session found, fetching student for user:', session.user.id)
        setAuthUser(session.user)

        // Fetch student record by auth_user_id
        const studentData = await getStudentByAuthUserId(session.user.id)

        if (!isMounted) {
          isLoading = false
          return
        }

        if (!studentData) {
          console.error('[StudentProvider] Student record not found for auth_user_id:', session.user.id)
          setStudent(null)
          setStatus('error')
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
            loadingTimeout = null
          }
          isLoading = false
          return
        }

        console.log('[StudentProvider] Student loaded successfully:', studentData.id)
        setStudent(studentData)
        setStatus('ready')
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
          loadingTimeout = null
        }

        // Subscribe to realtime updates for this student
        subscription = supabase
          .channel(`student:${studentData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'students',
              filter: `id=eq.${studentData.id}`,
            },
            (payload) => {
              if (isMounted) {
                const updatedStudent = payload.new as Student
                setStudent(updatedStudent)
              }
            }
          )
          .subscribe()

        // Handle subscription errors
        subscription.on('error', (error) => {
          console.error('Realtime subscription error:', error)
        })
        
        isLoading = false
      } catch (error) {
        console.error('[StudentProvider] Error loading student:', error)
        isLoading = false
        if (isMounted) {
          setStatus('error')
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
            loadingTimeout = null
          }
        }
      }
    }

    // Set a timeout to prevent infinite loading (5 seconds - shorter)
    loadingTimeout = setTimeout(() => {
      if (isMounted && statusRef.current === 'loading') {
        console.warn('[StudentProvider] Loading timeout reached, checking auth state')
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (isMounted && statusRef.current === 'loading') {
            if (!session?.user) {
              console.log('[StudentProvider] Timeout: No session, setting unauthenticated')
              setStatus('unauthenticated')
            } else {
              console.log('[StudentProvider] Timeout: Session exists but student not loaded, setting error')
              setStatus('error')
            }
          }
        })
      }
    }, 5000)

    // Initial load
    loadStudent()

    // Listen for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        // Clean up subscription
        if (subscription) {
          await subscription.unsubscribe()
          subscription = null
        }
        setAuthUser(null)
        setStudent(null)
        setStatus('unauthenticated')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reload student when auth changes
        await loadStudent()
      }
    })

    return () => {
      isMounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      // Cleanup
      authSubscription.unsubscribe()
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // Show loading state while loading
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-sm text-[var(--text-dim)]">Loading account...</p>
        </div>
      </div>
    )
  }

  // Show error state if student record is missing
  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
        <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold">Account Error</h2>
          <p className="mb-6 text-sm text-[var(--text-dim)]">
            We konden je studentprofiel niet vinden. Neem contact op met support.
          </p>
          <button
            onClick={() => {
              const supabase = getSupabaseClient()
              supabase.auth.signOut()
            }}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
          >
            Uitloggen
          </button>
        </div>
      </div>
    )
  }

  // Render children for ready or unauthenticated states
  // (unauthenticated will be handled by middleware redirects)
  return (
    <StudentContext.Provider value={{ authUser, student, status }}>
      {children}
    </StudentContext.Provider>
  )
}

