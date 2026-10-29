import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImportBukuClient } from "@/components/admin/ImportBukuClient";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImportBukuPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">

      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 mb-8 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/buku"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Koleksi Buku</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Import Buku Massal (CSV)
                  </h1>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
                    Unggah data koleksi perpustakaan sekaligus
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <ImportBukuClient />
      </div>
    </div>
  );
}
