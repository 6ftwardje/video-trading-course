import { getSupabaseClient } from '@/lib/supabaseClient'

type Exam = {
  id: number
  title: string | null
  module_id: number | null
}

type Lesson = {
  id: number
  module_id: number | null
  order: number | null
}

export async function getExamByModuleId(moduleId: number): Promise<Exam | null> {
  try {
    const supabase = getSupabaseClient()
    // First try to get active exam if 'active' column exists
    const { data: activeData, error: activeError } = await supabase
      .from('exams')
      .select('id,title,module_id')
      .eq('module_id', moduleId)
      .maybeSingle()
    
    // Check if error is due to missing 'active' column
    if (activeError && activeError.code !== 'PGRST116') {
      console.error('Error fetching active exam:', activeError)
      // Continue to fallback
    } else if (!activeError && activeData) {
      return activeData as Exam
    }
    
    // Fallback: get the newest exam (highest ID)
    const { data, error } = await supabase
      .from('exams')
      .select('id,title,module_id')
      .eq('module_id', moduleId)
      .order('id', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error fetching exam for module:', moduleId, error.message)
      return null
    }
    
    // Return the newest exam or null
    return data && data.length > 0 ? (data[0] as Exam) : null
  } catch (err) {
    console.error('Exception fetching exam:', err)
    return null
  }
}

export async function getExamById(examId: number): Promise<Exam | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('exams')
      .select('id,title,module_id')
      .eq('id', examId)
      .maybeSingle()
    if (error || !data) {
      console.error('Exam not found for ID:', examId)
      return null
    }
    console.log('Found exam:', { id: data.id, title: data.title, module_id: data.module_id })
    return data as Exam
  } catch (err) {
    console.error('Exception fetching exam by ID:', err)
    return null
  }
}

export async function getExamQuestions(examId: number) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('exam_questions')
      .select('id,question,options,correct_answer')
      .eq('exam_id', examId)
      .order('id', { ascending: true })
    if (error) {
      console.error('Error fetching exam questions:', error)
      return []
    }
    
    console.log(`Found ${data?.length || 0} questions for exam ${examId}`)
    if (data && data.length > 0) {
      console.log('First question sample:', { id: data[0].id, question: data[0].question })
    }
    
    // Supabase automatically converts jsonb to array
    return (data || []) as Array<{
      id: number
      question: string
      options: string[]
      correct_answer: string
    }>
  } catch (err) {
    console.error('Exception fetching exam questions:', err)
    return []
  }
}

export async function getModuleLessons(moduleId: number): Promise<Lesson[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('id,module_id,"order"')
    .eq('module_id', moduleId)
  if (error) return []
  // Sort manually to avoid PostgREST query string issues with 'order' column
  const sorted = data ? [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
  return sorted as Lesson[]
}

export async function getWatchedLessonIds(studentId: string, lessonIds: number[]) {
  if (!studentId || lessonIds.length === 0) return new Set<number>()
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('student_id', studentId)
    .eq('watched', true)
    .in('lesson_id', lessonIds)
  if (error) return new Set<number>()
  return new Set((data || []).map((r: any) => r.lesson_id))
}

export async function insertExamResult(studentId: string, examId: number, score: number, passed: boolean) {
  try {
    console.log(`[insertExamResult] Inserting: studentId=${studentId}, examId=${examId}, score=${score}, passed=${passed}`)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('exam_results')
      .insert([{ student_id: studentId, exam_id: examId, score, passed }])
      .select('id')
      .single()
    
    if (error) {
      console.error('[insertExamResult] Error inserting exam result:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { data: null, error }
    }
    
    console.log(`[insertExamResult] Successfully inserted exam result:`, data)
    return { data, error: null }
  } catch (err) {
    console.error('[insertExamResult] Exception:', err instanceof Error ? err.message : String(err))
    return { data: null, error: err }
  }
}

type ExamResult = {
  id: number
  student_id: string
  exam_id: number
  score: number
  passed: boolean
  created_at?: string
}

export async function getExamResultForModule(studentId: string, moduleId: number): Promise<ExamResult | null> {
  try {
    if (!studentId) {
      console.log('[getExamResultForModule] No studentId provided')
      return null
    }
    
    const supabase = getSupabaseClient()
    
    // First get the exam for this module
    const exam = await getExamByModuleId(moduleId)
    if (!exam) {
      console.log(`[getExamResultForModule] No exam found for module ${moduleId}`)
      return null
    }
    
    console.log(`[getExamResultForModule] Looking for exam result: studentId=${studentId}, examId=${exam.id}, moduleId=${moduleId}`)
    
    // Get the exam result for this student and exam
    const { data, error } = await supabase
      .from('exam_results')
      .select('id,student_id,exam_id,score,passed')
      .eq('student_id', studentId)
      .eq('exam_id', exam.id)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      // Only log if it's not a "not found" error (PGRST116)
      if (error.code !== 'PGRST116') {
        console.error('[getExamResultForModule] Error fetching exam result:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        console.log(`[getExamResultForModule] No exam result found (PGRST116) for studentId=${studentId}, examId=${exam.id}`)
      }
      return null
    }
    
    if (data) {
      console.log(`[getExamResultForModule] Found exam result:`, { 
        id: data.id, 
        student_id: data.student_id, 
        exam_id: data.exam_id, 
        score: data.score, 
        passed: data.passed 
      })
    } else {
      console.log(`[getExamResultForModule] No exam result data returned`)
    }
    
    return data as ExamResult | null
  } catch (err) {
    console.error('[getExamResultForModule] Exception:', err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function hasPassedExamForModule(studentId: string, moduleId: number): Promise<boolean> {
  if (!studentId) {
    console.log('[hasPassedExamForModule] No studentId provided')
    return false
  }
  
  try {
    const supabase = getSupabaseClient()
    
    // Get the exam for this module
    const exam = await getExamByModuleId(moduleId)
    if (!exam) {
      console.log(`[hasPassedExamForModule] No exam found for module ${moduleId}`)
      return false
    }
    
    // Try the direct query first
    const result = await getExamResultForModule(studentId, moduleId)
    if (result && result.passed === true) {
      console.log(`[hasPassedExamForModule] Found passed result via direct query`)
      return true
    }
    
    // Fallback: query all exam results for this student and exam, check if any passed
    console.log(`[hasPassedExamForModule] Trying fallback query for studentId=${studentId}, examId=${exam.id}`)
    const { data: allResults, error } = await supabase
      .from('exam_results')
      .select('id,student_id,exam_id,score,passed')
      .eq('student_id', studentId)
      .eq('exam_id', exam.id)
      .eq('passed', true)
      .limit(1)
    
    if (error) {
      console.error('[hasPassedExamForModule] Error in fallback query:', {
        message: error.message,
        details: error.details,
        code: error.code
      })
      return false
    }
    
    const hasPassedResults = Array.isArray(allResults) && allResults.length > 0
    const hasPassedFromResult = result ? result.passed === true : false
    const hasPassed = hasPassedResults || hasPassedFromResult
    console.log(`[hasPassedExamForModule] Final result: studentId=${studentId}, moduleId=${moduleId}, hasPassed=${hasPassed}, foundResults=${Array.isArray(allResults) ? allResults.length : 0}`)
    return hasPassed
  } catch (err) {
    console.error('[hasPassedExamForModule] Exception:', err instanceof Error ? err.message : String(err))
    return false
  }
}

type Module = {
  id: number
  title: string | null
  description: string | null
  order: number | null
}

// Debug function to get all exam results for a student
export async function getAllExamResultsForStudent(studentId: string) {
  try {
    if (!studentId) return []
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('exam_results')
      .select('id,student_id,exam_id,score,passed,submitted_at')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
    
    if (error) {
      console.error('[getAllExamResultsForStudent] Error:', error)
      return []
    }
    
    console.log(`[getAllExamResultsForStudent] Found ${data?.length || 0} exam results for studentId=${studentId}`)
    return data || []
  } catch (err) {
    console.error('[getAllExamResultsForStudent] Exception:', err)
    return []
  }
}

export async function getNextModule(currentModuleId: number): Promise<Module | null> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current module to find its order
    const { data: currentModule, error: currentError } = await supabase
      .from('modules')
      .select('id,order')
      .eq('id', currentModuleId)
      .maybeSingle()
    
    if (currentError || !currentModule) {
      console.error('Error fetching current module:', currentError)
      return null
    }
    
    const currentOrder = currentModule.order ?? 9999
    
    // Get all modules and find the next one
    const { data: allModules, error: allError } = await supabase
      .from('modules')
      .select('id,title,description,order')
    
    if (allError) {
      console.error('Error fetching modules:', allError)
      return null
    }
    
    // Sort by order and find next module
    const sorted = (allModules || []).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    const nextModule = sorted.find(m => (m.order ?? 9999) > currentOrder)
    
    return nextModule as Module | null
  } catch (err) {
    console.error('Exception fetching next module:', err)
    return null
  }
}

/**
 * Batch function to fetch exam results for multiple modules in parallel.
 * Returns a Map<moduleId, boolean> indicating if each module's exam was passed.
 */
export async function getExamResultsForModules(
  studentId: string,
  moduleIds: number[]
): Promise<Map<number, boolean>> {
  if (!studentId || moduleIds.length === 0) {
    return new Map()
  }

  try {
    const supabase = getSupabaseClient()

    // Get all exams for these modules in one query
    // Note: We use the same logic as getExamByModuleId - get newest exam per module
    // Since we can't use order/limit per module easily, we'll fetch all and process
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('id,module_id')
      .in('module_id', moduleIds)

    if (examsError) {
      console.error('[getExamResultsForModules] Error fetching exams:', examsError)
      return new Map()
    }

    if (!exams || exams.length === 0) {
      // No exams found for these modules
      return new Map(moduleIds.map(id => [id, false]))
    }

    // Get the newest exam per module (highest ID, since we can't use order easily in batch)
    const examByModuleId = new Map<number, number>()
    for (const exam of exams) {
      if (exam.module_id) {
        const existing = examByModuleId.get(exam.module_id)
        if (!existing || exam.id > existing) {
          examByModuleId.set(exam.module_id, exam.id)
        }
      }
    }

    const examIds = Array.from(examByModuleId.values())

    if (examIds.length === 0) {
      return new Map(moduleIds.map(id => [id, false]))
    }

    // Get all passed exam results for these exams in one query
    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select('exam_id')
      .eq('student_id', studentId)
      .eq('passed', true)
      .in('exam_id', examIds)

    if (resultsError) {
      console.error('[getExamResultsForModules] Error fetching exam results:', resultsError)
      return new Map(moduleIds.map(id => [id, false]))
    }

    // Create a set of exam IDs that were passed
    const passedExamIds = new Set((results || []).map(r => r.exam_id))

    // Create a map from module ID to exam ID
    const moduleToExamId = new Map<number, number>()
    examByModuleId.forEach((examId, moduleId) => {
      moduleToExamId.set(moduleId, examId)
    })

    // Build the result map: moduleId -> boolean (passed)
    const resultMap = new Map<number, boolean>()
    for (const moduleId of moduleIds) {
      const examId = moduleToExamId.get(moduleId)
      resultMap.set(moduleId, examId !== undefined && passedExamIds.has(examId))
    }

    return resultMap
  } catch (err) {
    console.error('[getExamResultsForModules] Exception:', err instanceof Error ? err.message : String(err))
    return new Map(moduleIds.map(id => [id, false]))
  }
}