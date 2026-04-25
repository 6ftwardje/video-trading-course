"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PlatformTheme = "dark-blue" | "light";

type ThemeContextValue = {
  theme: PlatformTheme;
  setTheme: (theme: PlatformTheme) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "trade-platform-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isPlatformTheme(value: string | null): value is PlatformTheme {
  return value === "dark-blue" || value === "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PlatformTheme>("dark-blue");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isPlatformTheme(storedTheme)) {
      setThemeState(storedTheme);
      document.documentElement.dataset.theme = storedTheme;
      return;
    }

    document.documentElement.dataset.theme = "dark-blue";
  }, []);

  const setTheme = (nextTheme: PlatformTheme) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark-blue" ? "light" : "dark-blue"),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usePlatformTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("usePlatformTheme must be used within ThemeProvider");
  }
  return context;
}
