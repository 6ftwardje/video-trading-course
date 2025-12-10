"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, BookOpen, LogOut, Users, User, Bell, Book } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredStudentAccessLevel, getStoredStudentEmail, clearStoredStudent } from "@/lib/student";
import { getSupabaseClient } from "@/lib/supabaseClient";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState<number | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const level = getStoredStudentAccessLevel();
    const email = getStoredStudentEmail();
    setAccessLevel(level);
    setStudentEmail(email);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      clearStoredStudent();
      setStudentEmail(null);
      setAccessLevel(null);
      setIsOpen(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Build nav items based on access level
  // Level 1: Dashboard, Modules, Updates, Login/Account
  // Level 2: Dashboard, Modules, Mentorship, Updates, Account, Logout
  // Level 3: Same as level 2, plus Mentor Panel if it exists
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/modules", label: "Modules", icon: BookOpen },
    ];

    if (accessLevel === 2 || accessLevel === 3) {
      items.push({ href: "/mentorship", label: "Mentorship", icon: Users });
    }

    items.push({ href: "/updates", label: "Updates", icon: Bell });

    // Include course-material for level >= 2 to match existing Navbar behavior
    if (accessLevel === 2 || accessLevel === 3) {
      items.push({ href: "/course-material", label: "Cursus PDF", icon: Book });
    }

    // Mentor Panel for level 3 (if route exists - currently not implemented)
    // if (accessLevel === 3) {
    //   items.push({ href: "/mentor-panel", label: "Mentor Panel", icon: Users });
    // }

    return items;
  };

  const navItems = getNavItems();

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const transition = {
    type: "spring" as const,
    damping: 25,
    stiffness: 300,
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden p-2 text-[var(--text-dim)] hover:text-white transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Portal Menu */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="md:hidden fixed inset-0 z-50">
                {/* Backdrop */}
                <motion.div
                  variants={backdropVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                />

                {/* Panel */}
                <motion.div
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="fixed inset-0 flex flex-col items-center justify-center gap-6 text-2xl font-bold pointer-events-none"
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-6 right-6 p-3 text-white hover:text-[var(--accent)] transition-colors pointer-events-auto"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-7 w-7" />
                  </button>

                  {/* Nav Items */}
                  <nav className="flex flex-col items-center justify-center gap-6 pointer-events-auto">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`px-6 py-4 rounded-lg transition-colors min-w-[200px] text-center ${
                            active
                              ? "text-[var(--accent)] bg-[var(--muted)]/50"
                              : "text-white hover:text-[var(--accent)] hover:bg-[var(--muted)]/30"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Icon className="h-6 w-6" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Account/Login Section */}
                    <div className="mt-4 pt-6 border-t border-white/20 w-full max-w-[200px]">
                      {studentEmail ? (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors text-white hover:text-[var(--accent)] hover:bg-[var(--muted)]/30"
                          >
                            <User className="h-6 w-6" />
                            <span>Account</span>
                          </Link>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors text-white hover:text-[var(--accent)] hover:bg-[var(--muted)]/30 w-full"
                          >
                            <LogOut className="h-6 w-6" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors text-white hover:text-[var(--accent)] hover:bg-[var(--muted)]/30"
                        >
                          <User className="h-6 w-6" />
                          <span>Login</span>
                        </Link>
                      )}
                    </div>
                  </nav>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
