"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  LayoutGrid,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Layers,
  Sparkles,
  School,
  QrCode,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface SlideData {
  id: number;
  category: string;
  title: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    category: "COVER RESMI",
    title: "Perpustakaan Digital SMKN 1 Beringin",
    subtitle: "Sistem Informasi Pustaka, E-Book Kejuruan & Kiosk Presensi Mandiri"
  },
  {
    id: 2,
    category: "LATAR BELAKANG",
    title: "Latar Belakang & Urgensi Digitalisasi",
    subtitle: "Transformasi dari pencatatan manual menuju tata kelola perpustakaan modern"
  },
  {
    id: 3,
    category: "BERANDA UTAMA",
    title: "Halaman Utama (Beranda Website)",
    subtitle: "Antarmuka ramah pengguna dengan visualisasi buku 3D dan profil sekolah"
  },
  {
    id: 4,
    category: "KATALOG & E-BOOK",
    title: "Katalog Koleksi & Bahan Ajar Kejuruan",
    subtitle: "Penyaringan 7 program keahlian dan fitur pembaca e-book terintegrasi"
  },
  {
    id: 5,
    category: "KARTU DIGITAL",
    title: "Kartu Perpustakaan Digital Siswa",
    subtitle: "Identitas digital mandiri berbasis NISN dengan Barcode & QR Code"
  },
  {
    id: 6,
    category: "KIOSK PRESENSI",
    title: "Kiosk Presensi Mandiri Siswa",
    subtitle: "Pencatatan kunjungan kilat 1 detik di pintu masuk perpustakaan tanpa kertas"
  },
  {
    id: 7,
    category: "LAYANAN INFORMASI",
    title: "Layanan WhatsApp & Bantuan Informasi",
    subtitle: "Pengingat otomatis H-1 jatuh tempo dan bantuan pencarian letak rak buku"
  },
  {
    id: 8,
    category: "PENUTUP",
    title: "Kesimpulan & Akses Sistem",
    subtitle: "Tautan resmi perpustakaan dan semboyan vokasi SMKN 1 Beringin"
  }
];

export default function PresentationViewer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = SLIDES.length;

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        setIsGridView((prev) => !prev);
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, toggleFullscreen, totalSlides]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://perpustakaan.tiksmkn1beringin.my.id");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none ${
        isFullscreen ? "p-0 bg-black" : "p-3 sm:p-6"
      }`}
    >
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-none">
              Presentasi Perpustakaan SMKN 1 Beringin
            </span>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2">
          {/* Slide Indicator Badge */}
          <div className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] sm:text-xs font-bold text-sky-400 border border-slate-700/60">
            Slide {currentSlide + 1} / {totalSlides}
          </div>

          {/* Toggle Grid View Button */}
          <button
            onClick={() => setIsGridView((prev) => !prev)}
            className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isGridView
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            title="Tampilan Grid Lembaran (G)"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">{isGridView ? "Mode Slide" : "Semua Slide"}</span>
          </button>

          {/* Download PPTX Button */}
          <a
            href="/uploads/Presentasi-Perpustakaan-SMKN1-Beringin-Final.pptx"
            download="Presentasi-Perpustakaan-SMKN1-Beringin.pptx"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00367E] hover:bg-[#002a63] text-white transition-colors flex items-center gap-1.5 border border-blue-500/30 shadow-xs"
            title="Unduh File PowerPoint (.pptx)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh PPTX</span>
          </a>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Layar Penuh (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Presentation Viewport */}
      {isGridView ? (
        /* GRID VIEW: All 8 Slides at a glance */
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                Daftar Seluruh Slide Presentasi (8 Slide)
              </h2>
              <span className="text-xs text-slate-400">Klik salah satu slide untuk membukanya</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setIsGridView(false);
                  }}
                  className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 text-left ${
                    currentSlide === idx
                      ? "border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/50"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg bg-slate-950 border border-slate-800 mb-2.5 flex flex-col items-center justify-center p-3 text-center overflow-hidden relative">
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      #{slide.id}
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-200 leading-snug line-clamp-2">
                      {slide.title}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-2">{slide.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{slide.title}</span>
                    <span className="text-[10px] text-sky-400 font-semibold">{slide.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SLIDE VIEW: 16:9 Screen Presentation Canvas */
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
          {/* 16:9 Canvas Container */}
          <div className="w-full max-w-6xl aspect-[16/9] bg-white text-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
            
            {/* Header Content Slide (Slide 2 - 7) */}
            {currentSlide > 0 && currentSlide < 7 && (
              <div className="px-6 sm:px-10 pt-5 sm:pt-6 pb-3 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#00367E] uppercase font-sans">
                    PERPUSTAKAAN DIGITAL SMK NEGERI 1 BERINGIN
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                    Slide {currentSlide + 1} dari {totalSlides}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {SLIDES[currentSlide].title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal">
                  {SLIDES[currentSlide].subtitle}
                </p>
              </div>
            )}

            {/* Slide Body Canvas */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
              
              {/* ========================================== */}
              {/* SLIDE 1: COVER RESMI */}
              {/* ========================================== */}
              {currentSlide === 0 && (
                <div className="w-full h-full bg-[#00367E] text-white p-6 sm:p-12 flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

                  {/* Top Header with Logo */}
                  <div className="relative z-10 flex items-center gap-3">
                    <img
                      src="/assets/logo.png"
                      alt="Logo SMKN 1 Beringin"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain p-1 bg-white rounded-full shadow-md"
                    />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold tracking-wider text-sky-200 uppercase">
                        SMK NEGERI 1 BERINGIN
                      </h3>
                      <p className="text-[10.5px] sm:text-xs text-slate-300">
                        Kecamatan Beringin, Kabupaten Deli Serdang, Sumatera Utara
                      </p>
                    </div>
                  </div>

                  {/* Center Content: Title & Building Photo */}
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
                    <div className="md:col-span-7">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-sky-200 text-xs font-semibold mb-3 border border-sky-400/30">
                        Sistem Informasi & Tata Kelola Pustaka Sekolah
                      </span>
                      <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black leading-tight tracking-tight text-white mb-3">
                        PERPUSTAKAAN DIGITAL <br />
                        <span className="text-sky-300">SMKN 1 BERINGIN</span>
                      </h1>
                      <div className="w-16 h-1 bg-amber-400 rounded-full mb-4" />
                      <p className="text-xs sm:text-base text-sky-100 font-medium leading-relaxed max-w-xl">
                        Katalog Buku Kurikulum Merdeka, Pembaca E-Book 7 Jurusan, serta Kiosk Presensi Mandiri
                        Pengganti Buku Tamu Konvensional.
                      </p>
                      <p className="text-xs sm:text-sm italic text-sky-200/90 mt-4">
                        &ldquo;Berilmu, Berkarakter, Berdaya Saing&rdquo; • SMK Bisa, SMK Hebat
                      </p>
                    </div>

                    {/* School Building Photo Box */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="w-full rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl bg-white/10">
                        <img
                          src="/assets/gedung-smk-user.jpg"
                          alt="Gedung SMKN 1 Beringin"
                          className="w-full aspect-[1.91/1] object-cover"
                        />
                      </div>
                      <div className="mt-3 w-full bg-blue-950/80 border border-blue-400/30 rounded-lg p-3 text-left">
                        <p className="text-[11px] font-bold text-amber-300 mb-1">
                          Cakupan Sistem Perpustakaan:
                        </p>
                        <ul className="text-[10px] sm:text-[11px] text-slate-200 space-y-1">
                          <li>• 500+ Koleksi Buku Teks & Modul Produktif</li>
                          <li>• Bahan Ajar Lengkap 7 Program Keahlian Vokasi</li>
                          <li>• Presensi Scan Kiosk & Akses Baca Online 24/7</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="relative z-10 pt-3 border-t border-blue-400/30 flex items-center justify-between text-[11px] text-sky-200">
                    <span>Tim Pengelola Perpustakaan SMKN 1 Beringin</span>
                    <span>Tahun Ajaran 2024 / 2025</span>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 2: LATAR BELAKANG & URGENSI */}
              {/* ========================================== */}
              {currentSlide === 1 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[460px]">
                    {/* Left Column: Challenges */}
                    <div className="bg-white border border-red-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <h3 className="text-sm sm:text-base font-extrabold text-red-900">
                            Tantangan Sistem Manual Sebelumnya
                          </h3>
                        </div>
                        <div className="space-y-3.5 text-slate-700">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              1. Pencatatan Tamu Masih di Buku Kertas
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Buku tamu fisik rentan sobek, antrean panjang saat jam istirahat, dan data kunjungan sulit direkapitulasi secara berkala.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              2. Sirkulasi Peminjaman Rawan Tercecer
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Pencatatan kartu gantung manual menyulitkan pemantauan buku yang melewati batas pinjam 7 hari, sehingga buku sering terlambat.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              3. Keterbatasan Waktu Akses Membaca
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Buku fisik hanya dapat dibaca saat jam operasional sekolah. Siswa kesulitan mengakses materi modul saat belajar di rumah.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              4. Kebutuhan Referensi 7 Kejuruan
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Siswa vokasi (PPLG, TJKT, Busana, Kuliner, Perhotelan, ULW, Kecantikan) memerlukan modul kejuruan yang mudah dicari.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Solutions */}
                    <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-[#00367E]" />
                          <h3 className="text-sm sm:text-base font-extrabold text-[#00367E]">
                            Solusi & Manfaat Sistem Digital
                          </h3>
                        </div>
                        <div className="space-y-3.5 text-slate-700">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#00367E]">
                              1. Presensi Mandiri 1 Detik di Layar Kiosk
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Siswa cukup memindai barcode kartu anggota digital di depan kamera kiosk saat memasuki perpustakaan tanpa kertas.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#00367E]">
                              2. Notifikasi Pengingat Otomatis via WhatsApp
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Sistem otomatis mengirimkan rincian bukti pinjam serta pengingat H-1 jatuh tempo langsung ke nomor WhatsApp siswa.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#00367E]">
                              3. Katalog Terpadu & Pembaca E-Book 24 Jam
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Modul kejuruan dan buku teks Kurikulum Merdeka dapat dibaca secara daring langsung dari ponsel atau laptop siswa.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#00367E]">
                              4. Kartu Anggota Digital Berbasis NISN
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Siswa dapat mengakses dan mengunduh kartu resmi hanya dengan mengetikkan NISN tanpa khawatir kartu fisik hilang.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 3: HALAMAN BERANDA */}
              {/* ========================================== */}
              {currentSlide === 2 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Browser Mockup with Screenshot */}
                    <div className="lg:col-span-6 flex justify-center">
                      <div className="w-full max-w-[490px] rounded-xl border border-slate-300 shadow-md bg-white overflow-hidden">
                        {/* Browser Bar */}
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 truncate">
                            perpustakaan.tiksmkn1beringin.my.id
                          </div>
                        </div>
                        {/* Image Screenshot */}
                        <img
                          src="/assets/presentasi/hero_crop.png"
                          alt="Halaman Beranda"
                          className="w-full aspect-[1.85/1] object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: Feature Highlights */}
                    <div className="lg:col-span-6 space-y-3.5">
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          1. Desain Buku Terbuka 3D Khas SMKN 1 Beringin
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Menampilkan visual buku terbuka dengan foto gedung sekolah asli yang diperjelas secara HD, menciptakan identitas visual institusi yang khas dan profesional.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          2. Memuat Visi & Karakter Vokasi (BAB 1 & BAB 2)
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Halaman buku menguraikan profil SMKN 1 Beringin serta semboyan &ldquo;SMK Bisa, SMK Hebat, Vokasi Kuat Menguatkan Indonesia&rdquo;.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          3. Ringkasan Statistik Koleksi Real-Time
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Menampilkan data 500+ koleksi buku, ketersediaan bahan ajar 7 jurusan kejuruan, serta kesiapan layanan online 24 jam.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          4. Navigasi Cepat Pengunjung
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Siswa dapat langsung mengklik tombol &lsquo;Lihat Koleksi Pustaka&rsquo; untuk mencari buku atau tombol &lsquo;Cek Kartu&rsquo; untuk memeriksa kartu anggota mereka.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 4: KATALOG BUKU & E-BOOK */}
              {/* ========================================== */}
              {currentSlide === 3 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Browser Mockup with Screenshot */}
                    <div className="lg:col-span-6 flex justify-center">
                      <div className="w-full max-w-[460px] rounded-xl border border-slate-300 shadow-md bg-white overflow-hidden">
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 truncate">
                            perpustakaan.tiksmkn1beringin.my.id/buku
                          </div>
                        </div>
                        <img
                          src="/assets/presentasi/catalog_crop.png"
                          alt="Katalog Buku"
                          className="w-full aspect-[1.45/1] object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: Feature Highlights */}
                    <div className="lg:col-span-6 space-y-3.5">
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          1. Penyaringan Khusus 7 Program Keahlian
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Tersedia tab filter untuk jurusan PPLG, TJKT, Tata Busana, Kuliner, Perhotelan, Usaha Layanan Wisata (ULW), dan Kecantikan/Spa.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          2. Pembaca E-Book Terintegrasi di Browser
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Modul dan buku Kurikulum Merdeka yang memiliki versi digital dapat dibaca langsung di browser HP atau laptop tanpa instal aplikasi tambahan.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          3. Pencarian Cepat & Akurat
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Mendukung pencarian instan berdasarkan judul buku, nama penulis, penerbit, maupun kategori mata pelajaran produktif kejuruan.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          4. Klasifikasi Kode Rak DDC Otomatis
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Sistem otomatis mengisi nomor klasifikasi Dewey (DDC) dan penanda rak fisik saat petugas menginput nomor ISBN buku baru.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 5: KARTU DIGITAL SISWA */}
              {/* ========================================== */}
              {currentSlide === 4 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Browser Mockup with Screenshot */}
                    <div className="lg:col-span-6 flex justify-center">
                      <div className="w-full max-w-[470px] rounded-xl border border-slate-300 shadow-md bg-white overflow-hidden">
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 truncate">
                            perpustakaan.tiksmkn1beringin.my.id/kartu
                          </div>
                        </div>
                        <img
                          src="/assets/presentasi/kartu_crop.png"
                          alt="Kartu Siswa Digital"
                          className="w-full aspect-[1.55/1] object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: Feature Highlights */}
                    <div className="lg:col-span-6 space-y-3.5">
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          1. Akses Mandiri Cukup dengan NISN
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Siswa tidak perlu khawatir kartu tertinggal atau hilang. Cukup ketikkan NISN, kartu resmi langsung terbit di layar ponsel.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          2. Dilengkapi Barcode & QR Code Unik
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Memuat kode identitas digital resmi untuk proses pemindaian saat meminjam buku fisik di meja sirkulasi atau di Kiosk presensi.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          3. Fitur Simpan / Unduh ke Galeri Ponsel
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Siswa dapat mengunduh gambar kartu anggota dalam resolusi tinggi untuk ditunjukkan sewaktu-waktu kepada petugas perpustakaan.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          4. Informasi Ketentuan & Tata Tertib
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Mencantumkan batas waktu pinjam 7 hari, kewajiban menjaga kondisi fisik buku, serta tata tertib di dalam ruang baca perpustakaan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 6: KIOSK PRESENSI MANDIRI */}
              {/* ========================================== */}
              {currentSlide === 5 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Browser Mockup with Screenshot */}
                    <div className="lg:col-span-6 flex justify-center">
                      <div className="w-full max-w-[470px] rounded-xl border border-slate-300 shadow-md bg-white overflow-hidden">
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 truncate">
                            perpustakaan.tiksmkn1beringin.my.id/kiosk
                          </div>
                        </div>
                        <img
                          src="/assets/presentasi/kiosk_crop.png"
                          alt="Kiosk Presensi Mandiri"
                          className="w-full aspect-[1.51/1] object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: Feature Highlights */}
                    <div className="lg:col-span-6 space-y-3.5">
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          1. Presensi Kilat 1 Detik di Pintu Masuk
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Perangkat kiosk ditempatkan di depan pintu perpustakaan. Siswa cukup menghadapkan barcode kartu digital ke kamera scanner.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          2. Pengganti Buku Tamu Kertas (Paperless)
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Menghilangkan antrean tanda tangan manual di jam istirahat serta menghemat biaya pengadaan buku tamu fisik sekolah.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          3. Validasi Pencegahan Presensi Ganda
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Sistem cerdas mendeteksi jika siswa sudah melakukan scan di hari yang sama agar data statistik pengunjung tidak terduplikasi.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00367E]">
                          4. Rekapitulasi Kunjungan Otomatis
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                          Petugas perpustakaan dapat memantau data pengunjung harian, jurusan teraktif, dan mengekspor rekapitulasi untuk akreditasi perpustakaan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 7: WHATSAPP & BANTUAN INFORMASI */}
              {/* ========================================== */}
              {currentSlide === 6 && (
                <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[460px]">
                    {/* Left Card: WhatsApp */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-emerald-600" />
                          <h3 className="text-sm sm:text-base font-extrabold text-[#00367E]">
                            1. Notifikasi Pengingat WhatsApp
                          </h3>
                        </div>
                        <div className="space-y-3.5 text-slate-700">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Bukti Peminjaman Digital Langsung
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Saat meminjam buku di meja sirkulasi, siswa otomatis menerima rincian judul dan tanggal batas pengembalian di nomor WhatsApp mereka.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Pesan Pengingat H-1 Jatuh Tempo
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Satu hari sebelum batas waktu peminjaman 7 hari berakhir, sistem secara otomatis mengingatkan siswa agar bersiap mengembalikan buku.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Pemberitahuan Keterlambatan Ramah
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Bagi siswa yang belum mengembalikan setelah 7 hari, sistem mengirimkan pesan sopan agar buku segera dikembalikan ke perpustakaan.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Kelancaran Sirkulasi Koleksi
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Menurunkan persentase buku tertahan di luar sekolah dan memastikan ketersediaan buku ajar tetap seimbang untuk siswa lainnya.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Tanya Pustaka */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Search className="w-5 h-5 text-sky-600" />
                          <h3 className="text-sm sm:text-base font-extrabold text-[#00367E]">
                            2. Layanan Informasi &ldquo;Tanya Pustaka&rdquo;
                          </h3>
                        </div>
                        <div className="space-y-3.5 text-slate-700">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Penunjuk Lokasi Rak Buku Fisik
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Siswa yang bingung mencari buku dapat bertanya langsung pada widget informasi dan memperoleh informasi nomor rak fisik di perpustakaan.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Rekomendasi Referensi Pelajaran
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Memberikan saran judul buku yang relevan berdasarkan topik tugas atau materi produktif kejuruan yang sedang dibahas di kelas.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Panduan Ketentuan Peminjaman
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Menjelaskan batas peminjaman 7 hari, tata cara pembuatan kartu perpustakaan, dan prosedur perpanjangan pinjaman.
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              • Layanan Informasi Fleksibel 24 Jam
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Siswa yang belajar di rumah pada malam hari tetap dapat mencari informasi ketersediaan koleksi sebelum berkunjung ke perpustakaan.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* SLIDE 8: PENUTUP & KESIMPULAN */}
              {/* ========================================== */}
              {currentSlide === 7 && (
                <div className="w-full h-full bg-[#00367E] text-white p-6 sm:p-12 flex flex-col justify-between items-center text-center relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center">
                    <img
                      src="/assets/logo.png"
                      alt="Logo SMKN 1 Beringin"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain p-1.5 bg-white rounded-full shadow-lg mb-4"
                    />
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
                      TERIMA KASIH
                    </h1>
                    <p className="text-sm sm:text-lg italic text-sky-200 font-serif">
                      &ldquo;SMK Bisa, SMK Hebat — Vokasi Kuat Menguatkan Indonesia&rdquo;
                    </p>
                  </div>

                  {/* System Access Card */}
                  <div className="relative z-10 w-full max-w-lg bg-blue-950/80 border border-blue-400/40 rounded-xl p-5 shadow-xl text-center">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Akses Website Resmi Perpustakaan
                    </p>
                    <a
                      href="https://perpustakaan.tiksmkn1beringin.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm sm:text-lg font-bold text-white hover:text-sky-300 underline underline-offset-4 transition-colors mb-3"
                    >
                      <span>https://perpustakaan.tiksmkn1beringin.my.id</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? "Tautan Disalin!" : "Salin Tautan"}</span>
                      </button>

                      <a
                        href="/uploads/Presentasi-Perpustakaan-SMKN1-Beringin-Final.pptx"
                        download="Presentasi-Perpustakaan-SMKN1-Beringin.pptx"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File PPTX</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="relative z-10 text-[11px] sm:text-xs text-sky-200">
                    <p>SMK Negeri 1 Beringin • Kabupaten Deli Serdang, Sumatera Utara</p>
                  </div>
                </div>
              )}

            </div>

            {/* Slide Footer Info Bar (Slide 2 - 7) */}
            {currentSlide > 0 && currentSlide < 7 && (
              <div className="px-6 sm:px-10 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
                <span>Sistem Informasi Perpustakaan Digital • SMK Negeri 1 Beringin</span>
                <span className="font-semibold text-[#00367E]">
                  Katalog, E-Book Kejuruan & Kiosk Presensi
                </span>
              </div>
            )}
          </div>

          {/* Floating Left/Right Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 shadow-xl transition-transform hover:scale-110 active:scale-95"
            title="Slide Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 shadow-xl transition-transform hover:scale-110 active:scale-95"
            title="Slide Selanjutnya (Panah Kanan / Space)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Bottom Thumbnail Navigator Strip (Slide Mode Only) */}
      {!isGridView && (
        <footer className="mt-4 pt-2 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Keyboard Shortcuts Hint */}
            <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-3">
              <span>Pintasan:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">← / →</kbd>
              <span>Ganti Slide</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">F</kbd>
              <span>Layar Penuh</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">G</kbd>
              <span>Semua Slide</span>
            </div>

            {/* Quick Slide Navigation Dots / Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                    currentSlide === idx
                      ? "bg-sky-500 text-slate-950 shadow-md scale-105"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                  title={`${slide.id}. ${slide.title}`}
                >
                  <span>{slide.id}</span>
                  <span className="hidden md:inline font-normal truncate max-w-[90px]">{slide.category}</span>
                </button>
              ))}
            </div>

            {/* Prev / Next Buttons for Mobile/Tablet */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={goToNext}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

