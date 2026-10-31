import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  ArrowLeftRight,
  Users,
  AlertCircle,
  Clock,
  ScanLine,
  QrCode,
  ExternalLink,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { AdminProfileDropdown } from "@/components/admin/AdminProfileDropdown";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { getDashboardAnalytics } from "@/lib/analytics";
import { SecurityAlertBanner } from "@/components/admin/SecurityAlertBanner";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 1. KPI Stats
  const [totalBuku, totalEksemplar, bukuDipinjam, totalAnggota, totalAnggotaSiswa, totalAnggotaGuruStaf] =
    await Promise.all([
      prisma.buku.count(),
      prisma.eksemplar.count(),
      prisma.transaksi.count({ where: { status: "DIPINJAM" } }),
      prisma.anggota.count(),
      prisma.anggota.count({ where: { jenis: "SISWA" } }),
      prisma.anggota.count({ where: { jenis: { in: ["GURU", "STAF"] } } }),
    ]);

  // Denda outstanding
  const dendaAgg = await prisma.transaksi.aggregate({
    where: { denda: { gt: 0 }, status: "SELESAI" },
    _sum: { denda: true },
  });
  const totalDenda = dendaAgg._sum.denda ?? 0;

  // 2. Real-time Analytics
  const analyticsData = await getDashboardAnalytics();

  // 3. Peminjaman Aktif & Jatuh Tempo Terdekat (Maksimal 5)
  const now = new Date();
  const upcomingReturns = await prisma.transaksi.findMany({
    where: { status: "DIPINJAM" },
    orderBy: { batas_kembali: "asc" },
    take: 5,
    include: {
      buku: { select: { judul: true, kode_buku: true } },
      eksemplar: { select: { kode: true, buku: { select: { judul: true } } } },
      anggota: {
        select: {
          nama: true,
          no_anggota: true,
          jenis: true,
          telepon: true,
          kelasRef: { select: { nama_kelas: true } },
        },
      },
      siswa: { select: { nama: true, nisn: true, kelas: true } },
    },
  });

  // 4. Audit Keamanan Akun
  const adminAccount = await prisma.admin.findFirst({
    where: {
      OR: [
        { id: (session.user as any)?.id },
        { username: session.user?.email || "" },
      ],
    },
    select: { id: true, username: true, nama: true, password: true },
  });

  const isDefaultPassword = adminAccount
    ? bcrypt.compareSync("admin123", adminAccount.password)
    : false;

  const adminName = adminAccount?.nama || session.user?.name || "Bapak/Ibu Pustakawan";

  const hour = now.getHours();
  const greetingTime =
    hour >= 4 && hour < 11
      ? "Selamat Pagi"
      : hour >= 11 && hour < 15
      ? "Selamat Siang"
      : hour >= 15 && hour < 18
      ? "Selamat Sore"
      : "Selamat Malam";

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* ─── EXECUTIVE DASHBOARD HERO HEADER ─── */}
      <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm p-4 sm:p-6 lg:p-7 transition-all">
        <div className="absolute right-6 bottom-2 opacity-[0.035] dark:opacity-[0.06] pointer-events-none select-none hidden md:block">
          <img
            src="/assets/logo.png"
            alt="Watermark SMKN 1 Beringin"
            className="w-44 h-44 object-contain"
          />
        </div>

        {/* Top Control Bar: Logo, School Identity, & Action Tools */}
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/assets/logo.png"
                alt="Logo SMKN 1 Beringin"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                <span className="sm:hidden">SMKN 1 Beringin</span>
                <span className="hidden sm:inline">SMK Negeri 1 Beringin</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Panel Manajemen Perpustakaan
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Buka Halaman Depan Siswa"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Katalog Publik</span>
            </Link>
            <ThemeToggle />
            <AdminProfileDropdown userName={adminName} />
          </div>
        </div>

        {/* Bottom Hero Content: Greeting & Live Information Chips */}
        <div className="pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
              {greetingTime}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              Selamat Bertugas,{" "}
              <span className="text-[#00367E] dark:text-sky-400">
                {adminName}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Pantau sirkulasi peminjaman buku, data keanggotaan siswa, dan statistik operasional perpustakaan secara real-time.
            </p>
          </div>

          {/* Functional Date Indicator */}
          <div className="flex items-center self-start md:self-end shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#00367E] dark:text-sky-400 shrink-0" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Peringatan Keamanan jika masih password default */}
      {isDefaultPassword && <SecurityAlertBanner userName={adminName} />}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 animate-fade-up">
        {/* Card 1: Total Koleksi */}
        <Link
          href="/admin/buku"
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Koleksi
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-600 dark:group-hover:bg-slate-700 dark:group-hover:text-sky-400 flex items-center justify-center shrink-0 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {totalBuku}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Judul buku terdaftar →
          </p>
        </Link>

        {/* Card 2: Total Eksemplar */}
        <Link
          href="/admin/buku"
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Eksemplar
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-600 dark:group-hover:bg-slate-700 dark:group-hover:text-sky-400 flex items-center justify-center shrink-0 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {totalEksemplar}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Fisik buku ber-barcode →
          </p>
        </Link>

        {/* Card 3: Sedang Dipinjam */}
        <Link
          href="/admin/transaksi"
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sedang Dipinjam
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 tracking-tight tabular-nums">
            {bukuDipinjam}
          </p>
          <p className="text-[10px] sm:text-[11px] text-sky-600/90 dark:text-sky-400/80 font-medium mt-1">
            Sirkulasi aktif →
          </p>
        </Link>

        {/* Card 4: Total Anggota */}
        <Link
          href="/admin/anggota"
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Anggota
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-600 dark:group-hover:bg-slate-700 dark:group-hover:text-sky-400 flex items-center justify-center shrink-0 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {totalAnggota}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {totalAnggotaSiswa} Siswa • {totalAnggotaGuruStaf} Guru →
          </p>
        </Link>

        {/* Card 5: Denda Belum Bayar */}
        <Link
          href="/admin/transaksi"
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-500/50 dark:hover:border-rose-500/50 hover:shadow-sm transition-all col-span-2 sm:col-span-1 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Denda Belum Bayar
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                totalDenda > 0
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums flex items-baseline ${
              totalDenda > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            <span className="text-sm sm:text-base font-semibold opacity-70 mr-1">Rp</span>
            <span>{totalDenda.toLocaleString("id-ID")}</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalDenda > 0 ? "Tertunggak sistem →" : "Semua denda lunas"}
          </p>
        </Link>
      </div>

      {/* Peminjaman Aktif & Jatuh Tempo Terdekat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Sirkulasi Aktif &amp; Batas Kembali Terdekat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peminjaman yang perlu perhatian dan pengembalian tepat waktu
              </p>
            </div>
          </div>

          <Link
            href="/admin/transaksi"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 self-start sm:self-center"
          >
            <span>Buka Semua Transaksi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingReturns.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada buku yang sedang dipinjam saat ini
            </p>
            <p className="text-xs mt-0.5">Semua buku tersedia rapi di rak koleksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Peminjam</th>
                  <th className="py-2.5 px-3">Buku &amp; Barcode</th>
                  <th className="py-2.5 px-3">Tgl Pinjam</th>
                  <th className="py-2.5 px-3">Batas Kembali</th>
                  <th className="py-2.5 px-3 text-right">Status Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {upcomingReturns.map((trx) => {
                  const peminjamName =
                    trx.anggota?.nama || trx.siswa?.nama || "Peminjam Tanpa Nama";
                  const peminjamKelas =
                    trx.anggota?.kelasRef?.nama_kelas ||
                    trx.siswa?.kelas ||
                    trx.anggota?.jenis ||
                    "-";
                  const bukuJudul =
                    trx.eksemplar?.buku?.judul ||
                    trx.buku?.judul ||
                    "Buku Perpustakaan";
                  const barcodeKode =
                    trx.eksemplar?.kode || trx.buku?.kode_buku || "-";

                  const returnDate = new Date(trx.batas_kembali);
                  const isOverdue = returnDate.getTime() < now.getTime();
                  const diffDays = Math.ceil(
                    (returnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {peminjamName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {peminjamKelas}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                          {bukuJudul}
                        </p>
                        <span className="inline-block font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {barcodeKode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(trx.tgl_pinjam).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {returnDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Terlambat {Math.abs(diffDays)} hari
                          </span>
                        ) : diffDays === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            Jatuh tempo hari ini
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Sisa {diffDays} hari
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Infografis & Interactive Trends */}
      <AdminAnalyticsDashboard data={analyticsData} />
    </div>
  );
}
