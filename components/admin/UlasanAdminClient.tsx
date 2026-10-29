"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  Trash2,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  User,
  ArrowUpDown,
} from "lucide-react";
import { deleteUlasan } from "@/actions/ulasan";

export type AdminUlasanItem = {
  id: string;
  nama: string;
  rating: number;
  komentar: string;
  createdAt: Date | string;
  buku: {
    id: string;
    judul: string;
    penulis: string;
    cover_url: string | null;
    kategori: string | null;
  };
};

export function UlasanAdminClient({ initialList }: { initialList: AdminUlasanItem[] }) {
  const [list, setList] = useState<AdminUlasanItem[]>(initialList);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST" | "RATING_HIGH" | "RATING_LOW">("NEWEST");

  // Deletion modal state
  const [selectedUlasan, setSelectedUlasan] = useState<AdminUlasanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter & sorting
  const filteredList = useMemo(() => {
    let result = [...list];

    // Rating filter
    if (ratingFilter !== "ALL") {
      result = result.filter((u) => u.rating === ratingFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.nama.toLowerCase().includes(q) ||
          u.komentar.toLowerCase().includes(q) ||
          u.buku.judul.toLowerCase().includes(q) ||
          u.buku.penulis.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      if (sortOrder === "NEWEST") return timeB - timeA;
      if (sortOrder === "OLDEST") return timeA - timeB;
      if (sortOrder === "RATING_HIGH") return b.rating - a.rating;
      if (sortOrder === "RATING_LOW") return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [list, ratingFilter, searchQuery, sortOrder]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = list.length;
    if (total === 0) {
      return { total: 0, avg: 0, bintang5: 0, rendah: 0 };
    }
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / total).toFixed(1));
    const bintang5 = list.filter((u) => u.rating === 5).length;
    const rendah = list.filter((u) => u.rating <= 2).length;

    return { total, avg, bintang5, rendah };
  }, [list]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedUlasan) return;
    setIsDeleting(true);
    setActionMessage(null);

    try {
      const res = await deleteUlasan(selectedUlasan.id);
      if (res.ok) {
        setList((prev) => prev.filter((item) => item.id !== selectedUlasan.id));
        setActionMessage({
          type: "success",
          text: `Ulasan dari "${selectedUlasan.nama}" berhasil dihapus.`,
        });
        setSelectedUlasan(null);
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Gagal menghapus ulasan.",
        });
      }
    } catch {
      setActionMessage({
        type: "error",
        text: "Terjadi kesalahan saat menghapus ulasan.",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-xs transition-all animate-fade-up ${
            actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Ulasan
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dari pembaca publik</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rata-rata Rating
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-amber-500">{stats.avg}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kepuasan koleksi</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bintang 5
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.bintang5}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ulasan sangat puas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rating ≤ 2 Bintang
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {stats.rendah}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Perlu perhatian pustakawan</p>
        </div>
      </div>

      {/* Control Bar: Search, Rating Filter, Sorting */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pengulas, judul buku, atau teks komentar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Rating Filter Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 h-10">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
                }
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Rating</option>
                <option value="5">★ 5 Bintang</option>
                <option value="4">★ 4 Bintang</option>
                <option value="3">★ 3 Bintang</option>
                <option value="2">★ 2 Bintang</option>
                <option value="1">★ 1 Bintang</option>
              </select>
            </div>

            {/* Sort Order Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 h-10">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">Terbaru</option>
                <option value="OLDEST">Terlama</option>
                <option value="RATING_HIGH">Rating Tertinggi</option>
                <option value="RATING_LOW">Rating Terendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {(searchQuery || ratingFilter !== "ALL") && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>Filter aktif:</span>
            {searchQuery && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">
                Pencarian: &quot;{searchQuery}&quot;
              </span>
            )}
            {ratingFilter !== "ALL" && (
              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded font-medium">
                ★ {ratingFilter} Bintang
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setRatingFilter("ALL");
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline ml-auto font-medium cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
              Daftar Ulasan &amp; Komentar ({filteredList.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Petugas dapat memantau dan menghapus ulasan yang melanggar norma.
          </p>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Tidak ada ulasan ditemukan
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || ratingFilter !== "ALL"
                ? "Coba ubah kata kunci pencarian atau bersihkan filter rating."
                : "Belum ada siswa atau pembaca yang mengirimkan ulasan buku."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
              >
                {/* Left Column: Book Info & Review Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Book Cover Thumbnail */}
                  <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {item.buku.cover_url ? (
                      <img
                        src={item.buku.cover_url}
                        alt={item.buku.judul}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Review & Book Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Book Title & Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.buku.judul}
                      </h3>
                      {item.buku.kategori && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {item.buku.kategori}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Penulis: <span className="font-medium text-slate-700 dark:text-slate-300">{item.buku.penulis}</span>
                    </p>

                    {/* Reviewer & Star Rating Row */}
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {item.nama}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-500 ml-1">
                          {item.rating}/5
                        </span>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-400">
                        • {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Review Comment Text */}
                    <div className="mt-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg p-3">
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic whitespace-pre-wrap">
                        &quot;{item.komentar}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/?q=${encodeURIComponent(item.buku.judul)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Buka buku di katalog publik"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat di Katalog</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedUlasan(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                    title="Hapus ulasan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Hapus Ulasan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedUlasan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Hapus Ulasan Buku?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan ini permanen. Ulasan akan dihapus dari sistem dan katalog publik.
                </p>
              </div>
            </div>

            {/* Target Details Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Buku:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedUlasan.buku.judul}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Pengulas:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedUlasan.nama}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Rating:</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">{selectedUlasan.rating} / 5</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Komentar:</span>
                <p className="italic text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-3">
                  &quot;{selectedUlasan.komentar}&quot;
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedUlasan(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Ulasan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
