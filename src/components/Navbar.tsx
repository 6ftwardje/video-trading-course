"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";
import Container from "@/components/ui/Container";
import { useState, useCallback, useEffect, useRef } from "react";
import { Menu, X, Home, BookOpen, LogOut, Users, User, ChevronDown, Pin, PinOff, Book } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  getStoredStudentAccessLevel,
  getStoredStudentEmail,
  clearStoredStudent,
} from "@/lib/student";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/mentorship", label: "Mentorship", icon: Users },
];

const courseMaterialLink = {
  href: "/course-material",
  label: "Cursus PDF",
  icon: Book,
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("Account");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStudentEmail(getStoredStudentEmail());
    setAccessLevel(getStoredStudentAccessLevel());
    
    // Fetch user name for sidebar
    // Use getSession() instead of getUser() to avoid unnecessary server requests
    const fetchUserName = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        } else {
          const email = getStoredStudentEmail();
          if (email) {
            const emailName = email.split("@")[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        }
      } catch (error) {
        const email = getStoredStudentEmail();
        if (email) {
          const emailName = email.split("@")[0];
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    };
    fetchUserName();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

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

  // Conditionally include course material link for access level >= 2
  const links = accessLevel != null && accessLevel >= 2
    ? [...baseLinks, courseMaterialLink]
    : baseLinks;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isExpanded = pinned || isHovered;

  // Internal component for navigation items with tooltips
  const SidebarNavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = isActive(href);
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div className="relative group/item">
        <Link
          href={href}
          onMouseEnter={() => !isExpanded && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
            active
              ? "border-l-2 border-[var(--accent)] bg-[var(--muted)]/50 text-[var(--accent)] font-medium"
              : "text-[var(--text-dim)] hover:text-white hover:bg-[var(--muted)]/30"
          }`}
        >
          {/* Fixed-width icon container */}
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          {/* Label with fixed positioning - always present but opacity-based */}
          <span
            className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-300 ${
              isExpanded
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {label}
          </span>
        </Link>
        {/* Tooltip for collapsed state */}
        {!isExpanded && showTooltip && (
          <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs text-white whitespace-nowrap z-50 shadow-lg">
            {label}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out border-r border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur overflow-hidden ${
          isExpanded ? "w-64" : "w-16"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full w-full">
          {/* Brand Logo + Pin Button - Top */}
          <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-3 min-w-0 h-full">
              {/* Logo - Always visible, no animation */}
              <Image 
                src={BRAND.logoUrl} 
                alt="Platform Logo" 
                width={36} 
                height={36} 
                className="rounded flex-shrink-0" 
              />
              {/* Brand name - Only text animates */}
              <span
                className={`font-semibold tracking-tight whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {BRAND.name}
              </span>
            </div>
            <button
              onClick={() => setPinned(!pinned)}
              className={`flex-shrink-0 p-1.5 rounded-md text-[var(--text-dim)] hover:text-white hover:bg-[var(--muted)] transition-opacity duration-200 ${
                isExpanded
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPinned(!pinned);
                }
              }}
            >
              {pinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1 py-4 px-2">
            {links.map((l) => (
              <SidebarNavItem key={l.href} href={l.href} label={l.label} icon={l.icon} />
            ))}
          </nav>

          {/* User Section - Bottom */}
          <div className="px-3 py-4 border-t border-[var(--border)] relative" ref={userMenuRef}>
            {studentEmail ? (
              <div className="flex flex-col gap-3">
                {/* User Info Section - Avatar always visible, text fades */}
                <div className="flex items-center gap-3 h-12 overflow-hidden">
                  {/* Avatar - Always visible, never animates */}
                  <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {/* User info text - Only this fades in/out */}
                  <div
                    className={`flex-1 min-w-0 overflow-hidden transition-opacity duration-300 ${
                      isExpanded
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="text-sm font-medium text-white truncate">{userName}</div>
                    <div className="text-xs text-[var(--text-dim)] truncate">{studentEmail}</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] mt-0.5">
                      {levelLabel}
                    </div>
                  </div>
                </div>

                {/* User Menu Button - Icon always visible */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center w-full rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-white transition-all duration-200 hover:border-[var(--accent)]/50 hover:bg-[var(--muted)] ${
                      isExpanded ? "px-3 py-2.5" : "px-2 py-2 justify-center"
                    }`}
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    {/* Icon - Always visible, never animates */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    {/* Username and chevron - Only these fade in/out */}
                    <div
                      className={`ml-2 flex items-center flex-1 min-w-0 transition-opacity duration-300 ${
                        isExpanded
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <span className="text-sm whitespace-nowrap truncate flex-1 text-left">
                        {userName}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 ml-2 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] backdrop-blur-md shadow-lg z-50">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-[var(--muted)] hover:text-[var(--accent)]"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Uitloggen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-white transition-all duration-200 hover:border-[var(--accent)]/50 hover:bg-[var(--muted)] ${
                  isExpanded ? "px-3 py-2.5 justify-start" : "px-2 py-2 justify-center"
                }`}
              >
                {/* Fixed-width icon container */}
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <span
                  className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-300 ${
                    isExpanded
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  Inloggen
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur md:hidden">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src={BRAND.logoUrl} 
              alt="Platform Logo" 
              width={36} 
              height={36} 
              className="rounded" 
            />
            <span className="font-semibold tracking-tight text-sm">{BRAND.name}</span>
          </div>

          <button
            className="p-2 text-[var(--text-dim)] hover:text-white"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </Container>

        {/* Mobile Menu */}
        {open && (
          <div className="bg-[var(--bg)] border-t border-[var(--border)]">
            <Container className="flex flex-col gap-1 py-3">
              {links.map(l => {
                const active = isActive(l.href);
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "text-[var(--accent)] bg-[var(--muted)]/50 font-medium"
                        : "text-white/80 hover:text-white hover:bg-[var(--muted)]/30"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
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
    </>
  );
}

