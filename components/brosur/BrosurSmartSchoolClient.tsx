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
} from "lucide-react";

export function BrosurSmartSchoolClient() {
  const [printMode, setPrintMode] = useState<"standard" | "compact">("standard");

  const handlePrint = () => {
    window.print();
  };

  const systems = [
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
        "Statistik real-time siswa (1.440+ Siswa, 135+ Guru, 7 Jurusan)",
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
      title: "4. Perpustakaan Digital & Kios Mandiri",
      tagline: "Sirkulasi Buku Cepat, AI Pustakawan, & E-Book Reader",
      image: "/assets/perpustakaan-hero.jpg",
      badge: "Literasi Modern",
      badgeColor: "bg-violet-500/10 text-violet-700 border-violet-200",
      accent: "from-violet-600 to-purple-600",
      desc: "Sistem perpustakaan modern dengan meja sirkulasi scanner instan, pencetakan kartu QR, katalog buku digital, dan peringatan WhatsApp otomatis.",
      features: [
        "Sirkulasi kilat: scan kartu anggota ➔ scan buku instan",
        "Kios presensi mandiri pengunjung perpustakaan",
        "AI Pustakawan cerdas pemberi rekomendasi literasi",
        "Notifikasi WhatsApp otomatis bagi peminjam terlambat",
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
        {/* KOP RESMI LEMBAGA */}
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
            <div className="text-xl sm:text-2xl font-black text-emerald-700">6 Sistem</div>
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
                  {/* Screenshot Mockup Container */}
                  <div className="relative aspect-[16/9] w-full bg-slate-950/5 border-b border-slate-200 overflow-hidden group">
                    <img
                      src={sys.image}
                      alt={sys.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/95 shadow-xs ${sys.badgeColor}`}>
                        {sys.badge}
                      </span>
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
                Data presensi, peminjaman buku, dan transaksi kantin sinkron seketika ke database pusat.
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
                Inisiator: <strong>Dika Armadana</strong> • Instagram:{" "}
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
    </div>
  );
}
