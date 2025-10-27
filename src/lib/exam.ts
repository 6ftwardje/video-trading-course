import { supabase } from '@/lib/supabaseClient'

export async function getExamByModuleId(moduleId: number) {
  try {
    // First try to get active exam if 'active' column exists
    const { data: activeData, error: activeError } = await supabase
      .from('exams')
      .select('id,title,module_id,active')
      .eq('module_id', moduleId)
      .eq('active', true)
      .maybeSingle()
    
    // If active exam exists, return it
    if (!activeError && activeData) {
      console.log('Using active exam:', activeData.id)
      return activeData
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
    return data && data.length > 0 ? data[0] : null
  } catch (err) {
    console.error('Exception fetching exam:', err)
    return null
  }
}

export async function getExamById(examId: number) {
  try {
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
    return data
  } catch (err) {
    console.error('Exception fetching exam by ID:', err)
    return null
  }
}

export async function getExamQuestions(examId: number) {
  try {
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

export async function getModuleLessons(moduleId: number) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id,module_id,"order"')
    .eq('module_id', moduleId)
    .order('order', { ascending: true })
  if (error) return []
  return data || []
}

export async function getWatchedLessonIds(studentId: string, lessonIds: number[]) {
  if (!studentId || lessonIds.length === 0) return new Set<number>()
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
    const { data, error } = await supabase
      .from('exam_results')
      .insert([{ student_id: studentId, exam_id: examId, score, passed }])
      .select('id')
      .single()
    
    if (error) {
      console.error('Error inserting exam result:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Exception inserting exam result:', err)
    return { data: null, error: err }
  }
}

