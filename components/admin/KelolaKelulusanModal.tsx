"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  BookX,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getInfoKelas12, hapusSiswaKelas12Permanen } from "@/actions/anggota";
import { useRouter } from "next/navigation";

export function KelolaKelulusanModal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [info, setInfo] = useState<{
    totalSiswa: number;
    totalSiswaKelas11: number;
    totalSiswaKelas10: number;
    totalKelas: number;
    namaKelas: string[];
    totalPeminjamAktif: number;
    peminjamAktif: { nama: string; no_anggota: string; judulBuku: string }[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setConfirmText("");
    try {
      const res = await getInfoKelas12();
      setInfo(res);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat info kelas.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (confirmText.trim().toUpperCase() !== "HAPUS") {
      alert("Ketik 'HAPUS' pada kolom konfirmasi untuk melanjutkan.");
      return;
    }

    setDeleting(true);
    setErrorMsg(null);
    try {
      const res = await hapusSiswaKelas12Permanen();
      if (res.ok) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 2000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat memproses kelulusan.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Tombol Pemicu Modal */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 hover:border-rose-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0"
        title="Proses kelulusan kelas 12 dan otomatis naikkan kelas 10 & 11"
      >
        <GraduationCap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        <span className="hidden sm:inline">Kelulusan</span>
        <span className="hidden 2xl:inline"> Kelas 12</span>
      </button>

      {/* Modal Dialog Portal */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          onClick={() => !deleting && setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal - Pinned at top */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-tight">
                    Kelulusan &amp; Kenaikan Kelas Otomatis
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                    Hapus permanen siswa Kelas 12 &amp; otomatis naikkan jenjang Kelas 10 dan 11
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-500 dark:text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-600 dark:text-rose-400" />
                  <p className="text-xs font-semibold">Memeriksa data siswa Kelas 10, 11, 12 &amp; pinjaman buku...</p>
                </div>
              ) : info ? (
                <>
                  {/* Ringkasan Data Jenjang Siswa */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Kelas 12 Lulus */}
                    <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                        Kelas 12 (Lulus)
                      </span>
                      <span className="text-lg sm:text-xl font-black text-rose-900 dark:text-rose-200 block mt-0.5">
                        {info.totalSiswa} Siswa
                      </span>
                      <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-medium">Akan Dihapus</span>
                    </div>

                    {/* Kelas 11 Naik */}
                    <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40">
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                        Kelas 11 (Naik)
                      </span>
                      <span className="text-lg sm:text-xl font-black text-sky-900 dark:text-sky-200 block mt-0.5">
                        {info.totalSiswaKelas11} Siswa
                      </span>
                      <span className="text-[10px] text-sky-600/80 dark:text-sky-400/80 font-medium">Naik ke Kelas 12</span>
                    </div>

                    {/* Kelas 10 Naik */}
                    <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                        Kelas 10 (Naik)
                      </span>
                      <span className="text-lg sm:text-xl font-black text-teal-900 dark:text-teal-200 block mt-0.5">
                        {info.totalSiswaKelas10} Siswa
                      </span>
                      <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-medium">Naik ke Kelas 11</span>
                    </div>

                    {/* Tanggungan Buku Kelas 12 */}
                    <div className={`p-3 rounded-2xl border ${
                      info.totalPeminjamAktif > 0
                        ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40"
                        : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        info.totalPeminjamAktif > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}>
                        Pinjaman Kelas 12
                      </span>
                      <span className={`text-lg sm:text-xl font-black block mt-0.5 ${
                        info.totalPeminjamAktif > 0 ? "text-amber-900 dark:text-amber-200" : "text-emerald-900 dark:text-emerald-200"
                      }`}>
                        {info.totalPeminjamAktif}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        info.totalPeminjamAktif > 0 ? "text-amber-600/90 dark:text-amber-400/90" : "text-emerald-600/90 dark:text-emerald-400/90"
                      }`}>
                        {info.totalPeminjamAktif > 0 ? "Belum Kembali" : "Bebas Pustaka"}
                      </span>
                    </div>
                  </div>

                  {/* Alur Kenaikan Kelas Otomatis */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-950/60 border border-stone-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      Alur Otomatisasi Tahun Ajaran Baru:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800/80 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white text-[11px]">Kelas 12 Tamat</p>
                          <p className="text-[10px] text-stone-500 dark:text-slate-400">Dihapus permanen dari perpustakaan</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white text-[11px]">Kelas 11 → Kelas 12</p>
                          <p className="text-[10px] text-stone-500 dark:text-slate-400">Naik jenjang otomatis sesuai jurusannya</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white text-[11px]">Kelas 10 → Kelas 11</p>
                          <p className="text-[10px] text-stone-500 dark:text-slate-400">Kelas 10 kosong untuk siswa baru</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Kelas 12 yang Terdaftar */}
                  {info.namaKelas.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-stone-700 dark:text-slate-300 block">
                        Daftar Rombel Kelas 12 Terdaftar ({info.namaKelas.length} Kelas):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-2 rounded-xl bg-stone-50 dark:bg-slate-950/60 border border-stone-200 dark:border-slate-800 text-[11px] text-stone-600 dark:text-slate-300">
                        {info.namaKelas.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-slate-800 font-mono text-[10px]"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Peringatan Jika Masih Ada Buku Belum Kembali */}
                  {info.totalPeminjamAktif > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                      <div className="flex items-start gap-2">
                        <BookX className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            Tidak Dapat Diproses Langsung
                          </h4>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                            Ada <strong>{info.totalPeminjamAktif} buku</strong> yang masih dipinjam oleh siswa
                            kelas 12. Harap minta siswa mengembalikan buku terlebih dahulu melalui menu Sirkulasi sebelum kelulusan.
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 max-h-28 overflow-y-auto text-[11px] bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-amber-500/20">
                        {info.peminjamAktif.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-stone-700 dark:text-slate-300">
                            <span className="font-semibold truncate">
                              {t.nama} ({t.no_anggota})
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-slate-400 truncate max-w-[150px]">
                              {t.judulBuku}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Bebas Tanggungan Perpustakaan
                        </h4>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Semua siswa kelas 12 telah mengembalikan pinjaman buku dan sistem siap mengeksekusi kelulusan serta kenaikan kelas otomatis.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pesan Kesalahan / Sukses */}
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Konfirmasi Ketik */}
                  {info.totalPeminjamAktif === 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-slate-800">
                      <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block">
                        Konfirmasi Eksekusi:
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400">
                        Ketik kata <span className="font-mono font-bold text-rose-600 dark:text-rose-400">HAPUS</span> di bawah ini untuk memulai kelulusan &amp; kenaikan kelas:
                      </p>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Ketik HAPUS"
                        disabled={deleting}
                        className="w-full h-10 px-3.5 bg-stone-50 dark:bg-slate-950/70 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-bold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer Modal - Pinned at bottom */}
            {info && !loading && (
              <div className="flex items-center gap-2.5 px-5 py-4 border-t border-stone-200 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-900/80 shrink-0">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-stone-300 dark:border-slate-700"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={
                    deleting ||
                    info.totalPeminjamAktif > 0 ||
                    confirmText.trim().toUpperCase() !== "HAPUS"
                  }
                  onClick={handleExecuteDelete}
                  className="flex-1 sm:flex-[2] h-10 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Kenaikan &amp; Kelulusan...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Kelas 12 &amp; Naikkan Kelas 10-11</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
