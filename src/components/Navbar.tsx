'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const pathname = usePathname()

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const studentId = getStoredStudentId()
        const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', 1)
        
        const total = lessons?.length || 0
        let completed = 0
        
        if (studentId) {
          const { data: progressData } = await supabase
            .from('progress')
            .select('lesson_id')
            .eq('watched', true)
            .eq('student_id', studentId)
            .in('lesson_id', (lessons || []).map(l => l.id))
          
          completed = progressData?.length || 0
        }
        
        setProgress({ completed, total })
      } catch (error) {
        console.log('Progress fetch error:', error)
      }
    }

    fetchProgress()
  }, [pathname])

  const progressPercentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/module/1', label: 'Module', icon: BookOpen },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-crypto-dark border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-crypto-orange text-xl font-bold">Cryptoriez</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    active
                      ? 'text-crypto-orange border-b-2 border-crypto-orange'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Progress */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-crypto-blue transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-300 whitespace-nowrap">
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-3 space-y-2 bg-gray-900 border-t border-gray-800">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  active
                    ? 'text-crypto-orange bg-crypto-orange/10 border-l-2 border-crypto-orange'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
          
          {/* Mobile Progress */}
          <div className="px-4 py-3 border-t border-gray-700 mt-2">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-crypto-blue transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-300 whitespace-nowrap font-medium">
                {progress.completed}/{progress.total} lessen
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

