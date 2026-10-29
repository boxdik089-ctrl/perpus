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
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
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
        judul: b.judul.split(":")[0],
        penulis: b.penulis || "Penulis",
        cover_url: b.cover_url,
        kategori: b.kategori || "Buku Pilihan",
      }));
    }

    return defaultFeatured;
  }, [books]);

  const [activeBookIndex, setActiveBookIndex] = useState<number>(0);
  const activeBook = catalogFeaturedBooks[activeBookIndex] || catalogFeaturedBooks[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateY((x / rect.width) * 8);
    setRotateX(-(y / rect.height) * 6);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section className="relative w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[780px] xl:min-h-[840px] flex items-center overflow-hidden select-none">

      {/* ─── BACKGROUND ─────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        {/* Base gradient */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-br from-[#060c1e] via-[#0d1635] to-[#09090b]"
            : "bg-gradient-to-br from-[#eef6ff] via-[#e2effd] to-[#f4f9ff]"
        }`} />

        {/* Soft radial glow behind the book */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-[10%] w-[750px] h-[750px] rounded-full blur-[140px] transition-colors duration-500 ${
          isDark ? "bg-blue-900/40" : "bg-sky-200/70"
        }`} />

        {/* Soft right accent */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-500 ${
          isDark ? "bg-indigo-950/30" : "bg-blue-100/50"
        }`} />

        {/* Subtle dot-grid */}
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(#ffffff07_1px,transparent_1px)] bg-[size:32px_32px]"
            : "bg-[radial-gradient(#0f172a06_1px,transparent_1px)] bg-[size:32px_32px]"
        }`} />

        {/* Bottom fade into catalog */}
        <div className={`absolute bottom-0 inset-x-0 h-32 ${
          isDark
            ? "bg-gradient-to-t from-[#09090b] to-transparent"
            : "bg-gradient-to-t from-[#f4f9ff] to-transparent"
        }`} />
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────────────── */}
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 pt-16 sm:pt-20 lg:pt-12 pb-12 lg:pb-8">

        {/* ─── MOBILE LAYOUT (<1024px) ─── */}
        <div className="lg:hidden flex flex-col items-center gap-6 w-full">
          {/* Mobile Open Book Preview */}
          <div className="relative w-full max-w-[380px] aspect-[705/585] flex items-center justify-center my-1 drop-shadow-xl">
            <img
              src="/assets/showcase/buku-smkn1-beringin.png"
              alt="Buku Profil SMKN 1 Beringin"
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Active book pill */}
          <button
            type="button"
            onClick={() => onSelectBook?.(activeBook)}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs cursor-pointer active:scale-95 ${
              isDark ? "bg-white/[0.08] border-white/12 text-slate-200" : "bg-white border-sky-200/80 text-slate-800 shadow-sm"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[210px]">
              <strong className={isDark ? "text-blue-400" : "text-blue-600"}>{activeBook.judul}</strong>
              <span className="opacity-75 font-normal"> — {activeBook.penulis}</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </button>

          {/* Typography */}
          <div className="flex flex-col items-center text-center gap-4 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Perpustakaan Digital SMKN 1 Beringin</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl font-black tracking-tight leading-[1.08] ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Baca.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500">
                Jelajahi.
              </span>
              <br />
              Berkembang.
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-sm ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              Ribuan koleksi buku tersedia di Kurikulum Merdeka, modul kejuruan, dan novel populer untuk mendukung belajar dan menambah wawasan.
            </p>

            <div className="flex items-center gap-6 sm:gap-8">
              {[
                { num: "500+", label: "Koleksi Buku" },
                { num: "7 Jurusan", label: "Referensi Lengkap" },
                { num: "24/7", label: "Akses Online" },
              ].map(({ num, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {num}
                  </span>
                  <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#katalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/35 active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lihat Koleksi Pustaka</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <Link
                href="/kartu"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm border transition-all active:scale-95 ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                }`}
              >
                <span>Cek Kartu</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── DESKTOP LAYOUT (>=1024px) ─── */}
        <div className="hidden lg:flex items-center justify-between gap-8 xl:gap-14 w-full">

          {/* ═══ LEFT COLUMN: 3D OPEN BOOK SHOWCASE ═══ */}
          <div className="flex-1 flex flex-col items-center lg:items-start shrink-0 max-w-[620px] xl:max-w-[720px] 2xl:max-w-[780px]">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              className="relative w-full cursor-pointer select-none group"
              style={{ perspective: 1400 }}
            >
              {/* 3D tilt & float wrapper */}
              <div
                className="relative transition-all duration-300 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isHovered ? "-10px" : "0px"}) scale(${isHovered ? 1.02 : 1})`,
                  animation: mounted ? "openBookFloat 6s ease-in-out infinite" : "none",
                }}
              >
                {/* Clean transparent 3D open book featuring real SMKN 1 Beringin building & logo */}
                <img
                  src="/assets/showcase/buku-smkn1-beringin.png"
                  alt="Buku Profil Perpustakaan SMKN 1 Beringin"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-2xl"
                  draggable={false}
                />

                {/* Soft interactive floor shadow */}
                <div
                  className={`absolute -bottom-6 left-8 right-8 h-8 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
                    isDark ? "bg-black/60" : "bg-blue-950/20"
                  }`}
                  style={{
                    transform: `scale(${isHovered ? 1.05 : 0.95})`,
                  }}
                />
              </div>
            </div>

            {/* Active book pill under the book */}
            <div className="mt-2 pl-4">
              <button
                type="button"
                onClick={() => onSelectBook?.(activeBook)}
                className={`group inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 border shadow-xs cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/12 text-slate-200 hover:border-sky-400/50"
                    : "bg-white hover:bg-slate-50 border-sky-200/80 text-slate-800 shadow-sm hover:border-blue-400"
                }`}
                title={`Buka detail dan peminjaman buku ${activeBook.judul}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="truncate max-w-[240px] xl:max-w-[280px]">
                  <strong className={isDark ? "text-blue-400" : "text-blue-600"}>{activeBook.judul}</strong>
                  <span className="opacity-75 font-normal"> — {activeBook.penulis}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: TYPOGRAPHY, STATS, CTAs ═══ */}
          <div className="flex-1 flex flex-col items-start gap-6 xl:gap-7 max-w-lg xl:max-w-xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Perpustakaan Digital SMKN 1 Beringin</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-[1.08] ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Baca.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500">
                Jelajahi.
              </span>
              <br />
              Berkembang.
            </h1>

            {/* Description */}
            <p className={`text-base xl:text-lg leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              Ribuan koleksi buku tersedia di Kurikulum Merdeka, modul kejuruan, dan novel populer untuk mendukung belajar dan menambah wawasan.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 xl:gap-8">
              {[
                { num: "500+", label: "Koleksi Buku" },
                { num: "7 Jurusan", label: "Referensi Lengkap" },
                { num: "24/7", label: "Akses Online" },
              ].map(({ num, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className={`text-2xl xl:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {num}
                  </span>
                  <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3.5 pt-1">
              <a
                href="#katalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/35 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lihat Koleksi Pustaka</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <Link
                href="/kartu"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm border transition-all active:scale-95 hover:scale-[1.02] ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                }`}
              >
                <span>Cek Kartu Siswa</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Floating subtle animation keyframes */}
      <style>{`
        @keyframes openBookFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50%       { transform: translateY(-8px) rotateX(1deg); }
        }
      `}</style>

    </section>
  );
}
