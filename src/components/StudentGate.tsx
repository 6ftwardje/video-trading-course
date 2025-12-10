'use client'

import { useEffect } from 'react'
import {
  getStoredStudentId,
  getStoredStudentEmail,
  getStoredStudentName,
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
      const existingName = getStoredStudentName()

      if (existingId && existingEmail) {
        // If we have id and email but no name, try to sync name
        if (!existingName) {
          const student = await getStudentByAuthUserId(session.user.id)
          if (student?.id && student.name) {
            setStoredStudent(student.id, student.email, student.name)
          }
        }
        return
      }

      const student = await getStudentByAuthUserId(session.user.id)
      if (student?.id) {
        // If student has no name but user_metadata has full_name, sync it
        let nameToStore = student.name
        if (!nameToStore && session.user.user_metadata?.full_name) {
          const fullName = session.user.user_metadata.full_name as string
          // Update the database
          await supabase
            .from('students')
            .update({ name: fullName })
            .eq('id', student.id)
          nameToStore = fullName
        }
        setStoredStudent(student.id, student.email, nameToStore ?? null)
        setStoredStudentAccessLevel(student.access_level ?? 1)
      }
    }

    syncStudent()
  }, [])

  return null
}

