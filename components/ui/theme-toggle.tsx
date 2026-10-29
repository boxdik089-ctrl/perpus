"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme/ThemeProvider"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const themeContext = useTheme()
  const [mounted, setMounted] = useState(false)
  const [internalDark, setInternalDark] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sinkronkan dengan theme context
  const isDark = mounted && themeContext ? themeContext.isDark : internalDark

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (themeContext?.toggleTheme) {
      themeContext.toggleTheme()
    } else {
      setInternalDark((prev) => !prev)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center w-[52px] h-[28px] p-[2px] rounded-full cursor-pointer transition-all duration-300 select-none shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 active:scale-95 border",
        isDark 
          ? "bg-slate-900/90 border-slate-700/80 shadow-inner" 
          : "bg-slate-100 border-slate-300 shadow-inner",
        className
      )}
      onClick={handleToggle}
      aria-label="Ganti Tema (Gelap / Terang)"
      title={isDark ? "Mode Gelap aktif (Klik untuk Mode Terang)" : "Mode Terang aktif (Klik untuk Mode Gelap)"}
    >
      {/* Background track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Moon className={cn("w-3 h-3 transition-opacity duration-200", isDark ? "text-slate-400 opacity-60" : "opacity-0")} />
        <Sun className={cn("w-3 h-3 transition-opacity duration-200", !isDark ? "text-amber-500 opacity-60" : "opacity-0")} />
      </div>

      {/* Sliding Active Knob */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center w-[22px] h-[22px] rounded-full shadow-sm transition-transform duration-300",
          isDark
            ? "translate-x-0.5 bg-slate-800 border border-slate-700 text-sky-400"
            : "translate-x-[24px] bg-white border border-slate-200 text-amber-500"
        )}
      >
        {isDark ? (
          <Moon className="w-3 h-3 fill-current/20" strokeWidth={2} />
        ) : (
          <Sun className="w-3 h-3 fill-current/20" strokeWidth={2} />
        )}
      </span>
    </button>
  )
}

export default ThemeToggle
