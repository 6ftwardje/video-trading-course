'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getStudentByAuthUserId } from '@/lib/student'
import { debugLog } from '@/lib/debug'

type Student = {
  id: string
  email: string
  access_level: number | null
  auth_user_id: string | null
  name: string | null
  updated_at?: string
}

export type StudentStatus = 'idle' | 'loading' | 'ready' | 'unauthenticated' | 'error'
export type ErrorReason = 'STUDENT_NOT_FOUND' | 'STUDENT_LOAD_TIMEOUT' | 'RLS' | 'NETWORK' | 'UNKNOWN' | null

type StudentContextType = {
  authUser: User | null
  student: Student | null
  status: StudentStatus
  errorReason: ErrorReason
  retry: () => void
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
  hideLoadingOnPublicRoutes?: boolean
}

const LOAD_TIMEOUT_MS = 15000 // Match stable: give localhost/Supabase time to respond
const PROTECTED_PATHS = ['/dashboard', '/module', '/lesson', '/exam', '/praktijk', '/mentorship', '/course-material', '/account']

export function StudentProvider({ children, hideLoadingOnPublicRoutes = false }: StudentProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [status, setStatus] = useState<StudentStatus>('idle')
  const [errorReason, setErrorReason] = useState<ErrorReason>(null)
  const statusRef = useRef(status)
  const isLoadingRef = useRef(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const retry = useCallback(() => {
    setErrorReason(null)
    setStatus('loading')
    setRetryCount((c) => c + 1)
  }, [])

  // Extra safety: redirect to login when unauthenticated on protected route (middleware is primary guard)
  useEffect(() => {
    if (status !== 'unauthenticated') return
    const isProtected = PROTECTED_PATHS.some((p) => pathname?.startsWith(p))
    if (isProtected) {
      debugLog('StudentProvider', 'unauthenticated on protected route, redirecting to login')
      const from = encodeURIComponent(pathname ?? '/')
      router.replace(`/login?redirectedFrom=${from}`)
    }
  }, [status, pathname, router])

  useEffect(() => {
    const supabase = getSupabaseClient()
    let subscription: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null

    const loadStudent = async () => {
      if (isLoadingRef.current) return
      isLoadingRef.current = true
      const start = Date.now()
      debugLog('StudentProvider', { event: 'loadStudent_start', ts: start })

      try {
        setStatus('loading')
        setErrorReason(null)

        if (subscription) {
          await subscription.unsubscribe()
          subscription = null
        }

        let { data: { session } } = await supabase.auth.getSession()
        debugLog('StudentProvider', { event: 'after_getSession', hasSession: !!session?.user, elapsed: Date.now() - start })

        if (!isMounted) {
          isLoadingRef.current = false
          return
        }

        if (!session?.user) {
          debugLog('StudentProvider', 'no session, trying refreshSession once')
          await supabase.auth.refreshSession()
          const next = await supabase.auth.getSession()
          session = next.data.session
          debugLog('StudentProvider', { event: 'after_refreshSession', hasSession: !!session?.user })
        }

        if (!session?.user) {
          setAuthUser(null)
          setStudent(null)
          setStatus('unauthenticated')
          return
        }

        setAuthUser(session.user)
        const getStudentStart = Date.now()
        debugLog('StudentProvider', { event: 'getStudentByAuthUserId_start', userId: session.user.id })

        let studentData: Student | null = null
        try {
          studentData = await getStudentByAuthUserId(session.user.id)
        } catch (err) {
          const elapsed = Date.now() - getStudentStart
          debugLog('StudentProvider', { event: 'getStudentByAuthUserId_error', err, elapsed })
          const reason: ErrorReason = (err as Error)?.message?.toLowerCase().includes('rls') ? 'RLS' : 'NETWORK'
          if (isMounted) {
            setStudent(null)
            setStatus('error')
            setErrorReason(reason)
          }
          return
        }

        const elapsed = Date.now() - getStudentStart
        debugLog('StudentProvider', { event: 'getStudentByAuthUserId_done', found: !!studentData, elapsed })

        if (!isMounted) return

        if (!studentData) {
          setStudent(null)
          setStatus('error')
          setErrorReason('STUDENT_NOT_FOUND')
          return
        }

        setStudent(studentData)
        setStatus('ready')
        debugLog('StudentProvider', { event: 'ready', studentId: studentData.id, totalElapsed: Date.now() - start })

        const currentStudentData = studentData
        const currentAuthUserId = session.user.id

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
            async (payload) => {
              if (!isMounted) return
              try {
                const updatedStudent = payload.new as Student
                if (!updatedStudent?.id) {
                  const reloaded = await getStudentByAuthUserId(currentAuthUserId)
                  if (reloaded && isMounted) setStudent(reloaded)
                  return
                }
                const oldLevel = currentStudentData?.access_level
                const newLevel = updatedStudent.access_level
                if (oldLevel !== newLevel || !currentStudentData) {
                  setStudent(updatedStudent)
                }
              } catch {
                try {
                  const reloaded = await getStudentByAuthUserId(currentAuthUserId)
                  if (reloaded && isMounted) setStudent(reloaded)
                } catch {
                  // ignore
                }
              }
            }
          )
          .subscribe()
      } catch (error) {
        const elapsed = Date.now() - start
        debugLog('StudentProvider', { event: 'loadStudent_catch', error, elapsed })
        if (isMounted) {
          setStatus('error')
          setErrorReason('UNKNOWN')
        }
      } finally {
        isLoadingRef.current = false
      }
    }

    loadingTimeout = setTimeout(async () => {
      if (statusRef.current !== 'loading' || !isMounted) return
      debugLog('StudentProvider', { event: 'LOAD_TIMEOUT', timeoutMs: LOAD_TIMEOUT_MS })
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) return
      if (statusRef.current !== 'loading') return
      if (!session?.user) {
        setAuthUser(null)
        setStudent(null)
        setStatus('unauthenticated')
      } else {
        setStatus('error')
        setErrorReason('STUDENT_LOAD_TIMEOUT')
      }
    }, LOAD_TIMEOUT_MS)

    loadStudent()

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (subscription) {
          await subscription.unsubscribe()
          subscription = null
        }
        isLoadingRef.current = false
        setAuthUser(null)
        setStudent(null)
        setStatus('unauthenticated')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!isLoadingRef.current) {
          loadStudent()
        }
      }
    })

    return () => {
      isMounted = false
      if (loadingTimeout) clearTimeout(loadingTimeout)
      authSubscription.unsubscribe()
      if (subscription) subscription.unsubscribe()
    }
  }, [retryCount])

  // Loader only when status is loading (or idle before first load) on protected routes
  const showFullscreenLoader = (status === 'loading' || status === 'idle') && !hideLoadingOnPublicRoutes
  if (showFullscreenLoader) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-sm text-[var(--text-dim)]">Loading account...</p>
        </div>
      </div>
    )
  }

  if ((status === 'loading' || status === 'idle') && hideLoadingOnPublicRoutes) {
    return (
      <StudentContext.Provider value={{ authUser, student, status, errorReason, retry }}>
        {children}
      </StudentContext.Provider>
    )
  }

  if (status === 'error' && !hideLoadingOnPublicRoutes) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
        <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold">Account Error</h2>
          <p className="mb-6 text-sm text-[var(--text-dim)]">
            {errorReason === 'STUDENT_LOAD_TIMEOUT'
              ? 'Het laden duurde te lang. Controleer je verbinding.'
              : errorReason === 'STUDENT_NOT_FOUND'
                ? 'We konden je studentprofiel niet vinden.'
                : 'Er ging iets mis. Probeer het opnieuw.'}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={retry}
              className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium transition hover:bg-[var(--bg)]"
            >
              Opnieuw proberen
            </button>
            <button
              onClick={() => getSupabaseClient().auth.signOut()}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' && hideLoadingOnPublicRoutes) {
    return (
      <StudentContext.Provider value={{ authUser, student, status, errorReason, retry }}>
        {children}
      </StudentContext.Provider>
    )
  }

  return (
    <StudentContext.Provider value={{ authUser, student, status, errorReason, retry }}>
      {children}
    </StudentContext.Provider>
  )
}
