'use client'

import { useEffect } from 'react'
import {
  getStoredStudentId,
  getStoredStudentEmail,
  setStoredStudent,
  setStoredStudentAccessLevel,
  getStudentByAuthUserId,
} from '@/lib/student'
import { getSupabaseClient } from '@/lib/supabaseClient'

export default function StudentGate() {
  useEffect(() => {
    const syncStudent = async () => {
      const supabase = getSupabaseClient()
      // Use getSession() instead of getUser() to avoid unnecessary server requests
      // Only validate with server if we actually need to sync student data
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) return

      const existingId = getStoredStudentId()
      const existingEmail = getStoredStudentEmail()

      if (existingId && existingEmail) return

      const student = await getStudentByAuthUserId(session.user.id)
      if (student?.id) {
        setStoredStudent(student.id, student.email)
        setStoredStudentAccessLevel(student.access_level ?? 1)
      }
    }

    syncStudent()
  }, [])

  return null
}

