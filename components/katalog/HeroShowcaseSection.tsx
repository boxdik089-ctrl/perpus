"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";

interface HeroShowcaseSectionProps {
  isDark: boolean;
  books?: any[];
  onSelectBook?: (book: any) => void;
}

export default function HeroShowcaseSection({
  isDark,
  books = [],
  onSelectBook,
}: HeroShowcaseSectionProps) {
  const [rotateX, setRotateX] = useState(12);
  const [rotateY, setRotateY] = useState(-6);
  const [rotateZ, setRotateZ] = useState(-6);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Curated list of iconic library books from the public catalog
  const catalogFeaturedBooks = useMemo(() => {
    const defaultFeatured = [
      {
        id: "cmvqcdhoy0000lg2p014f0xks",
        judul: "Atomic Habits",
        penulis: "James Clear",
        cover_url: "/uploads/covers/real-atomic-habits.jpg",
        kategori: "Pengembangan Diri",
      },
      {
        id: "cmvqcdhpb0009lg2ponykgfe6",
        judul: "Filosofi Teras",
        penulis: "Henry Manampiring",
        cover_url: "/uploads/covers/real-filosofi-teras.png",
        kategori: "Filsafat & Psikologi",
      },
      {
        id: "cmvqcdhps000plg2p4ony20uh",
        judul: "The Psychology of Money",
        penulis: "Morgan Housel",
        cover_url: "/uploads/covers/real-psychology-money.png",
        kategori: "Keuangan & Bisnis",
      },
      {
        id: "cmvqcdhqr001ulg2padl5wr2b",
        judul: "Laut Bercerita",
        penulis: "Leila S. Chudori",
        cover_url: "/uploads/covers/real-laut-bercerita.jpg",
        kategori: "Sastra & Fiksi",
      },
    ];

    if (!books || books.length === 0) return defaultFeatured;

    // Find real books from catalog
    const findBook = (query: string) =>
      books.find((b) => b.judul && b.judul.toLowerCase().includes(query.toLowerCase()));

    const bAtomic = findBook("Atomic Habits");
    const bFilosofi = findBook("Filosofi Teras");
    const bPsychology = findBook("Psychology of Money");
    const bLaut = findBook("Laut Bercerita") || findBook("Bumi Manusia");

    const found = [bAtomic, bFilosofi, bPsychology, bLaut].filter(Boolean);
    if (found.length >= 3) {
      return found.map((b) => ({
        id: b.id,
        judul: b.judul.split(":")[0], // clean short title
        penulis: b.penulis || "Penulis",
        cover_url: b.cover_url,
        kategori: b.kategori || "Buku Pilihan",
      }));
    }

    return defaultFeatured;
  }, [books]);

  // Active book displayed on the big 3D stage (defaults to Atomic Habits)
  const [activeBookIndex, setActiveBookIndex] = useState<number>(0);
  const activeBook = catalogFeaturedBooks[activeBookIndex] || catalogFeaturedBooks[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating books on the right: iconic catalog books
  const floatingBooks = useMemo(() => {
    return catalogFeaturedBooks;
  }, [catalogFeaturedBooks]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateY(-6 + (x / rect.width) * 14);
    setRotateX(12 - (y / rect.height) * 10);
    setRotateZ(-6 + (x / rect.width) * 3);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(12);
    setRotateY(-6);
    setRotateZ(-6);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    setRotateY(-6 + (x / rect.width) * 10);
    setRotateX(12 - (y / rect.height) * 8);
  };

  const handleTouchEnd = () => {
    setRotateX(12);
    setRotateY(-6);
    setRotateZ(-6);
  };

  const handleSwitchBook = (bookId: string) => {
    const newIdx = catalogFeaturedBooks.findIndex((b) => b.id === bookId);
    if (newIdx !== -1) {
      setActiveBookIndex(newIdx);
    }
  };

  return (
    <section className="relative w-full min-h-[600px] sm:min-h-[700px] lg:min-h-[820px] flex items-center overflow-hidden select-none">

      {/* ─── BACKGROUND ─────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">

        {/* Base gradient – sky in light, deep navy in dark */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-br from-[#060c1e] via-[#0d1635] to-[#09090b]"
            : "bg-gradient-to-br from-[#eaf6ff] via-[#dbeeff] to-[#f0f9ff]"
        }`} />

        {/* Radial glow centred-left behind the book */}
        <div className={`absolute top-0 -left-20 w-[780px] h-[780px] rounded-full blur-[120px] transition-colors duration-500 ${
          isDark ? "bg-blue-900/50" : "bg-sky-300/60"
        }`} />

        {/* Soft right-side accent */}
        <div className={`absolute top-0 right-0 w-[480px] h-[480px] rounded-full blur-[100px] transition-colors duration-500 ${
          isDark ? "bg-indigo-900/25" : "bg-indigo-200/50"
        }`} />

        {/* Subtle dot-grid */}
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]"
            : "bg-[radial-gradient(#0f172a08_1px,transparent_1px)] bg-[size:28px_28px]"
        }`} />

        {/* Bottom fade into catalog */}
        <div className={`absolute bottom-0 inset-x-0 h-32 ${
          isDark
            ? "bg-gradient-to-t from-[#09090b] to-transparent"
            : "bg-gradient-to-t from-[#f0f9ff] to-transparent"
        }`} />
      </div>

      {/* ─── CONTENT WRAPPER ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-14 w-full pt-20 sm:pt-24 lg:pt-14 pb-12 lg:pb-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-16 xl:gap-20">

          {/* ══════════════════════════════════════════════════
              COLUMN 1 – 3D BIG HARDCOVER BOOK (BACA. JELAJAHI. BERKEMBANG.)
              ══════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center w-full lg:w-auto">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              title="Perpustakaan Digital SMKN 1 Beringin • Baca. Jelajahi. Berkembang."
              className="relative flex-shrink-0 flex items-center justify-center cursor-pointer touch-manipulation group"
              style={{ perspective: 1400 }}
            >
              {/* Glow aura */}
              <div className={`absolute w-64 h-64 sm:w-80 sm:h-80 lg:w-[480px] lg:h-[480px] rounded-full blur-3xl -z-10 pointer-events-none transition-colors duration-700 ${
                isDark ? "bg-blue-600/35" : "bg-sky-400/50"
              }`} />

              {/* ── 3-D Book ── */}
              <div
                className="relative transition-all duration-300 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isHovered ? "-10px" : "0px"}) scale(${isHovered ? 1.025 : 1})`,
                  animation: mounted ? "heroFloat 5s ease-in-out infinite" : "none",
                }}
              >
                {/* Book wrapper – authentic A4 1:1.414 */}
                <div
                  className="book-3d-wrapper relative w-[210px] h-[297px] sm:w-[270px] sm:h-[382px] lg:w-[360px] lg:h-[510px]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT COVER (BACA. JELAJAHI. BERKEMBANG.) */}
                  <div
                    className="absolute inset-0 rounded-l-md rounded-r-xl lg:rounded-r-2xl overflow-hidden select-none"
                    style={{
                      background: isDark
                        ? "linear-gradient(150deg, #07132e 0%, #0c1e48 45%, #050b1a 100%)"
                        : "linear-gradient(150deg, #091a42 0%, #10265c 45%, #06112c 100%)",
                      border: "1px solid rgba(255,255,255,0.32)",
                      boxShadow: isDark
                        ? "0 40px 90px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(255,255,255,0.08)"
                        : "0 40px 90px -20px rgba(10,25,70,0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(255,255,255,0.12)",
                    }}
                  >
                    {/* Outer gold-cyan inlay border */}
                    <div className="absolute inset-2.5 sm:inset-3.5 lg:inset-4 border border-sky-400/25 rounded-xs pointer-events-none" />
                    <div className="absolute inset-3.5 sm:inset-5 lg:inset-5.5 border border-white/10 rounded-xs pointer-events-none" />

                    {/* Vintage bookbinding corner ornaments */}
                    <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
                    <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
                    <div className="absolute bottom-3.5 left-3.5 sm:bottom-5 sm:left-5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
                    <div className="absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

                    {/* Subtle dot-matrix library grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.06] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: "16px 16px",
                      }}
                    />

                    {/* 21st.dev tactile paper / bookcloth texture overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay bg-cover bg-center"
                      style={{
                        backgroundImage: "url('https://cdn.21st.dev/assets/mirror/1a/1a2ecfcafab4d36898151e5960d2bddd8c13c8b5e3721538ce626d366810e518.avif')",
                      }}
                    />

                    {/* Spine binding shadow on left */}
                    <div
                      className="absolute inset-y-0 left-0 w-[9%] pointer-events-none"
                      style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 100%)" }}
                    />

                    {/* Dynamic specular sheen reacting to 3D mouse rotation */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={{
                        background: `linear-gradient(${110 + rotateY}deg, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                      }}
                    />

                    {/* ─── COVER CONTENT ─── */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-7 lg:p-9 text-white">
                      {/* Header */}
                      <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 pt-1 sm:pt-2">
                        <div className="flex items-center gap-2">
                          <img src="/assets/logo.png" alt="SMKN 1 Beringin" className="w-4 h-4 sm:w-5 sm:h-5 object-contain drop-shadow" />
                          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-black uppercase text-amber-300/95 font-mono">
                            SMKN 1 BERINGIN
                          </span>
                        </div>
                        <div className="text-[8px] sm:text-[9px] tracking-wider uppercase text-sky-200/80 font-medium">
                          Perpustakaan Digital • Edisi Resmi
                        </div>
                        <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mt-0.5" />
                      </div>

                      {/* Center Title: BACA. JELAJAHI. BERKEMBANG. */}
                      <div className="flex flex-col items-center text-center my-auto py-2 sm:py-4">
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-sky-300 font-bold mb-1.5 sm:mb-2">
                          Koleksi Pustaka
                        </span>
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.02] drop-shadow-lg">
                          <span className="block text-white">Baca.</span>
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                            Jelajahi.
                          </span>
                          <span className="block text-white">Berkembang.</span>
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-sky-100/75 mt-2.5 sm:mt-3 max-w-[190px] sm:max-w-[220px] leading-relaxed font-light italic">
                          Gerbang ilmu, literasi kejuruan, dan referensi masa depan.
                        </p>
                      </div>

                      {/* Bottom Seal / Badges */}
                      <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2 pb-1 sm:pb-2">
                        <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mb-0.5" />
                        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                          <span>★ 7 Jurusan • 500+ Koleksi ★</span>
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-slate-300/70 tracking-widest uppercase font-mono">
                          SMKN1BERINGIN.SCH.ID
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PAGE STACK – right */}
                  <div className="book-page-right absolute top-[4px] bottom-[4px] pointer-events-none"
                    style={{
                      transformOrigin: "left center",
                      transform: "rotateY(90deg)",
                      background: "repeating-linear-gradient(to bottom, #f8fafc 0px, #f1f5f9 2px, #e2e8f0 3.5px, #cbd5e1 5px)",
                      boxShadow: "inset 3px 0 10px rgba(0,0,0,0.3), inset -2px 0 6px rgba(0,0,0,0.15)",
                    }} />

                  {/* PAGE EDGE – top */}
                  <div className="book-page-top absolute left-[5px] right-[5px] pointer-events-none"
                    style={{
                      transformOrigin: "bottom center",
                      transform: "rotateX(90deg)",
                      background: "linear-gradient(to right, #94a3b8, #dde6f0 12%, #f1f5f9 88%, #c8d5e2)",
                      boxShadow: "inset 0 4px 8px rgba(0,0,0,0.22)",
                    }} />

                  {/* PAGE EDGE – bottom */}
                  <div className="book-page-bottom absolute left-[5px] right-[5px] pointer-events-none"
                    style={{
                      transformOrigin: "top center",
                      transform: "rotateX(-90deg)",
                      background: "linear-gradient(to right, #94a3b8, #dde6f0 12%, #f1f5f9 88%, #c8d5e2)",
                      boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.22)",
                    }} />

                  {/* BACK COVER */}
                  <div className="book-back-cover absolute inset-0 rounded-l-md rounded-r-xl lg:rounded-r-2xl pointer-events-none"
                    style={{
                      background: isDark ? "#060d20" : "#0d1b3e",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.22)"}`,
                      boxShadow: "-22px 32px 60px rgba(0,0,0,0.5)",
                    }} />

                  {/* BOOKMARK RIBBON */}
                  <div className="book-bookmark absolute bottom-0 right-7 lg:right-12 pointer-events-none"
                    style={{ transform: `translateZ(calc(-0.45 * var(--book-d))) translateY(${isHovered ? "24px" : "16px"}) rotate(3deg)`, transition: "transform 0.5s ease" }}>
                    <div className="w-3.5 sm:w-4.5 lg:w-5 h-11 sm:h-14 lg:h-18 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 shadow"
                      style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }} />
                  </div>
                </div>

                {/* Floor shadow */}
                <div className="absolute -bottom-6 lg:-bottom-8 left-4 right-4 h-6 lg:h-8 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.75)" : "rgba(14,30,80,0.25)",
                    transform: `scale(${isHovered ? 1.08 : 0.9})`,
                    transition: "transform 0.3s ease",
                  }} />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              COLUMN 2 – HEADLINE + CTA + FLOATING CATALOG BOOKS
              ══════════════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-5 sm:gap-6 lg:gap-8 relative lg:min-h-[580px] lg:justify-center w-full">

            {/* Main headline */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-semibold w-fit mx-auto lg:mx-0 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Perpustakaan Digital SMKN 1 Beringin</span>
              </div>

              <h2 className={`text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.12] max-w-md xl:max-w-lg ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                Akses Ribuan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">
                  Buku &amp; E-Book
                </span>
                <br />
                Kapan Saja.
              </h2>

              <p className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}>
                Ribuan koleksi buku digital dan referensi fisik tersedia lengkap. Temukan buku pelajaran Kurikulum Merdeka, modul kejuruan 7 jurusan, karya sastra, dan novel populer untuk mendukung belajarmu.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex items-center justify-center lg:justify-start gap-5 sm:gap-8">
              {[
                { num: "500+", label: "Koleksi Buku" },
                { num: "7 Jurusan", label: "Referensi Lengkap" },
                { num: "24/7", label: "Akses Digital" },
              ].map(({ num, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className={`text-lg sm:text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {num}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5">
              <a
                href="#katalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-600/35 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lihat Koleksi Pustaka</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <Link
                href="/kartu"
                className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm border transition-all active:scale-95 hover:scale-[1.02] ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10 hover:border-white/20"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <span>Cek Kartu Siswa</span>
              </Link>
            </div>

            {/* Mobile Featured Book Quick Preview Strip (Under CTAs on mobile) */}
            <div className="lg:hidden flex flex-col items-center gap-2 w-full pt-2">
              <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Buku Populer Perpustakaan (Ketuk untuk detail):
              </span>
              <div className="flex items-center justify-center gap-2 w-full max-w-sm">
                {catalogFeaturedBooks.slice(0, 4).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBook?.(b)}
                    className={`flex-1 flex flex-col items-center p-1 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                      isDark
                        ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
                        : "bg-white hover:bg-slate-50 border-slate-200 shadow-xs"
                    }`}
                    title={`Lihat detail ${b.judul}`}
                  >
                    <div className="relative w-full aspect-[1/1.414] max-w-[48px] rounded overflow-hidden bg-slate-800 shadow-xs">
                      <img src={b.cover_url} alt={b.judul} className="w-full h-full object-cover select-none pointer-events-none" />
                    </div>
                    <span className={`text-[9px] font-semibold mt-1 w-full truncate text-center ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}>
                      {b.judul}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                FLOATING CATALOG BOOKS (Desktop only)
                ═════════════════════════════════════════════════════════════════ */}
            
            {/* Floating Book 1 – upper right */}
            {floatingBooks[0] && (
              <div
                onClick={() => {
                  onSelectBook?.(floatingBooks[0]);
                }}
                title={`Klik untuk melihat detail ${floatingBooks[0].judul}`}
                className="hidden lg:block absolute top-2 xl:top-5 right-2 xl:right-8 cursor-pointer group z-20"
                style={{
                  transform: `rotate(10deg) ${isHovered ? "translate(6px,-6px)" : "translate(0,0)"}`,
                  transition: "transform 0.6s ease",
                  animation: "sheetFloat1 6s ease-in-out infinite",
                }}
              >
                <div
                  className="relative w-[110px] h-[156px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2"
                  style={{
                    boxShadow: isDark
                      ? "0 22px 50px rgba(0,0,0,0.65), 0 0 15px rgba(56,189,248,0.2)"
                      : "0 20px 50px rgba(14,30,80,0.18), 0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <img
                    src={floatingBooks[0].cover_url}
                    alt={floatingBooks[0].judul}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div
                    className="absolute inset-y-0 left-0 w-[11%] pointer-events-none"
                    style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                  />
                  <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-r from-slate-300 to-slate-100 opacity-80" />
                  <div className="absolute inset-x-1 bottom-1 bg-slate-900/95 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-1 rounded text-center truncate opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                    {floatingBooks[0].judul}
                  </div>
                </div>
              </div>
            )}

            {/* Floating Book 2 – mid right */}
            {floatingBooks[1] && (
              <div
                onClick={() => {
                  onSelectBook?.(floatingBooks[1]);
                }}
                title={`Klik untuk melihat detail ${floatingBooks[1].judul}`}
                className="hidden lg:block absolute top-[215px] xl:top-[225px] right-10 xl:right-24 cursor-pointer group z-20"
                style={{
                  transform: `rotate(-7deg) ${isHovered ? "translate(8px,4px)" : "translate(0,0)"}`,
                  transition: "transform 0.6s ease",
                  animation: "sheetFloat2 7s ease-in-out infinite",
                }}
              >
                <div
                  className="relative w-[102px] h-[145px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2"
                  style={{
                    boxShadow: isDark
                      ? "0 20px 45px rgba(0,0,0,0.6), 0 0 15px rgba(56,189,248,0.2)"
                      : "0 18px 45px rgba(14,30,80,0.16), 0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <img
                    src={floatingBooks[1].cover_url}
                    alt={floatingBooks[1].judul}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div
                    className="absolute inset-y-0 left-0 w-[11%] pointer-events-none"
                    style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                  />
                  <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-r from-slate-300 to-slate-100 opacity-80" />
                  <div className="absolute inset-x-1 bottom-1 bg-slate-900/95 backdrop-blur-xs text-white text-[8.5px] font-bold px-1.5 py-1 rounded text-center truncate opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                    {floatingBooks[1].judul}
                  </div>
                </div>
              </div>
            )}

            {/* Floating Book 3 – lower right */}
            {floatingBooks[2] && (
              <div
                onClick={() => {
                  onSelectBook?.(floatingBooks[2]);
                }}
                title={`Klik untuk melihat detail ${floatingBooks[2].judul}`}
                className="hidden lg:block absolute top-[415px] xl:top-[430px] right-2 xl:right-8 cursor-pointer group z-20"
                style={{
                  transform: `rotate(12deg) ${isHovered ? "translate(6px,6px)" : "translate(0,0)"}`,
                  transition: "transform 0.6s ease",
                  animation: "sheetFloat3 8s ease-in-out infinite",
                }}
              >
                <div
                  className="relative w-[94px] h-[134px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2"
                  style={{
                    boxShadow: isDark
                      ? "0 18px 40px rgba(0,0,0,0.55), 0 0 15px rgba(56,189,248,0.2)"
                      : "0 16px 40px rgba(14,30,80,0.14), 0 2px 6px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <img
                    src={floatingBooks[2].cover_url}
                    alt={floatingBooks[2].judul}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div
                    className="absolute inset-y-0 left-0 w-[11%] pointer-events-none"
                    style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                  />
                  <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-r from-slate-300 to-slate-100 opacity-80" />
                  <div className="absolute inset-x-1 bottom-1 bg-slate-900/95 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-1 rounded text-center truncate opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                    {floatingBooks[2].judul}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Wind trail SVG (full width, behind content) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-[5] hidden md:block" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none">
        <path d="M 120,680 C 300,620 500,520 820,300 C 960,210 1080,130 1200,60"
          stroke={isDark ? "rgba(56,189,248,0.18)" : "rgba(14,165,233,0.25)"}
          strokeWidth="2" strokeLinecap="round" strokeDasharray="8 10" />
        <path d="M 200,740 C 420,670 650,560 950,340 C 1080,260 1220,170 1380,90"
          stroke={isDark ? "rgba(99,102,241,0.12)" : "rgba(79,70,229,0.15)"}
          strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 60,620 C 240,570 420,490 700,310"
          stroke={isDark ? "rgba(56,189,248,0.12)" : "rgba(14,165,233,0.18)"}
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Keyframe animations via style tag */}
      <style>{`
        .book-3d-wrapper {
          --book-d: 22px;
        }
        @media (min-width: 640px) {
          .book-3d-wrapper {
            --book-d: 28px;
          }
        }
        @media (min-width: 1024px) {
          .book-3d-wrapper {
            --book-d: 36px;
          }
        }
        .book-page-right {
          width: var(--book-d);
          right: calc(-1 * var(--book-d));
        }
        .book-page-top {
          height: var(--book-d);
          top: calc(-1 * var(--book-d));
        }
        .book-page-bottom {
          height: var(--book-d);
          bottom: calc(-1 * var(--book-d));
        }
        .book-back-cover {
          transform: translateZ(calc(-1 * var(--book-d)));
        }

        @keyframes heroFloat {
          0%, 100% { transform: rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0px); }
          50%       { transform: rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px); }
        }
        @keyframes sheetFloat1 {
          0%, 100% { margin-top: 0px; }
          50%       { margin-top: -6px; }
        }
        @keyframes sheetFloat2 {
          0%, 100% { margin-top: 0px; }
          50%       { margin-top: -6px; }
        }
        @keyframes sheetFloat3 {
          0%, 100% { margin-top: 0px; }
          50%       { margin-top: -6px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

    </section>
  );
}
