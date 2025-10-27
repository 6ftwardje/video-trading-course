import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function HomePage() {
  const { data: modules } = await supabase.from('modules').select('*').order('order', { ascending: true })

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-crypto-orange">Video Trading Course</h1>
      <p className="text-gray-400 mb-10">Powered by Cryptoriez</p>

      <div className="space-y-4">
        {modules?.map((m) => (
          <Link
            key={m.id}
            href={`/module/${m.id}`}
            className="block bg-gray-800 border border-gray-700 p-5 rounded-xl hover:border-crypto-orange transition-all"
          >
            <h2 className="text-2xl font-semibold">{m.title}</h2>
            <p className="text-gray-400 text-sm mt-2">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
