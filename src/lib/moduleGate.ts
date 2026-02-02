import { getSupabaseClient } from '@/lib/supabaseClient'

type ModuleRow = {
  id: number
  title: string | null
  order: number | null
}

export type ModuleGateStatus = {
  isLockedByExam: boolean
  previousModule: ModuleRow | null
}

function getPreviousModulesByOrder(modules: ModuleRow[]) {
  const moduleByOrder = new Map<number, ModuleRow>()
  for (const mod of modules) {
    if (typeof mod.order === 'number') {
      moduleByOrder.set(mod.order, mod)
    }
  }

  const previousByModuleId = new Map<number, ModuleRow>()
  for (const mod of modules) {
    if (typeof mod.order === 'number' && mod.order > 1) {
      const prev = moduleByOrder.get(mod.order - 1)
      if (prev) {
        previousByModuleId.set(mod.id, prev)
      }
    }
  }

  return previousByModuleId
}

async function getPassedExamIdsForModules(studentId: string, moduleIds: number[]) {
  const supabase = getSupabaseClient()

  const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select('id,module_id')
    .in('module_id', moduleIds)

  if (examsError) {
    console.error('[moduleGate] Error fetching exams:', examsError)
    return { examIdsByModuleId: new Map<number, number[]>(), passedExamIds: new Set<number>() }
  }

  const examIdsByModuleId = new Map<number, number[]>()
  for (const exam of exams || []) {
    if (!exam.module_id) continue
    const list = examIdsByModuleId.get(exam.module_id) ?? []
    list.push(exam.id)
    examIdsByModuleId.set(exam.module_id, list)
  }

  const allExamIds = Array.from(new Set((exams || []).map(exam => exam.id)))
  if (allExamIds.length === 0) {
    return { examIdsByModuleId, passedExamIds: new Set<number>() }
  }

  const { data: results, error: resultsError } = await supabase
    .from('exam_results')
    .select('exam_id')
    .eq('student_id', studentId)
    .eq('passed', true)
    .in('exam_id', allExamIds)

  if (resultsError) {
    console.error('[moduleGate] Error fetching exam results:', resultsError)
    return { examIdsByModuleId, passedExamIds: new Set<number>() }
  }

  const passedExamIds = new Set((results || []).map(r => r.exam_id))
  return { examIdsByModuleId, passedExamIds }
}

export async function getModuleGateStatuses(
  modules: ModuleRow[],
  studentId: string | null,
  accessLevel: number
): Promise<Map<number, ModuleGateStatus>> {
  const result = new Map<number, ModuleGateStatus>()
  if (!modules || modules.length === 0) return result

  if (!studentId || accessLevel < 2) {
    for (const mod of modules) {
      result.set(mod.id, { isLockedByExam: false, previousModule: null })
    }
    return result
  }

  const previousByModuleId = getPreviousModulesByOrder(modules)
  const previousModuleIds = Array.from(
    new Set(Array.from(previousByModuleId.values()).map(mod => mod.id))
  )

  const { examIdsByModuleId, passedExamIds } = await getPassedExamIdsForModules(studentId, previousModuleIds)

  for (const mod of modules) {
    const previousModule = previousByModuleId.get(mod.id) ?? null
    if (!previousModule) {
      result.set(mod.id, { isLockedByExam: false, previousModule: null })
      continue
    }

    const examIds = examIdsByModuleId.get(previousModule.id) ?? []
    if (examIds.length === 0) {
      result.set(mod.id, { isLockedByExam: false, previousModule })
      continue
    }

    const hasPassed = examIds.some(examId => passedExamIds.has(examId))
    result.set(mod.id, { isLockedByExam: !hasPassed, previousModule })
  }

  return result
}

export async function getModuleGateStatus(
  modules: ModuleRow[],
  currentModuleId: number,
  studentId: string | null,
  accessLevel: number
): Promise<ModuleGateStatus> {
  const map = await getModuleGateStatuses(modules, studentId, accessLevel)
  return map.get(currentModuleId) ?? { isLockedByExam: false, previousModule: null }
}
