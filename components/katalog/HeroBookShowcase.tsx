"use client";

import React, { useRef, useState, useEffect } from "react";

interface HeroBookShowcaseProps {
  className?: string;
  isDark?: boolean;
}

export default function HeroBookShowcase({
  className = "",
  isDark = false,
}: HeroBookShowcaseProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  // Auto-scale to fit container width smoothly while maintaining exact proportions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width <= 0) return;
      // Intrinsic composition width is 800px
      const calculatedScale = Math.min(1.0, Math.max(0.36, width / 800));
      setScale(calculatedScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const scaleStyle = scale !== null ? scale : "var(--showcase-scale, 0.85)";

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[800/500] max-h-[520px] flex items-center justify-center select-none overflow-visible [--showcase-scale:0.46] xs:[--showcase-scale:0.54] sm:[--showcase-scale:0.72] lg:[--showcase-scale:0.86] xl:[--showcase-scale:0.95] ${
        className ? className : "py-16 px-6 bg-[#f8fafc]"
      }`}
    >
      {/* Filter SVG Khusus untuk mempertajam foto gedung menjadi tampak HD */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="hd-sharpen">
            {/* Matriks konvolusi untuk menajamkan tepi bangunan dan teks plang sekolah */}
            <feConvolveMatrix
              order="3 3"
              preserveAlpha="true"
              kernelMatrix="0 -0.6 0 -0.6 3.4 -0.6 0 -0.6 0"
            />
            {/* Peningkatan pencahayaan dan kontras tipis agar warna gedung lebih hidup */}
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.05" intercept="-0.02" />
              <feFuncG type="linear" slope="1.05" intercept="-0.02" />
              <feFuncB type="linear" slope="1.05" intercept="-0.02" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Container Utama Skala Responsif */}
      <div
        className="absolute left-1/2 top-1/2 flex items-center justify-center will-change-transform pointer-events-auto"
        style={{
          width: "800px",
          height: "500px",
          transform: `translate(-50%, -50%) scale(${scaleStyle})`,
          transformOrigin: "center center",
        }}
      >
        {/* Container Utama Ilustrasi Buku */}
        <div className="relative flex items-center justify-center w-full h-full">

          {/* BUKU TERBUKA DI BELAKANG (BAB 1 & BAB 2) */}
          <div
            className={`relative z-10 flex flex-row bg-[#faf8f2] rounded-r-lg border border-stone-200 ml-40 sm:ml-44 w-[620px] min-h-[430px] overflow-hidden transition-all duration-300 ${
              isDark
                ? "shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] border-stone-700/60"
                : "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
            }`}
          >
            {/* Efek Lipatan Tengah Buku */}
            <div className="absolute inset-y-0 left-1/2 w-8 -ml-4 bg-gradient-to-r from-transparent via-stone-900/10 to-transparent pointer-events-none z-20" />

            {/* Halaman Kiri (Halaman 12 - BAB 1) */}
            <div className="flex-1 p-7 sm:p-9 pl-12 sm:pl-16 flex flex-col justify-between border-r border-stone-200/80 bg-gradient-to-r from-stone-200/40 via-[#faf8f2] to-[#faf8f2]">
              <div>
                <p className="text-[11px] tracking-[0.2em] text-stone-500 font-serif uppercase mb-2">
                  BAB 1
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
                  Tentang <br /> SMKN 1 Beringin
                </h3>
                <div className="w-10 h-[2px] bg-slate-800 mb-5" />
                <p className="font-serif text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify">
                  SMKN 1 Beringin adalah sekolah menengah kejuruan yang berkomitmen
                  mencetak generasi muda yang berilmu, berkarakter, dan siap
                  bersaing di dunia kerja maupun melanjutkan pendidikan.
                </p>
              </div>

              <div className="mt-6">
                <p className="font-serif italic text-sm text-slate-800 leading-snug">
                  &ldquo;Berilmu, <br /> Berkarakter, <br /> Berdaya Saing&rdquo;
                </p>
                <div className="w-8 h-[3px] bg-blue-600 mt-2 mb-4 rounded-full" />
                <p className="text-center font-serif text-[11px] text-stone-500">
                  12
                </p>
              </div>
            </div>

            {/* Halaman Kanan (Halaman 13 - BAB 2) */}
            <div className="flex-1 p-7 sm:p-9 flex flex-col justify-between bg-gradient-to-l from-stone-200/30 via-[#faf8f2] to-[#faf8f2]">
              <div>
                <p className="text-[11px] tracking-[0.2em] text-stone-500 font-serif uppercase mb-2">
                  BAB 2
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
                  Semangat Vokasi
                </h3>
                <div className="w-10 h-[2px] bg-slate-800 mb-5" />
                <p className="font-serif text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify">
                  Berlandaskan semboyan &ldquo;SMK Bisa, SMK Hebat&rdquo;,
                  pendidikan vokasi berfokus mencetak talenta muda yang terampil,
                  mandiri, dan berkarakter unggul—siap bekerja, berwirausaha,
                  serta adaptif menghadapi era industri modern.
                </p>
              </div>

              {/* Ornamen Bawah Halaman 13 */}
              <div className="mt-6 flex flex-col items-center text-center">
                {/* Ikon Toga & Buku */}
                <svg
                  className="w-8 h-8 text-slate-700 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>

                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-3 h-[1.5px] bg-blue-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="w-3 h-[1.5px] bg-blue-600" />
                </div>

                <p className="font-serif italic font-semibold text-[10.5px] text-slate-800 leading-tight mb-4">
                  SMK Bisa, SMK Hebat, <br />
                  Vokasi Kuat Menguatkan Indonesia
                </p>
                <p className="font-serif text-[11px] text-stone-500">13</p>
              </div>
            </div>

            {/* Efek Tumpukan Kertas di Bawah Buku */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-b from-stone-200 to-stone-300 border-t border-stone-300" />
            <div className="absolute bottom-0 inset-x-0 h-1 bg-[#0b3168]" />
          </div>

          {/* SAMPUL DEPAN BUKU (MIRING KE KIRI & MENUMPUK DI DEPAN) */}
          <div
            className={`absolute left-4 sm:left-6 z-30 w-[280px] sm:w-[310px] h-[430px] sm:h-[460px] bg-white rounded-r-md rounded-l-sm transform -rotate-[9deg] origin-bottom-left overflow-hidden flex flex-col border-l-[6px] border-[#09254e] transition-transform duration-500 hover:-rotate-[6deg] hover:scale-[1.02] ${
              isDark
                ? "shadow-[-15px_25px_45px_rgba(0,0,0,0.85)] border-t border-r border-sky-500/20"
                : "shadow-[-15px_25px_35px_rgba(0,0,0,0.35)]"
            }`}
          >
            {/* Efek Kilau Lipatan Engsel Sampul Buku */}
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/20 to-transparent z-30 pointer-events-none" />

            {/* Header Sampul Putih */}
            <div className="bg-white px-4 py-3.5 flex items-center gap-2.5 z-20 shadow-sm">
              <img
                src="/images/logo-sumut.png"
                alt="Logo SMKN 1 Beringin"
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/assets/logo.png";
                }}
              />
              <div className="leading-tight">
                <h4 className="font-extrabold text-xs sm:text-[13px] text-slate-900 tracking-tight">
                  SMKN 1 BERINGIN
                </h4>
                <p className="text-[9.5px] italic text-slate-600 font-medium">
                  &ldquo;Berilmu, Berkarakter, Berdaya Saing&rdquo;
                </p>
              </div>
            </div>

            {/* Foto Gedung Sekolah dengan Filter HD Sharpen */}
            <div className="relative flex-1 w-full overflow-hidden bg-sky-200">
              <img
                src="/images/photo-gedung.jpg"
                alt="Gedung SMK Negeri 1 Beringin"
                style={{ filter: "url(#hd-sharpen) contrast(1.06) saturate(1.12)" }}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "/assets/gedung-smk-user.jpg";
                }}
              />
              {/* Gradasi halus di bagian bawah foto agar menyatu dengan banner biru */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#083470]/50 to-transparent" />
            </div>

            {/* Footer Sampul Biru Tua */}
            <div className="relative bg-[#083470] text-white px-6 pt-6 pb-6 z-20">
              {/* Lengkungan Halus Pembatas Foto & Banner Biru */}
              <div className="absolute -top-4 left-0 right-0 h-8 bg-[#083470] rounded-t-[100%] scale-x-110 -z-10" />

              <h2 className="font-extrabold text-2xl sm:text-[26px] leading-[1.15] tracking-tight mb-2">
                Baca. Jelajahi. <br />
                Berkembang.
              </h2>
              <p className="text-[11px] text-blue-200/90 font-normal tracking-wide">
                Perpustakaan Digital SMKN 1 Beringin
              </p>
            </div>

            {/* Ketebalan Kertas di Sisi Kanan Sampul */}
            <div className="absolute inset-y-0 right-0 w-[5px] bg-gradient-to-r from-stone-200 via-white to-stone-300 z-30" />
          </div>

        </div>
      </div>
    </div>
  );
}
