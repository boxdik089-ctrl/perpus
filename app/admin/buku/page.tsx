import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, FileSpreadsheet, Barcode, Scan } from "lucide-react";
import { BukuListClient, type BukuListItem } from "@/components/admin/BukuListClient";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BukuPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const buku = await prisma.buku.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      judul: true,
      penulis: true,
      cover_url: true,
      file_url: true,
      is_ebook: true,
      kategori: true,
      klasifikasi: true,
      stok_total: true,
      stok_tersedia: true,
      tipe_buku: true,
      tahun_ajaran: true,
      kode_buku: true,
    },
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans selection:bg-sky-500 selection:text-white transition-colors duration-300">


      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-950/70 border-b border-stone-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-18 gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/60 dark:bg-white/10 ring-1 ring-stone-200 dark:ring-white/20 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/assets/logo.png"
                  alt="Logo SMKN 1 Beringin"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-white whitespace-nowrap leading-tight">
                  Koleksi Buku
                </h1>
                <p className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:block truncate">
                  SMK Negeri 1 Beringin · Inventaris &amp; Eksemplar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <ThemeToggle />
              <Link
                href="/admin/buku/scan"
                className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white border border-stone-300/80 dark:border-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
                title="Scan Barcode Masuk Buku"
              >
                <Scan className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden lg:inline">Scan ISBN</span>
              </Link>
              <Link
                href="/admin/buku/import"
                className="hidden lg:inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white border border-stone-300/80 dark:border-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Import Massal</span>
              </Link>
              <Link
                href="/admin/buku/create"
                className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="hidden xs:inline">Tambah Buku</span>
                <span className="xs:hidden">Tambah</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <BukuListClient initialBuku={buku as BukuListItem[]} />
      </main>
    </div>
  );
}


