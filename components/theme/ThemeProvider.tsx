"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
    }
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("perpus_theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        const root = document.documentElement;
        const isDomDark = root.classList.contains("dark") || root.getAttribute("data-theme") === "dark";
        const initialTheme: Theme = isDomDark ? "dark" : "light";
        setThemeState(initialTheme);
        applyTheme(initialTheme);
      }
    } catch {
      applyTheme("dark");
    }
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "perpus_theme" && (e.newValue === "light" || e.newValue === "dark")) {
        const newTheme = e.newValue as Theme;
        applyTheme(newTheme);
        setThemeState(newTheme);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
    try {
      localStorage.setItem("perpus_theme", newTheme);
    } catch {}
    setThemeState(newTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("perpus_theme", next);
      } catch {}
      return next;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
