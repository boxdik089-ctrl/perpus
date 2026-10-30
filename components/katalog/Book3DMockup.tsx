"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

export interface BookMockupProps {
  logoUrl?: string;
  schoolPhotoUrl?: string;
  isDark?: boolean;
  rotateX?: number;
  rotateY?: number;
  isHovered?: boolean;
  className?: string;
}

export default function BookMockup({
  logoUrl = "/images/logo-smkn1-beringin.png",
  schoolPhotoUrl = "/images/gedung-smkn1-beringin.jpg",
  isDark = true,
  rotateX = 0,
  rotateY = 0,
  isHovered = false,
  className = "",
}: BookMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicScale, setDynamicScale] = useState<number | null>(null);

  // Auto-scale to fit container width smoothly while maintaining exact book proportions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width <= 0) return;
      // Intrinsic mockup width is 920px
      const calculatedScale = Math.min(1.0, Math.max(0.32, width / 920));
      setDynamicScale(calculatedScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const scaleStyle = dynamicScale !== null ? dynamicScale : "var(--book-scale, 0.78)";

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[920/540] flex items-center justify-center select-none overflow-visible [--book-scale:0.42] xs:[--book-scale:0.48] sm:[--book-scale:0.62] lg:[--book-scale:0.78] xl:[--book-scale:0.86] 2xl:[--book-scale:0.95] ${className}`}
    >
      {/* 3D tilt & scale transform container centered with translate(-50%, -50%) */}
      <div
        className="absolute left-1/2 top-1/2 transition-transform duration-300 ease-out will-change-transform flex items-center justify-center"
        style={{
          width: "920px",
          height: "540px",
          transform: `translate(-50%, -50%) scale(${scaleStyle}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${
            isHovered ? "-6px" : "0px"
          })`,
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
          {/* Sorot Cahaya Lampu Meja Baca (Reading Spotlight Beam) di Mode Gelap */}
          {isDark && (
            <div
              className="absolute -top-36 left-1/2 -translate-x-1/2 w-[760px] h-[520px] pointer-events-none -z-10 opacity-75 transition-opacity duration-700"
              style={{
                background:
                  "radial-gradient(ellipse 60% 65% at 50% 12%, rgba(224, 242, 254, 0.28) 0%, rgba(56, 189, 248, 0.14) 38%, transparent 72%)",
                filter: "blur(42px)",
              }}
            />
          )}

          {/* Aura Spotlight Belakang Buku (Stage Lighting di Mode Gelap) */}
          {isDark && (
            <div
              className="absolute -inset-10 pointer-events-none -z-10 blur-[85px] opacity-90 transition-opacity duration-700"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 48% 46%, rgba(37, 99, 235, 0.42) 0%, rgba(56, 189, 248, 0.18) 42%, transparent 75%)",
              }}
            />
          )}

          {/* Partikel Cahaya Halus Suasana Perpustakaan Malam (Ambient Light Motes) */}
          {isDark && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
              {[
                { top: "16%", left: "18%", delay: 0, duration: 7, size: "w-1.5 h-1.5" },
                { top: "24%", left: "82%", delay: 2.2, duration: 8.5, size: "w-1 h-1" },
                { top: "68%", left: "14%", delay: 1.2, duration: 7.5, size: "w-1 h-1" },
                { top: "42%", left: "88%", delay: 3.1, duration: 9, size: "w-1.5 h-1.5" },
                { top: "82%", left: "50%", delay: 4.0, duration: 6.5, size: "w-1 h-1" },
                { top: "30%", left: "54%", delay: 1.8, duration: 8, size: "w-1 h-1" },
              ].map((mote, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                    opacity: [0.2, 0.65, 0.2],
                  }}
                  transition={{
                    duration: mote.duration,
                    delay: mote.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute rounded-full bg-sky-200 blur-[0.6px] shadow-[0_0_10px_rgba(56,189,248,0.9)] ${mote.size}`}
                  style={{ top: mote.top, left: mote.left }}
                />
              ))}
            </div>
          )}

          {/* Dual Floor Lighting (Lantai Bercahaya + Contact Shadow) */}
          {isDark ? (
            <>
              {/* Refleksi Permukaan Lantai Halus */}
              <div
                className="absolute bottom-2 w-[92%] max-w-[800px] h-16 blur-2xl rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.28) 0%, rgba(37, 99, 235, 0.15) 45%, transparent 75%)",
                }}
              />
              {/* Contact Shadow Pekat */}
              <div className="absolute bottom-5 w-[84%] max-w-[740px] h-9 bg-black/85 blur-md rounded-full pointer-events-none" />
            </>
          ) : (
            <div className="absolute bottom-6 w-[88%] max-w-[780px] h-14 bg-slate-900/25 blur-2xl rounded-full pointer-events-none transition-opacity duration-300" />
          )}

          <div
            className="relative flex flex-row items-center justify-center max-w-[920px] w-full"
            style={{ perspective: "2000px" }}
          >
            {/* =========================================================
                1. SAMPUL DEPAN HARDCOVER + BLOK KETEBALAN KERTAS (KIRI)
               ========================================================= */}
            <motion.div
              initial={{ opacity: 1, rotateZ: -12, rotateY: -16, x: 0 }}
              animate={{ opacity: 1, rotateZ: -10.5, rotateY: -14, x: 24 }}
              whileHover={{ rotateZ: -8.5, rotateY: -10, scale: 1.015 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative z-30 shrink-0 w-[320px] sm:w-[360px] aspect-[3/4.25]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Papan Hardcover Biru Dongker di Belakang Sampul & Tumpukan Kertas */}
              <div
                className={`absolute -inset-y-1.5 -left-1.5 -right-4 bg-[#0B2249] rounded-l-md rounded-r-sm transition-all duration-300 ${
                  isDark
                    ? "border-l border-t border-b border-sky-400/30 shadow-[0_0_30px_rgba(37,99,235,0.4),-15px_25px_45px_rgba(0,0,0,0.85)]"
                    : "shadow-[-20px_30px_45px_rgba(10,25,50,0.38)]"
                }`}
              />

              {/* Ketebalan Blok Kertas Sisi Kanan Sampul (Efek Lembaran Kertas) */}
              <div
                className="absolute top-1.5 bottom-2 -right-3.5 w-5 z-10 rounded-r-[2px]"
                style={{
                  background:
                    "repeating-linear-gradient(to right, #f8f6f0 0px, #e2ddd2 1.5px, #fdfbf7 3px)",
                  boxShadow:
                    "inset -3px 0 6px rgba(0,0,0,0.18), 8px 12px 24px rgba(0,0,0,0.35)",
                }}
              />

              {/* Ketebalan Blok Kertas Sisi Bawah Sampul */}
              <div
                className="absolute -bottom-2.5 left-1.5 -right-3 h-3.5 z-10 rounded-bl-sm"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #f4f1ea 0px, #dcd6c8 1.5px, #faf8f5 3px)",
                  transform: "skewX(35deg)",
                  transformOrigin: "top left",
                }}
              />

              {/* Permukaan Utama Sampul Depan */}
              <div
                className={`relative w-full h-full bg-white rounded-l-[4px] rounded-r-[2px] overflow-hidden flex flex-col border z-20 shadow-inner transition-colors duration-300 ${
                  isDark
                    ? "border-sky-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    : "border-slate-200/80"
                }`}
              >
                {/* Lekukan Engsel Hardcover Kiri (Groove) */}
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/25 via-white/50 to-black/10 z-30 pointer-events-none" />
                <div className="absolute inset-y-0 left-4 w-[1.5px] bg-black/15 z-30 pointer-events-none" />

                {/* Header Sampul */}
                <div className="bg-white pl-6 pr-4 py-3.5 flex items-center gap-3 border-b border-slate-100 z-10">
                  <img
                    src={logoUrl}
                    alt="Logo SMKN 1 Beringin"
                    className="w-10 h-10 object-contain shrink-0"
                    draggable={false}
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-[14.5px] tracking-tight leading-tight">
                      SMKN 1 BERINGIN
                    </span>
                    <span className="text-[10.5px] italic text-slate-600 font-medium">
                      &ldquo;Berilmu, Berkarakter, Berdaya Saing&rdquo;
                    </span>
                  </div>
                </div>

                {/* Foto Gedung Sekolah */}
                <div className="relative flex-1 w-full bg-sky-100 overflow-hidden">
                  <img
                    src={schoolPhotoUrl}
                    alt="Gedung SMKN 1 Beringin"
                    className="w-full h-full object-cover object-center"
                    draggable={false}
                  />
                  {/* Lengkungan Biru Halus */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-11 text-[#00367E] fill-current"
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,96 C460,15 980,0 1440,36 L1440,120 L0,120 Z" />
                  </svg>
                </div>

                {/* Bagian Bawah Sampul Biru Tua */}
                <div className="bg-[#00367E] text-white pl-7 pr-6 pt-2 pb-7 flex flex-col justify-center relative">
                  <h2 className="text-[26px] sm:text-[28px] font-extrabold leading-[1.12] tracking-tight mb-2">
                    Baca. Jelajahi.
                    <br />
                    Berkembang.
                  </h2>
                  <p className="text-blue-200/90 text-[11.5px] font-normal tracking-wide">
                    Perpustakaan Digital SMKN 1 Beringin
                  </p>
                </div>
              </div>
            </motion.div>

            {/* =========================================================
                2. BUKAAN HALAMAN MELENGKUNG 12 & 13 (KANAN)
               ========================================================= */}
            <motion.div
              initial={{ opacity: 1, rotateY: 8, rotateZ: -1.8, x: -10 }}
              animate={{ opacity: 1, rotateY: 6, rotateZ: -1.5, x: -12 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className={`relative z-10 w-full max-w-[540px] mt-4 transition-all duration-300 ${
                isDark ? "drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)]" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Kontainer Spread Halaman 12 & 13 */}
              <div className="relative flex flex-row w-full items-stretch">
                {/* ---------------- HALAMAN 12 (KIRI) ---------------- */}
                <div
                  className="relative flex-1 bg-[#F9F6F0] pt-10 pb-9 pl-11 pr-7 flex flex-col justify-between min-h-[430px] sm:min-h-[465px]"
                  style={{
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "42% 18px",
                    borderBottomRightRadius: "40% 14px",
                    background:
                      "linear-gradient(90deg, #cfcBC2 0%, #eae6df 14%, #F9F6F0 45%, #f5f2eb 92%, #dfd9ce 100%)",
                    boxShadow: "inset 26px 0 32px -12px rgba(15, 23, 42, 0.32)",
                  }}
                >
                  {/* Lengkungan Atas Halaman 12 */}
                  <div className="absolute -top-2 left-0 right-0 h-4 bg-gradient-to-r from-[#dcd8cf] via-[#F9F6F0] to-[#e5e0d5] rounded-t-[50%] pointer-events-none" />

                  <div style={{ transform: "rotate(-0.8deg)" }}>
                    <span className="block text-[10px] font-serif tracking-[0.22em] text-slate-600 uppercase mb-2">
                      BAB 1
                    </span>
                    <h3 className="text-[21px] font-serif font-bold text-slate-900 leading-[1.22] mb-3.5">
                      Tentang
                      <br />
                      SMKN 1 Beringin
                    </h3>
                    <div className="w-12 h-[1.5px] bg-slate-700/80 mb-5" />
                    <p className="text-[11.5px] font-serif text-slate-800 leading-[1.75] text-left">
                      SMKN 1 Beringin adalah sekolah menengah kejuruan yang
                      berkomitmen mencetak generasi muda yang berilmu, berkarakter,
                      dan siap bersaing di dunia kerja maupun melanjutkan
                      pendidikan.
                    </p>
                  </div>

                  {/* Kutipan Bawah Halaman 12 */}
                  <div className="mt-6 mb-3" style={{ transform: "rotate(-0.8deg)" }}>
                    <span className="block text-3xl font-serif font-black text-blue-700 leading-none mb-1">
                      &ldquo;
                    </span>
                    <p className="font-serif italic text-slate-900 text-[14.5px] leading-snug">
                      &ldquo;Berilmu,
                      <br />
                      Berkarakter,
                      <br />
                      Berdaya Saing&rdquo;
                    </p>
                    <div className="w-14 h-[3px] bg-blue-600 rounded-full mt-2 -rotate-2" />
                  </div>

                  <div className="text-center text-[11px] font-serif text-slate-600">
                    12
                  </div>
                </div>

                {/* LIPATAN TENGAH BUKU (SPINE CREASE) */}
                <div className="w-[2px] bg-gradient-to-b from-stone-400/70 via-stone-500/80 to-stone-700/90 z-20 shrink-0" />

                {/* ---------------- HALAMAN 13 (KANAN) ---------------- */}
                <div
                  className="relative flex-1 bg-[#F9F6F0] pt-10 pb-9 pl-7 pr-9 flex flex-col justify-between min-h-[430px] sm:min-h-[465px]"
                  style={{
                    borderTopLeftRadius: "42% 18px",
                    borderTopRightRadius: "3px",
                    borderBottomLeftRadius: "40% 14px",
                    background:
                      "linear-gradient(90deg, #dcd7cc 0%, #F9F6F0 12%, #FAF8F3 72%, #ebe6dc 96%, #d5cfc2 100%)",
                    transform: "perspective(900px) rotateY(-8deg)",
                    transformOrigin: "left center",
                  }}
                >
                  {/* Lengkungan Atas Halaman 13 */}
                  <div className="absolute -top-2 left-0 right-0 h-4 bg-gradient-to-r from-[#e2ddd2] via-[#FAF8F3] to-[#dfd9cc] rounded-t-[50%] pointer-events-none" />

                  {/* Efek Tumpukan Lembaran di Tepi Kanan Halaman 13 */}
                  <div
                    className="absolute top-1 bottom-1 right-0 w-2 pointer-events-none"
                    style={{
                      background:
                        "repeating-linear-gradient(to right, #eeeae0 0px, #c9c2b4 1px, #f7f4ed 2px)",
                    }}
                  />

                  <div style={{ transform: "rotate(0.8deg)" }}>
                    <span className="block text-[10px] font-serif tracking-[0.22em] text-slate-600 uppercase mb-2">
                      BAB 2
                    </span>
                    <h3 className="text-[19px] font-serif font-bold text-slate-900 leading-[1.22] mb-3.5">
                      Semangat Vokasi
                    </h3>
                    <div className="w-12 h-[1.5px] bg-slate-700/80 mb-5" />
                    <p className="text-[11px] sm:text-[11.5px] font-serif text-slate-800 leading-[1.75] text-justify">
                      Berlandaskan semboyan &ldquo;SMK Bisa, SMK Hebat&rdquo;,
                      pendidikan vokasi berfokus mencetak talenta muda yang
                      terampil, mandiri, dan berkarakter unggul—siap bekerja,
                      berwirausaha, serta adaptif menghadapi era industri modern.
                    </p>
                  </div>

                  {/* Ikon & Slogan Halaman 13 */}
                  <div
                    className="my-4 flex flex-col items-center text-center"
                    style={{ transform: "rotate(0.8deg)" }}
                  >
                    <svg
                      className="w-12 h-12 text-[#00367E] mb-2"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M32 10L12 20L32 30L52 20L32 10Z"
                        fill="#00367E"
                        fillOpacity="0.12"
                      />
                      <path d="M20 24V34C20 34 26 38 32 38C38 38 44 34 44 34V24" />
                      <path d="M10 28V52C10 52 21 49 32 54C43 49 54 52 54 52V28" />
                      <line x1="32" y1="38" x2="32" y2="54" />
                    </svg>

                    <div className="flex items-center gap-1.5 text-blue-800 my-1">
                      <span className="w-3.5 h-[1px] bg-blue-800" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-800" />
                      <span className="w-3.5 h-[1px] bg-blue-800" />
                    </div>

                    <p className="font-serif italic font-semibold text-slate-800 text-[10.5px] leading-snug mt-1">
                      SMK Bisa, SMK Hebat,
                      <br />
                      Vokasi Kuat Menguatkan Indonesia
                    </p>
                  </div>

                  <div className="text-center text-[11px] font-serif text-slate-600">
                    13
                  </div>
                </div>
              </div>

              {/* =========================================================
                  3. TUMPUKAN KERTAS BAWAH & PAPAN HARDCOVER BELAKANG
                 ========================================================= */}
              <div className="relative w-[98.5%] mx-auto -mt-1 z-20">
                <svg
                  viewBox="0 0 540 34"
                  className="w-full h-7 drop-shadow-md overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Papan Hardcover Biru Tua di Bawah Halaman */}
                  <path
                    d="M 0,14 Q 135,6 262,24 L 278,24 Q 405,6 536,12 L 540,22 Q 405,16 278,32 L 262,32 Q 135,16 0,24 Z"
                    fill="#0B2249"
                  />
                  {/* Tumpukan Kertas Berlapis Kiri (Halaman 12) */}
                  <path
                    d="M 2,4 Q 135,-4 270,18 L 270,27 Q 135,8 2,16 Z"
                    fill="#dfd9ce"
                    stroke="#b8b0a2"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 2,8 Q 135,0 270,21 L 270,24 Q 135,4 2,12 Z"
                    fill="#f4f1ea"
                  />
                  {/* Tumpukan Kertas Berlapis Kanan (Halaman 13) */}
                  <path
                    d="M 270,18 Q 405,-4 534,4 L 534,15 Q 405,8 270,27 Z"
                    fill="#d8d2c5"
                    stroke="#b8b0a2"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 270,21 Q 405,0 534,8 L 534,11 Q 405,4 270,24 Z"
                    fill="#efeae0"
                  />
                  {/* Pita Jilid Tengah (Headband Kuning/Emas Kecil di Spine) */}
                  <rect
                    x="265"
                    y="20"
                    width="10"
                    height="5"
                    rx="2"
                    fill="#d97706"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BookMockup as Book3DMockup };
