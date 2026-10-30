"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Book3DMockup from "./Book3DMockup";

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
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] flex items-center overflow-hidden select-none">

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
      <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 pt-12 sm:pt-16 lg:pt-8 pb-10 lg:pb-8">

        {/* ─── MOBILE LAYOUT (<1024px) ─── */}
        <div className="lg:hidden flex flex-col items-center gap-5 w-full">
          {/* Mobile Open Book Preview - Vector Crisp 3D Mockup */}
          <div className="w-full max-w-[420px] sm:max-w-[460px] my-1">
            <Book3DMockup isDark={isDark} />
          </div>

          {/* Typography */}
          <div className="flex flex-col items-center text-center gap-4 px-2">
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-[1.15] ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Perpustakaan Digital{" "}
              <span className={isDark ? "text-blue-400" : "text-[#00367E]"}>
                SMKN 1 Beringin
              </span>
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
        <div className="hidden lg:flex items-center justify-between gap-6 xl:gap-10 2xl:gap-14 w-full">

          {/* ═══ LEFT COLUMN: 3D OPEN BOOK SHOWCASE (BALANCED & ELEGANT) ═══ */}
          <div className="w-[50%] xl:w-[52%] 2xl:w-[54%] max-w-[680px] xl:max-w-[760px] 2xl:max-w-[820px] flex flex-col items-center lg:items-start min-w-0 shrink-0">
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
                  animation: mounted ? "openBookFloat 6s ease-in-out infinite" : "none",
                }}
              >
                {/* Vector Crisp 3D Open Book Mockup */}
                <Book3DMockup
                  isDark={isDark}
                  rotateX={rotateX}
                  rotateY={rotateY}
                  isHovered={isHovered}
                />
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: TYPOGRAPHY, STATS, CTAs ═══ */}
          <div className="flex-1 min-w-0 max-w-[620px] flex flex-col items-start gap-6 xl:gap-7">

            {/* Main Headline */}
            <h1 className={`text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-[1.1] ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Perpustakaan Digital{" "}
              <span className={isDark ? "text-blue-400" : "text-[#00367E]"}>
                SMKN 1 Beringin
              </span>
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
