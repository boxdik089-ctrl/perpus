import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { prisma } from "@/lib/prisma";
import { getStockOpnameList } from "@/actions/stock-opname";
import { StockOpnameListClient } from "@/components/admin/stock-opname/StockOpnameListClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StockOpnameListPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [sessions, raks] = await Promise.all([
    getStockOpnameList(),
    prisma.rak.findMany({
      orderBy: { nomor: "asc" },
      select: { id: true, nama: true, nomor: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-x-hidden font-sans transition-colors duration-300">


      {/* Top Navbar */}
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
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-1.5 whitespace-nowrap">
                  <span>Stock Opname Koleksi</span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shrink-0">
                    <Boxes className="w-3 h-3" />
                    AUDIT FISIK
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <StockOpnameListClient initialSessions={sessions as any} rakList={raks} />
      </div>
    </div>
  );
}
