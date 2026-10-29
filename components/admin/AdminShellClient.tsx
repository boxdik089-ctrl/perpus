"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileNav } from "./AdminMobileNav";

interface AdminShellClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  children: ReactNode;
}

export function AdminShellClient({ user, children }: AdminShellClientProps) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 antialiased selection:bg-sky-500 selection:text-white">
      {/* Persistent Left Sidebar on Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen overflow-hidden z-30">
        <AdminSidebar user={user} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Clean School Library Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-3.5 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 mb-16 md:mb-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Perpustakaan SMK Negeri 1 Beringin
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">© {new Date().getFullYear()}</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Sistem Manajemen Perpustakaan Terpadu
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar & Drawer for Touch Devices */}
      <AdminMobileNav />
    </div>
  );
}

