import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', id)
    .order('order', { ascending: true })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-crypto-orange">Lessen</h1>
      <div className="space-y-4">
        {lessons?.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            className="block bg-gray-800 border border-gray-700 p-4 rounded-lg hover:border-crypto-blue transition-all"
          >
            <h2 className="text-xl">{lesson.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

