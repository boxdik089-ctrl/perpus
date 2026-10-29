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
  // 3D Tilt parameters: tilted inward so the book emerges grandly from the far-left corner
  const [rotateX, setRotateX] = useState(8);
  const [rotateY, setRotateY] = useState(-13);
  const [rotateZ, setRotateZ] = useState(-3);
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

  // Floating books on the right: the other featured books in circulation
  const floatingBooks = useMemo(() => {
    return catalogFeaturedBooks.filter((_, idx) => idx !== activeBookIndex).slice(0, 3);
  }, [catalogFeaturedBooks, activeBookIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateY(-13 + (x / rect.width) * 10);
    setRotateX(8 - (y / rect.height) * 8);
    setRotateZ(-3 + (x / rect.width) * 2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(8);
    setRotateY(-13);
    setRotateZ(-3);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    setRotateY(-13 + (x / rect.width) * 8);
    setRotateX(8 - (y / rect.height) * 6);
  };

  const handleTouchEnd = () => {
    setRotateX(8);
    setRotateY(-13);
    setRotateZ(-3);
  };

  const handleSwitchBook = (bookId: string) => {
    const newIdx = catalogFeaturedBooks.findIndex((b) => b.id === bookId);
    if (newIdx !== -1) {
      setActiveBookIndex(newIdx);
    }
  };

  return (
    <section className="relative w-full min-h-[600px] sm:min-h-[700px] lg:min-h-[820px] xl:min-h-[880px] 2xl:min-h-[920px] flex items-center overflow-hidden select-none">

      {/* ─── BACKGROUND ─────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">

        {/* Base gradient – sky in light, deep navy in dark */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-br from-[#060c1e] via-[#0d1635] to-[#09090b]"
            : "bg-gradient-to-br from-[#eaf6ff] via-[#dbeeff] to-[#f0f9ff]"
        }`} />

        {/* Radial glow centred behind the giant left corner book */}
        <div className={`absolute top-1/2 -translate-y-1/2 -left-28 w-[950px] h-[950px] rounded-full blur-[150px] transition-colors duration-500 ${
          isDark ? "bg-blue-900/50" : "bg-sky-300/60"
        }`} />

        {/* Soft right-side accent */}
        <div className={`absolute top-0 right-0 w-[520px] h-[520px] rounded-full blur-[110px] transition-colors duration-500 ${
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

      {/* ─── CONTENT WRAPPER (FLEX LAYOUT FOR PRECISE SPACING & MASSIVE 3D BOOK) ─── */}
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 pt-16 sm:pt-20 lg:pt-12 pb-12 lg:pb-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-16">

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 1 – 3D BOOK SHOWCASE
            Mobile (<1024px): 4-Book Interactive Fan Showcase
            Desktop (>=1024px): MASSIVE 3D HARDCOVER BOOK (spanning top to bottom)
            ══════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-start lg:-ml-12 xl:-ml-16 2xl:-ml-20 shrink-0 z-20">

          {/* ─── MOBILE / TABLET 4-BOOK INTERACTIVE FAN SHOWCASE (lg:hidden) ─── */}
          <div className="lg:hidden flex flex-col items-center w-full mb-4">
            {/* Fan Stage Wrapper */}
            <div className="relative w-full max-w-[340px] h-[195px] flex items-center justify-center my-2">
              {/* Radial glow background */}
              <div className={`absolute w-64 h-64 rounded-full blur-3xl -z-10 pointer-events-none transition-colors duration-700 ${
                isDark ? "bg-blue-600/35" : "bg-sky-400/40"
              }`} />

              {/* The 4 fanned books */}
              {catalogFeaturedBooks.slice(0, 4).map((book, idx) => {
                const isActive = idx === activeBookIndex;
                const offsets = [
                  { x: -92, y: 12, rot: -14 },
                  { x: -30, y: 4,  rot: -5 },
                  { x: 30,  y: 4,  rot: 5 },
                  { x: 92,  y: 12, rot: 14 },
                ];
                const slot = offsets[idx] || { x: 0, y: 0, rot: 0 };
                
                const currentX = slot.x;
                const currentY = isActive ? slot.y - 14 : slot.y;
                const currentRot = isActive ? slot.rot * 0.35 : slot.rot;
                const currentScale = isActive ? 1.08 : 0.92;
                const zIndex = isActive ? 35 : (idx === 1 || idx === 2 ? 20 : 10);

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      if (isActive) {
                        onSelectBook?.(book);
                      } else {
                        setActiveBookIndex(idx);
                      }
                    }}
                    className="absolute cursor-pointer touch-manipulation select-none"
                    style={{
                      transform: `translate3d(${currentX}px, ${currentY}px, 0px) rotate(${currentRot}deg) scale(${currentScale})`,
                      zIndex,
                      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    title={isActive ? `Buka detail ${book.judul}` : `Tampilkan ${book.judul}`}
                  >
                    {/* Book card wrapper */}
                    <div
                      className={`relative w-[105px] h-[148px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 ${
                        isActive
                          ? "ring-2 ring-sky-400/70 shadow-2xl shadow-sky-500/30"
                          : "hover:scale-102 hover:-translate-y-1 shadow-lg shadow-black/20"
                      }`}
                      style={{
                        border: "1px solid rgba(255,255,255,0.22)",
                      }}
                    >
                      {/* Cover image */}
                      <img
                        src={book.cover_url}
                        alt={book.judul}
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                        loading="lazy"
                        draggable={false}
                      />

                      {/* Inactive overlay */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/25 transition-opacity" />
                      )}

                      {/* Spine shadow on left */}
                      <div
                        className="absolute inset-y-0 left-0 w-[11%] pointer-events-none"
                        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                      />

                      {/* Right page thickness edge */}
                      <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-r from-slate-300 to-slate-100 opacity-80" />

                      {/* Dynamic sheen on active book */}
                      {isActive && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.22) 0%, transparent 55%)" }}
                        />
                      )}

                      {/* Bookmark ribbon on active book */}
                      {isActive && (
                        <div className="absolute bottom-0 right-3.5 pointer-events-none">
                          <div
                            className="w-3 h-8 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 shadow"
                            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active book title pill & detail button */}
            <div className="flex flex-col items-center gap-1.5 mt-2 px-3 w-full">
              <button
                type="button"
                onClick={() => onSelectBook?.(activeBook)}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 border shadow-xs cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/12 text-slate-200 hover:border-sky-400/50"
                    : "bg-white hover:bg-slate-50 border-sky-200/80 text-slate-800 shadow-sm hover:border-blue-400"
                }`}
                title="Buka detail dan peminjaman buku"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="truncate max-w-[210px]">
                  <strong className={isDark ? "text-blue-400" : "text-blue-600"}>{activeBook.judul}</strong>
                  <span className="opacity-75 font-normal"> — {activeBook.penulis}</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </button>
              <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Ketuk cover untuk memilih • Ketuk lagi untuk detail
              </span>
            </div>
          </div>

          {/* ─── DESKTOP MASSIVE 3D HARDCOVER BOOK (hidden lg:flex) ─── */}
          <div className="hidden lg:flex flex-col items-center pointer-events-auto">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelectBook?.(activeBook)}
              title={`Klik untuk melihat detail & ketersediaan ${activeBook.judul}`}
              className="relative flex-shrink-0 flex items-center justify-center cursor-pointer group"
              style={{ perspective: 1500 }}
            >
              {/* Glow aura */}
              <div className={`absolute w-[520px] h-[520px] xl:w-[620px] xl:h-[620px] rounded-full blur-3xl -z-10 pointer-events-none transition-colors duration-700 ${
                isDark ? "bg-blue-600/35" : "bg-sky-400/50"
              }`} />

              {/* 3-D Book */}
              <div
                className="relative transition-all duration-300 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isHovered ? "-14px" : "0px"}) scale(${isHovered ? 1.025 : 1})`,
                  animation: mounted ? "heroFloat 5s ease-in-out infinite" : "none",
                }}
              >
                {/* Book dimensions – truly MASSIVE and IMPACTFUL like the user's sketch */}
                <div
                  className="book-3d-wrapper relative w-[390px] h-[550px] xl:w-[460px] xl:h-[650px] 2xl:w-[510px] 2xl:h-[720px]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT COVER – displays active book cover */}
                  <div
                    className="absolute inset-0 rounded-l-md rounded-r-xl lg:rounded-r-2xl overflow-hidden select-none bg-slate-900"
                    style={{
                      border: "1px solid rgba(255,255,255,0.28)",
                      boxShadow: isDark
                        ? "0 40px 95px -20px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(255,255,255,0.08)"
                        : "0 40px 95px -20px rgba(10,25,70,0.48), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(255,255,255,0.12)",
                    }}
                  >
                    {/* Cover image with smooth crossfade on switch */}
                    <img
                      key={activeBook.cover_url}
                      src={activeBook.cover_url}
                      alt={activeBook.judul}
                      className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none transition-all duration-500 animate-fadeIn"
                      draggable={false}
                    />

                    {/* Spine shadow on left */}
                    <div
                      className="absolute inset-y-0 left-0 w-[11%] pointer-events-none"
                      style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
                    />

                    {/* Tactile paper texture overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-cover bg-center"
                      style={{ backgroundImage: "url('https://cdn.21st.dev/assets/mirror/1a/1a2ecfcafab4d36898151e5960d2bddd8c13c8b5e3721538ce626d366810e518.avif')" }}
                    />

                    {/* Dynamic specular sheen reacting to mouse tilt */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={{ background: `linear-gradient(${110 + rotateY}deg, rgba(255,255,255,0.25) 0%, transparent 55%)` }}
                    />

                    {/* Gold corner ornaments */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-300/70 pointer-events-none" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-300/70 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-300/70 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-300/70 pointer-events-none" />
                  </div>

                  {/* PAGE STACK – right */}
                  <div className="book-page-right absolute top-[6px] bottom-[6px] pointer-events-none"
                    style={{
                      transformOrigin: "left center",
                      transform: "rotateY(90deg)",
                      background: "repeating-linear-gradient(to bottom, #f8fafc 0px, #f1f5f9 2px, #e2e8f0 3.5px, #cbd5e1 5px)",
                      boxShadow: "inset 4px 0 12px rgba(0,0,0,0.32), inset -2px 0 8px rgba(0,0,0,0.15)",
                    }} />

                  {/* PAGE EDGE – top */}
                  <div className="book-page-top absolute left-[8px] right-[8px] pointer-events-none"
                    style={{
                      transformOrigin: "bottom center",
                      transform: "rotateX(90deg)",
                      background: "linear-gradient(to right, #94a3b8, #dde6f0 12%, #f1f5f9 88%, #c8d5e2)",
                      boxShadow: "inset 0 4px 8px rgba(0,0,0,0.22)",
                    }} />

                  {/* PAGE EDGE – bottom */}
                  <div className="book-page-bottom absolute left-[8px] right-[8px] pointer-events-none"
                    style={{
                      transformOrigin: "top center",
                      transform: "rotateX(-90deg)",
                      background: "linear-gradient(to right, #94a3b8, #dde6f0 12%, #f1f5f9 88%, #c8d5e2)",
                      boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.22)",
                    }} />

                  {/* BACK COVER */}
                  <div className="book-back-cover absolute inset-0 rounded-l-md rounded-r-2xl pointer-events-none"
                    style={{
                      background: isDark ? "#060d20" : "#1e3a8a",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.22)"}`,
                      boxShadow: "-24px 34px 65px rgba(0,0,0,0.52)",
                    }} />

                  {/* BOOKMARK RIBBON */}
                  <div className="book-bookmark absolute bottom-0 right-12 xl:right-16 pointer-events-none"
                    style={{ transform: `translateZ(calc(-0.45 * var(--book-d))) translateY(${isHovered ? "32px" : "20px"}) rotate(3deg)`, transition: "transform 0.5s ease" }}>
                    <div className="w-5 xl:w-6 h-16 xl:h-20 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 shadow-md"
                      style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }} />
                  </div>
                </div>

                {/* Floor shadow */}
                <div className="absolute -bottom-10 left-6 right-6 h-10 rounded-full blur-3xl pointer-events-none"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.8)" : "rgba(14,30,80,0.28)",
                    transform: `scale(${isHovered ? 1.08 : 0.92})`,
                    transition: "transform 0.3s ease",
                  }} />
              </div>
            </div>

            {/* Active book pill under the giant 3D book */}
            <button
              type="button"
              onClick={() => onSelectBook?.(activeBook)}
              className={`mt-5 group inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 border shadow-md cursor-pointer active:scale-95 ${
                isDark
                  ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/12 text-slate-200 hover:border-sky-400/50 shadow-black/40"
                  : "bg-white hover:bg-slate-50 border-sky-200/80 text-slate-800 shadow-slate-300/40 hover:border-blue-400"
              }`}
              title={`Buka detail dan peminjaman buku ${activeBook.judul}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[220px] xl:max-w-[280px]">
                <strong className={isDark ? "text-blue-400" : "text-blue-600"}>{activeBook.judul}</strong>
                <span className="opacity-75 font-normal"> — {activeBook.penulis}</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 2 – TYPOGRAPHY, STATS, CTAs, & FLOATING CATALOG BOOKS
            ══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-5 sm:gap-6 lg:gap-7 relative z-10 min-w-0 pr-0 lg:pr-24 xl:pr-32">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-semibold w-fit mx-auto lg:mx-0 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Perpustakaan Digital SMKN 1 Beringin</span>
          </div>

          {/* Main headline: BACA. JELAJAHI. BERKEMBANG. */}
          <div className="flex flex-col gap-2 max-w-xl">
            <h1 className={`text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Baca.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500">
                Jelajahi.
              </span>
              <br />
              Berkembang.
            </h1>

            <p className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mt-1 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              Ribuan koleksi buku tersedia digital. Temukan buku pelajaran Kurikulum Merdeka, modul kejuruan 7 jurusan, karya sastra, dan novel populer untuk mendukung belajarmu.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8">
            {[
              { num: "500+", label: "Koleksi Buku" },
              { num: "7 Jurusan", label: "Referensi Lengkap" },
              { num: "24/7", label: "Akses Digital" },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {num}
                </span>
                <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-1">
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

          {/* ═════════════════════════════════════════════════════════════════
              FLOATING CATALOG BOOKS (Desktop only, interactive switch)
              ═════════════════════════════════════════════════════════════════ */}
          
          {/* Floating Book 1 – upper right */}
          {floatingBooks[0] && (
            <div
              onClick={() => handleSwitchBook(floatingBooks[0].id)}
              title={`Klik untuk menampilkan buku ${floatingBooks[0].judul} di buku besar`}
              className="hidden lg:block absolute top-1 xl:top-4 -right-2 xl:right-4 2xl:right-8 cursor-pointer group z-20"
              style={{
                transform: `rotate(10deg) ${isHovered ? "translate(6px,-6px)" : "translate(0,0)"}`,
                transition: "transform 0.6s ease",
                animation: "sheetFloat1 6s ease-in-out infinite",
              }}
            >
              <div
                className="relative w-[110px] h-[156px] xl:w-[122px] xl:h-[172px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-sky-500/30"
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
              onClick={() => handleSwitchBook(floatingBooks[1].id)}
              title={`Klik untuk menampilkan buku ${floatingBooks[1].judul} di buku besar`}
              className="hidden lg:block absolute top-[205px] xl:top-[225px] 2xl:top-[245px] right-2 xl:right-16 2xl:right-24 cursor-pointer group z-20"
              style={{
                transform: `rotate(-7deg) ${isHovered ? "translate(8px,4px)" : "translate(0,0)"}`,
                transition: "transform 0.6s ease",
                animation: "sheetFloat2 7s ease-in-out infinite",
              }}
            >
              <div
                className="relative w-[102px] h-[145px] xl:w-[114px] xl:h-[160px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-sky-500/30"
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
              onClick={() => handleSwitchBook(floatingBooks[2].id)}
              title={`Klik untuk menampilkan buku ${floatingBooks[2].judul} di buku besar`}
              className="hidden lg:block absolute top-[400px] xl:top-[435px] 2xl:top-[460px] -right-2 xl:right-4 2xl:right-8 cursor-pointer group z-20"
              style={{
                transform: `rotate(12deg) ${isHovered ? "translate(6px,6px)" : "translate(0,0)"}`,
                transition: "transform 0.6s ease",
                animation: "sheetFloat3 8s ease-in-out infinite",
              }}
            >
              <div
                className="relative w-[96px] h-[136px] xl:w-[106px] xl:h-[150px] rounded-l-xs rounded-r-lg overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-sky-500/30"
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
          --book-d: 36px;
        }
        @media (min-width: 1024px) {
          .book-3d-wrapper {
            --book-d: 44px;
          }
        }
        @media (min-width: 1280px) {
          .book-3d-wrapper {
            --book-d: 50px;
          }
        }
        @media (min-width: 1536px) {
          .book-3d-wrapper {
            --book-d: 56px;
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
          50%       { transform: rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-14px); }
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
