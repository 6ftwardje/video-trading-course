'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import StudentGate from '@/components/StudentGate'
import ChatbotOverlay from '@/components/ChatbotOverlay'

const HIDDEN_ROUTES = ['/login', '/confirmed']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideChrome = useMemo(
    () => {
      // Hide chrome for root path exactly
      if (pathname === '/') return true
      // Hide chrome for other hidden routes
      return HIDDEN_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
    },
    [pathname],
  )

  return (
    <div className={hideChrome ? '' : 'md:pl-16'}>
      {!hideChrome && <StudentGate />}
      {!hideChrome && <Navbar />}
      {!hideChrome && <ChatbotOverlay />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  )
}


