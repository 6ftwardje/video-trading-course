'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getStoredStudentId } from '@/lib/student'
import { getExamById, getExamByModuleId, getExamQuestions, getModuleLessons, getWatchedLessonIds, insertExamResult } from '@/lib/exam'

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

  // keyboard shortcuts: pijltjes links/rechts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result) return
      if (e.key === 'ArrowRight') setIdx(v => Math.min(v + 1, Math.max(0, questions.length - 1)))
      if (e.key === 'ArrowLeft') setIdx(v => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [questions.length, result])

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

      // 0) Student check
      const studentId = getStoredStudentId()
      if (!studentId) {
        setErrorMsg('Geen student gevonden. Herlaad de pagina of vul je e-mail opnieuw in.')
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
      if (passed) confettiLite()
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
  }

  if (loading) return <p className="text-gray-400">Laden…</p>

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-crypto-orange">Examen</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-red-400">{errorMsg}</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/module/${moduleId}`} className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700">
              Terug naar module
            </Link>
            <button onClick={() => router.refresh()} className="px-4 py-2 rounded-md bg-crypto-blue/20 border border-crypto-blue/40 hover:bg-crypto-blue/30">
              Opnieuw laden
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gatedBlocked) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-crypto-orange">Examen geblokkeerd</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-300">Je moet eerst alle lessen van deze module volledig bekijken.</p>
          <Link href={`/module/${moduleId}`} className="mt-4 inline-block px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30">
            Ga naar de module
          </Link>
        </div>
      </div>
    )
  }

  if (result) {
    const pctText = Math.round((result.score / total) * 100)
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-semibold text-crypto-orange">{title}</h1>
          <div className="w-44 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-crypto-blue" style={{ width: `${100}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-lg">
            Je score: <span className="font-semibold">{result.score}/{total}</span> ({pctText}%)
          </p>
          {result.passed ? (
            <p className="mt-2 text-green-400">✅ Geslaagd! Knap werk.</p>
          ) : (
            <p className="mt-2 text-red-400">❌ Niet geslaagd. Je hebt minstens 75% nodig om te slagen.</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={retry} className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700">
              Opnieuw proberen
            </button>
            <Link href={`/module/${moduleId}`} className="px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30">
              Terug naar module
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-crypto-orange">{title}</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400">Geen vragen beschikbaar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-crypto-orange">{title}</h1>
          <p className="text-sm text-gray-400">Vraag {idx + 1} van {total}</p>
        </div>
        <div className="w-44 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-crypto-blue" style={{ width: `${Math.max(5, progressPct)}%` }} />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="font-medium mb-4">{current.question}</p>
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const selected = answers[current.id] === opt
            return (
              <button
                key={i}
                onClick={() => onSelect(current.id, opt)}
                className={`w-full text-left px-4 py-2 rounded-md border transition
                  ${selected ? 'border-crypto-orange bg-crypto-orange/10' : 'border-gray-700 hover:bg-gray-800'}
                `}
                aria-pressed={selected}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIdx(v => Math.max(0, v - 1))}
            disabled={!canPrev}
            className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 disabled:opacity-50"
          >
            Vorige
          </button>

          {canNext ? (
            <button
              onClick={() => setIdx(v => Math.min(total - 1, v + 1))}
              className="px-4 py-2 rounded-md bg-crypto-blue/20 border border-crypto-blue/40 hover:bg-crypto-blue/30"
            >
              Volgende
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-crypto-orange/20 border border-crypto-orange/40 hover:bg-crypto-orange/30 disabled:opacity-50"
            >
              {submitting ? 'Indienen…' : 'Examen indienen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

