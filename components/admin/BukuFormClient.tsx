"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IsbnFetcher } from "@/components/admin/IsbnFetcher";
import { VoiceNoteBuku } from "@/components/admin/VoiceNoteBuku";
import { VoiceInput } from "@/components/ui/VoiceInput";
import { EbookUploadField } from "@/components/admin/EbookUploadField";
import { CoverUploadField } from "@/components/admin/CoverUploadField";
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
} from "lucide-react";
import Link from "next/link";
import { autoDetectDdcAction } from "@/actions/scanBuku";
import { CATEGORY_TO_DDC, QUICK_DDC_OPTIONS } from "@/lib/ddc";

type Prefill = {
  judul: string;
  penulis: string;
  cover_url: string | null;
  kategori?: string | null;
  klasifikasi?: string | null;
};

export function BukuFormClient({
  createBuku,
  mataPelajaran,
  today,
  initialIsbn,
}: {
  createBuku: (formData: FormData) => Promise<void>;
  mataPelajaran: string[];
  today: string;
  initialIsbn?: string;
}) {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [isbn, setIsbn] = useState(initialIsbn || "");
  const [klasifikasi, setKlasifikasi] = useState("");
  const [isDetectingDdc, setIsDetectingDdc] = useState(false);
  const [showQuickDdc, setShowQuickDdc] = useState(false);
  const [detectedDdcInfo, setDetectedDdcInfo] = useState<{
    ddc: string;
    label: string;
    source: string;
    confidence?: string;
  } | null>(null);

  const prevIsbnRef = useRef(initialIsbn || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Deteksi otomatis DDC dari ISBN (Online Catalog / Local DB / Smart Keyword Inference)
  const triggerDdcDetection = useCallback(async (rawIsbn: string) => {
    const clean = rawIsbn.trim().replace(/[-\s]/g, "");
    if (clean.length < 8) return;

    const formJudul = document.querySelector<HTMLInputElement>('input[name="judul"]')?.value || "";
    const formKategori = document.querySelector<HTMLSelectElement>('select[name="kategori"]')?.value || "";

    setIsDetectingDdc(true);
    try {
      const res = await autoDetectDdcAction(clean, formJudul, formKategori);
      if (res.ok && res.ddc && res.ddc !== "000") {
        setKlasifikasi(res.ddc);
        setDetectedDdcInfo({
          ddc: res.ddc,
          label: res.label,
          source: res.source,
          confidence: res.confidence,
        });

        // Sinkronkan ke DOM input form name="klasifikasi"
        const formKlasifikasi = document.querySelector<HTMLInputElement>('input[name="klasifikasi"]');
        if (formKlasifikasi) {
          formKlasifikasi.value = res.ddc;
          formKlasifikasi.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Auto-fill judul & penulis jika form masih kosong
        if (res.judul) {
          const inputJudul = document.querySelector<HTMLInputElement>('input[name="judul"]');
          if (inputJudul && !inputJudul.value.trim()) {
            inputJudul.value = res.judul;
            inputJudul.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        if (res.penulis) {
          const inputPenulis = document.querySelector<HTMLInputElement>('input[name="penulis"]');
          if (inputPenulis && !inputPenulis.value.trim()) {
            inputPenulis.value = res.penulis;
            inputPenulis.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        if (res.kategori) {
          const selectKategori = document.querySelector<HTMLSelectElement>('select[name="kategori"]');
          if (selectKategori && !selectKategori.value) {
            selectKategori.value = res.kategori;
            selectKategori.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
        if (res.cover_url) {
          const inputCover = document.querySelector<HTMLInputElement>('input[name="cover_url"]');
          if (inputCover && !inputCover.value) {
            inputCover.value = res.cover_url;
          }
        }
      }
    } catch {
      // Abaikan jika network error
    } finally {
      setIsDetectingDdc(false);
    }
  }, []);

  // Handle perubahan pada input ISBN secara langsung (ketik manual, paste, atau scanner tembak)
  const handleIsbnChange = (val: string) => {
    setIsbn(val);

    // Otomatis isi kode_buku dengan ISBN jika kode_buku masih kosong
    const formKode = document.querySelector<HTMLInputElement>('input[name="kode_buku"]');
    if (formKode && (!formKode.value || formKode.value === prevIsbnRef.current)) {
      formKode.value = val;
    }
    prevIsbnRef.current = val;

    // Bersihkan timer debounce sebelumnya
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const clean = val.trim().replace(/[-\s]/g, "");
    if (clean.length >= 8) {
      // Debounce 400ms agar tidak spam request saat user masih mengetik
      debounceTimerRef.current = setTimeout(() => {
        triggerDdcDetection(clean);
      }, 400);
    }
  };

  // Trigger auto-detect DDC saat initialIsbn tersedia (misalnya redirect dari halaman scan barcode)
  useEffect(() => {
    if (initialIsbn) {
      const clean = initialIsbn.trim().replace(/[-\s]/g, "");
      setIsbn(initialIsbn);
      const formIsbn = document.querySelector<HTMLInputElement>('input[name="isbn"]');
      if (formIsbn) {
        formIsbn.value = initialIsbn;
        formIsbn.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const formKode = document.querySelector<HTMLInputElement>('input[name="kode_buku"]');
      if (formKode && !formKode.value) {
        formKode.value = initialIsbn;
        formKode.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (clean.length >= 8) {
        triggerDdcDetection(clean);
      }
    }
  }, [initialIsbn, triggerDdcDetection]);

  // Sinkronisasi data dari IsbnFetcher (bagian atas)
  const handlePrefill = (data: Prefill) => {
    setPrefill(data);

    if (data.klasifikasi && data.klasifikasi !== "000") {
      setKlasifikasi(data.klasifikasi);
      setDetectedDdcInfo({
        ddc: data.klasifikasi,
        label: data.kategori || "Hasil Scan Online",
        source: "Scanner ISBN",
      });
    }

    // Sinkronkan ke elemen DOM untuk jaminan instan 100%
    setTimeout(() => {
      const formJudul = document.querySelector<HTMLInputElement>('input[name="judul"]');
      if (formJudul && data.judul) {
        formJudul.value = data.judul;
        formJudul.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const formPenulis = document.querySelector<HTMLInputElement>('input[name="penulis"]');
      if (formPenulis && data.penulis) {
        formPenulis.value = data.penulis;
        formPenulis.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const formKategori = document.querySelector<HTMLSelectElement>('select[name="kategori"]');
      if (formKategori && data.kategori) {
        formKategori.value = data.kategori;
        formKategori.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const formKlasifikasi = document.querySelector<HTMLInputElement>('input[name="klasifikasi"]');
      if (formKlasifikasi && data.klasifikasi && data.klasifikasi !== "000") {
        formKlasifikasi.value = data.klasifikasi;
      }

      const formCover = document.querySelector<HTMLInputElement>('input[name="cover_url"]');
      if (formCover && data.cover_url) {
        formCover.value = data.cover_url;
      }
    }, 50);
  };

  // Jika admin memilih kategori, otomatis sarankan DDC kategori tersebut jika kolom DDC masih kosong
  const handleKategoriChange = (newCat: string) => {
    if (!klasifikasi || klasifikasi === "000") {
      const mapped = CATEGORY_TO_DDC[newCat];
      if (mapped) {
        setKlasifikasi(mapped.ddc);
        setDetectedDdcInfo({
          ddc: mapped.ddc,
          label: mapped.label,
          source: `Kategori: ${newCat}`,
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
    <form action={createBuku} className="space-y-6">
      <IsbnFetcher onFetch={handlePrefill} />
      <VoiceNoteBuku />

      {/* Tipe Buku */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Jenis &amp; Tipe Buku</label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-xs">
            <input
              type="radio"
              name="tipe_buku"
              value="BIASA"
              defaultChecked
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
            defaultValue={initialIsbn || ""}
            placeholder="Contoh: 001, B-IPA-01, LKS-IPA-2024"
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono shadow-xs"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Kode unik identifikasi buku (opsional)
          </p>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const clean = isbn.trim().replace(/[-\s]/g, "");
                  if (clean.length >= 8) triggerDdcDetection(clean);
                }
              }}
              inputMode="numeric"
              placeholder="9786021234567 (otomatis deteksi DDC)"
              className="w-full h-11 font-mono border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              {isDetectingDdc && <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />}
              {!isDetectingDdc && detectedDdcInfo && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ketik atau scan nomor ISBN buku — nomor DDC terisi otomatis
          </p>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Judul Buku *
        </label>
        <VoiceInput
          name="judul"
          required
          placeholder="Masukkan judul buku..."
          prefillValue={prefill?.judul}
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Penulis / Pengarang *
        </label>
        <VoiceInput
          name="penulis"
          required
          placeholder="Nama penulis atau penyusun..."
          prefillValue={prefill?.penulis}
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
            defaultValue={prefill?.kategori || ""}
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

          {/* Banner status deteksi otomatis */}
          {detectedDdcInfo ? (
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
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Nomor klasifikasi rak Dewey Decimal (terisi otomatis saat isi ISBN)
            </p>
          )}

          {/* Tombol rekomendasi DDC cepat */}
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
                      const formKat = document.querySelector<HTMLSelectElement>('select[name="kategori"]');
                      if (formKat && !formKat.value && opt.kategori) {
                        formKat.value = opt.kategori;
                        formKat.dispatchEvent(new Event("change", { bubbles: true }));
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
            Jumlah Stok Eksemplar *
          </label>
          <input
            name="stok_total"
            type="number"
            min="1"
            defaultValue="1"
            required
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono shadow-xs"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tahun Ajaran / Terbit
          </label>
          <input
            name="tahun_ajaran"
            placeholder="Contoh: 2024/2025"
            className="w-full h-11 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Foto Sampul / Cover Upload */}
      <CoverUploadField initialCoverUrl={prefill?.cover_url} />

      {/* E-Book PDF Upload */}
      <EbookUploadField />

      <div className="flex items-center gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
        <button
          type="submit"
          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          Simpan Buku
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
