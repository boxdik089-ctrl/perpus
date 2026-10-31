"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import PustakawanAiWidget from "@/components/ai/PustakawanAiWidget";
import { 
  Search, 
  BookOpen, 
  User, 
  CheckCircle2, 
  LogIn, 
  Info, 
  X, 
  Star, 
  MessageSquare, 
  Send,
  ThumbsUp,
  Mic,
  MicOff,
  MapPin,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Laptop,
  Share2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  QrCode,
  Code,
  Server,
  Utensils,
  Wrench,
  Layers,
  CreditCard,
  Library,
  Flame,
  BookmarkCheck,
  Clock,
  Compass,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { createUlasan } from "@/actions/ulasan";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import BookMarqueeSection from "./BookMarqueeSection";
import { Book } from "@/components/ui/book";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { CatalogCustomDropdown, DropdownOption } from "./CatalogCustomDropdown";
import HeroShowcaseSection from "./HeroShowcaseSection";

export type BukuItem = {
  id: string;
  judul: string;
  penulis: string;
  cover_url: string | null;
  file_url?: string | null;
  is_ebook?: boolean;
  stok_total: number;
  stok_tersedia: number;
  klasifikasi: string | null;
  kategori?: string | null;
  is_referensi: boolean;
  rakNama: string | null;
};

export type UlasanItem = {
  id: string;
  bukuId: string;
  nama: string;
  rating: number;
  komentar: string;
  tanggal: string;
};

// Generative hardcover styling for books without image cover (No empty ugly placeholders)
function getGenerativeCoverTheme(judul: string) {
  const themes = [
    { bg: "from-[#0f172a] via-[#1e1b4b] to-[#020617]", accent: "text-indigo-400", border: "border-indigo-500/30", tag: "bg-indigo-500/20 text-indigo-300" },
    { bg: "from-[#064e3b] via-[#022c22] to-[#0a0a0c]", accent: "text-emerald-400", border: "border-emerald-500/30", tag: "bg-emerald-500/20 text-emerald-300" },
    { bg: "from-[#451a03] via-[#291204] to-[#0a0a0c]", accent: "text-amber-400", border: "border-amber-500/30", tag: "bg-amber-500/20 text-amber-300" },
    { bg: "from-[#581c87] via-[#3b0764] to-[#09090b]", accent: "text-purple-400", border: "border-purple-500/30", tag: "bg-purple-500/20 text-purple-300" },
    { bg: "from-[#1e293b] via-[#0f172a] to-[#020617]", accent: "text-sky-400", border: "border-sky-500/30", tag: "bg-sky-500/20 text-sky-300" },
  ];
  let code = 0;
  for (let i = 0; i < judul.length; i++) {
    code = (code + judul.charCodeAt(i)) % themes.length;
  }
  return themes[code];
}

export default function KatalogBukuClient({ 
  initialBuku, 
  initialUlasan = [],
}: { 
  initialBuku: BukuItem[];
  topReaders?: any[];
  initialUlasan?: UlasanItem[];
}) {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeFormat, setActiveFormat] = useState<string>("ALL");
  const [selectedBook, setSelectedBook] = useState<BukuItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"INFO" | "REVIEWS">("INFO");

  // Headroom: Smart Floating Navbar that hides on scroll down and reveals on scroll up
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 70) {
        if (currentScrollY > lastScrollY.current + 8) {
          // Scrolling down -> hide navbar
          setIsNavVisible(false);
        } else if (currentScrollY < lastScrollY.current - 8) {
          // Scrolling up -> reveal navbar
          setIsNavVisible(true);
        }
      } else {
        // At the top of the page -> always show navbar
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reviews state with database persistence
  const [ulasanMap, setUlasanMap] = useState<Record<string, UlasanItem[]>>(() => {
    const map: Record<string, UlasanItem[]> = {};
    if (initialUlasan && initialUlasan.length > 0) {
      initialUlasan.forEach((u) => {
        if (!map[u.bukuId]) map[u.bukuId] = [];
        map[u.bukuId].push(u);
      });
    }
    return map;
  });
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newRating, setNewRating] = useState<number>(5);
  const [newKomentar, setNewKomentar] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  const ebookCount = useMemo(() => {
    return initialBuku.filter((b) => b.is_ebook || b.file_url).length;
  }, [initialBuku]);

  const physicalCount = useMemo(() => {
    return initialBuku.filter((b) => !b.is_ebook && !b.file_url).length;
  }, [initialBuku]);

  const totalAvailableCopies = useMemo(() => {
    return initialBuku.reduce((acc, b) => acc + (b.stok_tersedia || 0), 0);
  }, [initialBuku]);

  // Shortcut Ctrl + K atau Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // AI navigation callback
  const handleSelectBookFromAi = (bookId: string, bookTitle: string) => {
    const target = initialBuku.find((b) => b.id === bookId);
    if (target) {
      setSelectedBook(target);
      setActiveModalTab("INFO");
    } else {
      setSearchTerm(bookTitle);
      document.getElementById("katalog-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // URL query sync (?cari= atau ?q=)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("cari") || params.get("q");
      if (q) setSearchTerm(q);
    }
  }, []);

  const handleShareWhatsApp = () => {
    if (!selectedBook) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://perpustakaan.tiksmkn1beringin.my.id";
    const targetUrl = `${origin}?cari=${encodeURIComponent(selectedBook.judul)}`;
    const pesan = `*Rekomendasi Pustaka SMKN 1 Beringin*\n\n` +
      `*Judul:* ${selectedBook.judul}\n` +
      `*Penulis:* ${selectedBook.penulis}\n` +
      (selectedBook.is_ebook || selectedBook.file_url 
        ? `*E-Book Digital:* Siap dibaca online instan di HP/Laptop!\n` 
        : `*Lokasi Rak Fisik:* ${selectedBook.rakNama || "Sirkulasi Utama"} (Stok: ${selectedBook.stok_tersedia})\n`) +
      `\nBuka katalog lengkap:\n${targetUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  const handleCopyLink = () => {
    if (!selectedBook) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://perpustakaan.tiksmkn1beringin.my.id";
    const targetUrl = `${origin}?cari=${encodeURIComponent(selectedBook.judul)}`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Voice search
  const handleVoiceSearch = async () => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Browser Anda belum mendukung pencarian suara. Disarankan menggunakan Google Chrome atau Microsoft Edge.");
      return;
    }

    if (listening) {
      try {
        (window as any).__rec?.stop();
      } catch {}
      setListening(false);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      alert("Izin mikrofon tidak aktif atau ditolak. Mohon aktifkan izin mikrofon pada browser Anda.");
      return;
    }

    try {
      const rec = new SR();
      rec.lang = "id-ID";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setListening(true);
      rec.onresult = (evt: any) => {
        const text = evt.results?.[0]?.[0]?.transcript ?? "";
        if (text) setSearchTerm(text);
      };
      rec.onerror = (err: any) => {
        setListening(false);
        if (err?.error === "not-allowed") {
          alert("Akses mikrofon diblokir. Mohon izinkan mikrofon di pengaturan browser.");
        }
      };
      rec.onend = () => setListening(false);

      (window as any).__rec = rec;
      rec.start();
    } catch (err: any) {
      setListening(false);
    }
  };

  useEffect(() => {
    if (initialUlasan && initialUlasan.length > 0) {
      const map: Record<string, UlasanItem[]> = {};
      initialUlasan.forEach((u) => {
        if (!map[u.bukuId]) map[u.bukuId] = [];
        map[u.bukuId].push(u);
      });
      setUlasanMap(map);
    }
  }, [initialUlasan]);

  const getBookRatingInfo = (bookId: string) => {
    const list = ulasanMap[bookId] || [];
    if (list.length === 0) return { avg: 5.0, count: 0 };
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return { avg: Number((sum / list.length).toFixed(1)), count: list.length };
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !newReviewerName.trim() || !newKomentar.trim() || submittingReview) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await createUlasan({
        bukuId: selectedBook.id,
        nama: newReviewerName.trim(),
        rating: newRating,
        komentar: newKomentar.trim(),
      });

      if (res.ok && res.ulasan) {
        const created: UlasanItem = {
          id: res.ulasan.id,
          bukuId: selectedBook.id,
          nama: res.ulasan.nama,
          rating: res.ulasan.rating,
          komentar: res.ulasan.komentar,
          tanggal: "Hari ini",
        };

        setUlasanMap((prev) => {
          const currentList = prev[selectedBook.id] || [];
          return {
            ...prev,
            [selectedBook.id]: [created, ...currentList],
          };
        });

        setNewReviewerName("");
        setNewKomentar("");
        setNewRating(5);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      } else {
        setReviewError(res.error || "Gagal mengirim ulasan.");
      }
    } catch {
      setReviewError("Terjadi kendala saat menyimpan ulasan ke database.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Dynamic category counts for unified pill design
  const categoryCounts = useMemo(() => {
    let pplg = 0;
    let tjkt = 0;
    let boga = 0;
    let otomotif = 0;
    let ready = 0;

    for (const b of initialBuku) {
      const text = `${b.judul} ${b.kategori || ""}`.toLowerCase();
      if (text.includes("perangkat lunak") || text.includes("pplg") || text.includes("pemrograman") || text.includes("react") || text.includes("java") || text.includes("c++") || text.includes("algoritma") || text.includes("database")) pplg++;
      if (text.includes("jaringan") || text.includes("tjkt") || text.includes("server") || text.includes("mikrotik") || text.includes("cisco") || text.includes("linux") || text.includes("fiber")) tjkt++;
      if (text.includes("boga") || text.includes("kuliner") || text.includes("masakan")) boga++;
      if (text.includes("otomotif") || text.includes("mesin") || text.includes("motor") || text.includes("mobil")) otomotif++;
      if (b.stok_tersedia > 0) ready++;
    }

    return { pplg, tjkt, boga, otomotif, ready };
  }, [initialBuku]);

  // Unique database categories
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    initialBuku.forEach((b) => {
      if (b.kategori && b.kategori.trim()) {
        set.add(b.kategori.trim());
      }
    });
    return Array.from(set).sort();
  }, [initialBuku]);

  // Dynamic Dropdown Options for Category & Jurusan (21st.dev Styled Custom Select)
  const categoryDropdownOptions: DropdownOption[] = useMemo(() => [
    { id: "ALL", label: "Semua Jurusan & Kategori", count: initialBuku.length, icon: BookOpen, group: "Umum" },
    { id: "PPLG", label: "Rekayasa Perangkat Lunak", count: categoryCounts.pplg, icon: Code, group: "Jurusan Kejuruan" },
    { id: "TJKT", label: "Teknik Jaringan Komputer", count: categoryCounts.tjkt, icon: Server, group: "Jurusan Kejuruan" },
    { id: "BOGA", label: "Tata Boga & Kuliner", count: categoryCounts.boga, icon: Utensils, group: "Jurusan Kejuruan" },
    { id: "OTOMOTIF", label: "Teknik Otomotif", count: categoryCounts.otomotif, icon: Wrench, group: "Jurusan Kejuruan" },
    ...dynamicCategories.map((cat) => ({
      id: cat,
      label: cat,
      icon: BookmarkCheck,
      group: "Kategori Koleksi",
    })),
    { id: "AVAILABLE", label: "Hanya Siap Dipinjam", count: categoryCounts.ready, icon: CheckCircle2, group: "Status Koleksi" },
    { id: "POPULAR", label: "Rating Terpopuler", icon: Star, group: "Status Koleksi" },
  ], [initialBuku.length, categoryCounts, dynamicCategories]);

  // Dynamic Dropdown Options for Format
  const formatDropdownOptions: DropdownOption[] = useMemo(() => [
    { id: "ALL", label: "Semua Format", count: initialBuku.length, icon: Layers },
    { id: "FISIK", label: "Buku Fisik di Rak", count: physicalCount, icon: Library },
    { id: "EBOOK", label: "E-Book Online Instan", count: ebookCount, icon: Laptop },
  ], [initialBuku.length, physicalCount, ebookCount]);

  // Realtime search & filter
  const filteredBuku = useMemo(() => {
    let result = initialBuku.filter((book) => {
      const matchSearch =
        book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.penulis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.kategori && book.kategori.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      // Format filter (ALL | EBOOK | FISIK)
      const hasEbook = Boolean(book.is_ebook || book.file_url);
      if (activeFormat === "EBOOK" && !hasEbook) return false;
      if (activeFormat === "FISIK" && hasEbook) return false;

      // Category filter
      if (activeCategory === "AVAILABLE") return book.stok_tersedia > 0;
      if (activeCategory === "PPLG") {
        const text = `${book.judul} ${book.kategori || ""}`.toLowerCase();
        return text.includes("perangkat lunak") || text.includes("pplg") || text.includes("pemrograman") || text.includes("react") || text.includes("java") || text.includes("c++") || text.includes("algoritma") || text.includes("database");
      }
      if (activeCategory === "TJKT") {
        const text = `${book.judul} ${book.kategori || ""}`.toLowerCase();
        return text.includes("jaringan") || text.includes("tjkt") || text.includes("server") || text.includes("mikrotik") || text.includes("cisco") || text.includes("linux") || text.includes("fiber");
      }
      if (activeCategory === "BOGA") {
        const text = `${book.judul} ${book.kategori || ""}`.toLowerCase();
        return text.includes("boga") || text.includes("kuliner") || text.includes("masakan");
      }
      if (activeCategory === "OTOMOTIF") {
        const text = `${book.judul} ${book.kategori || ""}`.toLowerCase();
        return text.includes("otomotif") || text.includes("mesin") || text.includes("motor") || text.includes("mobil");
      }
      if (activeCategory !== "ALL" && activeCategory !== "POPULAR") {
        return (book.kategori || "").toLowerCase() === activeCategory.toLowerCase();
      }
      return true;
    });

    if (activeCategory === "POPULAR") {
      result = [...result].sort((a, b) => {
        const ratingA = getBookRatingInfo(a.id).avg;
        const ratingB = getBookRatingInfo(b.id).avg;
        return ratingB - ratingA;
      });
    }

    return result;
  }, [initialBuku, searchTerm, activeCategory, activeFormat, ulasanMap]);

  // Pagination State & Logic
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Otomatis reset ke halaman 1 saat pencarian, kategori, atau format berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, activeFormat]);

  const totalPages = Math.max(1, Math.ceil(filteredBuku.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedBuku = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredBuku.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBuku, validCurrentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === validCurrentPage) return;
    setCurrentPage(page);
    const catalogSection = document.getElementById("katalog-section");
    if (catalogSection) {
      const targetOffset = catalogSection.getBoundingClientRect().top + window.scrollY - 85;
      window.scrollTo({ top: targetOffset, behavior: "smooth" });
    }
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [totalPages, validCurrentPage]);

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 selection:bg-sky-500 selection:text-white ${
      isDark ? "bg-[#09090b] text-[#fafafa]" : "bg-[#fafafa] text-[#09090b]"
    }`}>

      {/* Shared Unified Floating Island Navbar */}
      <PublicNavbar currentPage="katalog" />

      {/* High-Impact Centered Hero Section (Pure Typography & Minimalist) */}
      <HeroShowcaseSection
        isDark={isDark}
        books={initialBuku}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setActiveModalTab("INFO");
        }}
      />

      {/* Infinite Book Marquee Showcase (Inspired by Malaka Books & Design DNA Animation) */}
      <BookMarqueeSection
        books={initialBuku}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setActiveModalTab("INFO");
        }}
        failedImages={failedImages}
        onImageError={(id) => setFailedImages((prev) => ({ ...prev, [id]: true }))}
        isDark={isDark}
      />

      {/* Main Catalog Section */}
      <main id="katalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative z-10 scroll-mt-20">

        {/* Section Header: Bold, Proportional, and Single-Line */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Koleksi Pustaka Lengkap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Menampilkan <span className="font-bold text-sky-600 dark:text-sky-400">{filteredBuku.length}</span> dari {initialBuku.length} judul buku fisik &amp; e-book aktif
            </p>
          </div>
        </div>

        {/* Unified Search & Dropdown Filter Bar: Sticky & Floating on scroll */}
        <div className={`sticky top-3 sm:top-4 z-30 rounded-2xl border p-2 sm:p-2.5 mb-8 shadow-md backdrop-blur-xl transition-all duration-200 ${
          isDark
            ? "bg-[#111218]/95 border-white/10 shadow-black/50"
            : "bg-white/95 border-slate-200/90 shadow-slate-900/10"
        }`}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-2.5">
            {/* 1. Main Search Bar */}
            <div className={`relative flex-1 flex items-center rounded-xl border transition-all ${
              isDark
                ? "bg-white/[0.04] border-white/10 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20"
                : "bg-slate-50 border-slate-200 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-500/15"
            }`}>
              <div className="pl-3.5 text-sky-500 shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul buku, penulis, jurusan (PPLG, TJKT)..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm font-medium focus:outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1 pr-2 shrink-0">
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-white/10 font-mono text-[9px] font-bold select-none">
                    Ctrl K
                  </kbd>
                )}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title={listening ? "Berhenti mendengarkan" : "Cari menggunakan suara"}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    listening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "text-sky-500 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-sky-500" />}
                </button>
              </div>
            </div>

            {/* 2. Custom Styled Dropdown Filter: Kategori / Jurusan */}
            <CatalogCustomDropdown
              value={activeCategory}
              options={categoryDropdownOptions}
              onChange={setActiveCategory}
              leadIcon={Filter}
              colorScheme="sky"
              placeholder="Pilih Kategori"
            />

            {/* 3. Custom Styled Dropdown Filter: Format (Buku Fisik / E-Book) */}
            <CatalogCustomDropdown
              value={activeFormat}
              options={formatDropdownOptions}
              onChange={setActiveFormat}
              leadIcon={Layers}
              colorScheme="emerald"
              placeholder="Pilih Format"
            />

            {/* Reset Filter Button */}
            {(searchTerm || activeCategory !== "ALL" || activeFormat !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("ALL");
                  setActiveFormat("ALL");
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer shrink-0"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Active filter summary pill track */}
          {(searchTerm || activeCategory !== "ALL" || activeFormat !== "ALL") && (
            <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/5 text-[11px]">
              <span className="text-slate-400 font-medium">Filter aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                  Cari: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-rose-500 ml-0.5 cursor-pointer">×</button>
                </span>
              )}
              {activeCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  Kategori: {activeCategory}
                  <button onClick={() => setActiveCategory("ALL")} className="hover:text-rose-500 ml-0.5 cursor-pointer">×</button>
                </span>
              )}
              {activeFormat !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Format: {activeFormat === "EBOOK" ? "E-Book Online" : "Buku Fisik"}
                  <button onClick={() => setActiveFormat("ALL")} className="hover:text-rose-500 ml-0.5 cursor-pointer">×</button>
                </span>
              )}
              <span className="text-slate-400 font-mono text-[10px] ml-auto">
                {filteredBuku.length} buku cocok
              </span>
            </div>
          )}
        </div>

        {/* Luxury Book Grid: Celebrating Genuine Covers, Rich 3D Hardcover Finish, and Clear Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {paginatedBuku.map((book) => {
            const hasEbook = Boolean(book.is_ebook || book.file_url);
            const isReady = book.stok_tersedia > 0;
            const hasValidCover = Boolean(book.cover_url && !failedImages[book.id]);
            const { avg, count } = getBookRatingInfo(book.id);
            const fallbackTheme = getGenerativeCoverTheme(book.judul);

            return (
              <div
                key={book.id}
                onClick={() => {
                  setSelectedBook(book);
                  setActiveModalTab("INFO");
                }}
                className="group cursor-pointer flex flex-col h-full bg-white dark:bg-white/[0.02] hover:bg-slate-50/90 dark:hover:bg-white/[0.04] p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-sky-500/40 dark:hover:border-sky-500/40 shadow-xs hover:shadow-lg transition-all duration-300"
              >
                {/* 3D Realistic Physical Book Component */}
                <div className="w-full flex justify-center py-2 sm:py-3 relative select-none">
                  <Book
                    title={book.judul}
                    author={book.penulis}
                    coverUrl={hasValidCover ? book.cover_url : null}
                    width={{ sm: 135, md: 155, lg: 172 }}
                    category={book.kategori}
                    textured={true}
                    onError={() => setFailedImages((prev) => ({ ...prev, [book.id]: true }))}
                  />
                </div>

                {/* Book Details Typography Below Cover */}
                <div className="pt-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Format Tags */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate max-w-[105px]">
                        {book.kategori || "Umum"}
                      </span>
                      {hasEbook ? (
                        <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          <Laptop className="w-2.5 h-2.5" />
                          <span>E-Book</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          <Library className="w-2.5 h-2.5" />
                          <span>Fisik</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-[14px] leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {book.judul}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate flex items-center gap-1.5 font-medium">
                      <User className="w-3 h-3 text-sky-500 shrink-0" />
                      <span>{book.penulis}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100 dark:border-white/5 mt-2">
                    {hasEbook ? (
                      <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>Online Instan</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 font-semibold text-[10px] ${
                        isReady ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <span>{isReady ? `${book.stok_tersedia} Siap` : "Dipinjam"}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{avg}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {filteredBuku.length > 0 && totalPages > 1 && (
          <div className={`mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${
            isDark
              ? "bg-[#111218]/80 border-white/10"
              : "bg-white/90 border-slate-200/90 shadow-xs"
          }`}>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Menampilkan <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {(validCurrentPage - 1) * itemsPerPage + 1} - {Math.min(validCurrentPage * itemsPerPage, filteredBuku.length)}
              </span> dari <span className={`font-bold ${isDark ? "text-sky-400" : "text-sky-600"}`}>
                {filteredBuku.length}
              </span> judul buku
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center select-none">
              <button
                type="button"
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] border-white/10"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {pageNumbers.map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      validCurrentPage === p
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-105"
                        : isDark
                        ? "text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/10"
                        : "text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-slate-400 font-mono text-xs select-none">
                    ...
                  </span>
                )
              )}

              <button
                type="button"
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] border-white/10"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
                title="Halaman Selanjutnya"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={`hidden sm:flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <span>Per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer ${
                  isDark
                    ? "bg-slate-900 text-slate-200 border-white/10"
                    : "bg-white text-slate-800 border-slate-200"
                }`}
              >
                <option value={15}>15 buku</option>
                <option value={20}>20 buku</option>
                <option value={30}>30 buku</option>
                <option value={50}>50 buku</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBuku.length === 0 && (
          <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Tidak Ada Buku Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada koleksi buku fisik maupun e-book yang cocok dengan kata kunci &ldquo;{searchTerm}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("ALL");
              }}
              className="mt-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset Filter &amp; Pencarian
            </button>
          </div>
        )}
      </main>

      {/* Book Detail & Reviews Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 backdrop-blur-xl bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className={`rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border relative max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto ${
            isDark
              ? "bg-[#111218] border-white/10 text-slate-100 shadow-black"
              : "bg-white border-slate-200 text-slate-900"
          }`}>
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Book Info */}
            <div className="flex gap-4">
              <div className="shrink-0 select-none">
                <Book
                  title={selectedBook.judul}
                  author={selectedBook.penulis}
                  coverUrl={selectedBook.cover_url && !failedImages[selectedBook.id] ? selectedBook.cover_url : null}
                  width={112}
                  textured={true}
                />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(selectedBook.is_ebook || selectedBook.file_url) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-600 text-white shadow-xs">
                      <Laptop className="w-2.5 h-2.5" />
                      E-Book Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                      <Library className="w-2.5 h-2.5" />
                      Buku Fisik
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedBook.stok_tersedia > 0 ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
                  }`}>
                    {selectedBook.stok_tersedia > 0 ? "Fisik Tersedia" : "Fisik Habis"}
                  </span>
                  <span className="text-[10px] font-bold flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{getBookRatingInfo(selectedBook.id).avg}</span>
                  </span>
                </div>

                <h3 className="font-black text-sm sm:text-base leading-snug line-clamp-2 text-slate-900 dark:text-white">
                  {selectedBook.judul}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Penulis: <strong className="text-slate-800 dark:text-slate-200">{selectedBook.penulis}</strong>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stok Fisik: <strong className="text-sky-500 font-bold">{selectedBook.stok_tersedia}</strong> / {selectedBook.stok_total} buku
                </p>
              </div>
            </div>

            {/* Prominent BACA E-BOOK BUTTON if ebook exists */}
            {(selectedBook.is_ebook || selectedBook.file_url) && (
              <div className="mt-4 pt-1">
                <Link
                  href={`/buku/${selectedBook.id}/baca`}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/25 active:scale-[0.99] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Buka &amp; Baca E-Book Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Share WhatsApp & Copy Link */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan ke WhatsApp</span>
              </button>
              
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  copiedLink
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : isDark
                      ? "bg-white/[0.06] hover:bg-white/[0.1] border-white/10 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? "Tersalin!" : "Salin Link"}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-5 border-b border-slate-200 dark:border-white/10 flex items-center gap-4">
              <button
                onClick={() => setActiveModalTab("INFO")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "INFO"
                    ? "border-sky-500 text-sky-500"
                    : "border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Info Pinjam &amp; Rak Fisik</span>
              </button>
              <button
                onClick={() => setActiveModalTab("REVIEWS")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === "REVIEWS"
                    ? "border-sky-500 text-sky-500"
                    : "border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ulasan Pembaca ({(ulasanMap[selectedBook.id] || []).length})</span>
              </button>
            </div>

            {/* Tab 1: Info Peminjaman */}
            {activeModalTab === "INFO" && (
              <div className="pt-4 space-y-3.5">
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-500/15 text-sky-500 flex flex-col items-center justify-center font-bold">
                    <span className="text-[8px] uppercase">RAK</span>
                    <span className="text-base font-black">{selectedBook.rakNama?.replace(/[^0-9]/g, "") || "1"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedBook.rakNama ?? "Sirkulasi Utama"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Klasifikasi DDC: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedBook.klasifikasi ?? "—"}</strong>
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  isDark ? "bg-sky-500/10 border-sky-500/20 text-sky-300" : "bg-sky-50 border-sky-200 text-sky-800"
                }`}>
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Siswa dapat meminjam buku fisik secara langsung di meja sirkulasi perpustakaan atau melakukan peminjaman mandiri menggunakan kartu siswa di kios presensi perpustakaan.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Rating & Ulasan */}
            {activeModalTab === "REVIEWS" && (
              <div className="pt-4 space-y-4">
                {reviewSuccess && (
                  <div className="p-3 border rounded-xl text-xs flex items-center gap-2 bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Terima kasih! Ulasan Anda berhasil ditambahkan.</span>
                  </div>
                )}

                <form onSubmit={handleAddReview} className={`border rounded-2xl p-3.5 space-y-3 ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}>
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                    Beri Ulasan Buku
                  </h4>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-slate-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-500 ml-2">
                      {newRating} / 5
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Nama Anda (contoh: Siti - XII PPLG 1)"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="w-full text-xs h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />

                  <textarea
                    placeholder="Tulis ulasan Anda mengenai buku ini..."
                    value={newKomentar}
                    onChange={(e) => setNewKomentar(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    required
                  />

                  {reviewError && (
                    <div className="p-2.5 rounded-xl border text-xs text-rose-500 border-rose-500/20 bg-rose-500/10">
                      {reviewError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingReview}
                      className="text-xs h-8 px-4 font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1.5" />
                          Kirim Ulasan
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-2.5">
                  {(ulasanMap[selectedBook.id] || []).map((rev) => (
                    <div key={rev.id} className={`p-3 rounded-xl border space-y-1 ${
                      isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{rev.nama}</span>
                        <span className="text-[10px] text-slate-400">{rev.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
                        &ldquo;{rev.komentar}&rdquo;
                      </p>
                    </div>
                  ))}

                  {(!ulasanMap[selectedBook.id] || ulasanMap[selectedBook.id].length === 0) && (
                    <p className="text-xs text-center py-4 italic text-slate-400">
                      Belum ada ulasan untuk buku ini. Jadilah yang pertama memberikan ulasan!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Footer with Both School Logo and Kolaborasi Sumut Berkah */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-10 mt-16 text-center text-xs text-slate-500 relative z-10">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <img src="/assets/logo.png" alt="SMK Negeri 1 Beringin" className="w-6 h-6 object-contain opacity-90" />
          <img src="/assets/logo-kolaborasi.png" alt="Kolaborasi Sumut Berkah" className="h-5 w-auto object-contain opacity-90" />
          <span className="font-bold text-slate-800 dark:text-slate-200">Perpustakaan Digital SMK Negeri 1 Beringin</span>
        </div>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Perpustakaan SMK Negeri 1 Beringin. Hak cipta dilindungi.
        </p>
      </footer>

      {/* Floating AI Pustakawan Widget */}
      <PustakawanAiWidget onSelectBook={handleSelectBookFromAi} />
    </div>
  );
}