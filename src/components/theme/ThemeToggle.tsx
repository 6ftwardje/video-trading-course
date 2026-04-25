"use client";

import { Moon, Sun } from "lucide-react";
import { usePlatformTheme } from "@/components/theme/ThemeProvider";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export default function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = usePlatformTheme();
  const isLight = theme === "light";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-dim)] transition hover:border-[var(--accent)]/50 hover:text-[var(--foreground)] ${className}`}
        aria-label={isLight ? "Schakel donkerblauwe stijl in" : "Schakel light mode in"}
        title={isLight ? "Donkerblauw" : "Light mode"}
      >
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/35 p-1 ${className}`}
      aria-label="Thema"
    >
      <button
        type="button"
        onClick={() => setTheme("dark-blue")}
        className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold transition ${
          theme === "dark-blue"
            ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
            : "text-[var(--text-dim)] hover:text-[var(--foreground)]"
        }`}
        aria-pressed={theme === "dark-blue"}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden />
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold transition ${
          theme === "light"
            ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
            : "text-[var(--text-dim)] hover:text-[var(--foreground)]"
        }`}
        aria-pressed={theme === "light"}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden />
        Light
      </button>
    </div>
  );
}
