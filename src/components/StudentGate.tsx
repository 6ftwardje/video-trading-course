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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const existingId = getStoredStudentId()
      const existingEmail = getStoredStudentEmail()

      if (existingId && existingEmail) return

      const student = await getStudentByAuthUserId(user.id)
      if (student?.id) {
        setStoredStudent(student.id, student.email)
        setStoredStudentAccessLevel(student.access_level ?? 1)
      }
    }

    syncStudent()
  }, [])

  return null
}

