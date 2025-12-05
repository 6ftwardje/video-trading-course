"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { BRAND } from "@/components/ui/Brand";
import Container from "@/components/ui/Container";
import { useState, useCallback, useEffect, useRef } from "react";
import { Menu, X, Home, BookOpen, LogOut, Users, User, ChevronDown, Pin, PinOff, Book, Bell } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  getStoredStudentAccessLevel,
  getStoredStudentEmail,
  getStoredStudentId,
  clearStoredStudent,
} from "@/lib/student";
import { getUnreadCount } from "@/lib/updates";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/updates", label: "Updates", icon: Bell },
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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStudentEmail(getStoredStudentEmail());
    const level = getStoredStudentAccessLevel();
    setAccessLevel(level);
    
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

    // Fetch unread count for updates
    const fetchUnreadCount = async () => {
      const studentId = getStoredStudentId();
      const accessLevel = getStoredStudentAccessLevel();
      
      // Only fetch for access level 2 and 3
      if (studentId && (accessLevel === 2 || accessLevel === 3)) {
        try {
          const count = await getUnreadCount(studentId);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count', error);
        }
      } else {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();

    // Listen for updates-read event to refresh unread count
    const handleUpdatesRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener('updates-read', handleUpdatesRead);

    // Refresh unread count periodically and on pathname change
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('updates-read', handleUpdatesRead);
    };
  }, [pathname]);

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

  // Fixed icon wrapper dimensions - never change
  const ICON_WRAPPER_WIDTH = 24; // w-6 = 24px

  // Internal component for navigation items with tooltips
  const SidebarNavItem = ({ href, label, icon: Icon, badgeCount }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badgeCount?: number }) => {
    const active = isActive(href);
    const [showTooltip, setShowTooltip] = useState(false);
    const showBadge = badgeCount !== undefined && badgeCount > 0 && (accessLevel === 2 || accessLevel === 3);

    return (
      <div className="relative group/item">
        <Link
          href={href}
          onMouseEnter={() => !isExpanded && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center rounded-lg transition-colors duration-200 relative ${
            active
              ? "border-l-2 border-[var(--accent)] bg-[var(--muted)]/50 text-[var(--accent)] font-medium"
              : "text-[var(--text-dim)] hover:text-white hover:bg-[var(--muted)]/30"
          } ${isExpanded ? "px-3 py-2.5 gap-3" : "px-2 py-2.5 justify-center gap-0"}`}
        >
          {/* Fixed-width icon container - never changes size, perfectly centered in closed state */}
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 relative">
            <Icon className="h-5 w-5" />
            {/* Badge - shown when collapsed or expanded */}
            {showBadge && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[var(--accent)] text-black text-[10px] font-semibold leading-none">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </div>
          {/* Label wrapper with overflow-hidden and opacity transition */}
          <div
            className={`overflow-hidden flex items-center gap-2 ${
              isExpanded
                ? "opacity-100 max-w-[200px]"
                : "opacity-0 max-w-0 pointer-events-none"
            }`}
            style={{ 
              transitionProperty: 'opacity, max-width',
              transitionDuration: '240ms',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
          >
            <span className="text-sm whitespace-nowrap block">
              {label}
            </span>
            {/* Badge next to label when expanded */}
            {isExpanded && showBadge && (
              <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-[var(--accent)] text-black text-xs font-semibold leading-none">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </div>
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
        className={`hidden md:flex fixed left-0 top-0 bottom-0 z-50 border-r border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur overflow-hidden ${
          isExpanded ? "w-64" : "w-16"
        }`}
        style={{
          transition: 'width 240ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: 'width'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full w-full">
          {/* Brand Logo + Pin Button - Top */}
          <div className="flex items-center justify-between h-14 border-b border-[var(--border)] overflow-hidden">
            <div className={`flex items-center h-full flex-1 min-w-0 ${
              isExpanded ? "px-4 gap-3" : "px-2 justify-center gap-0"
            }`}>
              {/* Logo - Fixed width container, never changes */}
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <Image 
                  src={BRAND.logoIconUrl} 
                  alt="Platform Logo" 
                  width={36} 
                  height={36} 
                  className="rounded" 
                  priority
                />
              </div>
              {/* Brand name wrapper with overflow-hidden */}
              <div
                className={`overflow-hidden ${
                  isExpanded
                    ? "opacity-100 max-w-[180px]"
                    : "opacity-0 max-w-0 pointer-events-none"
                }`}
                style={{ 
                  transitionProperty: 'opacity, max-width',
                  transitionDuration: '240ms',
                  transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                }}
              >
                <span className="font-semibold tracking-tight whitespace-nowrap block">
                  {BRAND.name}
                </span>
              </div>
            </div>
            {/* Pin button wrapper */}
            <div
              className={`flex-shrink-0 ${
                isExpanded ? "opacity-100 max-w-[40px] px-2" : "opacity-0 max-w-0 pointer-events-none overflow-hidden"
              }`}
              style={{ 
                transitionProperty: 'opacity, max-width',
                transitionDuration: '240ms',
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            >
              <button
                onClick={() => setPinned(!pinned)}
                className="p-1.5 rounded-md text-[var(--text-dim)] hover:text-white hover:bg-[var(--muted)]"
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
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1 py-4 overflow-hidden">
            {links.map((l) => (
              <SidebarNavItem 
                key={l.href} 
                href={l.href} 
                label={l.label} 
                icon={l.icon}
                badgeCount={l.href === "/updates" ? unreadCount : undefined}
              />
            ))}
          </nav>

          {/* User Section - Bottom */}
          <div className={`border-t border-[var(--border)] relative ${isExpanded ? "px-3 py-4" : "px-2 py-4"}`} ref={userMenuRef}>
            {studentEmail ? (
              <div className="flex flex-col gap-3">
                {/* User Info Section - Avatar always visible, text fades */}
                <div className={`flex items-center overflow-hidden ${
                  isExpanded ? "h-12 gap-3" : "h-10 justify-center gap-0"
                }`}>
                  {/* Avatar - Fixed size container, perfectly centered in closed state */}
                  <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {/* User info text wrapper with overflow-hidden */}
                  <div
                    className={`overflow-hidden ${
                      isExpanded
                        ? "opacity-100 max-w-[200px]"
                        : "opacity-0 max-w-0 pointer-events-none"
                    }`}
                    style={{ 
                      transitionProperty: 'opacity, max-width',
                      transitionDuration: '240ms',
                      transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                    }}
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
                    className={`flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-white transition-colors duration-200 hover:border-[var(--accent)]/50 hover:bg-[var(--muted)] ${
                      isExpanded ? "px-3 py-2.5 w-full" : "px-2 py-2.5 justify-center w-full"
                    }`}
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    {/* Icon - Fixed size container, perfectly centered in closed state */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    {/* Username and chevron wrapper with overflow-hidden */}
                    <div
                      className={`overflow-hidden flex items-center flex-1 min-w-0 ${
                        isExpanded
                          ? "opacity-100 max-w-[200px] ml-2"
                          : "opacity-0 max-w-0 pointer-events-none"
                      }`}
                      style={{ 
                        transitionProperty: 'opacity, max-width, margin-left',
                        transitionDuration: '240ms',
                        transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                      }}
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
                className={`flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-white transition-colors duration-200 hover:border-[var(--accent)]/50 hover:bg-[var(--muted)] ${
                  isExpanded ? "px-3 py-2.5 justify-start" : "px-2 py-2.5 justify-center"
                }`}
              >
                {/* Fixed-width icon container - perfectly centered in closed state */}
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                {/* Label wrapper with overflow-hidden */}
                <div
                  className={`overflow-hidden ${
                    isExpanded
                      ? "opacity-100 max-w-[200px] ml-3"
                      : "opacity-0 max-w-0 pointer-events-none"
                  }`}
                  style={{ 
                    transitionProperty: 'opacity, max-width, margin-left',
                    transitionDuration: '240ms',
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                  }}
                >
                  <span className="text-sm whitespace-nowrap block">
                    Inloggen
                  </span>
                </div>
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
              src={BRAND.logoIconUrl} 
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
                const showBadge = l.href === "/updates" && unreadCount > 0 && (accessLevel === 2 || accessLevel === 3);
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
                    <div className="relative">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[var(--accent)] text-black text-[10px] font-semibold leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium flex-1">{l.label}</span>
                    {showBadge && (
                      <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-[var(--accent)] text-black text-xs font-semibold leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
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

