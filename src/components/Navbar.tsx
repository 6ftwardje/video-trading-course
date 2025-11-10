"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/Brand";
import Container from "@/components/ui/Container";
import { useState, useEffect } from "react";
import { Menu, X, Home, BookOpen } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { getStoredStudentId } from '@/lib/student'

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const supabase = getSupabaseClient()
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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <Container className="h-16 flex items-center justify-between">
        <BrandLogo />

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map(l => {
            const active = isActive(l.href);
            const Icon = l.icon;
            return (
              <Link 
                key={l.href} 
                href={l.href} 
                className={`flex items-center gap-2 ${active ? "text-[var(--accent)]" : "text-[var(--text-dim)] hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Progress */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 bg-[var(--muted)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-[var(--text-dim)] whitespace-nowrap">
              {progress.completed}/{progress.total}
            </span>
          </div>
        </div>

        <button 
          className="md:hidden text-[var(--text-dim)] hover:text-white p-2" 
          onClick={()=>setOpen(v=>!v)} 
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </Container>

      {/* mobile */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <Container className="py-3 flex flex-col gap-2">
            {links.map(l => {
              const active = isActive(l.href);
              const Icon = l.icon;
              return (
                <Link 
                  key={l.href} 
                  href={l.href} 
                  onClick={()=>setOpen(false)} 
                  className={`flex items-center gap-2 py-2 ${active ? "text-[var(--accent)]" : "text-white/80"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{l.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Progress */}
            <div className="pt-3 border-t border-[var(--border)] mt-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[var(--muted)] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--text-dim)] whitespace-nowrap font-medium">
                  {progress.completed}/{progress.total} lessen
                </span>
              </div>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

