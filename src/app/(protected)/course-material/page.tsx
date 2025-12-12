'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useStudent } from '@/components/StudentProvider'
import Container from '@/components/ui/Container'
import { Download } from 'lucide-react'
import { WaveLoader } from '@/components/ui/wave-loader'

export default function CourseMaterialPage() {
  const { student, status } = useStudent()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accessLevel = student?.access_level ?? 1
  const studentId = student?.id ?? null

  useEffect(() => {
    const load = async () => {
      try {
        if (status !== 'ready' || !student) {
          if (status === 'unauthenticated') {
            setError('Je moet ingelogd zijn om het cursusmateriaal te bekijken.')
          }
          setLoading(false)
          return
        }

        // Verify user is authenticated first
        const supabase = createClient()

        console.log('[CourseMaterial] Access level:', accessLevel, 'Student ID:', studentId, 'User ID:', student.auth_user_id)

        if (accessLevel < 2) {
          console.log('[CourseMaterial] Access denied: access_level < 2')
          setLoading(false)
          return
        }

        // Fetch signed URL from Supabase Storage
        // The RLS policy will check that the user has access_level >= 2
        console.log('[CourseMaterial] Attempting to create signed URL for cursus.pdf')
        const { data, error: storageError } = await supabase
          .storage
          .from('course-materials')
          .createSignedUrl('cursus.pdf', 3600)

        if (storageError) {
          // Log all error properties for debugging
          // Try to extract all possible error information
          const errorObj = storageError as any
          const errorDetails = {
            message: storageError.message || errorObj.message,
            name: storageError.name || errorObj.name,
            statusCode: errorObj.statusCode || errorObj.status,
            status: errorObj.status,
            error: errorObj.error,
            context: errorObj.context,
            code: errorObj.code,
            details: errorObj.details,
            hint: errorObj.hint,
            toString: String(storageError),
            studentId,
            accessLevel,
            authUserId: student.auth_user_id,
          }
          
          // Try to stringify the error object
          let errorString = ''
          try {
            errorString = JSON.stringify(storageError, (key, value) => {
              if (value instanceof Error) {
                return {
                  name: value.name,
                  message: value.message,
                  stack: value.stack,
                }
              }
              return value
            }, 2)
          } catch (e) {
            errorString = String(storageError)
          }
          
          console.error('[CourseMaterial] Error fetching PDF:', errorDetails)
          console.error('[CourseMaterial] Full error object:', errorString)
          
          // Check for specific error types
          // StorageApiError might have different structure
          const errorMessage = (
            storageError.message || 
            errorObj.message || 
            errorObj.error?.message ||
            String(storageError) || 
            ''
          ).toLowerCase()
          const statusCode = errorObj.statusCode || errorObj.status || errorObj.error?.statusCode
          const httpStatus = errorObj.status || errorObj.error?.status
          
          // Log the error name to identify the error type
          if (errorObj.name) {
            console.error('[CourseMaterial] Error name:', errorObj.name)
          }
          
          // Check if this is an "Object not found" error
          const isNotFoundError = (
            statusCode === 404 ||
            statusCode === '404' ||
            errorMessage.includes('not found') ||
            errorMessage.includes('object not found') ||
            errorMessage.includes('the resource was not found')
          )
          
          // HTTP 400 with "Object not found" typically means RLS policy blocked access
          // Supabase returns 400 Bad Request when RLS denies access to prevent information leakage
          const isRLSPolicyIssue = (
            (httpStatus === 400 && isNotFoundError) ||
            (httpStatus === 400 && errorMessage.includes('object not found'))
          )
          
          if (
            statusCode === 403 ||
            statusCode === '403' ||
            httpStatus === 403 ||
            errorMessage.includes('permission denied') ||
            errorMessage.includes('access denied') ||
            errorMessage.includes('policy violation')
          ) {
            setError('Je hebt geen toegang tot dit cursusmateriaal. Controleer of je account het juiste toegangsniveau heeft (Full of Mentor).')
          } else if (isRLSPolicyIssue || (isNotFoundError && accessLevel >= 2)) {
            // "Object not found" with access_level >= 2 or HTTP 400 means RLS policy issue
            setError('Het bestand is niet toegankelijk vanwege beveiligingsinstellingen. Je account heeft wel het juiste toegangsniveau, maar de beveiligingspolicy blokkeert de toegang. Neem contact op met je mentor om de Storage RLS policies te controleren.')
          } else if (isNotFoundError) {
            setError('Het cursus PDF-bestand is nog niet beschikbaar. Neem contact op met je mentor als je denkt dat dit een fout is.')
          } else if (
            errorMessage.includes('Bucket not found') ||
            errorMessage.includes('bucket does not exist')
          ) {
            setError('De opslaglocatie voor cursusmateriaal is nog niet geconfigureerd. Neem contact op met je mentor.')
          } else {
            // Generic error - log the full error for debugging
            console.error('[CourseMaterial] Unknown error type:', storageError)
            setError(`Er is een fout opgetreden bij het laden van het PDF-bestand. ${errorMessage ? `Fout: ${errorMessage}` : 'Probeer het later opnieuw.'}`)
          }
          setLoading(false)
          return
        }

        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl)
        } else {
          setError('PDF-bestand niet gevonden. Neem contact op met je mentor als je denkt dat dit een fout is.')
        }
      } catch (err) {
        console.error('Unexpected error loading course material:', err)
        setError('Er is een onverwachte fout opgetreden.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [status, student, accessLevel, studentId])

  const isBasic = accessLevel < 2

  if (loading) {
    return (
      <Container className="pt-8 md:pt-12 pb-16">
        <div className="flex items-center justify-center py-12">
          <WaveLoader message="Laden..." />
        </div>
      </Container>
    )
  }

  if (isBasic) {
    return (
      <Container className="pt-8 md:pt-12 pb-16">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-6">Cursus PDF</h1>
        <div className="rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-4 text-sm text-[#7C99E3]">
          🔒 Deze cursus is alleen beschikbaar voor leden met volledige toegang. Neem contact op met je mentor om te upgraden
          en toegang te krijgen tot het cursusmateriaal.
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="pt-8 md:pt-12 pb-16">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-6">Cursus PDF</h1>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-[var(--text-dim)]">{error}</p>
        </div>
      </Container>
    )
  }

  if (!pdfUrl) {
    return (
      <Container className="pt-8 md:pt-12 pb-16">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-6">Cursus PDF</h1>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-[var(--text-dim)]">PDF-bestand niet beschikbaar.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="pt-8 md:pt-12 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-4">Cursus PDF</h1>
      </div>

      <div className="space-y-6">
        {/* PDF Preview */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full"
            style={{ height: '80vh' }}
            title="Cursus PDF"
          />
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <a
            href={pdfUrl}
            download="cursus.pdf"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-medium hover:opacity-90 transition"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </a>
        </div>
      </div>
    </Container>
  )
}

