"use client";

import { useState, useRef, useCallback } from "react";
import { updateBuku } from "@/actions/buku";
import { autoDetectDdcAction } from "@/actions/scanBuku";
import { CATEGORY_TO_DDC, QUICK_DDC_OPTIONS } from "@/lib/ddc";
import { CoverUploadField } from "@/components/admin/CoverUploadField";
import { EbookUploadField } from "@/components/admin/EbookUploadField";
import {
  Save,
  BookOpen,
  User,
  Tag,
  Layers,
  Bookmark,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface EditBukuFormClientProps {
  buku: {
    id: string;
    judul: string;
    penulis: string;
    kode_buku: string | null;
    kategori: string | null;
    klasifikasi: string | null;
    tahun_ajaran: string | null;
    tipe_buku: string;
    stok_total: number;
    stok_tersedia: number;
    cover_url: string | null;
    file_url: string | null;
    is_ebook: boolean;
  };
  mataPelajaran: string[];
}

export function EditBukuFormClient({ buku, mataPelajaran }: EditBukuFormClientProps) {
  const [isbn, setIsbn] = useState(buku.kode_buku || "");
  const [klasifikasi, setKlasifikasi] = useState(buku.klasifikasi || "");
  const [isDetectingDdc, setIsDetectingDdc] = useState(false);
  const [showQuickDdc, setShowQuickDdc] = useState(false);
  const [detectedDdcInfo, setDetectedDdcInfo] = useState<{
    ddc: string;
    label: string;
    source: string;
  } | null>(
    buku.klasifikasi
      ? {
          ddc: buku.klasifikasi,
          label: buku.kategori || "Tersimpan",
          source: "Database",
        }
      : null
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDdcDetection = useCallback(async (rawIsbn: string) => {
    const clean = rawIsbn.trim().replace(/[-\s]/g, "");
    if (clean.length < 8) return;

    const formJudul = document.querySelector<HTMLInputElement>('input[name="judul"]')?.value || buku.judul;
    const formKategori = document.querySelector<HTMLSelectElement>('select[name="kategori"]')?.value || buku.kategori || "";

    setIsDetectingDdc(true);
    try {
      const res = await autoDetectDdcAction(clean, formJudul, formKategori);
      if (res.ok && res.ddc && res.ddc !== "000") {
        setKlasifikasi(res.ddc);
        setDetectedDdcInfo({
          ddc: res.ddc,
          label: res.label,
          source: res.source,
        });
        const formKlasifikasi = document.querySelector<HTMLInputElement>('input[name="klasifikasi"]');
        if (formKlasifikasi) {
          formKlasifikasi.value = res.ddc;
          formKlasifikasi.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    } catch {
      // Abaikan jika error jaringan
    } finally {
      setIsDetectingDdc(false);
    }
  }, [buku.judul, buku.kategori]);

  const handleIsbnChange = (val: string) => {
    setIsbn(val);
    const formKode = document.querySelector<HTMLInputElement>('input[name="kode_buku"]');
    if (formKode && !formKode.value) {
      formKode.value = val;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const clean = val.trim().replace(/[-\s]/g, "");
    if (clean.length >= 8) {
      debounceTimerRef.current = setTimeout(() => {
        triggerDdcDetection(clean);
      }, 400);
    }
  };

  const handleKategoriChange = (cat: string) => {
    if (!klasifikasi || klasifikasi === "000") {
      const mapped = CATEGORY_TO_DDC[cat];
      if (mapped) {
        setKlasifikasi(mapped.ddc);
        setDetectedDdcInfo({
          ddc: mapped.ddc,
          label: mapped.label,
          source: `Kategori: ${cat}`,
        });
        const formKlasifikasi = document.querySelector<HTMLInputElement>('input[name="klasifikasi"]');
        if (formKlasifikasi) {
          formKlasifikasi.value = mapped.ddc;
          formKlasifikasi.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }
  };

  return (
    <form action={updateBuku.bind(null, buku.id)} className="space-y-6">
      {/* Tipe Buku */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Jenis &amp; Tipe Buku</label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-xs">
            <input
              type="radio"
              name="tipe_buku"
              value="BIASA"
              defaultChecked={buku.tipe_buku !== "MAPEL"}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Buku Biasa / Umum</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Peminjaman individual, durasi fleksibel
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-xs">
            <input
              type="radio"
              name="tipe_buku"
              value="MAPEL"
              defaultChecked={buku.tipe_buku === "MAPEL"}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Buku Mapel / LKS</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Paket per kelas, ganti per tahun ajaran
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Kode Buku (Unik)
          </label>
          <input
            name="kode_buku"
            defaultValue={buku.kode_buku || ""}
            placeholder="Contoh: 001, B-IPA-01"
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono shadow-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              ISBN
            </label>
            {isDetectingDdc ? (
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Mencari DDC...
              </span>
            ) : detectedDdcInfo ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                DDC Siap
              </span>
            ) : null}
          </div>
          <div className="relative">
            <input
              name="isbn"
              value={isbn}
              onChange={(e) => handleIsbnChange(e.target.value)}
              onBlur={() => {
                const clean = isbn.trim().replace(/[-\s]/g, "");
                if (clean.length >= 8) triggerDdcDetection(clean);
              }}
              inputMode="numeric"
              placeholder="Nomor ISBN buku..."
              className="w-full h-11 font-mono border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              {isDetectingDdc && <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />}
              {!isDetectingDdc && detectedDdcInfo && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Judul Buku *
        </label>
        <input
          name="judul"
          defaultValue={buku.judul}
          required
          className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium shadow-xs"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Nama Penulis / Pengarang *
        </label>
        <input
          name="penulis"
          defaultValue={buku.penulis}
          required
          className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Kategori / Mata Pelajaran
          </label>
          <select
            name="kategori"
            defaultValue={buku.kategori || ""}
            onChange={(e) => handleKategoriChange(e.target.value)}
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
          >
            <option value="">-- Pilih Kategori --</option>
            {mataPelajaran.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Klasifikasi / DDC
            </label>
            {isDetectingDdc && (
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Mendeteksi...
              </span>
            )}
          </div>
          <div className="relative">
            <input
              name="klasifikasi"
              value={klasifikasi}
              onChange={(e) => setKlasifikasi(e.target.value)}
              placeholder="Contoh: 500 (Sains), 004 (Komputer)"
              className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono shadow-xs"
            />
            {klasifikasi && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  DDC
                </span>
              </div>
            )}
          </div>

          {detectedDdcInfo && (
            <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] flex-wrap">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Otomatis: <strong className="font-mono font-bold">{detectedDdcInfo.ddc}</strong> ({detectedDdcInfo.label})
                </span>
              </span>
              <span className="text-slate-400 text-[10px]">
                {detectedDdcInfo.source}
              </span>
            </div>
          )}

          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowQuickDdc(!showQuickDdc)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{showQuickDdc ? "Tutup Pilihan DDC Cepat" : "Pilihan Kode DDC Cepat (SMK)"}</span>
              {showQuickDdc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showQuickDdc && (
              <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {QUICK_DDC_OPTIONS.map((opt) => (
                  <button
                    key={opt.ddc}
                    type="button"
                    onClick={() => {
                      setKlasifikasi(opt.ddc);
                      setDetectedDdcInfo({
                        ddc: opt.ddc,
                        label: opt.label,
                        source: "Pilihan Cepat",
                      });
                      const formKlasifikasi = document.querySelector<HTMLInputElement>('input[name="klasifikasi"]');
                      if (formKlasifikasi) {
                        formKlasifikasi.value = opt.ddc;
                        formKlasifikasi.dispatchEvent(new Event("input", { bubbles: true }));
                      }
                    }}
                    className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      klasifikasi === opt.ddc
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    <span className="font-mono font-bold mr-1">{opt.ddc}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Total Stok Keseluruhan *
          </label>
          <input
            name="stok_total"
            type="number"
            min="1"
            defaultValue={buku.stok_total}
            required
            className="w-full h-11 font-mono border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
          />
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Tersedia saat ini: <strong className="text-blue-600 dark:text-blue-400 font-bold">{buku.stok_tersedia}</strong> eksemplar.
            </span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tahun Ajaran / Terbit
          </label>
          <input
            name="tahun_ajaran"
            defaultValue={buku.tahun_ajaran || ""}
            placeholder="Contoh: 2024/2025"
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Foto Sampul / Cover Upload */}
      <CoverUploadField initialCoverUrl={buku.cover_url} />

      {/* E-Book Digital PDF Upload & Linking */}
      <EbookUploadField
        initialFileUrl={buku.file_url}
        initialIsEbook={buku.is_ebook}
      />

      <div className="flex items-center gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
        <button
          type="submit"
          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          Simpan Perubahan
        </button>
        <Link
          href="/admin/buku"
          className="h-11 px-5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-sm font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 flex items-center transition-all cursor-pointer shadow-xs"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

