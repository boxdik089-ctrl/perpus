"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useState, useEffect } from "react";

export interface PublicNavbarProps {
  currentPage?: "katalog" | "kartu" | "kios" | "login" | "admin" | "other";
  className?: string;
  autoHideOnScroll?: boolean;
}

export function PublicNavbar({
  currentPage = "katalog",
  className = "",
  autoHideOnScroll = true,
}: PublicNavbarProps) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    if (!autoHideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, autoHideOnScroll]);

  const navItems = [
    { id: "katalog", label: "Katalog", href: "/" },
    { id: "kartu", label: "Kartu", href: "/kartu" },
  ];

  return (
    <header
      className={`fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none transition-all duration-300 ease-in-out ${
        isNavVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
      } ${className}`}
    >
      <nav className="pointer-events-auto rounded-full backdrop-blur-2xl border px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2.5 sm:gap-3.5 shadow-xl bg-white/95 dark:bg-[#0c0d12]/95 border-slate-200/90 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-slate-200/50 dark:shadow-black/60 transition-all duration-300 max-w-[96vw] overflow-x-auto no-scrollbar">
        
        {/* Brand: Logo & Title (Clean Natural Typography - No Spaced Out Gaps) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group select-none pr-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <img
              src="/assets/logo.png"
              alt="Logo SMKN 1 Beringin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
            />
            <img
              src="/assets/logo-kolaborasi.png"
              alt="Logo Kolaborasi Sumut Berkah"
              className="h-5 sm:h-6 w-auto object-contain shrink-0 opacity-90 hidden md:block"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Perpustakaan
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-semibold text-sky-600 dark:text-sky-400 leading-tight">
              SMKN 1 Beringin
            </span>
          </div>
        </Link>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 hidden sm:block shrink-0" />

        {/* Navigation Options: Pure Text Without Icons, Powered by Smooth Pill Animations */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-0.5 rounded-full bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 select-none group cursor-pointer ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {/* Active Pill Background with Smooth Depth */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-white/10 transition-all duration-300" />
                )}

                {/* Hover Pill Background Animation */}
                {!isActive && isHovered && (
                  <span className="absolute inset-0 rounded-full bg-slate-200/60 dark:bg-white/[0.08] transition-all duration-200 animate-in fade-in" />
                )}

                {/* Animated Text Label with Micro-scale on Hover */}
                <span className="relative z-10 block transition-transform duration-200 group-hover:scale-105 active:scale-95">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-white/10 hidden sm:block shrink-0" />

        {/* Right Actions: Theme Toggle */}
        <div className="flex items-center shrink-0 pl-0.5">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

export default PublicNavbar;
