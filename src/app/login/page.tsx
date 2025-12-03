import { Suspense } from 'react'
import LoginClient from './LoginClient'
import { WaveLoader } from '@/components/ui/wave-loader'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
          <WaveLoader message="Laden..." />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}

