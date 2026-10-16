"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Users,
  GraduationCap,
  Laptop,
  BookOpen,
  Award,
  ShieldCheck,
  Maximize2,
  X,
  ZoomIn,
  FileText,
  Layers,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

interface SystemItem {
  id: string;
  title: string;
  tagline: string;
  image: string;
  badge: string;
  badgeColor: string;
  desc: string;
  features: string[];
}

export function BrosurSmartSchoolClient() {
  const [activeModalImg, setActiveModalImg] = useState<SystemItem | null>(null);
  const [viewMode, setViewMode] = useState<"a4-sheets" | "web-flow">("a4-sheets");

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
      badgeColor: "bg-blue-600 text-white",
      desc: "Platform gerbang utama yang menyatukan seluruh kanal informasi, profil sekolah, data jurusan, agenda resmi, dan navigasi seluruh modul aplikasi sekolah.",
      features: [
        "Akses instan ke seluruh modul ekosistem sekolah",
        "Statistik terpadu (1.440+ Siswa, 135+ Guru, 7 Jurusan)",
        "Dokumentasi kegiatan resmi & agenda gladi bersih",
        "Asisten interaktif sekolah & informasi publik terupdate",
      ],
    },
    {
      id: "sidata",
      title: "2. SIDATA — Data Pokok Akademik",
      tagline: "Pusat Kendali Data Siswa & Rombongan Belajar",
      image: "/assets/showcase/sidata.png",
      badge: "Master Data",
      badgeColor: "bg-emerald-600 text-white",
      desc: "Sistem otomasi pengelolaan data akademik, penugasan wali kelas berjenjang, grafik distribusi rombel, serta audit log mutasi siswa akurat.",
      features: [
        "Otomasi kenaikan kelas satu-klik bebas redundansi",
        "Grafik komposisi gender & distribusi rombel aktif",
        "Laporan data akademik siap cetak format A4 instan",
      ],
    },
    {
      id: "presensi",
      title: "3. Presensi Digital & Wajah",
      tagline: "Monitoring Kehadiran Siswa Real-Time",
      image: "/assets/showcase/presensi-online.png",
      badge: "Otomasi Kehadiran",
      badgeColor: "bg-sky-600 text-white",
      desc: "Sistem presensi cerdas harian dengan rekap kehadiran 7 hari terakhir, integrasi deteksi wajah (Face Recognition), dan monitoring kelas aktif.",
      features: [
        "Dashboard pemantau kehadiran real-time kelas aktif",
        "Rekap kehadiran berkala harian dan mingguan",
        "Integrasi barcode & biometrik presensi kelas",
      ],
    },
    {
      id: "perpus",
      title: "4. E-Perpustakaan & Command Center",
      tagline: "Sirkulasi Scanner Mandiri & WhatsApp Notifier",
      image: "/assets/showcase/perpus-digital.png",
      badge: "Literasi Digital",
      badgeColor: "bg-purple-600 text-white",
      desc: "Command Center manajemen buku terpadu dengan meja sirkulasi scanner kilat, transaksi pinjam/kembali, layar kios presensi mandiri, serta pengingat WhatsApp otomatis.",
      features: [
        "Sirkulasi scanner cepat: scan kartu anggota ➔ scan buku instan",
        "Layar Kios Presensi mandiri pengunjung perpustakaan",
        "Pemberitahuan & pengingat jatuh tempo via WhatsApp otomatis",
        "Pencatatan denda otomatis dan manajemen inventaris fisik",
      ],
    },
    {
      id: "siswapay",
      title: "5. SISWAPAY — Kantin SPW Cashless",
      tagline: "Digitalisasi Transaksi Wirausaha Siswa (SPW)",
      image: "/assets/showcase/siswapay-kantin.png",
      badge: "Fintech Vokasi",
      badgeColor: "bg-amber-600 text-white",
      desc: "Platform dompet digital dan pasar produk kreatif siswa (Sekolah Pencetak Wirausaha) untuk memfasilitasi transaksi kantin sekolah nontunai.",
      features: [
        "Pembayaran nontunai (cashless) aman dan tercatat",
        "Manajemen seller siswa jurusan kuliner & tata boga",
        "Statistik produk terlaris & riwayat pesanan realtime",
      ],
    },
    {
      id: "ejurnal",
      title: "6. E-Jurnal & Portofolio Siswa",
      tagline: "Pencatatan Jurnal Pembelajaran & Prakerin",
      image: "/assets/showcase/ejurnal.png",
      badge: "Kurikulum Merdeka",
      badgeColor: "bg-rose-600 text-white",
      desc: "Pusat portofolio digital siswa untuk mencatat jurnal harian praktik kejuruan, laporan PKL/Prakerin industri, serta validasi kompetensi kaprodi.",
      features: [
        "Validasi bukti tugas dan foto hasil karya praktik siswa",
        "Dashboard distribusi siswa kejuruan (TKJ, PPLG, dll)",
        "Master template resmi jurnal harian format sekolah",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-200/80 text-slate-800 print:bg-white print:text-black font-sans pb-16 print:pb-0">
      {/* Top Floating Control Bar (Strictly Hidden on Print) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm px-4 py-3 print-hide print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Tampilan:</span>
            <button
              onClick={() => setViewMode("a4-sheets")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                viewMode === "a4-sheets"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2 Lembar A4 (Pas Cetak)</span>
            </button>
            <button
              onClick={() => setViewMode("web-flow")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                viewMode === "web-flow"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tampilan Bebas</span>
            </button>

            <button
              onClick={handlePrint}
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Brosur (PDF / A4)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sheet Container */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 print:max-w-none print:px-0">
        {/* ========================================================================= */}
        {/* HALAMAN 1 (A4 SHEET 1 - COVER & MODUL 1 S/D 3)                           */}
        {/* ========================================================================= */}
        <section className="a4-print-page a4-page-1 my-6 bg-white sm:rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-8 print:my-0 print:border-none print:shadow-none print:rounded-none print:p-0">
          {/* Label Penanda Halaman di Layar Web */}
          <div className="print-hide print:hidden mb-4 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              Lembar 1: Halaman Depan Brosur (Kop Resmi, Highlight & Modul 1-3)
            </span>
            <span className="text-[11px] font-medium bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
              Format Standar A4 Portrait (210 x 297 mm)
            </span>
          </div>

          {/* KOP RESMI LEMBAGA (LOGO SMKN 1 BERINGIN + TULISAN RESMI + LOGO KOLABORASI SUMUT BERKAH) */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              {/* Logo SMKN 1 Beringin */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Logo SMKN 1 Beringin"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Kop Teks */}
              <div className="text-center flex-1 px-1">
                <h4 className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-700 uppercase leading-tight">
                  Pemerintah Provinsi Sumatera Utara • Dinas Pendidikan
                </h4>
                <h1 className="text-base sm:text-xl font-black text-slate-950 tracking-tight uppercase leading-tight mt-0.5">
                  SMK NEGERI 1 BERINGIN
                </h1>
                <h2 className="text-[11px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                  KABUPATEN DELI SERDANG — SUMATERA UTARA
                </h2>
                <p className="text-[8.5px] sm:text-[9.5px] text-slate-600 mt-0.5 leading-tight">
                  Jl. Pendidikan No. 1, Kec. Beringin, Kab. Deli Serdang, Sumatera Utara 20552
                  <br />
                  Website: <span className="font-semibold text-slate-800">smknegeri1beringin.sch.id</span> • Email: <span className="font-semibold text-slate-800">info@smknegeri1beringin.sch.id</span>
                </p>
              </div>

              {/* Logo Kolaborasi Sumut Berkah */}
              <div className="w-20 h-16 sm:w-24 sm:h-20 shrink-0 flex items-center justify-center">
                <img
                  src="/assets/logo-kolaborasi.png"
                  alt="Logo Kolaborasi Sumut Berkah"
                  className="w-full h-auto max-h-12 sm:max-h-14 object-contain"
                />
              </div>
            </div>
          </div>

          {/* HERO BANNER & DEVELOPER BADGE */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[9.5px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>Official Showcase Acara Smart School</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight uppercase leading-tight">
              EKOSISTEM DIGITAL SMART SCHOOL
            </h2>
            <p className="text-[10.5px] sm:text-xs font-medium text-slate-600 max-w-xl mx-auto leading-tight mt-0.5">
              Transformasi Terpadu Berbasis TI Menuju Sekolah Vokasi Unggul, Modern, Paperless, dan Siap Industri.
            </p>

            {/* Lencana Pencipta Resmi Dika Armadana */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inisiator &amp; Lead Software Engineer:</span>
              <span className="font-extrabold text-emerald-400">Dika Armadana</span>
              <span className="text-slate-300 font-normal text-[9px]">(Instagram: @dprxz_)</span>
            </div>
          </div>

          {/* BAR STATISTIK RINGKAS */}
          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 mb-4 text-center">
            <div className="border-r border-slate-200">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none">1.440+</div>
              <div className="text-[9px] text-slate-600 font-semibold mt-0.5">Siswa Terdata</div>
            </div>
            <div className="border-r border-slate-200">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none">135+</div>
              <div className="text-[9px] text-slate-600 font-semibold mt-0.5">Guru &amp; Staf</div>
            </div>
            <div className="border-r border-slate-200">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none">7 Jurusan</div>
              <div className="text-[9px] text-slate-600 font-semibold mt-0.5">Program Vokasi</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-emerald-800 leading-none">6 Modul</div>
              <div className="text-[9px] text-slate-600 font-semibold mt-0.5">Terintegrasi Penuh</div>
            </div>
          </div>

          {/* BAGIAN I: MODUL 1 (FEATURED) DAN MODUL 2 & 3 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
              <h3 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilar Utama Ekosistem Digital — Bagian I</span>
              </h3>
              <span className="text-[9.5px] font-bold text-slate-600">SMK Negeri 1 Beringin</span>
            </div>

            {/* MODUL 1: PORTAL UTAMA (FEATURED HORIZONTAL) */}
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs print-avoid-break">
              {/* Header di atas foto dengan Logo SMKN 1 Beringin & Logo Sumut Berkah */}
              <div className="flex items-center justify-between px-3 py-1 bg-slate-900 text-white text-[9.5px] font-bold">
                <div className="flex items-center gap-1.5">
                  <img src="/assets/logo.png" alt="" className="w-4 h-4 object-contain" />
                  <span>SMKN 1 BERINGIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <img src="/assets/logo-kolaborasi.png" alt="" className="h-3 w-auto object-contain brightness-0 invert" />
                  <span className="text-emerald-400 text-[9px]">KOLABORASI SUMUT BERKAH</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-2.5 items-center">
                {/* Gambar Screenshot */}
                <div
                  onClick={() => setActiveModalImg(systems[0])}
                  className="sm:col-span-6 relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
                >
                  <img
                    src={systems[0].image}
                    alt={systems[0].title}
                    className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                  />
                  <span className="absolute top-1.5 right-1.5 text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow-xs bg-blue-600 text-white">
                    Pusat Ekosistem
                  </span>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white print-hide print:hidden">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Perbesar</span>
                  </div>
                </div>

                {/* Deskripsi & Fitur */}
                <div className="sm:col-span-6 flex flex-col justify-center">
                  <h4 className="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                    {systems[0].title}
                  </h4>
                  <p className="text-[10px] font-bold text-emerald-800 mt-0.5">
                    {systems[0].tagline}
                  </p>
                  <p className="text-[9.5px] text-slate-600 mt-1 leading-snug">
                    {systems[0].desc}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[9px] text-slate-800 font-medium">
                    {systems[0].features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* MODUL 2 & 3: GRID 2 KOLOM BERDAMPINGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MODUL 2: SIDATA */}
              <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs flex flex-col justify-between print-avoid-break">
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold">
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span>SMKN 1 BERINGIN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo-kolaborasi.png" alt="" className="h-2.5 w-auto object-contain brightness-0 invert" />
                      <span className="text-emerald-400 text-[8.5px]">SUMUT BERKAH</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveModalImg(systems[1])}
                    className="relative aspect-[16/9] w-full border-b border-slate-200 bg-slate-100 group cursor-pointer overflow-hidden"
                  >
                    <img
                      src={systems[1].image}
                      alt={systems[1].title}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                    />
                    <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                      Master Data
                    </span>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-black text-slate-950 leading-tight">
                      {systems[1].title}
                    </h4>
                    <p className="text-[9.5px] font-bold text-emerald-800">
                      {systems[1].tagline}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      {systems[1].desc}
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[8.5px] text-slate-800">
                      {systems[1].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* MODUL 3: PRESENSI DIGITAL */}
              <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs flex flex-col justify-between print-avoid-break">
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold">
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span>SMKN 1 BERINGIN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo-kolaborasi.png" alt="" className="h-2.5 w-auto object-contain brightness-0 invert" />
                      <span className="text-emerald-400 text-[8.5px]">SUMUT BERKAH</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveModalImg(systems[2])}
                    className="relative aspect-[16/9] w-full border-b border-slate-200 bg-slate-100 group cursor-pointer overflow-hidden"
                  >
                    <img
                      src={systems[2].image}
                      alt={systems[2].title}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                    />
                    <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-700 text-white">
                      Kehadiran Digital
                    </span>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-black text-slate-950 leading-tight">
                      {systems[2].title}
                    </h4>
                    <p className="text-[9.5px] font-bold text-emerald-800">
                      {systems[2].tagline}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      {systems[2].desc}
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[8.5px] text-slate-800">
                      {systems[2].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER LEMBAR 1 */}
          <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500 font-medium">
            <span>SMK Negeri 1 Beringin • Ekosistem Smart School</span>
            <span className="font-bold text-slate-800">Bersambung ke Halaman 2 (Perpustakaan, SiswaPay, &amp; E-Jurnal) ➔</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HALAMAN 2 (A4 SHEET 2 - MODUL 4 S/D 6 & PENUTUP / PENGESAHAN)             */}
        {/* ========================================================================= */}
        <section className="a4-print-page a4-page-2 my-6 bg-white sm:rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-8 print:my-0 print:border-none print:shadow-none print:rounded-none print:p-0">
          {/* Label Penanda Halaman di Layar Web */}
          <div className="print-hide print:hidden mb-4 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
              Lembar 2: Halaman Belakang Brosur (Modul 4-6, Keunggulan &amp; Legalitas)
            </span>
            <span className="text-[11px] font-medium bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
              Format Standar A4 Portrait (210 x 297 mm)
            </span>
          </div>

          {/* HEADER MINI HALAMAN 2 DENGAN KOP DUAL LOGO */}
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="SMKN 1 Beringin" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                    SMK NEGERI 1 BERINGIN
                  </h4>
                  <p className="text-[8px] font-bold text-emerald-800 uppercase leading-none">
                    Lanjutan Showcase Ekosistem Smart School
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-[8.5px] font-extrabold text-slate-700 block">KOLABORASI SUMUT BERKAH</span>
                  <span className="text-[7.5px] text-slate-500">Provinsi Sumatera Utara</span>
                </div>
                <img src="/assets/logo-kolaborasi.png" alt="Sumut Berkah" className="h-6 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* BAGIAN II: PILAR UTAMA EKOSISTEM DIGITAL */}
          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
              <h3 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                <span>Pilar Utama Ekosistem Digital — Bagian II</span>
              </h3>
              <span className="text-[9.5px] font-bold text-slate-600">Terverifikasi Operasional</span>
            </div>

            {/* MODUL 4: E-PERPUSTAKAAN & COMMAND CENTER (FEATURED HORIZONTAL) */}
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs print-avoid-break">
              {/* Header di atas foto dengan Logo SMKN 1 Beringin & Logo Sumut Berkah */}
              <div className="flex items-center justify-between px-3 py-1 bg-slate-900 text-white text-[9.5px] font-bold">
                <div className="flex items-center gap-1.5">
                  <img src="/assets/logo.png" alt="" className="w-4 h-4 object-contain" />
                  <span>SMKN 1 BERINGIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <img src="/assets/logo-kolaborasi.png" alt="" className="h-3 w-auto object-contain brightness-0 invert" />
                  <span className="text-purple-300 text-[9px]">KOLABORASI SUMUT BERKAH</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-2.5 items-center">
                {/* Gambar Screenshot */}
                <div
                  onClick={() => setActiveModalImg(systems[3])}
                  className="sm:col-span-6 relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
                >
                  <img
                    src={systems[3].image}
                    alt={systems[3].title}
                    className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                  />
                  <span className="absolute top-1.5 right-1.5 text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow-xs bg-purple-700 text-white">
                    Command Center
                  </span>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white print-hide print:hidden">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Perbesar</span>
                  </div>
                </div>

                {/* Deskripsi & Fitur */}
                <div className="sm:col-span-6 flex flex-col justify-center">
                  <h4 className="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                    {systems[3].title}
                  </h4>
                  <p className="text-[10px] font-bold text-purple-800 mt-0.5">
                    {systems[3].tagline}
                  </p>
                  <p className="text-[9.5px] text-slate-600 mt-1 leading-snug">
                    {systems[3].desc}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[9px] text-slate-800 font-medium">
                    {systems[3].features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* MODUL 5 & 6: GRID 2 KOLOM BERDAMPINGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MODUL 5: SISWAPAY KANTIN */}
              <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs flex flex-col justify-between print-avoid-break">
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold">
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span>SMKN 1 BERINGIN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo-kolaborasi.png" alt="" className="h-2.5 w-auto object-contain brightness-0 invert" />
                      <span className="text-emerald-400 text-[8.5px]">SUMUT BERKAH</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveModalImg(systems[4])}
                    className="relative aspect-[16/9] w-full border-b border-slate-200 bg-slate-100 group cursor-pointer overflow-hidden"
                  >
                    <img
                      src={systems[4].image}
                      alt={systems[4].title}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                    />
                    <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-700 text-white">
                      Fintech Vokasi
                    </span>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-black text-slate-950 leading-tight">
                      {systems[4].title}
                    </h4>
                    <p className="text-[9.5px] font-bold text-amber-800">
                      {systems[4].tagline}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      {systems[4].desc}
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[8.5px] text-slate-800">
                      {systems[4].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* MODUL 6: E-JURNAL */}
              <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs flex flex-col justify-between print-avoid-break">
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold">
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                      <span>SMKN 1 BERINGIN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="/assets/logo-kolaborasi.png" alt="" className="h-2.5 w-auto object-contain brightness-0 invert" />
                      <span className="text-emerald-400 text-[8.5px]">SUMUT BERKAH</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveModalImg(systems[5])}
                    className="relative aspect-[16/9] w-full border-b border-slate-200 bg-slate-100 group cursor-pointer overflow-hidden"
                  >
                    <img
                      src={systems[5].image}
                      alt={systems[5].title}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform"
                    />
                    <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-700 text-white">
                      Portofolio Siswa
                    </span>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-black text-slate-950 leading-tight">
                      {systems[5].title}
                    </h4>
                    <p className="text-[9.5px] font-bold text-rose-800">
                      {systems[5].tagline}
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      {systems[5].desc}
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[8.5px] text-slate-800">
                      {systems[5].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-rose-700 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 NILAI KEUNGGULAN UTAMA SISTEM */}
          <div className="p-3 rounded-xl bg-slate-900 text-white mb-3 print-avoid-break">
            <h4 className="text-center text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
              Keunggulan Arsitektur Sistem Smart School SMKN 1 Beringin
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <h5 className="font-extrabold text-[10px] text-slate-100">100% Real-Time</h5>
                <p className="text-[8.5px] text-slate-300 mt-0.5 leading-tight">
                  Sinkronisasi presensi, peminjaman buku, dan transaksi tanpa jeda waktu.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <h5 className="font-extrabold text-[10px] text-slate-100">Keamanan Enterprise</h5>
                <p className="text-[8.5px] text-slate-300 mt-0.5 leading-tight">
                  Dilengkapi proteksi anti brute-force, hash Bcrypt, dan kontrol hak akses ketat.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <h5 className="font-extrabold text-[10px] text-slate-100">Inovasi Mandiri</h5>
                <p className="text-[8.5px] text-slate-300 mt-0.5 leading-tight">
                  Dirancang langsung oleh pengembang resmi sekolah sesuai kebutuhan vokasi.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER RESMI PENUTUP & PENGESAHAN HAK CIPTA */}
          <footer className="border-t-2 border-slate-900 pt-2.5 print-avoid-break">
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Kolom Kiri: Kontak Resmi Sekolah */}
              <div className="text-[9px] text-slate-700 leading-tight">
                <span className="font-black text-slate-950 uppercase block text-[10px]">
                  SMK NEGERI 1 BERINGIN DELI SERDANG
                </span>
                <p className="text-slate-600 mt-0.5">
                  Mencetak Generasi Vokasi Berkarakter, Kompeten, dan Berdaya Saing Industri Global.
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-slate-600">
                  <span>🌐 smknegeri1beringin.sch.id</span>
                  <span>✉️ info@smknegeri1beringin.sch.id</span>
                </div>
              </div>

              {/* Kolom Kanan: Pengembang Resmi & Hak Cipta */}
              <div className="text-right text-[9px] text-slate-700 leading-tight">
                <span className="font-black text-slate-950 block text-[10px]">
                  PENCIPTA &amp; LEAD DEVELOPER:
                </span>
                <p className="font-extrabold text-emerald-800 text-[10px] mt-0.5">
                  DIKA ARMADANA
                </p>
                <p className="text-slate-600">
                  Instagram Resmi:{" "}
                  <a
                    href="https://instagram.com/dprxz_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 underline"
                  >
                    @dprxz_
                  </a>
                </p>
                <p className="text-[8px] text-slate-500 mt-1">
                  © {new Date().getFullYear()} Hak Cipta Dilindungi UU No. 28 Tahun 2014 • SMKN 1 Beringin
                </p>
              </div>
            </div>
          </footer>
        </section>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeModalImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 print-hide print:hidden animate-fade-in"
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

            {/* Modal Footer */}
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
                className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
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
