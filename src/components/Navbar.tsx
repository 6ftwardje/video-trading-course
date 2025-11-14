"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/Brand";
import Container from "@/components/ui/Container";
import { useState, useCallback, useEffect } from "react";
import { Menu, X, Home, BookOpen, LogOut } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  getStoredStudentAccessLevel,
  getStoredStudentEmail,
  clearStoredStudent,
} from "@/lib/student";
import UserMenu from "@/components/navbar/UserMenu";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<number | null>(null);

  useEffect(() => {
    setStudentEmail(getStoredStudentEmail());
    setAccessLevel(getStoredStudentAccessLevel());
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      clearStoredStudent();
      setStudentEmail(null);
      setAccessLevel(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  }, [router]);

  const levelLabel = accessLevel === 3 ? "Mentor" : accessLevel === 2 ? "Full" : "Basic";

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <BrandLogo />

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map(l => {
            const active = isActive(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 ${active ? "text-[var(--accent)]" : "text-[var(--text-dim)] hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {studentEmail ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-white transition hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]"
            >
              Inloggen
            </Link>
          )}
        </div>

        <button
          className="p-2 text-[var(--text-dim)] hover:text-white md:hidden"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {/* mobile */}
      {open && (
        <div className="bg-[var(--bg)] border-t border-[var(--border)] md:hidden">
          <Container className="flex flex-col gap-2 py-3">
            {links.map(l => {
              const active = isActive(l.href);
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 py-2 ${active ? "text-[var(--accent)]" : "text-white/80"}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{l.label}</span>
                </Link>
              );
            })}

            <div className="mt-2 border-t border-[var(--border)] pt-3">
              <div className="flex flex-col gap-1 text-xs text-[var(--text-dim)]">
                {studentEmail && <span className="truncate">{studentEmail}</span>}
                <span className="font-semibold uppercase tracking-wide text-[#7C99E3]">Level: {levelLabel}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]"
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </button>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

