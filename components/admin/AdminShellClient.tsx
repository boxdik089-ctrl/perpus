"use client";

import { ReactNode, useState, useEffect } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 antialiased selection:bg-sky-500 selection:text-white print:h-auto print:overflow-visible">
      {/* Persistent Stationary Left Sidebar on Desktop (Does NOT scroll with page & can be minimized) */}
      <aside
        className={`hidden md:flex flex-col h-full shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 transition-all duration-300 ease-in-out print:hidden ${
          isCollapsed ? "w-[72px]" : "w-64 lg:w-72"
        }`}
      >
        <AdminSidebar
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Main Content Area (Only this section scrolls) */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto overflow-x-hidden print:h-auto print:overflow-visible">
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

