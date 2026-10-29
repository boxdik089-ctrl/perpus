import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { prisma } from "@/lib/prisma";
import { UlasanAdminClient, type AdminUlasanItem } from "@/components/admin/UlasanAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUlasanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const rawUlasan = await prisma.ulasan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buku: {
        select: {
          id: true,
          judul: true,
          penulis: true,
          cover_url: true,
          kategori: true,
        },
      },
    },
  });

  const initialList: AdminUlasanItem[] = rawUlasan.map((u) => ({
    id: u.id,
    nama: u.nama,
    rating: u.rating,
    komentar: u.komentar,
    createdAt: u.createdAt,
    buku: {
      id: u.buku.id,
      judul: u.buku.judul,
      penulis: u.buku.penulis,
      cover_url: u.buku.cover_url,
      kategori: u.buku.kategori,
    },
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 relative overflow-x-hidden font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                <span>Moderasi Ulasan Buku</span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Ulasan Publik
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Katalog Publik
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Kelola Rating &amp; Ulasan Pembaca
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau feedback buku dari siswa atau pengunjung publik. Hapus ulasan yang mengandung kata tidak pantas atau spam.
          </p>
        </div>

        <UlasanAdminClient initialList={initialList} />
      </main>
    </div>
  );
}
