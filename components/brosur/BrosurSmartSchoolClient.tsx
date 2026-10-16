"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Sparkles,
  School,
  CheckCircle2,
  Users,
  GraduationCap,
  Laptop,
  QrCode,
  Wallet,
  BookOpen,
  FileCheck2,
  Share2,
  Award,
  ShieldCheck,
  ExternalLink,
  Maximize2,
  X,
  ZoomIn,
} from "lucide-react";

interface SystemItem {
  id: string;
  title: string;
  tagline: string;
  image: string;
  badge: string;
  badgeColor: string;
  accent: string;
  desc: string;
  features: string[];
}

export function BrosurSmartSchoolClient() {
  const [printMode, setPrintMode] = useState<"standard" | "compact">("standard");
  const [activeModalImg, setActiveModalImg] = useState<SystemItem | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const systems: SystemItem[] = [
    {
      id: "portal",
      title: "1. Portal Utama Smart School",
      tagline: "Pusat Gerbang Informasi & Layanan Digital Terpadu",
      image: "/assets/showcase/portal-smartschool.png",
      badge: "Pusat Ekosistem",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-200",
      accent: "from-blue-600 to-indigo-600",
      desc: "Platform gerbang utama yang menyatukan seluruh kanal informasi, profil sekolah, data jurusan, agenda sekolah, dan navigasi aplikasi.",
      features: [
        "Akses cepat ke 5 aplikasi pendukung sekolah",
        "Statistik real-time sekolah (1.440+ Siswa, 135+ Guru, 7 Jurusan)",
        "Dokumentasi kegiatan resmi & agenda gladi bersih",
        "Fitur live chat asisten sekolah interaktif",
      ],
    },
    {
      id: "sidata",
      title: "2. SIDATA — Sistem Informasi Data Akademik",
      tagline: "Pusat Kendali Data Pokok Siswa & Rombongan Belajar",
      image: "/assets/showcase/sidata.png",
      badge: "Master Data",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      accent: "from-emerald-600 to-teal-600",
      desc: "Sistem otomasi pengelolaan data akademik, kenaikan kelas berjenjang, penugasan wali kelas, serta audit log mutasi siswa secara akurat.",
      features: [
        "Otomasi kenaikan kelas satu-klik bebas eror",
        "Grafik distribusi siswa per kelas & rasio gender",
        "Laporan lengkap siap cetak format A4 instan",
        "Audit log sistem untuk keamanan riwayat data",
      ],
    },
    {
      id: "presensi",
      title: "3. Presensi Digital & Verifikasi Wajah",
      tagline: "Monitoring Kehadiran Siswa & Guru Real-Time",
      image: "/assets/showcase/presensi-online.png",
      badge: "Otomasi Kehadiran",
      badgeColor: "bg-sky-500/10 text-sky-700 border-sky-200",
      accent: "from-sky-600 to-cyan-600",
      desc: "Sistem presensi cerdas harian dengan rekap kehadiran 7 hari terakhir, integrasi deteksi wajah (Face Recognition), dan monitoring kelas aktif.",
      features: [
        "Dashboard pemantau kehadiran real-time kelas aktif",
        "Rekap kehadiran harian, mingguan, dan bulanan",
        "Integrasi barcode & biometrik presensi",
        "Pencatatan sesi kehadiran per mata pelajaran",
      ],
    },
    {
      id: "perpus",
      title: "4. E-Perpustakaan & Command Center Sirkulasi",
      tagline: "Sirkulasi Scanner Mandiri, Kios Presensi, & WhatsApp Notifier",
      image: "/assets/showcase/perpus-digital.png",
      badge: "Command Center Literasi",
      badgeColor: "bg-violet-500/10 text-violet-700 border-violet-200",
      accent: "from-violet-600 to-purple-600",
      desc: "Command Center manajemen buku terpadu dengan sirkulasi scanner instan, transaksi peminjaman & pengembalian, kios presensi mandiri, serta pengingat WhatsApp otomatis.",
      features: [
        "Sirkulasi scanner cepat: scan kartu anggota ➔ scan buku instan",
        "Transaksi peminjaman, pengembalian buku, & kelola denda",
        "Layar Kios Presensi mandiri pengunjung perpustakaan",
        "Notifikasi & pengingat WhatsApp otomatis bagi peminjam",
      ],
    },
    {
      id: "siswapay",
      title: "5. SISWAPAY — Kantin SPW Cashless",
      tagline: "Digitalisasi Transaksi & Wirausaha Siswa (SPW)",
      image: "/assets/showcase/siswapay-kantin.png",
      badge: "Fintech Vokasi",
      badgeColor: "bg-amber-500/10 text-amber-700 border-amber-200",
      accent: "from-amber-500 to-orange-600",
      desc: "Platform dompet digital sekolah dan marketplace produk kreatif siswa (Sekolah Pencetak Wirausaha) untuk transaksi kantin nontunai.",
      features: [
        "Pembayaran nontunai (cashless) aman bagi siswa",
        "Manajemen seller siswa jurusan kuliner & tata boga",
        "Laporan laba rugi transaksi wirausaha sekolah",
        "Statistik produk terlaris & riwayat pesanan realtime",
      ],
    },
    {
      id: "ejurnal",
      title: "6. E-Jurnal & Portofolio Pembelajaran",
      tagline: "Pencatatan Jurnal Pembelajaran & Prakerin Digital",
      image: "/assets/showcase/ejurnal.png",
      badge: "Kurikulum Merdeka",
      badgeColor: "bg-rose-500/10 text-rose-700 border-rose-200",
      accent: "from-rose-600 to-pink-600",
      desc: "Pusat portofolio digital siswa untuk mencatat jurnal harian praktik kejuruan, laporan PKL/Prakerin, dan validasi kompetensi oleh Kaprodi.",
      features: [
        "Validasi bukti tugas dan foto hasil praktik siswa",
        "Penilaian berkala oleh guru pembimbing & kaprodi",
        "Dashboard distribusi siswa per jurusan (TKJ, PPLG, dll)",
        "Master template jurnal resmi format sekolah",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 print:bg-white print:text-black font-sans">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Format Brosur:</span>
            <button
              onClick={() => setPrintMode("standard")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                printMode === "standard"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Layar &amp; A4 Lengkap
            </button>
            <button
              onClick={() => setPrintMode("compact")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                printMode === "compact"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Format Ringkas
            </button>

            <button
              onClick={handlePrint}
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Brosur (PDF / A4)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Printable Document Sheet (Standard A4 Dimensions on Print) */}
      <main className="max-w-5xl mx-auto my-6 sm:my-10 p-6 sm:p-12 bg-white rounded-3xl shadow-xl border border-slate-200/80 print:my-0 print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* KOP RESMI LEMBAGA DENGAN LOGO SMKN 1 BERINGIN & LOGO SUMUT BERKAH */}
        <section className="border-b-4 border-double border-slate-800 pb-5 mb-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo SMKN 1 Beringin */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              <img
                src="/assets/logo.png"
                alt="Logo SMK Negeri 1 Beringin"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Kop Tulisan */}
            <div className="text-center flex-1 px-2">
              <h4 className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-600 uppercase">
                Pemerintah Provinsi Sumatera Utara • Dinas Pendidikan
              </h4>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-0.5">
                SMK NEGERI 1 BERINGIN
              </h1>
              <h2 className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-wide">
                KABUPATEN DELI SERDANG — SUMATERA UTARA
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-snug">
                Jl. Pendidikan No. 1, Kec. Beringin, Kab. Deli Serdang, Sumatera Utara • Kode Pos: 20552
                <br />
                Website Resmi: <span className="font-semibold text-slate-700">smknegeri1beringin.sch.id</span> • Email: info@smknegeri1beringin.sch.id
              </p>
            </div>

            {/* Logo Kolaborasi Sumut Berkah */}
            <div className="w-24 h-20 sm:w-32 sm:h-24 shrink-0 flex items-center justify-center">
              <img
                src="/assets/logo-kolaborasi.png"
                alt="Logo Kolaborasi Sumut Berkah"
                className="w-full h-auto max-h-16 object-contain"
              />
            </div>
          </div>
        </section>

        {/* HERO TITLE BROSUR */}
        <section className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Showcase Acara Smart School</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            EKOSISTEM DIGITAL SMART SCHOOL
          </h2>
          <p className="text-sm sm:text-base font-medium text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
            Transformasi Terpadu Berbasis Teknologi Informasi Menuju Sekolah Vokasi Unggul, Modern, Terintegrasi, dan 100% Ramah Lingkungan (*Paperless*).
          </p>

          {/* OFFICIAL DEVELOPER BADGE */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pencipta &amp; Lead Software Engineer:</span>
            <span className="font-bold text-emerald-400">Dika Armadana</span>
            <span className="text-slate-400 text-[11px]">(Instagram: @dprxz_)</span>
          </div>
        </section>

        {/* STATS HIGHLIGHT BAR */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-100/80 mb-8 text-center print:bg-slate-50">
          <div className="p-2 border-r border-emerald-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-black text-slate-900">1.440+</div>
            <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Siswa Terdata</div>
          </div>
          <div className="p-2 border-r border-emerald-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-black text-slate-900">135+</div>
            <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Guru &amp; Staf</div>
          </div>
          <div className="p-2 border-r border-emerald-200/50 last:border-none">
            <div className="text-xl sm:text-2xl font-black text-slate-900">7 Jurusan</div>
            <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Program Keahlian</div>
          </div>
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-700">6 Pilar Sistem</div>
            <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Terintegrasi Penuh</div>
          </div>
        </section>

        {/* 6 APLIKASI UTAMA (SCREENSHOTS SHOWCASE) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Pilar Utama Aplikasi Smart School
              </h3>
              <p className="text-xs text-slate-500">
                Dokumentasi live antarmuka sistem yang beroperasi penuh di SMK Negeri 1 Beringin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {systems.map((sys) => (
              <div
                key={sys.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between print:break-inside-avoid print:shadow-none"
              >
                <div>
                  {/* HEADER DI ATAS FOTO: LOGO SMKN 1 BERINGIN & LOGO KOLABORASI SUMUT BERKAH */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/logo.png"
                        alt="SMKN 1 Beringin"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-[11px] font-bold tracking-wide uppercase text-slate-100">
                        SMKN 1 BERINGIN
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/logo-kolaborasi.png"
                        alt="Kolaborasi Sumut Berkah"
                        className="h-3.5 w-auto object-contain brightness-0 invert"
                      />
                      <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                        SUMUT BERKAH
                      </span>
                    </div>
                  </div>

                  {/* Screenshot Mockup Container */}
                  <div
                    onClick={() => setActiveModalImg(sys)}
                    className="relative aspect-[16/9] w-full bg-slate-950/5 border-b border-slate-200 overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={sys.image}
                      alt={sys.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/95 shadow-xs ${sys.badgeColor}`}>
                        {sys.badge}
                      </span>
                    </div>
                    {/* Hover Zoom Overlay (Hidden in print) */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white print:hidden">
                      <ZoomIn className="w-5 h-5" />
                      <span className="text-xs font-semibold">Klik untuk Perbesar</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                      {sys.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      {sys.tagline}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {sys.desc}
                    </p>

                    {/* Bullet Points */}
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-700">
                      {sys.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>SMKN 1 Beringin Digital Ecosystem</span>
                  <span className="font-bold text-slate-700">Verified System</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEUNGGULAN EKOSISTEM */}
        <section className="mt-10 p-6 rounded-2xl bg-slate-900 text-white print:bg-slate-900 print:text-white print:break-inside-avoid">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Mengapa Ekosistem Smart School Ini Unggul?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dirancang dengan standar industri teknologi modern untuk mendukung kelancaran operasional sekolah vokasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">100% Realtime &amp; Otomatis</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Data presensi, peminjaman buku perpustakaan, dan transaksi kantin sinkron seketika ke database pusat.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Keamanan Enterprise</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Dilengkapi proteksi anti-brute force, enkripsi password Bcrypt, dan kontrol hak akses role-based.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-100">Karya Mandiri Pengembang</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Dikembangkan langsung oleh Dika Armadana sesuai kebutuhan riil siswa dan guru di SMKN 1 Beringin.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER BROSUR RESMI */}
        <footer className="mt-8 pt-5 border-t-2 border-slate-200 text-center text-xs text-slate-500 print:mt-6 print:pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left text-[11px] leading-tight">
              <span className="font-bold text-slate-800">SMK NEGERI 1 BERINGIN</span>
              <p className="text-slate-500">Mencetak Lulusan Berkarakter, Unggul, Kompeten, dan Siap Kerja Global.</p>
            </div>

            <div className="text-right text-[11px]">
              <span className="font-bold text-slate-800">Hak Cipta &amp; Lisensi Perangkat Lunak:</span>
              <p className="text-slate-600">
                Inisiator &amp; Lead Developer: <strong>Dika Armadana</strong> • Instagram:{" "}
                <a
                  href="https://instagram.com/dprxz_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 underline"
                >
                  @dprxz_
                </a>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            © {new Date().getFullYear()} Ekosistem Smart School SMK Negeri 1 Beringin • Kolaborasi Sumut Berkah. Seluruh hak cipta dilindungi undang-undang.
          </div>
        </footer>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL (Interactive view) */}
      {activeModalImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-fade-in"
          onClick={() => setActiveModalImg(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/logo.png"
                  alt="SMKN 1 Beringin"
                  className="w-6 h-6 object-contain"
                />
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activeModalImg.title}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {activeModalImg.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="/assets/logo-kolaborasi.png"
                  alt="Sumut Berkah"
                  className="h-4 w-auto object-contain brightness-0 invert hidden sm:block"
                />
                <button
                  onClick={() => setActiveModalImg(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-[16/9] w-full bg-slate-950">
              <img
                src={activeModalImg.image}
                alt={activeModalImg.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer info */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                <p className="font-medium text-slate-800">{activeModalImg.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeModalImg.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setActiveModalImg(null)}
                className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
