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

type MeResponse = Student & {
  auth_user?: Partial<User> | null
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
const API_ME_TIMEOUT_MS = 8000
const PROTECTED_PATHS = [
  '/dashboard',
  '/modules',
  '/module',
  '/lesson',
  '/exam',
  '/praktijk',
  '/mentorship',
  '/course-material',
  '/account',
  '/updates',
  '/admin',
]

export function StudentProvider({ children, hideLoadingOnPublicRoutes = false }: StudentProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [status, setStatus] = useState<StudentStatus>('idle')
  const [errorReason, setErrorReason] = useState<ErrorReason>(null)
  const statusRef = useRef(status)
  const isLoadingRef = useRef(false)
  const studentRef = useRef<Student | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    studentRef.current = student
  }, [student])

  const retry = useCallback(() => {
    setErrorReason(null)
    setStatus('loading')
    setRetryCount((c) => c + 1)
  }, [])

  const loadStudentFromApi = useCallback(async (timeoutMs = API_ME_TIMEOUT_MS) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const start = Date.now()

    try {
      debugLog('StudentProvider', { event: 'api_me_start', timeoutMs })
      const response = await fetch('/api/me', {
        method: 'GET',
        headers: { accept: 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
      })

      debugLog('StudentProvider', {
        event: 'api_me_response',
        status: response.status,
        ok: response.ok,
        elapsed: Date.now() - start,
      })

      if (response.status === 401) {
        return { studentData: null, authUserData: null, errorReason: null as ErrorReason, unauthenticated: true }
      }

      if (response.status === 404) {
        return { studentData: null, authUserData: null, errorReason: 'STUDENT_NOT_FOUND' as ErrorReason, unauthenticated: false }
      }

      if (!response.ok) {
        return { studentData: null, authUserData: null, errorReason: 'NETWORK' as ErrorReason, unauthenticated: false }
      }

      const json = (await response.json()) as MeResponse
      const { auth_user: authUserData, ...studentData } = json

      if (!studentData?.id) {
        return { studentData: null, authUserData: null, errorReason: 'STUDENT_NOT_FOUND' as ErrorReason, unauthenticated: false }
      }

      return {
        studentData,
        authUserData: authUserData ? (authUserData as User) : null,
        errorReason: null as ErrorReason,
        unauthenticated: false,
      }
    } catch (error) {
      debugLog('StudentProvider', { event: 'api_me_error', error, elapsed: Date.now() - start })
      return { studentData: null, authUserData: null, errorReason: 'NETWORK' as ErrorReason, unauthenticated: false }
    } finally {
      clearTimeout(timeout)
    }
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

    const loadStudentSoft = async () => {
      if (isLoadingRef.current) return
      isLoadingRef.current = true
      try {
        const { studentData, authUserData } = await loadStudentFromApi(5000)
        if (!isMounted) return
        if (studentData) {
          if (authUserData) setAuthUser(authUserData)
          setStudent(studentData)
        }
      } catch {
        // Keep last known good UI on background refresh failure
      } finally {
        isLoadingRef.current = false
      }
    }

    const loadStudentFull = async () => {
      if (isLoadingRef.current) {
        debugLog('StudentProvider', { event: 'loadStudentFull_skipped_already_loading' })
        return
      }
      isLoadingRef.current = true
      const start = Date.now()
      debugLog('StudentProvider', { event: 'loadStudent_full_start', ts: start })

      try {
        setStatus('loading')
        setErrorReason(null)

        if (subscription) {
          await subscription.unsubscribe()
          subscription = null
        }

        const apiResult = await loadStudentFromApi()
        if (!isMounted) {
          isLoadingRef.current = false
          return
        }

        if (apiResult.studentData) {
          setAuthUser(apiResult.authUserData)
          setStudent(apiResult.studentData)
          setStatus('ready')
          debugLog('StudentProvider', { event: 'ready_from_api_me', studentId: apiResult.studentData.id, totalElapsed: Date.now() - start })

          const currentStudentData = apiResult.studentData
          const currentAuthUserId = apiResult.authUserData?.id ?? apiResult.studentData.auth_user_id

          subscription = supabase
            .channel(`student:${apiResult.studentData.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'students',
                filter: `id=eq.${apiResult.studentData.id}`,
              },
              async (payload) => {
                if (!isMounted) return
                try {
                  const updatedStudent = payload.new as Student
                  if (!updatedStudent?.id) {
                    const reloaded = currentAuthUserId ? await getStudentByAuthUserId(currentAuthUserId) : null
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
                    const reloaded = currentAuthUserId ? await getStudentByAuthUserId(currentAuthUserId) : null
                    if (reloaded && isMounted) setStudent(reloaded)
                  } catch {
                    // ignore
                  }
                }
              },
            )
            .subscribe()

          return
        }

        if (apiResult.unauthenticated) {
          setAuthUser(null)
          setStudent(null)
          setStatus('unauthenticated')
          return
        }

        if (apiResult.errorReason === 'STUDENT_NOT_FOUND') {
          setStudent(null)
          setStatus('error')
          setErrorReason('STUDENT_NOT_FOUND')
          return
        }

        let {
          data: { user },
        } = await supabase.auth.getUser()
        debugLog('StudentProvider', {
          event: 'after_getUser',
          hasUser: !!user,
          elapsed: Date.now() - start,
        })

        if (!isMounted) {
          isLoadingRef.current = false
          return
        }

        if (!user) {
          await supabase.auth.refreshSession()
          if (!isMounted) {
            isLoadingRef.current = false
            return
          }
          ;({
            data: { user },
          } = await supabase.auth.getUser())
        }

        if (!user) {
          setAuthUser(null)
          setStudent(null)
          setStatus('unauthenticated')
          return
        }

        setAuthUser(user)
        const getStudentStart = Date.now()
        debugLog('StudentProvider', { event: 'getStudentByAuthUserId_start', userId: user.id })

        let studentData: Student | null = null
        try {
          studentData = await getStudentByAuthUserId(user.id)
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
        const currentAuthUserId = user.id

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
            },
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!isMounted) return
      if (statusRef.current !== 'loading') return
      if (!user) {
        setAuthUser(null)
        setStudent(null)
        setStatus('unauthenticated')
      } else {
        setStatus('error')
        setErrorReason('STUDENT_LOAD_TIMEOUT')
      }
    }, LOAD_TIMEOUT_MS)

    void loadStudentFull()

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
      } else if (event === 'SIGNED_IN') {
        if (!isLoadingRef.current) {
          void loadStudentFull()
        }
      } else if (event === 'TOKEN_REFRESHED') {
        if (isLoadingRef.current) return
        if (statusRef.current === 'ready' && studentRef.current) {
          void loadStudentSoft()
        } else {
          void loadStudentFull()
        }
      }
    })

    return () => {
      debugLog('StudentProvider', { event: 'cleanup', status: statusRef.current })
      isMounted = false
      isLoadingRef.current = false
      if (loadingTimeout) clearTimeout(loadingTimeout)
      authSubscription.unsubscribe()
      if (subscription) subscription.unsubscribe()
    }
  }, [retryCount, loadStudentFromApi])

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
