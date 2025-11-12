import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 text-white">
          <div className="w-full max-w-sm space-y-4 rounded-xl bg-gray-900 p-8 shadow-lg">
            <div className="space-y-3">
              <div className="h-12 rounded-md bg-gray-800" />
              <div className="h-4 rounded bg-gray-800" />
            </div>
            <div className="space-y-3">
              <div className="h-10 rounded bg-gray-800" />
              <div className="h-10 rounded bg-gray-800" />
              <div className="h-10 rounded bg-gray-800" />
            </div>
            <div className="h-10 rounded bg-[#7C99E3]/40" />
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}

