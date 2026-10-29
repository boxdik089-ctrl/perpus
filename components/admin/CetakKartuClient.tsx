"use client";

import { useState, useRef, useEffect } from "react";
import { getAnggotaForKartu } from "@/actions/anggota";
import { scanAnggota } from "@/actions/eksemplar";
import { LABEL_SIZES, printWithPageSize } from "@/lib/label";
import {
  Search,
  Printer,
  Download,
  User,
  CheckCircle2,
  Loader2,
  CreditCard,
  BookOpen,
} from "lucide-react";
import bwipjs from "bwip-js";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

type AnggotaInfo = {
  id: string;
  no_anggota: string;
  nama: string;
  jenis: string;
  nisn: string | null;
  kelas: string | null;
};

type ModePrint = "KEDUA" | "DEPAN" | "BELAKANG";

export function CetakKartuClient() {
  const [query, setQuery] = useState("");
  const [anggota, setAnggota] = useState<AnggotaInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [barcodeUrl, setBarcodeUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [modeCetak, setModeCetak] = useState<ModePrint>("KEDUA");

  const inputRef = useRef<HTMLInputElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  // Generate barcode dan QR code image data URL ketika anggota berubah
  useEffect(() => {
    if (!anggota?.no_anggota) {
      setBarcodeUrl("");
      setQrCodeUrl("");
      return;
    }

    try {
      // 1. Generate Barcode Code128
      const canvasBarcode = document.createElement("canvas");
      bwipjs.toCanvas(canvasBarcode, {
        bcid: "code128",
        text: anggota.no_anggota,
        scale: 5,
        height: 18,
        includetext: false,
        paddingleft: 0,
        paddingright: 0,
        backgroundcolor: "ffffff",
      });
      setBarcodeUrl(canvasBarcode.toDataURL("image/png"));

      // 2. Generate QR Code
      const canvasQR = document.createElement("canvas");
      bwipjs.toCanvas(canvasQR, {
        bcid: "qrcode",
        text: anggota.no_anggota,
        scale: 4,
        paddingleft: 0,
        paddingright: 0,
        backgroundcolor: "ffffff",
      });
      setQrCodeUrl(canvasQR.toDataURL("image/png"));
    } catch (e) {
      console.error("Gagal generate barcode/QR:", e);
    }
  }, [anggota?.no_anggota]);

  const cari = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || busy) return;

    setBusy(true);
    setErr(null);
    try {
      const data = await getAnggotaForKartu(q);
      if (data) {
        setAnggota(data);
      } else {
        const res = await scanAnggota(q);
        if (res.ok && (res as any).anggota) {
          setAnggota((res as any).anggota);
        } else {
          setAnggota(null);
          setErr("Anggota tidak ditemukan. Pastikan nomor anggota, NISN, atau nama sesuai.");
        }
      }
    } catch {
      setErr("Terjadi kesalahan saat mencari anggota.");
    } finally {
      setBusy(false);
    }
  };

  const cetak = (mode: ModePrint) => {
    if (!anggota) return;
    setModeCetak(mode);

    setTimeout(() => {
      printWithPageSize(LABEL_SIZES.kartu.width, LABEL_SIZES.kartu.height);
    }, 100);
  };

  const unduhPdf = async (mode: ModePrint) => {
    if (!anggota) return;
    setDownloading(true);

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54],
        compress: true,
      });

      if (mode === "DEPAN" || mode === "KEDUA") {
        if (!frontCardRef.current) {
          throw new Error("Elemen kartu depan belum siap dirender.");
        }
        const frontDataUrl = await toPng(frontCardRef.current, {
          quality: 1,
          pixelRatio: 4,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });
        pdf.addImage(frontDataUrl, "PNG", 0, 0, 85.6, 54, undefined, "FAST");
      }

      if (mode === "BELAKANG" || mode === "KEDUA") {
        if (!backCardRef.current) {
          throw new Error("Elemen kartu belakang belum siap dirender.");
        }
        const backDataUrl = await toPng(backCardRef.current, {
          quality: 1,
          pixelRatio: 4,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        if (mode === "KEDUA") {
          pdf.addPage([85.6, 54], "landscape");
          pdf.addImage(backDataUrl, "PNG", 0, 0, 85.6, 54, undefined, "FAST");
        } else {
          pdf.addImage(backDataUrl, "PNG", 0, 0, 85.6, 54, undefined, "FAST");
        }
      }

      const suffix =
        mode === "KEDUA" ? "Depan-Belakang" : mode === "DEPAN" ? "Depan" : "Belakang";
      pdf.save(`Kartu-Anggota-${anggota.no_anggota}-${suffix}.pdf`);
    } catch (e: any) {
      console.error("Gagal membuat file PDF:", e);
      alert(
        `Gagal membuat file PDF: ${e?.message || e}. Anda juga dapat menggunakan opsi 'Cetak via Browser'.`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* UI Administrasi — Disembunyikan saat print */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 print-hidden items-start">
        {/* Panel Pencarian & Aksi */}
        <div className="space-y-4">
          <form onSubmit={cari}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition-all flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={busy}
                placeholder="Nomor anggota / NISN / nama..."
                className="flex-1 bg-transparent focus:outline-none disabled:opacity-50 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-sans"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={busy || !query}
                className="shrink-0 h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cari"}
              </button>
            </div>
          </form>

          {err && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl px-3.5 py-2.5 text-xs">
              <span className="font-medium">{err}</span>
            </div>
          )}

          {anggota && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {anggota.nama.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{anggota.nama}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{anggota.no_anggota}</span> · {anggota.jenis}
                    {anggota.kelas ? ` · ${anggota.kelas}` : ""}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>

              {/* Unduh File PDF */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Simpan File PDF (Standar ISO ID-1)
                </p>

                <button
                  type="button"
                  onClick={() => unduhPdf("KEDUA")}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyiapkan PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Unduh PDF (Depan &amp; Belakang)
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => unduhPdf("DEPAN")}
                    disabled={downloading}
                    className="flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    Unduh Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => unduhPdf("BELAKANG")}
                    disabled={downloading}
                    className="flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    Unduh Belakang
                  </button>
                </div>
              </div>

              {/* Cetak Fisik / Browser */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cetak Langsung (Browser / Printer PVC)
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => cetak("KEDUA")}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Bolak-Balik
                  </button>
                  <button
                    type="button"
                    onClick={() => cetak("DEPAN")}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => cetak("BELAKANG")}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Belakang
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-lg p-3 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Spesifikasi Kartu ID-1:</p>
                <p>
                  Ukuran: <strong className="text-slate-800 dark:text-slate-200 font-mono">85.60 mm × 53.98 mm</strong>
                </p>
                <p>
                  Watermark logo sekolah dan rasio 1:1 siap cetak di blanko kartu PVC atau kertas laminasi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Workstation Pratinjau Kartu */}
        <div className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px]">
          {anggota ? (
            <div className="space-y-6 flex flex-col items-center w-full">
              <div className="flex items-center justify-between w-full px-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Pratinjau Fisik Kartu Anggota
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                  85.6 × 54 mm
                </span>
              </div>

              {/* Sisi Depan dan Belakang Berdampingan */}
              <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-6 w-full">
                {/* 1. SISI DEPAN */}
                <div className="flex flex-col items-center gap-2.5">
                  <div ref={frontCardRef} className="shadow-md rounded-xl overflow-hidden border border-slate-300/80">
                    <KartuDepan
                      a={anggota}
                      barcodeUrl={barcodeUrl}
                      qrCodeUrl={qrCodeUrl}
                      isPreview={true}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Sisi Depan
                  </span>
                </div>

                {/* 2. SISI BELAKANG */}
                <div className="flex flex-col items-center gap-2.5">
                  <div ref={backCardRef} className="shadow-md rounded-xl overflow-hidden border border-slate-300/80">
                    <KartuBelakang isPreview={true} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    Sisi Belakang
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Belum ada anggota yang dipilih
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Ketik nomor anggota (misal: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">A0005</span>), NISN, atau nama pada kolom pencarian di sebelah kiri.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Print-only area — Dicetak di browser */}
      {anggota && (
        <div className="print-area">
          {(modeCetak === "DEPAN" || modeCetak === "KEDUA") && (
            <div
              style={
                modeCetak === "KEDUA"
                  ? { pageBreakAfter: "always", breakAfter: "page" }
                  : undefined
              }
            >
              <KartuDepan
                a={anggota}
                barcodeUrl={barcodeUrl}
                qrCodeUrl={qrCodeUrl}
                isPreview={false}
              />
            </div>
          )}

          {(modeCetak === "BELAKANG" || modeCetak === "KEDUA") && (
            <div>
              <KartuBelakang isPreview={false} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * 1. SISI DEPAN:
 * Kartu Anggota Resmi Perpustakaan SMK Negeri 1 Beringin.
 * Berstandar ISO/IEC 7810 ID-1 (85.6 × 54 mm).
 */
function KartuDepan({
  a,
  barcodeUrl,
  qrCodeUrl,
  isPreview = false,
}: {
  a: AnggotaInfo;
  barcodeUrl: string;
  qrCodeUrl?: string;
  isPreview?: boolean;
}) {
  return (
    <div
      className={`${
        isPreview
          ? "w-[340px] h-[214.5px]"
          : "w-[85.6mm] h-[54mm]"
      } bg-white flex flex-col justify-between text-slate-900 select-none box-border relative`}
      style={{
        boxSizing: "border-box",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Background Watermark Logo Sekolah */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <img
          src="/assets/logo.png"
          alt="Watermark Logo Sekolah"
          className="w-32 h-32 object-contain opacity-[0.08]"
          style={{
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        />
      </div>

      {/* Header Resmi Pendidikan: Navy Solid Institusional */}
      <div
        className="px-3 py-1.5 flex items-center justify-between shrink-0 relative z-10 border-b border-blue-950"
        style={{
          backgroundColor: "#1e3a8a",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="Logo SMKN 1 Beringin"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-[9px] sm:text-[9.5px] tracking-wide text-white uppercase">
              SMK NEGERI 1 BERINGIN
            </p>
            <p className="text-blue-200 font-semibold text-[6.5px] sm:text-[7px] tracking-wider uppercase">
              PERPUSTAKAAN SEKOLAH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <img
            src="/assets/logo-kolaborasi.png"
            alt="Logo Kolaborasi"
            className="h-4 w-auto object-contain brightness-0 invert opacity-85 shrink-0"
          />
          <span 
            className="px-1.5 py-0.5 rounded text-[6.5px] font-bold tracking-wider uppercase border border-amber-300"
            style={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            KARTU ANGGOTA
          </span>
        </div>
      </div>

      {/* Body Kartu: Data Anggota + Barcode + QR Code */}
      <div className="flex-1 flex items-center justify-between px-3.5 py-1.5 gap-2 relative z-10">
        {/* Kolom Kiri: Detail Identitas */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          <div className="space-y-0.5">
            <span className="text-[6.5px] uppercase font-semibold text-slate-500 tracking-wider block">
              Nama Anggota
            </span>
            <h2 className="font-bold text-[12px] sm:text-[13px] text-slate-900 leading-tight truncate">
              {a.nama}
            </h2>

            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
              <span 
                className="font-mono font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded leading-none"
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                {a.no_anggota}
              </span>
              <span 
                className="text-[7.5px] font-semibold px-1.5 py-0.5 rounded leading-none"
                style={{
                  backgroundColor: "#f8fafc",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                {a.jenis}
              </span>
              {a.kelas && (
                <span 
                  className="text-[7.5px] font-semibold px-1.5 py-0.5 rounded leading-none"
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                  }}
                >
                  {a.kelas}
                </span>
              )}
            </div>

            {a.nisn && (
              <p className="font-mono text-[7px] text-slate-600 pt-0.5 leading-tight">
                NISN: <strong className="text-slate-800">{a.nisn}</strong>
              </p>
            )}
          </div>

          {/* Barcode Frame */}
          <div 
            className="mt-1 inline-flex flex-col items-center justify-center p-1 px-2.5 rounded shadow-2xs w-fit"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #94a3b8",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            {barcodeUrl ? (
              <img
                src={barcodeUrl}
                alt={`Barcode ${a.no_anggota}`}
                className="h-7.5 sm:h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <div className="h-8 w-28 bg-slate-100 animate-pulse rounded" />
            )}
            <span className="text-[7px] font-mono font-bold text-slate-800 tracking-wider leading-none mt-0.5">
              {a.no_anggota}
            </span>
          </div>
        </div>

        {/* Kolom Kanan: QR Code untuk Scan Kiosk */}
        <div 
          className="shrink-0 flex flex-col items-center justify-center p-1 rounded shadow-2xs"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        >
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code ${a.no_anggota}`}
              className="w-13 h-13 sm:w-14 sm:h-14 object-contain"
            />
          ) : (
            <div className="w-13 h-13 bg-slate-100 animate-pulse rounded" />
          )}
          <span className="text-[6px] font-mono font-bold text-slate-600 mt-0.5 uppercase tracking-wide">
            SCAN KIOSK
          </span>
        </div>
      </div>

      {/* Footer Bawah */}
      <div
        className="px-3 py-1 border-t border-slate-200 shrink-0 relative z-10 flex items-center justify-between"
        style={{
          backgroundColor: "#f8fafc",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <p className="text-[6px] sm:text-[6.5px] text-slate-600 leading-tight">
          Kartu sah anggota perpustakaan. Wajib dibawa saat berkunjung atau meminjam.
        </p>
        <p className="text-[6px] font-mono text-emerald-700 font-bold">
          STATUS: AKTIF
        </p>
      </div>
    </div>
  );
}

/**
 * 2. SISI BELAKANG:
 * Tata Tertib & Ketentuan Penggunaan Kartu Perpustakaan SMK Negeri 1 Beringin.
 */
function KartuBelakang({ isPreview = false }: { isPreview?: boolean }) {
  const tahunIni = new Date().getFullYear();

  return (
    <div
      className={`${
        isPreview
          ? "w-[340px] h-[214.5px]"
          : "w-[85.6mm] h-[54mm]"
      } bg-white flex flex-col justify-between text-slate-900 select-none box-border relative`}
      style={{
        boxSizing: "border-box",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Background Watermark Logo Sekolah */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <img
          src="/assets/logo.png"
          alt="Watermark Logo Sekolah"
          className="w-32 h-32 object-contain opacity-[0.08]"
          style={{
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        />
      </div>

      {/* Header Sisi Belakang */}
      <div
        className="px-3 py-1.5 flex items-center justify-between shrink-0 relative z-10 border-b border-blue-950"
        style={{
          backgroundColor: "#1e3a8a",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <div className="flex items-center gap-1.5">
          <img
            src="/assets/logo.png"
            alt="Logo SMKN 1 Beringin"
            className="w-4 h-4 object-contain rounded bg-white p-0.5 shrink-0"
          />
          <p className="font-extrabold text-[9px] sm:text-[9.5px] tracking-wide leading-tight text-white uppercase">
            TATA TERTIB PERPUSTAKAAN
          </p>
        </div>
        <p className="text-blue-200 font-bold text-[7px] sm:text-[7.5px] uppercase tracking-wider">
          SMKN 1 BERINGIN
        </p>
      </div>

      {/* Body: 5 Poin Tata Tertib & Ketentuan */}
      <div className="flex-1 px-3.5 py-1.5 flex flex-col justify-around text-slate-800 relative z-10">
        <ol className="space-y-1 text-[7px] sm:text-[7.5px] leading-tight list-none">
          <li className="flex items-start gap-1.5">
            <span 
              className="font-bold text-[6.5px] px-1 rounded shrink-0 leading-tight"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              1
            </span>
            <span>Kartu ini adalah bukti keanggotaan sah dan wajib dibawa setiap berkunjung/meminjam.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span 
              className="font-bold text-[6.5px] px-1 rounded shrink-0 leading-tight"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              2
            </span>
            <span>Kartu tidak boleh dipindahtangankan atau digunakan oleh orang lain.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span 
              className="font-bold text-[6.5px] px-1 rounded shrink-0 leading-tight"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              3
            </span>
            <span>Peminjam bertanggung jawab penuh atas keutuhan dan kebersihan koleksi buku.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span 
              className="font-bold text-[6.5px] px-1 rounded shrink-0 leading-tight"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              4
            </span>
            <span>Keterlambatan pengembalian buku dikenakan sanksi sesuai ketentuan sekolah.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span 
              className="font-bold text-[6.5px] px-1 rounded shrink-0 leading-tight"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#334155",
                border: "1px solid #e2e8f0",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              5
            </span>
            <span>Apabila kartu hilang atau rusak, segera melapor kepada staf perpustakaan.</span>
          </li>
        </ol>
      </div>

      {/* Footer Sisi Belakang */}
      <div
        className="px-3.5 py-1 border-t border-slate-200 flex items-center justify-between shrink-0 relative z-10"
        style={{
          backgroundColor: "#f8fafc",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <div className="text-[6px] sm:text-[6.5px] text-slate-600 leading-tight">
          <p className="font-bold text-slate-800">Perpustakaan SMK Negeri 1 Beringin</p>
          <p>Kec. Beringin, Kab. Deli Serdang, Sumut</p>
          <p className="text-blue-700 font-mono">perpustakaan.smknegeri1beringin.sch.id</p>
        </div>

        <div className="text-right text-[6px] sm:text-[6.5px] text-slate-600 leading-tight">
          <p>Beringin, {tahunIni}</p>
          <p className="font-bold text-slate-800 mt-0.5">Kepala Perpustakaan,</p>
          <p className="text-slate-400 font-mono mt-0.5">( Tanda Tangan / Stempel )</p>
        </div>
      </div>
    </div>
  );
}
