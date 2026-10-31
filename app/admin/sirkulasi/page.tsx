import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SirkulasiScanner } from "@/components/admin/SirkulasiScanner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SirkulasiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 relative overflow-x-hidden font-sans transition-colors duration-200">

      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-stone-200/80 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link 
                href="/admin" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white bg-stone-100 hover:bg-stone-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-stone-300/80 dark:border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-xs shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">/</span>
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/assets/logo.png"
                  alt="Logo SMK Negeri 1 Beringin"
                  className="w-7 h-7 object-contain rounded-lg bg-white/60 dark:bg-white/10 border border-stone-200 dark:border-white/20 p-0.5 shrink-0 hidden xs:block"
                />
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-base font-bold text-stone-900 dark:text-white leading-tight truncate">
                    Sirkulasi Scanner
                  </h1>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 hidden sm:block truncate">
                    Scan kartu anggota → scan buku → pinjam/kembali otomatis
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SirkulasiScanner />
      </div>
    </div>
  );
}
