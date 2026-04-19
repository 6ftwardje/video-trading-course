export type AdminModuleRow = {
  id: number
  title: string
  description: string | null
  order: number | null
}

export type AdminLessonRow = {
  id: number
  module_id: number
  title: string
  description: string | null
  order: number | null
}

export type AdminPracticalRow = {
  id: number
  module_id: number
  title: string
  description: string | null
}
