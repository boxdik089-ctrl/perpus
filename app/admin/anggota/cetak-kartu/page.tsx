import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CetakKartuClient } from "@/components/admin/CetakKartuClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CetakKartuPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:text-slate-900 print:min-h-0 relative overflow-x-hidden transition-colors duration-200">

      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs print-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/anggota"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Daftar Anggota
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Cetak Kartu Anggota
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Standar ID-1 (85.6 × 54 mm)
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 print:p-0 print:m-0 print:max-w-none">
        <CetakKartuClient />
      </div>
    </div>
  );
}
