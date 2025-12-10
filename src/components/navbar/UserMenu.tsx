"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getStoredStudentEmail, getStoredStudentName, clearStoredStudent } from "@/lib/student";
import UserDropdownItem from "./UserDropdownItem";

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Account");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch user data and determine display name
  useEffect(() => {
    const name = getStoredStudentName();
    const email = getStoredStudentEmail();
    
    // Use name ?? email pattern
    const displayName = name ?? email ?? "Account";
    setUserName(displayName);
    
    // If no name in localStorage, try to fetch from session
    if (!name) {
      const fetchUserData = async () => {
        try {
          const supabase = getSupabaseClient();
          // Use getSession() instead of getUser() to avoid unnecessary server requests
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user?.user_metadata?.full_name) {
            setUserName(session.user.user_metadata.full_name);
          } else if (email) {
            // Fallback to email if no name available
            setUserName(email);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to email if error
          if (email) {
            setUserName(email);
          }
        }
      };

      fetchUserData();
    }
  }, []);

  // Close dropdown function
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeDropdown]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, closeDropdown]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      clearStoredStudent();
      closeDropdown();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  }, [router, closeDropdown]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-white transition hover:border-[var(--accent)]/50 hover:bg-[var(--muted)]"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span className="max-w-[8rem] truncate">{userName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md shadow-lg">
          <div className="p-2">
            {/* TODO: Add 'Mijn Account' navigation */}
            <UserDropdownItem
              icon={User}
              label="Mijn Account"
              onClick={() => {
                // TODO: Navigate to account page
                closeDropdown();
              }}
              hidden={true}
            />

            {/* TODO: Add settings page navigation (theme switcher, dark/light mode) */}
            <UserDropdownItem
              icon={Settings}
              label="Settings"
              onClick={() => {
                // TODO: Navigate to settings page
                closeDropdown();
              }}
              hidden={true}
            />

            <UserDropdownItem
              icon={LogOut}
              label="Uitloggen"
              onClick={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}

