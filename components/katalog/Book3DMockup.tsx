"use client";

import React, { useRef, useState, useEffect } from "react";

interface Book3DMockupProps {
  isDark?: boolean;
  rotateX?: number;
  rotateY?: number;
  isHovered?: boolean;
  className?: string;
}

export default function Book3DMockup({
  isDark = true,
  rotateX = 0,
  rotateY = 0,
  isHovered = false,
  className = "",
}: Book3DMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicScale, setDynamicScale] = useState<number | null>(null);

  // Fine-tune scale dynamically if container dimensions resize continuously
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width <= 0) return;
      // Intrinsic book width is 890px
      const calculatedScale = Math.min(1.0, Math.max(0.32, width / 890));
      setDynamicScale(calculatedScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const intrinsicWidth = 890;
  const intrinsicHeight = 530;

  // Use dynamicScale if computed on client, otherwise CSS variable handles immediate responsive scale
  const scaleStyle = dynamicScale !== null ? dynamicScale : "var(--book-scale, 0.78)";

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[890/530] flex items-center justify-center select-none overflow-visible [--book-scale:0.42] xs:[--book-scale:0.46] sm:[--book-scale:0.60] lg:[--book-scale:0.78] xl:[--book-scale:0.86] 2xl:[--book-scale:0.95] ${className}`}
    >
      {/* 3D tilt & scale transform container centered with translate(-50%, -50%) */}
      <div
        className="absolute left-1/2 top-1/2 transition-transform duration-300 ease-out will-change-transform flex items-center justify-center pointer-events-none"
        style={{
          width: `${intrinsicWidth}px`,
          height: `${intrinsicHeight}px`,
          transform: `translate(-50%, -50%) scale(${scaleStyle}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${
            isHovered ? "-6px" : "0px"
          })`,
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Kontainer Utama Mockup Buku 3D */}
        <div
          className="relative flex flex-row items-center justify-center gap-0 w-full h-full pointer-events-auto"
          style={{ perspective: "1600px" }}
        >
          {/* ══════════ SAMPUL DEPAN (KIRI) ══════════ */}
          <div
            className="relative w-[370px] h-[518px] bg-white rounded-l-md rounded-r-xs shadow-2xl overflow-hidden flex flex-col z-20 shrink-0 transition-transform duration-500 border-b-[3px] border-b-[#002860]"
            style={{
              transform: "rotateY(-12deg) rotateZ(-3deg) translateX(12px)",
              transformStyle: "preserve-3d",
              boxShadow:
                "-15px 25px 35px rgba(0,0,0,0.35), inset 4px 0 8px rgba(255,255,255,0.6)",
            }}
          >
            {/* Efek Lipatan Engsel Sampul Kiri */}
            <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/25 via-white/20 to-transparent z-30 pointer-events-none" />

            {/* Header Sampul */}
            <div className="bg-white px-5 py-3.5 flex items-center gap-3 border-b border-slate-100 z-10 shrink-0">
              <img
                src="/assets/logo-smkn1-beringin.png"
                alt="Logo SMKN 1 Beringin"
                className="w-11 h-11 object-contain shrink-0"
                draggable={false}
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                  SMKN 1 BERINGIN
                </span>
                <span className="text-[11px] italic text-slate-700 font-medium">
                  &ldquo;Berilmu, Berkarakter, Berdaya Saing&rdquo;
                </span>
              </div>
            </div>

            {/* Foto Gedung Sekolah */}
            <div className="relative flex-1 w-full bg-sky-100 overflow-hidden min-h-0">
              <img
                src="/assets/gedung-sekolah.jpg"
                alt="Gedung SMKN 1 Beringin"
                className="w-full h-full object-cover object-center"
                draggable={false}
              />

              {/* Lengkungan Pembatas Biru */}
              <svg
                className="absolute -bottom-1 left-0 w-full h-10 text-[#003882] fill-current"
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
              >
                <path d="M0,96 C480,20 960,0 1440,32 L1440,120 L0,120 Z" />
              </svg>
            </div>

            {/* Bagian Bawah Sampul (Biru Tua) */}
            <div className="bg-[#003882] text-white px-7 pt-3.5 pb-8 flex flex-col justify-center text-left shrink-0">
              <div className="text-3xl font-extrabold leading-tight tracking-tight mb-2">
                Baca. Jelajahi.
                <br />
                Berkembang.
              </div>
              <p className="text-blue-200/90 text-xs font-normal tracking-wide">
                Perpustakaan Digital SMKN 1 Beringin
              </p>
            </div>
          </div>

          {/* ══════════ BUKAAN HALAMAN 12 & 13 (KANAN) ══════════ */}
          <div
            className="relative flex flex-row w-[520px] h-[518px] bg-[#FAF8F5] rounded-r-md shadow-2xl z-10 overflow-hidden border border-stone-200 shrink-0 border-b-[4px] border-b-stone-300"
            style={{
              transform: "rotateY(8deg) rotateZ(-1deg)",
              boxShadow:
                "0 4px 0 0 #e7e5e4, 0 7px 0 0 #d6d3d1, 22px 25px 42px rgba(0,0,0,0.3)",
            }}
          >
            {/* HALAMAN 12 (TENGAH) */}
            <div className="relative flex-1 p-7 flex flex-col justify-between bg-gradient-to-r from-stone-200/70 via-[#FAF8F5] to-[#FAF8F5] border-r border-stone-300/80 text-left">
              <div>
                <span className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                  BAB 1
                </span>
                <div className="text-xl font-serif font-bold text-slate-900 leading-snug mb-3">
                  Tentang
                  <br />
                  SMKN 1 Beringin
                </div>
                <div className="w-14 h-[1.5px] bg-slate-700 mb-4" />
                <p className="text-xs font-serif text-slate-700 leading-relaxed text-justify">
                  SMKN 1 Beringin adalah sekolah menengah kejuruan yang berkomitmen mencetak
                  generasi muda yang berilmu, berkarakter, dan siap bersaing di dunia kerja maupun
                  melanjutkan pendidikan.
                </p>
              </div>

              {/* Kutipan Bawah Halaman 12 */}
              <div className="mt-4 mb-2 pl-2">
                <span className="block text-3xl font-serif font-black text-blue-700 leading-none mb-1">
                  &ldquo;
                </span>
                <p className="font-serif italic text-slate-900 text-base leading-snug">
                  &ldquo;Berilmu,
                  <br />
                  Berkarakter,
                  <br />
                  Berdaya Saing&rdquo;
                </p>
                <div className="w-16 h-1 bg-blue-600 rounded-full mt-2 transform -rotate-3" />
              </div>

              <div className="text-center text-[11px] font-serif font-semibold text-slate-600">
                12
              </div>
            </div>

            {/* HALAMAN 13 (KANAN) */}
            <div className="relative flex-1 p-7 flex flex-col justify-between bg-gradient-to-r from-stone-200/50 via-[#FAF8F5] to-stone-100 text-left">
              <div>
                <span className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                  BAB 2
                </span>
                <div className="text-lg font-serif font-bold text-slate-900 leading-snug mb-3">
                  Jargon Beringin
                </div>
                <div className="w-14 h-[1.5px] bg-slate-700 mb-4" />
                <p className="text-[11.5px] font-serif text-slate-700 leading-relaxed text-justify">
                  Jargon &ldquo;Bersama, Kita Bisa Raih Masa Depan&rdquo; mencerminkan semangat
                  seluruh warga SMKN 1 Beringin untuk saling mendukung, bekerja sama, dan terus
                  berusaha mewujudkan cita-cita serta masa depan yang lebih baik.
                </p>
              </div>

              {/* Ikon & Slogan Bawah Halaman 13 */}
              <div className="my-4 flex flex-col items-center text-center">
                <svg
                  className="w-14 h-14 text-[#003882] mb-2"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M32 10L12 20L32 30L52 20L32 10Z"
                    fill="#003882"
                    fillOpacity="0.12"
                  />
                  <path d="M20 24V34C20 34 26 38 32 38C38 38 44 34 44 34V24" />
                  <path d="M10 28V52C10 52 21 49 32 54C43 49 54 52 54 52V28" />
                  <line x1="32" y1="38" x2="32" y2="54" />
                </svg>
                <div className="flex items-center gap-1.5 text-blue-800 my-1">
                  <span className="w-4 h-[1px] bg-blue-800" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-800" />
                  <span className="w-4 h-[1px] bg-blue-800" />
                </div>
                <p className="font-serif italic font-semibold text-slate-800 text-[11px] leading-snug mt-1">
                  Beringin Maju, Siswa Hebat,
                  <br />
                  Indonesia Kuat
                </p>
              </div>

              <div className="text-center text-[11px] font-serif font-semibold text-slate-600">
                13
              </div>
            </div>
          </div>

          {/* Bayangan Lantai di Bawah Buku */}
          <div
            className={`absolute -bottom-8 left-10 right-10 h-10 rounded-full blur-2xl pointer-events-none -z-10 transition-opacity duration-300 ${
              isDark ? "bg-black/55" : "bg-blue-950/25"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
