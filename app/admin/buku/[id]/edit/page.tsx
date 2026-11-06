import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft, BookOpen, Barcode } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { EditBukuFormClient } from "@/components/admin/EditBukuFormClient";

const MATA_PELAJARAN = [
  "IPA",
  "IPS",
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Seni Budaya",
  "Pendidikan Jasmani",
  "Teknologi Informasi",
  "Sejarah",
  "Geografi",
  "Biologi",
  "Kimia",
  "Fisika",
  "Akuntansi",
  "Ekonomi",
  "Hukum Dagang",
  "Lainnya",
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditBukuPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const buku = await prisma.buku.findUnique({ where: { id } });
  if (!buku) notFound();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 mb-8 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link 
              href="/admin/buku" 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Koleksi Buku</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                Formulir Perubahan Data Buku
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-16 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Edit Data Buku</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Perbarui judul, penulis, cover, nomor DDC, dan penyesuaian stok buku
                </p>
              </div>
            </div>

            <Link
              href={`/admin/buku/${buku.id}/eksemplar`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Kelola Eksemplar</span>
            </Link>
          </div>

          <EditBukuFormClient buku={buku} mataPelajaran={MATA_PELAJARAN} />
        </div>
      </div>
    </div>
  );
}
