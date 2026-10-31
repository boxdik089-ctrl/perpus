import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, UserPlus, CreditCard } from "lucide-react";
import { AnggotaListClient, type AnggotaListItem } from "@/components/admin/AnggotaListClient";
import { ImportSiswaModal } from "@/components/admin/ImportSiswaModal";
import { KelolaKelulusanModal } from "@/components/admin/KelolaKelulusanModal";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnggotaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const anggota = await prisma.anggota.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kelasRef: {
        select: {
          nama_kelas: true,
        },
      },
      _count: {
        select: {
          transaksi: { where: { status: "DIPINJAM" } },
        },
      },
    },
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans selection:bg-sky-500 selection:text-white transition-colors duration-300">


      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-950/70 border-b border-stone-200/80 dark:border-slate-800/80 mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-18 gap-3 sm:gap-6">
            {/* Left Section: Icon & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="shrink-0">
                <h1 className="text-base sm:text-lg font-black text-stone-900 dark:text-white whitespace-nowrap leading-tight">
                  Data Anggota
                </h1>
                <p className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:block">
                  SMK Negeri 1 Beringin
                </p>
              </div>
            </div>

            {/* Right Section: Actions & Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <ImportSiswaModal />
              <KelolaKelulusanModal />
              <Link
                href="/admin/anggota/cetak-kartu"
                className="hidden md:inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white border border-stone-300/80 dark:border-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cetak Kartu</span>
              </Link>
              <Link
                href="/admin/anggota/create"
                className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Tambah Anggota</span>
                <span className="sm:hidden">Tambah</span>
              </Link>
              <div className="h-5 w-px bg-stone-300 dark:bg-slate-800 hidden sm:block mx-0.5 shrink-0" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <AnggotaListClient initialAnggota={anggota as unknown as AnggotaListItem[]} />
      </main>
    </div>
  );
}
