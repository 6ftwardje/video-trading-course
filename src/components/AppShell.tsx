'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ChatbotOverlay from '@/components/ChatbotOverlay'
import { StudentProvider } from '@/components/StudentProvider'

const HIDDEN_ROUTES = ['/login', '/confirmed', '/privacy', '/terms', '/reset-password']

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

  // Always wrap with StudentProvider, but it will only show loading state when chrome is visible
  return (
    <StudentProvider hideLoadingOnPublicRoutes={hideChrome}>
      <div className={hideChrome ? '' : 'md:pl-16'}>
        {!hideChrome && <Navbar />}
        {!hideChrome && <ChatbotOverlay />}
        <main className={`min-h-screen ${hideChrome ? '' : 'pt-16 md:pt-0'}`}>{children}</main>
        {!hideChrome && <Footer />}
      </div>
    </StudentProvider>
  )
}


