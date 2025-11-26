import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ hasAccess: false, error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ hasAccess: false }, { status: 401 })
    }

    // Get student record to check access level
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('access_level')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return NextResponse.json({ hasAccess: false }, { status: 403 })
    }

    if (!student) {
      return NextResponse.json({ hasAccess: false }, { status: 403 })
    }

    // Check if user has level 2 or higher (premium access)
    const hasAccess = (student.access_level ?? 1) >= 2

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Error checking mentorship access:', error)
    return NextResponse.json({ hasAccess: false, error: String(error) }, { status: 500 })
  }
}

