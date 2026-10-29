"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Share2,
  Sun,
  Moon,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  FileText,
  X,
  Copy,
  Info,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

type BukuDetail = {
  id: string;
  judul: string;
  penulis: string;
  cover_url: string | null;
  file_url: string | null;
  kategori: string | null;
  klasifikasi?: string | null;
  tipe_buku?: string | null;
  kode_buku?: string | null;
};

type BookmarkItem = {
  id: string;
  page: number;
  note: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// 1. Subtle Paper Rustle Sound Effect (Web Audio API, Pure Client)
// ---------------------------------------------------------------------------

let sharedAudioCtx: AudioContext | null = null;

function playPageFlipSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;

    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch {
    // Ignore audio permission/context restriction
  }
}

// ---------------------------------------------------------------------------
// 2. Main Ebook Reader Client Component (3D Page Turn & Slide Animation)
// ---------------------------------------------------------------------------

export function EbookReaderClient({ buku }: { buku: BukuDetail }) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"flipbook" | "standard">("flipbook");
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPage = localStorage.getItem(`ebook_last_page_${buku.id}`);
        if (savedPage) {
          const pageNum = parseInt(savedPage, 10);
          if (pageNum > 1) return pageNum;
        }
      } catch {
        // ignore
      }
    }
    return 1;
  });

  const [totalPages, setTotalPages] = useState<number>(30);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(30);
  const [isTwoPage, setIsTwoPage] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(100);
  const [theme, setTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation States (3D Flip & Slide)
  const [animMode, setAnimMode] = useState<"flip3d" | "slide">("flip3d");
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipStage, setFlipStage] = useState<"idle" | "flipping" | "settling">("idle");
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scrubber slider state for 60fps buttery-smooth dragging
  const [sliderVal, setSliderVal] = useState<number>(currentPage);
  const sliderDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSliderVal(currentPage);
  }, [currentPage]);

  // Bookmarks (Reading Notes)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ebook_bookmarks_${buku.id}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [newBookmarkNote, setNewBookmarkNote] = useState("");
  const [journalCopied, setJournalCopied] = useState(false);

  // General UI States
  const [copied, setCopied] = useState(false);

  // PDF.js Engine States for True Open-Book Spread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);

  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leftRenderTaskRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rightRenderTaskRef = useRef<any>(null);

  const fileUrl = buku.file_url || "";
  const isGoogleDrive = fileUrl.includes("drive.google.com");
  const embedUrl = isGoogleDrive ? fileUrl.replace("/view", "/preview") : fileUrl;

  // Responsive two-page detection: on mobile screens < 768px default to single-page
  useEffect(() => {
    const handleCheckWidth = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setIsTwoPage(false);
        } else {
          setIsTwoPage(true);
        }
      }
    };
    handleCheckWidth();
    window.addEventListener("resize", handleCheckWidth);
    return () => window.removeEventListener("resize", handleCheckWidth);
  }, []);

  // Initialize PDF.js Library & Document
  useEffect(() => {
    if (typeof window === "undefined" || !fileUrl) return;

    let isCancelled = false;

    const initPdf = async () => {
      try {
        setPdfLoading(true);
        setPdfError(null);

        // Load pdf.min.js dynamically if not already present
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/vendor/pdfjs/pdf.min.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Gagal memuat file engine PDF"));
            document.head.appendChild(script);
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error("Library PDF.js tidak ditemukan");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPdfPages(doc.numPages);
        setTotalPages(doc.numPages + 1);
        setPdfLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : "Gagal memproses dokumen PDF";
        console.error("PDF.js load error:", err);
        setPdfLoading(false);
        setPdfError(msg);
      }
    };

    initPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // Render Open-Book Spread to Left & Right Canvases with Offscreen Double-Buffering
  const renderSpread = useCallback(
    async (leftPdfPageNum: number, rightPdfPageNum: number | null) => {
      if (!pdfDoc) return;

      try {
        setIsRenderingPage(true);

        if (leftRenderTaskRef.current) {
          try {
            leftRenderTaskRef.current.cancel();
          } catch {}
          leftRenderTaskRef.current = null;
        }
        if (rightRenderTaskRef.current) {
          try {
            rightRenderTaskRef.current.cancel();
          } catch {}
          rightRenderTaskRef.current = null;
        }

        const container = stageContainerRef.current;
        const availableHeight = container ? Math.max(340, container.clientHeight - 80) : 620;
        const availablePageWidth = container
          ? isTwoPage
            ? Math.max(180, (container.clientWidth - 40) / 2)
            : Math.max(260, container.clientWidth - 40)
          : 440;

        const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2.5);

        // Render Left Page to offscreen buffer
        const renderLeftPromise = async () => {
          if (leftPdfPageNum >= 1 && leftPdfPageNum <= pdfDoc.numPages) {
            const leftPage = await pdfDoc.getPage(leftPdfPageNum);
            const canvasL = canvasLeftRef.current;
            if (canvasL) {
              const pageViewport = leftPage.getViewport({ scale: 1.0 });
              const scaleX = availablePageWidth / pageViewport.width;
              const scaleY = availableHeight / pageViewport.height;
              const fitScale = Math.min(scaleX, scaleY);
              const viewportL = leftPage.getViewport({ scale: fitScale * dpr });

              const offL = document.createElement("canvas");
              offL.width = viewportL.width;
              offL.height = viewportL.height;
              const offCtxL = offL.getContext("2d");
              if (offCtxL) {
                const taskL = leftPage.render({ canvasContext: offCtxL, viewport: viewportL });
                leftRenderTaskRef.current = taskL;
                await taskL.promise;
                return { canvas: canvasL, off: offL, viewport: viewportL, dpr };
              }
            }
          }
          return null;
        };

        // Render Right Page to offscreen buffer
        const renderRightPromise = async () => {
          if (isTwoPage && rightPdfPageNum && rightPdfPageNum >= 1 && rightPdfPageNum <= pdfDoc.numPages) {
            const rightPage = await pdfDoc.getPage(rightPdfPageNum);
            const canvasR = canvasRightRef.current;
            if (canvasR) {
              const pageViewport = rightPage.getViewport({ scale: 1.0 });
              const scaleX = availablePageWidth / pageViewport.width;
              const scaleY = availableHeight / pageViewport.height;
              const fitScale = Math.min(scaleX, scaleY);
              const viewportR = rightPage.getViewport({ scale: fitScale * dpr });

              const offR = document.createElement("canvas");
              offR.width = viewportR.width;
              offR.height = viewportR.height;
              const offCtxR = offR.getContext("2d");
              if (offCtxR) {
                const taskR = rightPage.render({ canvasContext: offCtxR, viewport: viewportR });
                rightRenderTaskRef.current = taskR;
                await taskR.promise;
                return { canvas: canvasR, off: offR, viewport: viewportR, dpr };
              }
            }
          }
          return null;
        };

        // Execute in parallel for 2x rendering speed
        const [leftRes, rightRes] = await Promise.all([renderLeftPromise(), renderRightPromise()]);

        // Instant frame swap without ever displaying a blank/wiped canvas
        if (leftRes) {
          const { canvas, off, viewport, dpr: currentDpr } = leftRes;
          if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width / currentDpr}px`;
            canvas.style.height = `${viewport.height / currentDpr}px`;
          }
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(off, 0, 0);
          }
        }

        if (rightRes) {
          const { canvas, off, viewport, dpr: currentDpr } = rightRes;
          if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width / currentDpr}px`;
            canvas.style.height = `${viewport.height / currentDpr}px`;
          }
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(off, 0, 0);
          }
        }

        setIsRenderingPage(false);
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((err as any)?.name !== "RenderingCancelledException") {
          console.error("Gagal merender lembar buku:", err);
        }
        setIsRenderingPage(false);
      }
    },
    [pdfDoc, isTwoPage]
  );

  // Trigger Spread Render When Page Changes in Slide Mode
  useEffect(() => {
    if (viewMode === "flipbook" && currentPage > 1 && pdfDoc) {
      if (isTwoPage) {
        const leftPageNum = currentPage - 1;
        const rightPageNum = currentPage <= pdfDoc.numPages ? currentPage : null;
        renderSpread(leftPageNum, rightPageNum);
      } else {
        renderSpread(currentPage - 1, null);
      }
    }
  }, [currentPage, viewMode, pdfDoc, isTwoPage, renderSpread]);

  // Window Resize Re-render Debounce
  useEffect(() => {
    if (viewMode !== "flipbook" || currentPage <= 1 || !pdfDoc) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentPage > 1 && pdfDoc) {
          if (isTwoPage) {
            renderSpread(currentPage - 1, currentPage <= pdfDoc.numPages ? currentPage : null);
          } else {
            renderSpread(currentPage - 1, null);
          }
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [viewMode, currentPage, pdfDoc, isTwoPage, renderSpread]);

  // Action Handlers with Dynamic 3D Page Turn / Slide Motion
  const handleNextPage = useCallback(() => {
    if (currentPage >= totalPages || flipStage !== "idle") return;

    if (soundEnabled) playPageFlipSound();

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);

    // Phase 1: Begin Page Lift & 3D Curl (200ms)
    setFlipDirection("next");
    setFlipStage("flipping");

    flipTimerRef.current = setTimeout(() => {
      // Phase 2: Page turns over at peak of curl -> update page number
      if (isTwoPage) {
        if (currentPage === 1) {
          setCurrentPage(2);
        } else {
          setCurrentPage((p) => Math.min(totalPages, p + 2));
        }
      } else {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      }

      // Phase 3: Settle down with smooth spring deceleration
      setFlipStage("settling");

      flipTimerRef.current = setTimeout(() => {
        setFlipStage("idle");
        setFlipDirection(null);
      }, 240);
    }, 200);
  }, [currentPage, totalPages, flipStage, soundEnabled, isTwoPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage <= 1 || flipStage !== "idle") return;

    if (soundEnabled) playPageFlipSound();

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);

    // Phase 1: Begin Left Page Lift & 3D Curl (200ms)
    setFlipDirection("prev");
    setFlipStage("flipping");

    flipTimerRef.current = setTimeout(() => {
      // Phase 2: Page turns over at peak of curl -> update page number
      if (isTwoPage) {
        if (currentPage <= 3) {
          setCurrentPage(1);
        } else {
          setCurrentPage((p) => Math.max(1, p - 2));
        }
      } else {
        setCurrentPage((p) => Math.max(1, p - 1));
      }

      // Phase 3: Settle down with smooth spring deceleration
      setFlipStage("settling");

      flipTimerRef.current = setTimeout(() => {
        setFlipStage("idle");
        setFlipDirection(null);
      }, 240);
    }, 200);
  }, [currentPage, flipStage, soundEnabled, isTwoPage]);

  // Smooth Scrubber Drag & Commit
  const commitSliderPage = useCallback((val: number) => {
    if (sliderDebounceTimerRef.current) {
      clearTimeout(sliderDebounceTimerRef.current);
      sliderDebounceTimerRef.current = null;
    }
    const target = isTwoPage && val > 1 && val % 2 !== 0 ? Math.min(totalPages, val + 1) : val;
    if (target !== currentPage) {
      if (soundEnabled) playPageFlipSound();
      setFlipDirection(target > currentPage ? "next" : "prev");
      setFlipStage("settling");
      setCurrentPage(target);
      setTimeout(() => {
        setFlipStage("idle");
        setFlipDirection(null);
      }, 240);
    }
  }, [currentPage, totalPages, isTwoPage, soundEnabled]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseInt(e.target.value, 10);
    setSliderVal(rawVal);

    if (sliderDebounceTimerRef.current) {
      clearTimeout(sliderDebounceTimerRef.current);
    }

    sliderDebounceTimerRef.current = setTimeout(() => {
      commitSliderPage(rawVal);
    }, 120);
  }, [commitSliderPage]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Save Last Page to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`ebook_last_page_${buku.id}`, currentPage.toString());
    } catch {
      // ignore
    }
  }, [buku.id, currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "b") {
        setShowBookmarksDrawer(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextPage, handlePrevPage, toggleFullscreen]);

  // Add / Remove Bookmark
  const handleAddBookmark = () => {
    const isAlready = bookmarks.some((b) => b.page === currentPage);
    if (isAlready) {
      const filtered = bookmarks.filter((b) => b.page !== currentPage);
      setBookmarks(filtered);
      localStorage.setItem(`ebook_bookmarks_${buku.id}`, JSON.stringify(filtered));
    } else {
      const newBm: BookmarkItem = {
        id: Date.now().toString(),
        page: currentPage,
        note: newBookmarkNote.trim() || `Halaman ${currentPage}`,
        createdAt: new Date().toLocaleDateString("id-ID"),
      };
      const updated = [...bookmarks, newBm].sort((a, b) => a.page - b.page);
      setBookmarks(updated);
      setNewBookmarkNote("");
      localStorage.setItem(`ebook_bookmarks_${buku.id}`, JSON.stringify(updated));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: buku.judul,
          text: `Baca e-book "${buku.judul}" karya ${buku.penulis}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.page === currentPage);

  // 21st.dev Curated Aesthetic Themes
  const themeStyles = {
    dark: {
      appBg: "bg-[#080c14] text-slate-100",
      header: "bg-[#0d131f]/90 border-slate-800/80 text-white shadow-xs",
      desk: "bg-radial from-[#111827] to-[#080c14]",
      bookShell: "border-slate-800/60 shadow-[0_30px_70px_rgba(0,0,0,0.7)]",
      paperBg: "bg-[#0f172a] text-slate-100",
      toolbarBtn: "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/70",
    },
    sepia: {
      appBg: "bg-[#f4ebe1] text-[#3d2e1e]",
      header: "bg-[#ece0d1]/90 border-[#dfccba] text-[#3d2e1e] shadow-xs",
      desk: "bg-radial from-[#eee2d4] to-[#e4d5c3]",
      bookShell: "border-[#dfccba] shadow-[0_25px_60px_rgba(61,46,30,0.22)]",
      paperBg: "bg-[#fbf5eb] text-[#3d2e1e]",
      toolbarBtn: "bg-[#dfccba]/70 hover:bg-[#d5c0ab] text-[#3d2e1e] border-[#cfbaa7]",
    },
    light: {
      appBg: "bg-[#f8fafc] text-slate-900",
      header: "bg-white/90 border-slate-200/90 text-slate-900 shadow-xs",
      desk: "bg-radial from-[#f1f5f9] to-[#e2e8f0]",
      bookShell: "border-slate-200/90 shadow-[0_25px_60px_rgba(0,0,0,0.12)]",
      paperBg: "bg-white text-slate-900",
      toolbarBtn: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200",
    },
  };

  const currentTheme = themeStyles[theme];

  // Dynamic 3D Styles for Page Leaves during Flip / Slide (Buttery-smooth Coordinated Motion)
  const getLeftLeafTransform = (): React.CSSProperties => {
    if (animMode === "flip3d") {
      if (flipDirection === "prev" && flipStage === "flipping") {
        return {
          transformOrigin: "right center",
          transform: "perspective(1800px) rotateY(26deg) translateY(-4px) scale(0.985)",
          boxShadow: "25px 20px 45px rgba(0,0,0,0.35)",
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 220ms ease-out",
          zIndex: 30,
        };
      }
      if (flipDirection === "prev" && flipStage === "settling") {
        return {
          transformOrigin: "right center",
          transform: "perspective(1800px) rotateY(0deg) translateY(0) scale(1)",
          boxShadow: "-15px 15px 35px rgba(0,0,0,0.25)",
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 240ms ease-out",
          zIndex: 10,
        };
      }
      if (flipDirection === "next" && flipStage === "flipping") {
        return {
          transformOrigin: "right center",
          transform: "perspective(1800px) rotateY(6deg) scale(0.99)",
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex: 10,
        };
      }
      return {
        transformOrigin: "right center",
        transform: "perspective(1800px) rotateY(0deg) translateY(0) scale(1)",
        boxShadow: "-15px 15px 35px rgba(0,0,0,0.25)",
        transition: "transform 240ms ease-out, box-shadow 240ms ease-out",
        zIndex: 10,
      };
    } else {
      // Fluid Coordinated Slide Mode (Both pages glide smoothly together)
      if (flipDirection === "prev" && flipStage === "flipping") {
        return {
          transform: "translateX(24px) scale(0.99)",
          opacity: 0.88,
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out",
        };
      }
      if (flipDirection === "prev" && flipStage === "settling") {
        return {
          transform: "translateX(0) scale(1)",
          opacity: 1,
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), opacity 240ms ease-out",
        };
      }
      if (flipDirection === "next" && flipStage === "flipping") {
        return {
          transform: "translateX(-24px) scale(0.99)",
          opacity: 0.88,
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out",
        };
      }
      if (flipDirection === "next" && flipStage === "settling") {
        return {
          transform: "translateX(0) scale(1)",
          opacity: 1,
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), opacity 240ms ease-out",
        };
      }
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        transition: "transform 240ms ease-out, opacity 240ms ease-out",
      };
    }
  };

  const getRightLeafTransform = (): React.CSSProperties => {
    if (animMode === "flip3d") {
      if (flipDirection === "next" && flipStage === "flipping") {
        return {
          transformOrigin: "left center",
          transform: "perspective(1800px) rotateY(-26deg) translateY(-4px) scale(0.985)",
          boxShadow: "-25px 20px 45px rgba(0,0,0,0.35)",
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 220ms ease-out",
          zIndex: 30,
        };
      }
      if (flipDirection === "next" && flipStage === "settling") {
        return {
          transformOrigin: "left center",
          transform: "perspective(1800px) rotateY(0deg) translateY(0) scale(1)",
          boxShadow: "15px 15px 35px rgba(0,0,0,0.25)",
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 240ms ease-out",
          zIndex: 10,
        };
      }
      if (flipDirection === "prev" && flipStage === "flipping") {
        return {
          transformOrigin: "left center",
          transform: "perspective(1800px) rotateY(-6deg) scale(0.99)",
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex: 10,
        };
      }
      return {
        transformOrigin: "left center",
        transform: "perspective(1800px) rotateY(0deg) translateY(0) scale(1)",
        boxShadow: "15px 15px 35px rgba(0,0,0,0.25)",
        transition: "transform 240ms ease-out, box-shadow 240ms ease-out",
        zIndex: 10,
      };
    } else {
      // Fluid Coordinated Slide Mode (Both pages glide smoothly together)
      if (flipDirection === "prev" && flipStage === "flipping") {
        return {
          transform: "translateX(24px) scale(0.99)",
          opacity: 0.88,
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out",
        };
      }
      if (flipDirection === "prev" && flipStage === "settling") {
        return {
          transform: "translateX(0) scale(1)",
          opacity: 1,
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), opacity 240ms ease-out",
        };
      }
      if (flipDirection === "next" && flipStage === "flipping") {
        return {
          transform: "translateX(-24px) scale(0.99)",
          opacity: 0.88,
          transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out",
        };
      }
      if (flipDirection === "next" && flipStage === "settling") {
        return {
          transform: "translateX(0) scale(1)",
          opacity: 1,
          transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), opacity 240ms ease-out",
        };
      }
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        transition: "transform 240ms ease-out, opacity 240ms ease-out",
      };
    }
  };

  const getSinglePageTransform = (): React.CSSProperties => {
    if (flipStage === "flipping") {
      const offsetX = flipDirection === "next" ? -35 : 35;
      const rotate = flipDirection === "next" ? -8 : 8;
      return {
        transform: `perspective(1400px) translateX(${offsetX}px) rotateY(${rotate}deg) scale(0.98)`,
        opacity: 0.85,
        transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 220ms ease-out",
      };
    }
    if (flipStage === "settling") {
      return {
        transform: "perspective(1400px) translateX(0) rotateY(0deg) scale(1)",
        opacity: 1,
        transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1), opacity 240ms ease-out",
      };
    }
    return {
      transform: "perspective(1400px) translateX(0) rotateY(0deg) scale(1)",
      opacity: 1,
      transition: "transform 240ms ease-out, opacity 240ms ease-out",
    };
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none transition-colors duration-300 ${currentTheme.appBg}`}>
      {/* =========================================================================
          HEADER TOOLBAR (Clean, Minimalist & Distraction-Free - 21st.dev Style)
      ========================================================================= */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-colors ${currentTheme.header}`}>
        {/* Left: Back & Book Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer shrink-0 ${currentTheme.toolbarBtn}`}
            title="Kembali ke Katalog Perpustakaan"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Katalog</span>
          </Link>

          <div className="h-4 w-[1px] bg-current opacity-15 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate leading-tight tracking-tight">
              {buku.judul}
            </h1>
            <p className="text-[10px] sm:text-[11px] opacity-70 truncate font-medium">
              {buku.penulis} {buku.kategori ? `• ${buku.kategori}` : ""}
            </p>
          </div>
        </div>

        {/* Center: Segmented Controller 2 Opsi Membaca (Slide Buku vs Scroll PDF) */}
        <div className="flex items-center p-1 bg-black/10 dark:bg-white/10 rounded-xl border border-black/5 dark:border-white/10 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("flipbook")}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "flipbook"
                ? "bg-sky-600 text-white shadow-xs"
                : "opacity-70 hover:opacity-100"
            }`}
            title="Mode Slide Buku: Tampilan lembaran buku dengan animasi 3D & geser"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mode Slide</span>
            <span className="sm:hidden text-[11px]">Slide</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("standard")}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "standard"
                ? "bg-sky-600 text-white shadow-xs"
                : "opacity-70 hover:opacity-100"
            }`}
            title="Mode Dokumen PDF: Tampilan PDF standar dengan gulir vertikal bebas"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dokumen PDF</span>
            <span className="sm:hidden text-[11px]">PDF</span>
          </button>
        </div>

        {/* Right: Essential Tools (Anim Mode, Spread Toggle, Theme, Bookmarks, Fullscreen) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Animation Style Toggle (3D Flip vs Slide) */}
          {viewMode === "flipbook" && (
            <button
              type="button"
              onClick={() => setAnimMode((m) => (m === "flip3d" ? "slide" : "flip3d"))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${currentTheme.toolbarBtn}`}
              title={`Ubah Gaya Animasi (Saat ini: ${animMode === "flip3d" ? "3D Lembaran Buku" : "Slide Halus"})`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-mono text-[11px]">
                {animMode === "flip3d" ? "Animasi 3D" : "Animasi Slide"}
              </span>
            </button>
          )}

          {/* Spread Mode Toggle (2 Halaman vs 1 Halaman) */}
          {viewMode === "flipbook" && (
            <button
              type="button"
              onClick={() => setIsTwoPage(!isTwoPage)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${currentTheme.toolbarBtn}`}
              title={isTwoPage ? "Ubah ke 1 Halaman Tunggal" : "Ubah ke 2 Halaman (Buku Terbuka)"}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline font-mono text-[11px]">
                {isTwoPage ? "2 Halaman" : "1 Halaman"}
              </span>
            </button>
          )}

          {/* Theme Palette Switcher: Dark, Sepia, Light */}
          <div className="flex items-center gap-0.5 bg-black/10 dark:bg-white/10 rounded-xl p-0.5 border border-black/5 dark:border-white/10">
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === "dark" ? "bg-slate-800 text-white shadow-xs" : "opacity-60 hover:opacity-100"
              }`}
              title="Mode Gelap"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === "sepia" ? "bg-[#d8be8a] text-[#3d2e1e] font-bold shadow-xs" : "opacity-60 hover:opacity-100"
              }`}
              title="Mode Kertas Sepia"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === "light" ? "bg-white text-slate-900 font-bold shadow-xs" : "opacity-60 hover:opacity-100"
              }`}
              title="Mode Terang"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmarks Drawer Button */}
          <button
            onClick={() => setShowBookmarksDrawer(true)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              isCurrentPageBookmarked
                ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                : currentTheme.toolbarBtn
            }`}
            title="Penanda & Jurnal Baca"
          >
            {isCurrentPageBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline font-mono text-[11px]">
              {bookmarks.length > 0 ? bookmarks.length : ""}
            </span>
          </button>

          {/* Zoom controls (Only in PDF standard mode) */}
          {viewMode === "standard" && (
            <div className="hidden md:flex items-center gap-1 bg-black/10 dark:bg-white/10 rounded-xl p-1 border border-black/5 dark:border-white/10">
              <button
                onClick={() => setZoom((prev) => Math.max(75, prev - 15))}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 font-bold">{zoom}%</span>
              <button
                onClick={() => setZoom((prev) => Math.min(175, prev + 15))}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${currentTheme.toolbarBtn}`}
            title="Bagikan Tautan Buku"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${currentTheme.toolbarBtn}`}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN READING STAGE (Authentic Physical Book Spread with Dynamic 3D Motion)
      ========================================================================= */}
      <main
        ref={stageContainerRef}
        className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-6 w-full relative overflow-hidden transition-colors ${currentTheme.desk}`}
      >
        {fileUrl ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center max-w-6xl relative pb-16">
            {/* OPSI 1: MODE SLIDE BUKU (SEAMLESS OPEN BOOK SPREAD DENGAN ANIMASI) */}
            {viewMode === "flipbook" ? (
              <div className="w-full flex flex-col items-center justify-center flex-1 relative">
                {currentPage === 1 ? (
                  /* SPREAD 1: OPEN BOOK TITLE SPREAD (KIRI: INFO BUKU, KANAN: SAMPUL 3D) */
                  <div className={`w-full max-w-4xl rounded-2xl overflow-hidden border flex flex-col md:flex-row items-stretch select-none transition-all duration-300 ${currentTheme.bookShell} ${currentTheme.paperBg}`}>
                    {/* Halaman Samping Kiri: Identitas Buku & Tombol Mulai */}
                    <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 border border-sky-500/30 text-sky-500 dark:text-sky-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Perpustakaan Digital SMKN 1 Beringin</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight">
                          {buku.judul}
                        </h2>

                        <div className="space-y-1.5 text-xs opacity-80 font-medium">
                          <p>
                            Penulis: <strong className="font-bold">{buku.penulis}</strong>
                          </p>
                          {buku.kategori && (
                            <p>
                              Kategori: <span className="font-semibold">{buku.kategori}</span>
                            </p>
                          )}
                          {buku.kode_buku && (
                            <p className="font-mono text-[11px]">ISBN: {buku.kode_buku}</p>
                          )}
                        </div>

                        <p className="text-xs opacity-70 leading-relaxed">
                          Buku digital resmi terverifikasi. Klik tombol di bawah atau gunakan tombol panah keyboard (← / →) untuk mulai membuka lembaran buku dengan animasi nyata.
                        </p>
                      </div>

                      <div className="pt-6 flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleNextPage}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Buka Buku (Halaman 1 &amp; 2)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewMode("standard")}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-semibold border border-black/10 dark:border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Mode PDF Standar</span>
                        </button>
                      </div>
                    </div>

                    {/* Halaman Samping Kanan: Sampul Buku Asli 3D */}
                    <div className="flex-1 p-6 sm:p-10 flex items-center justify-center relative overflow-hidden bg-black/5 dark:bg-black/20">
                      <div
                        className="relative aspect-[3/4] w-48 sm:w-56 md:w-64 max-h-[52vh] rounded-2xl overflow-hidden shadow-2xl border border-black/20 dark:border-white/20 shrink-0 group transition-all duration-300 hover:scale-105 before:absolute before:inset-y-0 before:left-0 before:w-4 before:bg-gradient-to-r before:from-black/60 before:via-black/20 before:to-transparent before:z-20 before:pointer-events-none after:absolute after:inset-y-0 after:left-4 after:w-[1px] after:bg-white/25 after:z-20 after:pointer-events-none"
                        style={
                          flipDirection === "next" && flipStage === "flipping"
                            ? {
                                transformOrigin: "left center",
                                transform: "perspective(1600px) rotateY(-36deg) scale(0.97) translateY(-4px)",
                                boxShadow: "-35px 25px 55px rgba(0,0,0,0.45)",
                                transition: "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 220ms ease-out",
                              }
                            : flipDirection === "prev" && flipStage === "settling"
                            ? {
                                transformOrigin: "left center",
                                transform: "perspective(1600px) rotateY(0deg) scale(1)",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                                transition: "transform 240ms cubic-bezier(0.25, 1, 0.5, 1)",
                              }
                            : {}
                        }
                      >
                        {buku.cover_url ? (
                          <img
                            src={buku.cover_url}
                            alt={buku.judul}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
                            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 w-fit">
                              <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                                E-Book Resmi
                              </span>
                              <h3 className="font-extrabold text-base line-clamp-3 mt-1 leading-snug">
                                {buku.judul}
                              </h3>
                              <p className="text-xs text-slate-400 mt-2">{buku.penulis}</p>
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 border-t border-slate-700/60 pt-2">
                              SMK Negeri 1 Beringin
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SPREAD 2+: SEAMLESS PHYSICAL OPEN BOOK SPREAD WITH 3D TURNING ANIMATION */
                  <div
                    className="relative inline-flex items-center justify-center max-w-full"
                    style={{ perspective: "1800px" }}
                  >
                    {isTwoPage ? (
                      <>
                        {/* Halaman Kiri (Left Page Leaf) */}
                        <div
                          onClick={handlePrevPage}
                          style={getLeftLeafTransform()}
                          className="relative group cursor-pointer overflow-hidden rounded-l-2xl border-y border-l border-black/15 dark:border-white/10 will-change-transform"
                          title="Halaman sebelumnya (Klik lembar ini atau tekan panah kiri ←)"
                        >
                          <canvas ref={canvasLeftRef} className="block bg-white" />
                          {/* Paper spine curve shadow on the inner right edge */}
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-14 bg-gradient-to-l from-black/25 via-black/10 to-transparent" />
                          {/* Dynamic lighting change when turning */}
                          <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10 transition-opacity duration-200 ${
                              flipDirection === "prev" && flipStage === "flipping"
                                ? "opacity-35"
                                : "opacity-0"
                            }`}
                          />
                          {/* Cast shadow when right leaf lifts */}
                          <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-black/40 transition-opacity duration-200 ${
                              flipDirection === "next" && flipStage === "flipping"
                                ? "opacity-30"
                                : "opacity-0"
                            }`}
                          />
                          {/* Discrete page number badge */}
                          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Hal. {currentPage - 1}
                          </div>
                        </div>

                        {/* Center Spine Valley Overlay (Gutter & Crease) */}
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 sm:w-10 z-20 bg-gradient-to-r from-black/25 via-black/40 to-black/25 opacity-70" />
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] z-20 bg-black/40" />

                        {/* Halaman Kanan (Right Page Leaf) */}
                        <div
                          onClick={handleNextPage}
                          style={getRightLeafTransform()}
                          className="relative group cursor-pointer overflow-hidden rounded-r-2xl border-y border-r border-black/15 dark:border-white/10 will-change-transform"
                          title="Halaman selanjutnya (Klik lembar ini atau tekan panah kanan →)"
                        >
                          {currentPage <= totalPdfPages ? (
                            <>
                              <canvas ref={canvasRightRef} className="block bg-white" />
                              {/* Paper spine curve shadow on the inner left edge */}
                              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
                              {/* Dynamic lighting change when turning */}
                              <div
                                className={`pointer-events-none absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-black/10 transition-opacity duration-200 ${
                                  flipDirection === "next" && flipStage === "flipping"
                                    ? "opacity-35"
                                    : "opacity-0"
                                }`}
                              />
                              {/* Cast shadow when left leaf lifts */}
                              <div
                                className={`pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-black/40 transition-opacity duration-200 ${
                                  flipDirection === "prev" && flipStage === "flipping"
                                    ? "opacity-30"
                                    : "opacity-0"
                                }`}
                              />
                              {/* Discrete page number badge */}
                              <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                Hal. {currentPage}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                width: canvasLeftRef.current ? canvasLeftRef.current.style.width : "340px",
                                height: canvasLeftRef.current ? canvasLeftRef.current.style.height : "480px",
                              }}
                              className="bg-white flex flex-col items-center justify-center p-8 text-center text-slate-400"
                            >
                              <BookOpen className="w-12 h-12 mb-3 text-slate-300" />
                              <h4 className="font-bold text-sm text-slate-700">Akhir Dokumen</h4>
                              <p className="text-xs text-slate-400 mt-1">
                                Perpustakaan Digital SMKN 1 Beringin
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* SINGLE PAGE MODE (MOBILE / 1-HALAMAN) DENGAN ANIMASI FLUID SLIDE */
                      <div
                        onClick={handleNextPage}
                        style={getSinglePageTransform()}
                        className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-2xl border border-black/15 dark:border-white/10 will-change-transform"
                        title="Klik untuk ke halaman berikutnya"
                      >
                        <canvas ref={canvasLeftRef} className="block bg-white" />
                        <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-md">
                          Hal. {currentPage - 1}
                        </div>
                      </div>
                    )}

                    {/* Subtle Non-Intrusive Page Rendering Indicator */}
                    {isRenderingPage && !pdfLoading && (
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse z-40 pointer-events-none opacity-80" />
                    )}

                    {/* Full Loading Indicator (Only on initial PDF document load) */}
                    {pdfLoading && (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 rounded-2xl z-30 pointer-events-none">
                        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                          Membuka buku...
                        </span>
                      </div>
                    )}

                    {/* Error Fallback */}
                    {pdfError && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center gap-3 rounded-2xl z-30 text-white">
                        <Info className="w-8 h-8 text-rose-400" />
                        <p className="text-xs text-rose-200">{pdfError}</p>
                        <button
                          type="button"
                          onClick={() => setViewMode("standard")}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
                        >
                          Buka di Mode PDF Standar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Floating Navigation Chevrons outside the book casing */}
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || flipStage !== "idle"}
                  className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-sky-600 disabled:opacity-20 disabled:pointer-events-none text-white shadow-xl backdrop-blur-md border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Halaman Sebelumnya (←)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || flipStage !== "idle"}
                  className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-sky-600 disabled:opacity-20 disabled:pointer-events-none text-white shadow-xl backdrop-blur-md border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Halaman Selanjutnya (→)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* =========================================================================
                    FLOATING BOTTOM DOCK (21st.dev Style Pill Controller with Animation Feedback)
                ========================================================================= */}
                <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/90 border border-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-all">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || flipStage !== "idle"}
                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                    title="Halaman Sebelumnya (←)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {/* Quick -5 Jump */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage <= 1 || flipStage !== "idle") return;
                      if (soundEnabled) playPageFlipSound();
                      setFlipDirection("prev");
                      setFlipStage("flipping");
                      setTimeout(() => {
                        if (isTwoPage) {
                          setCurrentPage((p) => {
                            const prevVal = Math.max(1, p - 6);
                            return prevVal <= 1 ? 1 : (prevVal % 2 !== 0 ? prevVal + 1 : prevVal);
                          });
                        } else {
                          setCurrentPage((p) => Math.max(1, p - 5));
                        }
                        setFlipStage("settling");
                        setTimeout(() => {
                          setFlipStage("idle");
                          setFlipDirection(null);
                        }, 240);
                      }, 180);
                    }}
                    disabled={currentPage <= 1 || flipStage !== "idle"}
                    className="hidden md:inline-block px-2 py-1 rounded-full hover:bg-white/10 disabled:opacity-30 text-[10px] font-mono cursor-pointer transition-colors"
                    title="Mundur 5 Halaman"
                  >
                    -5
                  </button>

                  {/* Page Scrubber Slider */}
                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="range"
                      min="1"
                      max={totalPages}
                      value={sliderVal}
                      onChange={handleSliderChange}
                      onPointerUp={() => commitSliderPage(sliderVal)}
                      onMouseUp={() => commitSliderPage(sliderVal)}
                      onTouchEnd={() => commitSliderPage(sliderVal)}
                      className="w-16 sm:w-32 accent-sky-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                      title="Geser halaman"
                    />
                  </div>

                  {/* Page Badge Indicator with Spring Bounce Animation */}
                  <div className="flex items-center gap-1 text-xs font-mono font-bold px-1.5">
                    <span
                      className="text-sky-300 transition-transform duration-200 inline-block"
                      style={{
                        transform: flipStage !== "idle" ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {currentPage === 1
                        ? "Sampul"
                        : isTwoPage
                        ? `${currentPage - 1}-${Math.min(totalPdfPages, currentPage)}`
                        : `${currentPage - 1}`}
                    </span>
                    <span className="opacity-40">/</span>
                    <span className="opacity-70">{totalPages}</span>
                  </div>

                  {/* Quick +5 Jump */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage >= totalPages || flipStage !== "idle") return;
                      if (soundEnabled) playPageFlipSound();
                      setFlipDirection("next");
                      setFlipStage("flipping");
                      setTimeout(() => {
                        if (isTwoPage) {
                          setCurrentPage((p) => {
                            if (p === 1) return 2;
                            const nextVal = Math.min(totalPages, p + 6);
                            return nextVal % 2 !== 0 ? nextVal - 1 : nextVal;
                          });
                        } else {
                          setCurrentPage((p) => Math.min(totalPages, p + 5));
                        }
                        setFlipStage("settling");
                        setTimeout(() => {
                          setFlipStage("idle");
                          setFlipDirection(null);
                        }, 240);
                      }, 180);
                    }}
                    disabled={currentPage >= totalPages || flipStage !== "idle"}
                    className="hidden md:inline-block px-2 py-1 rounded-full hover:bg-white/10 disabled:opacity-30 text-[10px] font-mono cursor-pointer transition-colors"
                    title="Maju 5 Halaman"
                  >
                    +5
                  </button>

                  {/* Audio Toggle (Paper Sound) */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      soundEnabled ? "text-sky-400 hover:text-sky-300" : "text-white/40 hover:text-white/70"
                    }`}
                    title={soundEnabled ? "Efek Suara Lembar Kertas Aktif" : "Efek Suara Lembar Kertas Mati"}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || flipStage !== "idle"}
                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-md shadow-sky-600/30"
                    title="Halaman Selanjutnya (→)"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* OPSI 2: MODE DOKUMEN PDF (SCROLL VERTIKAL BEBAS TANPA WATERMARK) */
              <div
                style={{ width: `${zoom}%`, maxWidth: "100%", height: "calc(100vh - 120px)" }}
                className={`rounded-2xl overflow-hidden shadow-2xl border transition-all duration-150 flex flex-col relative ${currentTheme.bookShell}`}
              >
                <iframe
                  src={embedUrl}
                  title={buku.judul}
                  className="w-full h-full border-0 rounded-2xl"
                  allow="autoplay"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md w-full text-center py-16 px-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm text-white">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold mb-1">File E-Book Belum Tersedia</h2>
            <p className="text-xs text-slate-400 mb-6">
              File digital untuk buku ini sedang dalam proses digitalisasi oleh tim perpustakaan SMKN 1 Beringin.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Katalog
            </Link>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOOKMARKS & READING NOTES DRAWER (Clean Slide-over)
      ========================================================================= */}
      {showBookmarksDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 text-white p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm">Penanda &amp; Catatan Baca</h3>
                </div>
                <button
                  onClick={() => setShowBookmarksDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Bookmark Form */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Tandai Posisi Halaman {currentPage}
                </span>
                <input
                  type="text"
                  placeholder="Tulis catatan ringkas (opsional)..."
                  value={newBookmarkNote}
                  onChange={(e) => setNewBookmarkNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={handleAddBookmark}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isCurrentPageBookmarked ? "Hapus Penanda Halaman Ini" : "Simpan Penanda"}
                </button>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Belum ada penanda halaman tersimpan.
                  </p>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => {
                        setCurrentPage(bm.page);
                        setShowBookmarksDrawer(false);
                      }}
                      className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>Halaman {bm.page}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{bm.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{bm.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const txt = bookmarks.map((b) => `• Hal ${b.page}: ${b.note}`).join("\n");
                  navigator.clipboard.writeText(txt || "Tidak ada catatan.");
                  setJournalCopied(true);
                  setTimeout(() => setJournalCopied(false), 2000);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{journalCopied ? "Catatan Disalin!" : "Salin Catatan Baca"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
