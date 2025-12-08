'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getStoredStudentAccessLevel,
  getStoredStudentId,
  getStudentByAuthUserId,
  setStoredStudent,
  setStoredStudentAccessLevel,
} from '@/lib/student'
import { getExamById, getExamByModuleId, getExamQuestions, getModuleLessons, getWatchedLessonIds, insertExamResult, getNextModule } from '@/lib/exam'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { WaveLoader } from '@/components/ui/wave-loader'

type Question = {
  id: number
  question: string
  options: string[]
  correct_answer: string
}

const PASS_THRESHOLD = 0.75

// simpele confetti-fallback (kan vervangen worden door een lib)
function confettiLite() {
  const el = document.createElement('div')
  el.className = 'fixed inset-0 pointer-events-none animate-pulse'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 600)
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const search = useSearchParams()
  const [examId, setExamId] = useState<number>(0)
  const [moduleId, setModuleId] = useState<number>(1)

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Examen')
  const [questions, setQuestions] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [gatedBlocked, setGatedBlocked] = useState(false)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [started, setStarted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [accessLevel, setAccessLevel] = useState<number | null>(null)
  const [nextModuleId, setNextModuleId] = useState<number | null>(null)

  // keyboard shortcuts: pijltjes links/rechts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result || confirmSubmit || !started) return
      if (e.key === 'ArrowRight') setIdx(v => Math.min(v + 1, Math.max(0, questions.length - 1)))
      if (e.key === 'ArrowLeft') setIdx(v => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [questions.length, result, confirmSubmit, started])

  // Smooth scroll to top when question changes
  useEffect(() => {
    if (started && !result) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [idx, started, result])

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      const moduleIdFromUrl = Number(search.get('module') || 1)
      setModuleId(moduleIdFromUrl)
      // Try to get the newest exam for this module instead of using the URL exam_id
      const newestExam = await getExamByModuleId(moduleIdFromUrl)
      if (newestExam) {
        setExamId(newestExam.id)
      } else {
        // Fallback to URL exam_id if no exam found
        setExamId(Number(id))
      }
    }
    loadParams()
  }, [params, search])

  useEffect(() => {
    const load = async () => {
      if (!examId) return
      setLoading(true)
      setErrorMsg(null)
      setGatedBlocked(false)
      setAccessBlocked(false)

      // 0) Student check
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let studentId = getStoredStudentId()
      let level = getStoredStudentAccessLevel()

      if (user && (!studentId || level == null)) {
        const student = await getStudentByAuthUserId(user.id)
        if (student?.id) {
          setStoredStudent(student.id, student.email)
          setStoredStudentAccessLevel(student.access_level ?? 1)
          studentId = student.id
          level = student.access_level ?? 1
        }
      }

      if (level == null) level = 1
      setAccessLevel(level)

      if (level < 2) {
        setAccessBlocked(true)
        setLoading(false)
        return
      }

      if (!studentId) {
        setErrorMsg('Geen student gevonden. Log opnieuw in om verder te gaan.')
        setLoading(false)
        return
      }

      // 1) Exam info
      const exam = await getExamById(examId)
      if (!exam) {
        setErrorMsg('Examen niet gevonden.')
        setLoading(false)
        return
      }
      setTitle(exam.title || 'Examen')

      // 2) Gating: alle lessen bekeken?
      const lessons = await getModuleLessons(moduleId)
      const lessonIds = lessons.map(l => l.id)
      const watchedSet = await getWatchedLessonIds(studentId, lessonIds)

      const allWatched = lessonIds.length > 0 && lessonIds.every(id => watchedSet.has(id))
      if (!allWatched) {
        setGatedBlocked(true)
        setLoading(false)
        return
      }

      // 3) vragen laden
      const qs = await getExamQuestions(examId)
      if (!qs || qs.length === 0) {
        setErrorMsg('Geen vragen beschikbaar voor dit examen.')
        setLoading(false)
        return
      }

      setQuestions(qs as Question[])
      setIdx(0)
      setLoading(false)
    }
    load()
  }, [examId, moduleId])

  const total = questions.length
  const current = questions[idx]
  const canPrev = idx > 0
  const canNext = idx < total - 1
  const progressPct = total ? Math.round(((idx + 1) / total) * 100) : 0

  const score = useMemo(() => {
    let s = 0
    for (const q of questions) {
      if (answers[q.id] && answers[q.id] === q.correct_answer) s += 1
    }
    return s
  }, [answers, questions])

  const onSelect = (qid: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qid]: val }))
  }

  const submit = async () => {
    if (submitting || result || !examId) return
    if (!total) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const pct = score / total
      const passed = pct >= PASS_THRESHOLD
      const studentId = getStoredStudentId()
      if (studentId) {
        const { error } = await insertExamResult(studentId, examId, score, passed)
        if (error) {
          console.error('Failed to save exam result:', error)
        }
      }
      setResult({ score, passed })
      if (passed) {
        confettiLite()
        // Haal volgende module op als geslaagd
        const nextMod = await getNextModule(moduleId)
        if (nextMod) {
          setNextModuleId(nextMod.id)
        }
      }
    } catch (e) {
      setErrorMsg('Er ging iets mis bij het indienen. Probeer opnieuw.')
    } finally {
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const retry = () => {
    setAnswers({})
    setIdx(0)
    setResult(null)
    setErrorMsg(null)
    setStarted(false)
    setConfirmSubmit(false)
  }

  const handleSubmitClick = () => {
    setConfirmSubmit(true)
  }

  const handleConfirmSubmit = async () => {
    setConfirmSubmit(false)
    await submit()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WaveLoader message="Laden..." />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="space-y-4 pt-8 md:pt-12 px-4">
        <h1 className="text-2xl font-semibold text-[var(--accent)]">Examen</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <p className="text-red-400">{errorMsg}</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/module/${moduleId}`} className="px-4 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] transition">
              Terug naar module
            </Link>
            <button onClick={() => router.refresh()} className="px-4 py-2 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-[var(--accent)]">
              Opnieuw laden
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gatedBlocked) {
    return (
      <div className="space-y-4 pt-8 md:pt-12 px-4">
        <h1 className="text-2xl font-semibold text-[var(--accent)]">Examen geblokkeerd</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <p className="text-gray-300">Je moet eerst alle lessen van deze module volledig bekijken.</p>
          <Link href={`/module/${moduleId}`} className="mt-4 inline-block px-4 py-2 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 transition text-[var(--accent)]">
            Ga naar de module
          </Link>
        </div>
      </div>
    )
  }

  if (accessBlocked) {
    return (
      <div className="space-y-4 pt-8 md:pt-12 px-4">
        <h1 className="text-2xl font-semibold text-[#7C99E3]">Alleen voor Full leden</h1>
        <div className="rounded-xl border border-[#7C99E3]/40 bg-[#7C99E3]/10 p-6 text-sm text-[#7C99E3]">
          <p>
            Dit examen is enkel beschikbaar voor studenten met volledige toegang. Neem contact op met je mentor om je
            account te upgraden.
          </p>
          <Link
            href={`/module/${moduleId}`}
            className="mt-4 inline-block rounded-lg border border-[#7C99E3]/40 bg-[#7C99E3]/20 px-4 py-2 text-[#7C99E3] transition hover:bg-[#7C99E3]/30"
          >
            Terug naar de module
          </Link>
        </div>
      </div>
    )
  }


  // Intro screen before exam starts
  if (!started && !result && !loading && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto pt-8 md:pt-12 px-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 md:p-12 text-center space-y-6">
          <h1 className="text-3xl font-semibold text-[var(--accent)]">Examen: {title}</h1>
          <div className="space-y-4 text-gray-300">
            <p className="text-lg">
              Dit examen bevat <strong className="text-[var(--accent)]">{total}</strong> vragen.
            </p>
            <p>
              Je hebt minstens <strong className="text-[var(--accent)]">75%</strong> nodig om te slagen.
            </p>
            <p className="text-sm text-gray-400 pt-2">
              Zodra je start, kan je niet meer terug. Zorg dat je alle vragen beantwoord hebt voordat je indient.
            </p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition text-lg"
          >
            Start examen
          </button>
        </div>
      </div>
    )
  }

  if (result) {
    const pctText = Math.round((result.score / total) * 100)
    
    // Bepaal welke vragen juist/fout waren
    const questionResults = questions.map(q => {
      const userAnswer = answers[q.id]
      const isCorrect = userAnswer === q.correct_answer
      return {
        question: q,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect
      }
    })
    
    return (
      <div className="space-y-6 max-w-3xl mx-auto pt-8 md:pt-12 px-4">
        <h1 className="text-3xl font-semibold text-[var(--accent)] text-center">{title}</h1>
        <div className={`bg-[var(--card)] border rounded-xl p-8 md:p-10 ${result.passed ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
          <div className="text-center space-y-4">
            <h2 className={`text-3xl font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
              {result.passed ? '✅ Geslaagd!' : '❌ Niet geslaagd'}
            </h2>
            <div className="space-y-2">
              <p className="text-xl text-gray-300">
                Je score: <span className="font-bold text-[var(--accent)]">{result.score}/{total}</span>
              </p>
              <p className="text-2xl font-semibold text-[var(--accent)]">{pctText}%</p>
            </div>
            {result.passed ? (
              <p className="text-gray-400 pt-2">Je hebt deze module succesvol afgerond. Ga verder naar de volgende module →</p>
            ) : (
              <p className="text-gray-400 pt-2">Je hebt minimaal 75% nodig. Probeer opnieuw wanneer je er klaar voor bent.</p>
            )}
          </div>

          {/* Vraag breakdown */}
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4 text-white">Vraag overzicht</h3>
            <div className="space-y-4">
              {questionResults.map((qr, idx) => (
                <div
                  key={qr.question.id}
                  className={`p-4 rounded-lg border ${
                    qr.isCorrect
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      qr.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {qr.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white mb-2">
                        Vraag {idx + 1}: {qr.question.question}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className={qr.isCorrect ? 'text-green-300' : 'text-red-300'}>
                          Jouw antwoord: <span className="font-medium">{qr.userAnswer || 'Niet beantwoord'}</span>
                        </p>
                        {!qr.isCorrect && (
                          <p className="text-green-300">
                            Correct antwoord: <span className="font-medium">{qr.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {result.passed ? (
              <>
                {nextModuleId ? (
                  <Link 
                    href={`/module/${nextModuleId}`} 
                    className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition text-center"
                  >
                    Ga naar volgende module →
                  </Link>
                ) : null}
                <Link 
                  href={`/module/${moduleId}`} 
                  className="px-6 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] transition text-center font-medium"
                >
                  Terug naar module
                </Link>
              </>
            ) : (
              <>
                <button 
                  onClick={retry} 
                  className="px-6 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] transition font-medium"
                >
                  Opnieuw proberen
                </button>
                <Link 
                  href={`/module/${moduleId}`} 
                  className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition text-center"
                >
                  Terug naar module
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!current || !started) {
    return (
      <div className="space-y-4 pt-8 md:pt-12 px-4">
        <h1 className="text-2xl font-semibold text-[var(--accent)]">{title}</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <p className="text-gray-400">Geen vragen beschikbaar.</p>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 pt-8 md:pt-12 px-4">
        {/* Progress bar at top */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="font-medium text-white">Vraag {idx + 1} van {total}</span>
            <span>Multiple choice</span>
          </div>
          <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Mini-map navigation */}
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setIdx(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                answers[q.id] 
                  ? 'bg-[var(--accent)]' 
                  : 'bg-[var(--muted)] hover:bg-[var(--border)]'
              } ${idx === i ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
              aria-label={`Ga naar vraag ${i + 1}`}
            />
          ))}
        </div>

        {/* Question card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 text-white">{current.question}</h2>
          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const selected = answers[current.id] === opt
              return (
                <button
                  key={i}
                  onClick={() => onSelect(current.id, opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between font-medium
                    ${selected
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--muted)] text-gray-300'
                    }
                  `}
                  aria-pressed={selected}
                >
                  <span>{opt}</span>
                  {selected && <span className="text-[var(--accent)] text-xl">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Navigation - sticky on mobile */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[var(--border)]">
            <button
              onClick={() => setIdx(v => Math.max(0, v - 1))}
              disabled={!canPrev}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Vorige
            </button>

            <div className="text-sm text-gray-400">
              {answeredCount} van {total} beantwoord
            </div>

            {canNext ? (
              <button
                onClick={() => setIdx(v => Math.min(total - 1, v + 1))}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition"
              >
                Volgende
              </button>
            ) : (
              <button
                onClick={handleSubmitClick}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Indienen…' : 'Examen indienen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation modal overlay */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setConfirmSubmit(false)}>
          <div 
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center space-y-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white">Examen indienen?</h2>
            <p className="text-gray-400">Ben je zeker dat je je examen wilt indienen? Je kan daarna niets meer wijzigen.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={handleConfirmSubmit} 
                disabled={submitting}
                className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Indienen…' : 'Ja, indienen'}
              </button>
              <button 
                onClick={() => setConfirmSubmit(false)} 
                className="px-6 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] transition"
              >
                Annuleer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

