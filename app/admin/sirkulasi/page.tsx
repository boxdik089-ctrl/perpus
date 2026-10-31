import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SirkulasiScanner } from "@/components/admin/SirkulasiScanner";
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
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <img
                src="/assets/logo.png"
                alt="Logo SMK Negeri 1 Beringin"
                className="w-8 h-8 object-contain rounded-xl bg-white/60 dark:bg-white/10 border border-stone-200 dark:border-white/20 p-1 shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight whitespace-nowrap">
                  Sirkulasi Scanner
                </h1>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 hidden sm:block truncate">
                  Scan kartu anggota → scan buku → pinjam/kembali otomatis
                </p>
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
