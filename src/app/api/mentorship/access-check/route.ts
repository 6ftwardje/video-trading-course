import { NextResponse, type NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
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

