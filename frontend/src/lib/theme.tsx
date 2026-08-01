"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({
  children,
  storageKey = "airecruit_theme",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(storageKey)) as Theme | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
    } else if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, [storageKey]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider storageKey="airecruit_admin_theme">{children}</ThemeProvider>;
}

export function CompanyThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider storageKey="airecruit_company_theme">{children}</ThemeProvider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
