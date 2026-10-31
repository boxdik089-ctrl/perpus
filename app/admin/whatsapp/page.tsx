import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { WhatsAppCenterClient } from "@/components/admin/WhatsAppCenterClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Pusat Notifikasi & Pengingat WhatsApp - Perpustakaan SMKN 1 Beringin",
  description: "Kirim pengingat jatuh tempo, tagihan denda, dan bukti peminjaman buku perpustakaan via WhatsApp.",
};

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Query all active and recent transactions
  const transaksiList = await prisma.transaksi.findMany({
    where: {
      status: "DIPINJAM",
    },
    include: {
      siswa: { select: { id: true, nama: true, nisn: true, kelas: true } },
      buku: { select: { id: true, judul: true, penulis: true, kode_buku: true, tipe_buku: true } },
      anggota: {
        select: {
          id: true,
          nama: true,
          nisn: true,
          jenis: true,
          no_anggota: true,
          telepon: true,
          kelasRef: { select: { nama_kelas: true } },
        },
      },
      eksemplar: {
        select: {
          id: true,
          kode: true,
          buku: { select: { id: true, judul: true, penulis: true, kode_buku: true, tipe_buku: true } },
        },
      },
    },
    orderBy: { batas_kembali: "asc" },
  });

  const formattedPinjaman = transaksiList.map((t) => ({
    id: t.id,
    nama: t.anggota?.nama || t.siswa?.nama || "Peminjam",
    kelas: t.siswa?.kelas || t.anggota?.kelasRef?.nama_kelas || (t.anggota?.jenis === "GURU" ? "GURU" : t.anggota?.jenis === "STAF" ? "STAF" : null),
    nisn: t.siswa?.nisn || t.anggota?.nisn || null,
    telepon: t.anggota?.telepon || null,
    no_anggota: t.anggota?.no_anggota || null,
    judul_buku: t.buku?.judul || t.eksemplar?.buku?.judul || "Buku Perpustakaan",
    kode_eksemplar: t.eksemplar?.kode || t.buku?.kode_buku || null,
    tgl_pinjam: t.tgl_pinjam.toISOString(),
    batas_kembali: t.batas_kembali.toISOString(),
    status: t.status as "DIPINJAM" | "SELESAI",
    denda: t.denda,
  }));

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">

      {/* Top Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-stone-200/80 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight whitespace-nowrap">
                  Pusat Notifikasi WhatsApp
                </h1>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 hidden sm:block truncate">
                  Broadcast pengingat jatuh tempo &amp; tagihan denda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <WhatsAppCenterClient pinjamanList={formattedPinjaman} />
      </div>
    </div>
  );
}
