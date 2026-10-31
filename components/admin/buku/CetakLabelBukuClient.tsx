"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ItemLabelBuku } from "@/actions/label-buku";
import {
  Search,
  Printer,
  Download,
  CheckSquare,
  Square,
  Layers,
  Settings2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Bookmark,
  Barcode as BarcodeIcon,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Grid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import bwipjs from "bwip-js";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export type PaperTemplateId =
  | "A4_4x4"
  | "TJ103"
  | "TJ121"
  | "A4_3x8"
  | "A4_2x5"
  | "A4_2x4_COMBI"
  | "THERMAL_70x35"
  | "THERMAL_50x30";

export type LabelMode = "COMBI" | "SPINE_ONLY" | "BARCODE_ONLY";

interface PaperTemplateConfig {
  id: PaperTemplateId;
  name: string;
  description: string;
  cols: number;
  rows: number;
  perPage: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginHorizMm: number;
  marginVertMm: number;
  gapHorizMm: number;
  gapVertMm: number;
  isContinuous?: boolean;
}

export const PAPER_TEMPLATES: Record<PaperTemplateId, PaperTemplateConfig> = {
  A4_4x4: {
    id: "A4_4x4",
    name: "Kertas A4 Grid 4×4 (16 Label Pas A4)",
    description: "4 kolom × 4 baris = 16 label (62 × 36 mm) presisi & anti-terpotong printer",
    cols: 4,
    rows: 4,
    perPage: 16,
    sheetWidthMm: 297,
    sheetHeightMm: 210,
    labelWidthMm: 62,
    labelHeightMm: 36,
    marginHorizMm: 18.5,
    marginVertMm: 27,
    gapHorizMm: 4,
    gapVertMm: 4,
  },
  TJ103: {
    id: "TJ103",
    name: "Tom & Jerry No. 103",
    description: "3 kolom × 4 baris = 12 label (32 × 64 mm)",
    cols: 3,
    rows: 4,
    perPage: 12,
    sheetWidthMm: 200,
    sheetHeightMm: 165,
    labelWidthMm: 64,
    labelHeightMm: 32,
    marginHorizMm: 4,
    marginVertMm: 15,
    gapHorizMm: 2,
    gapVertMm: 4,
  },
  TJ121: {
    id: "TJ121",
    name: "Tom & Jerry No. 121",
    description: "2 kolom × 5 baris = 10 label (38 × 76 mm)",
    cols: 2,
    rows: 5,
    perPage: 10,
    sheetWidthMm: 205,
    sheetHeightMm: 165,
    labelWidthMm: 76,
    labelHeightMm: 38,
    marginHorizMm: 18,
    marginVertMm: 10,
    gapHorizMm: 17,
    gapVertMm: 5,
  },
  A4_3x8: {
    id: "A4_3x8",
    name: "Kertas A4 Grid 3×8 (24 Label)",
    description: "3 kolom × 8 baris = 24 label (65 × 34 mm)",
    cols: 3,
    rows: 8,
    perPage: 24,
    sheetWidthMm: 210,
    sheetHeightMm: 297,
    labelWidthMm: 65,
    labelHeightMm: 34,
    marginHorizMm: 5,
    marginVertMm: 10,
    gapHorizMm: 2.5,
    gapVertMm: 2,
  },
  A4_2x5: {
    id: "A4_2x5",
    name: "Kertas A4 Grid 2×5 (10 Label Besar)",
    description: "2 kolom × 5 baris = 10 label (95 × 52 mm)",
    cols: 2,
    rows: 5,
    perPage: 10,
    sheetWidthMm: 210,
    sheetHeightMm: 297,
    labelWidthMm: 95,
    labelHeightMm: 52,
    marginHorizMm: 6,
    marginVertMm: 12,
    gapHorizMm: 8,
    gapVertMm: 5,
  },
  A4_2x4_COMBI: {
    id: "A4_2x4_COMBI",
    name: "Kertas A4 Kombinasi 2×4 (8 Label 2-in-1)",
    description: "2 kolom × 4 baris = 8 label 2-in-1 (96 × 66 mm)",
    cols: 2,
    rows: 4,
    perPage: 8,
    sheetWidthMm: 210,
    sheetHeightMm: 297,
    labelWidthMm: 96,
    labelHeightMm: 66,
    marginHorizMm: 6,
    marginVertMm: 12,
    gapHorizMm: 6,
    gapVertMm: 6,
  },
  THERMAL_70x35: {
    id: "THERMAL_70x35",
    name: "Thermal Roll 70 × 35 mm",
    description: "Printer barcode thermal stiker 1 kolom",
    cols: 1,
    rows: 1,
    perPage: 1,
    sheetWidthMm: 70,
    sheetHeightMm: 35,
    labelWidthMm: 70,
    labelHeightMm: 35,
    marginHorizMm: 0,
    marginVertMm: 0,
    gapHorizMm: 0,
    gapVertMm: 0,
    isContinuous: true,
  },
  THERMAL_50x30: {
    id: "THERMAL_50x30",
    name: "Thermal Roll 50 × 30 mm",
    description: "Printer thermal mini stiker 1 kolom",
    cols: 1,
    rows: 1,
    perPage: 1,
    sheetWidthMm: 50,
    sheetHeightMm: 30,
    labelWidthMm: 50,
    labelHeightMm: 30,
    marginHorizMm: 0,
    marginVertMm: 0,
    gapHorizMm: 0,
    gapVertMm: 0,
    isContinuous: true,
  },
};

interface CetakLabelBukuClientProps {
  initialItems: ItemLabelBuku[];
  categories: string[];
  raks: { id: string; nama: string; nomor?: number }[];
}

export function CetakLabelBukuClient({
  initialItems,
  categories,
  raks,
}: CetakLabelBukuClientProps) {
  const [items] = useState<ItemLabelBuku[]>(initialItems);
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("ALL");
  const [selectedRak, setSelectedRak] = useState("ALL");
  
  // Selection (default 16 items for 4x4 A4 grid)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialItems.slice(0, 16).map((i) => i.id))
  );

  // Settings
  const [labelMode, setLabelMode] = useState<LabelMode>("COMBI");
  const [templateId, setTemplateId] = useState<PaperTemplateId>("A4_4x4");
  const [startOffset, setStartOffset] = useState<number>(0); // 0-indexed (skip slots)
  const [showBorder, setShowBorder] = useState(true);
  const [showHeaderInstansi, setShowHeaderInstansi] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Page Scope Selection & Pagination Controls
  const [pageScope, setPageScope] = useState<"ALL" | "ODD" | "EVEN" | "CUSTOM">("ALL");
  const [customPagesInput, setCustomPagesInput] = useState<string>("1");
  const [previewPageIdx, setPreviewPageIdx] = useState<number>(0);

  // Barcode Cache (Data URLs)
  const [barcodeCache, setBarcodeCache] = useState<Record<string, string>>({});

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.judul.toLowerCase().includes(search.toLowerCase()) ||
        item.penulis.toLowerCase().includes(search.toLowerCase()) ||
        item.kode.toLowerCase().includes(search.toLowerCase()) ||
        item.klasifikasi.toLowerCase().includes(search.toLowerCase());

      const matchKat = selectedKategori === "ALL" || item.kategori === selectedKategori;
      const matchRak = selectedRak === "ALL" || item.rakNama === selectedRak;

      return matchSearch && matchKat && matchRak;
    });
  }, [items, search, selectedKategori, selectedRak]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const template = PAPER_TEMPLATES[templateId];

  const totalSlots = startOffset + selectedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalSlots / template.perPage));

  // Determine target pages based on scope
  const targetPages = useMemo(() => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (pageScope === "ALL") return all;
    if (pageScope === "ODD") return all.filter((p) => p % 2 === 1);
    if (pageScope === "EVEN") {
      const even = all.filter((p) => p % 2 === 0);
      return even.length > 0 ? even : [1];
    }
    // CUSTOM
    const set = new Set<number>();
    const parts = customPagesInput.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(totalPages, b); i++) {
            set.add(i);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          set.add(p);
        }
      }
    }
    const res = Array.from(set).sort((a, b) => a - b);
    return res.length > 0 ? res : [1];
  }, [totalPages, pageScope, customPagesInput]);

  // Pre-generate barcodes using bwipjs
  useEffect(() => {
    const newCache: Record<string, string> = { ...barcodeCache };
    let changed = false;

    for (const item of selectedItems) {
      if (!newCache[item.kode]) {
        try {
          const canvas = document.createElement("canvas");
          bwipjs.toCanvas(canvas, {
            bcid: "code128",
            text: item.kode,
            scale: 3,
            height: 10,
            includetext: false,
            paddingleft: 2,
            paddingright: 2,
            backgroundcolor: "ffffff",
          });
          newCache[item.kode] = canvas.toDataURL("image/png");
          changed = true;
        } catch (e) {
          console.error("Barcode gen error for:", item.kode, e);
        }
      }
    }

    if (changed) {
      setBarcodeCache(newCache);
    }
  }, [selectedItems]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Direct Print via Browser
  const handlePrintBrowser = () => {
    if (typeof document === "undefined") return;

    const styleId = "print-label-sheet-style";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      @page {
        size: ${template.sheetWidthMm}mm ${template.sheetHeightMm}mm ${template.sheetWidthMm > template.sheetHeightMm ? "landscape" : "portrait"};
        margin: 0 !important;
      }
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        .print-hidden, nav, header, footer, aside {
          display: none !important;
        }
        .printable-sheet-container {
          display: block !important;
          width: 100% !important;
        }
        .printable-sheet {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .printable-sheet:not(:last-child) {
          page-break-after: always;
          break-after: page;
        }
      }
    `;

    const restore = () => {
      style.textContent = "";
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Export Data to Excel (.xlsx)
  const handleExportExcel = () => {
    if (selectedItems.length === 0) return;

    const headers = [
      "No",
      "Kode Barcode",
      "No Panggil (Call Number)",
      "Klasifikasi DDC",
      "Kode Pengarang",
      "Kode Judul",
      "No Eksemplar",
      "Judul Buku",
      "Pengarang / Penulis",
      "Kategori",
      "Lokasi Rak",
      "Tipe Koleksi",
      "Status Sirkulasi",
    ];

    const dataRows = selectedItems.map((item, idx) => [
      idx + 1,
      String(item.kode),
      item.callNumber,
      item.klasifikasi || "-",
      item.authorCode,
      item.titleCode,
      `c.${item.copyNumber}`,
      item.judul,
      item.penulis,
      item.kategori,
      item.rakNama,
      item.isReferensi ? "Referensi [R]" : "Sirkulasi Umum",
      item.status,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Force Barcode column (col 1 / B) as string type with text format to preserve leading zeros
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let R = 1; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].t = "s";
        worksheet[cellAddress].z = "@";
      }
    }

    // Explicit professional column widths
    worksheet["!cols"] = [
      { wch: 6 },  // No
      { wch: 16 }, // Kode Barcode
      { wch: 22 }, // No Panggil
      { wch: 15 }, // DDC
      { wch: 16 }, // Kode Pengarang
      { wch: 12 }, // Kode Judul
      { wch: 14 }, // No Eksemplar
      { wch: 42 }, // Judul Buku
      { wch: 28 }, // Pengarang
      { wch: 22 }, // Kategori
      { wch: 16 }, // Lokasi Rak
      { wch: 18 }, // Tipe Koleksi
      { wch: 16 }, // Status Sirkulasi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Label Buku");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Data-Label-Buku-SMKN1Beringin-${dateStr}.xlsx`);
  };

  // Generate & Download PDF with jsPDF
  const handleDownloadPdf = async () => {
    if (selectedItems.length === 0) return;
    setIsGeneratingPdf(true);

    try {
      const orientation = template.sheetWidthMm > template.sheetHeightMm ? "landscape" : "portrait";
      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: [template.sheetWidthMm, template.sheetHeightMm],
      });

      const pagesToPrint = targetPages;
      let docPageCount = 0;

      for (const pageNum of pagesToPrint) {
        const pageIdx = pageNum - 1;
        if (docPageCount > 0) {
          doc.addPage([template.sheetWidthMm, template.sheetHeightMm], orientation);
        }
        docPageCount++;

        for (let slot = 0; slot < template.perPage; slot++) {
          const globalSlotIndex = pageIdx * template.perPage + slot;
          if (globalSlotIndex < startOffset) continue; // Skip unused offset
          const itemIndex = globalSlotIndex - startOffset;
          if (itemIndex >= selectedItems.length) break;

          const item = selectedItems[itemIndex];

          const col = slot % template.cols;
          const row = Math.floor(slot / template.cols);

          const x = template.marginHorizMm + col * (template.labelWidthMm + template.gapHorizMm);
          const y = template.marginVertMm + row * (template.labelHeightMm + template.gapVertMm);
          const w = template.labelWidthMm;
          const h = template.labelHeightMm;

          // Draw Border if enabled
          if (showBorder) {
            doc.setDrawColor(203, 213, 225); // Slate-300
            doc.setLineWidth(0.2);
            doc.roundedRect(x, y, w, h, 1.2, 1.2, "S");
          }

          if (labelMode === "COMBI") {
            const spineW = w * 0.35; // 21.7mm on 62mm
            const barcodeW = w - spineW; // 40.3mm on 62mm

            // Vertical divider line
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.2);
            doc.line(x + spineW, y + 1.2, x + spineW, y + h - 1.2);

            // --- Left Side: Spine ---
            if (showHeaderInstansi) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(5.2);
              doc.setTextColor(15, 23, 42);
              doc.text("SMKN 1", x + spineW / 2, y + 2.8, { align: "center", baseline: "middle" });
              doc.text("BERINGIN", x + spineW / 2, y + 5.0, { align: "center", baseline: "middle" });

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.18);
              doc.line(x + 1.5, y + 6.4, x + spineW - 1.5, y + 6.4);
            }

            // DDC Klasifikasi
            doc.setFont("helvetica", "bold");
            const ddcLen = (item.klasifikasi || "").length;
            doc.setFontSize(ddcLen > 5 ? 7.8 : 9.0);
            doc.setTextColor(15, 23, 42);
            doc.text(item.klasifikasi || "000", x + spineW / 2, y + 11.5, { align: "center", baseline: "middle" });

            // Author Code
            doc.setFontSize(7.4);
            doc.setTextColor(30, 41, 59);
            doc.text(item.authorCode, x + spineW / 2, y + 16.2, { align: "center", baseline: "middle" });

            // Title Code
            doc.setFontSize(7.0);
            doc.setTextColor(51, 65, 85);
            doc.text(item.titleCode, x + spineW / 2, y + 20.6, { align: "center", baseline: "middle" });

            // Left Pill
            const lPillW = 12.5;
            const lPillH = 3.2;
            const lPillX = x + (spineW - lPillW) / 2;
            const lPillY = y + h - 4.6;

            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.15);
            doc.roundedRect(lPillX, lPillY, lPillW, lPillH, 0.7, 0.7, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.2);
            doc.setTextColor(71, 85, 105);
            doc.text(`c.${item.copyNumber}`, lPillX + lPillW / 2, lPillY + lPillH / 2, { align: "center", baseline: "middle" });

            // --- Right Side: Barcode ---
            const bX = x + spineW + 1.0;
            const bW = barcodeW - 2.0;

            if (showHeaderInstansi) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(5.2);
              doc.setTextColor(15, 23, 42);
              doc.text("PERPUS SMKN 1 BERINGIN", bX + bW / 2, y + 3.0, { align: "center", baseline: "middle" });

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.18);
              doc.line(bX + 1.5, y + 4.8, bX + bW - 1.5, y + 4.8);
            }

            // Barcode image
            const bcImg = barcodeCache[item.kode];
            const rBcW = 26;
            const rBcH = 5.2;
            const rBcX = bX + (bW - rBcW) / 2;
            const rBcY = y + 5.8;

            if (bcImg) {
              doc.addImage(bcImg, "PNG", rBcX, rBcY, rBcW, rBcH);
            }

            // Code
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.6);
            doc.setTextColor(15, 23, 42);
            doc.text(item.kode, bX + bW / 2, y + 13.0, { align: "center", baseline: "middle" });

            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.4);
            doc.setTextColor(30, 41, 59);
            const rawLines = doc.splitTextToSize(item.judul, bW - 2);
            let titleLines = rawLines.slice(0, 2);
            if (rawLines.length > 2) {
              let last = titleLines[1];
              if (last.length > 3) last = last.substring(0, last.length - 3) + "...";
              titleLines[1] = last;
            }

            if (titleLines.length === 1) {
              doc.text(titleLines[0], bX + bW / 2, y + 16.5, { align: "center", baseline: "middle" });
            } else {
              doc.text(titleLines[0], bX + bW / 2, y + 15.8, { align: "center", baseline: "middle" });
              doc.text(titleLines[1], bX + bW / 2, y + 18.4, { align: "center", baseline: "middle" });
            }

            // Right location pill
            if (showLocation) {
              const rPillW = Math.min(bW - 4, Math.max(18, doc.getTextWidth(item.rakNama) + 4));
              const rPillH = 3.2;
              const rPillX = bX + (bW - rPillW) / 2;
              const rPillY = y + h - 4.6;

              doc.setFillColor(241, 245, 249);
              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.15);
              doc.roundedRect(rPillX, rPillY, rPillW, rPillH, 0.7, 0.7, "FD");

              doc.setFont("helvetica", "bold");
              doc.setFontSize(5.0);
              doc.setTextColor(71, 85, 105);
              doc.text(item.rakNama, rPillX + rPillW / 2, rPillY + rPillH / 2, { align: "center", baseline: "middle" });
            }
          } else if (labelMode === "SPINE_ONLY") {
            // 1. Header Instansi
            if (showHeaderInstansi) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.0);
              doc.setTextColor(15, 23, 42);
              doc.text("SMKN 1 BERINGIN", x + w / 2, y + 3.6, { align: "center", baseline: "middle" });

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.18);
              doc.line(x + 3, y + 5.4, x + w - 3, y + 5.4);
            }

            // 2. Call Number Stack (DDC + Author + Title)
            doc.setFont("helvetica", "bold");
            const ddcLen = (item.klasifikasi || "").length;
            doc.setFontSize(ddcLen > 5 ? 10.5 : 12.0);
            doc.setTextColor(15, 23, 42);
            doc.text(item.klasifikasi || "000", x + w / 2, y + 11.8, { align: "center", baseline: "middle" });

            doc.setFontSize(9.0);
            doc.setTextColor(30, 41, 59);
            doc.text(item.authorCode, x + w / 2, y + 17.0, { align: "center", baseline: "middle" });

            doc.setFontSize(8.0);
            doc.setTextColor(51, 65, 85);
            doc.text(item.titleCode, x + w / 2, y + 21.8, { align: "center", baseline: "middle" });

            // 3. Bottom Pill Badge
            const pillText = `c.${item.copyNumber} · ${item.isReferensi ? "[R]" : "Koleksi"}`;
            const pillW = Math.min(w - 12, 32);
            const pillH = 3.4;
            const pillX = x + (w - pillW) / 2;
            const pillY = y + h - 4.6;

            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.15);
            doc.roundedRect(pillX, pillY, pillW, pillH, 0.8, 0.8, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.5);
            doc.setTextColor(71, 85, 105);
            doc.text(pillText, pillX + pillW / 2, pillY + pillH / 2, { align: "center", baseline: "middle" });
          } else {
            // BARCODE ONLY
            // 1. Header Instansi
            if (showHeaderInstansi) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6.8);
              doc.setTextColor(15, 23, 42);
              doc.text("PERPUSTAKAAN SMKN 1 BERINGIN", x + w / 2, y + 3.4, { align: "center", baseline: "middle" });

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.18);
              doc.line(x + 3, y + 5.2, x + w - 3, y + 5.2);
            }

            // 2. Barcode Image
            const bcImg = barcodeCache[item.kode];
            const bcW = 32;
            const bcH = 6.0;
            const bcX = x + (w - bcW) / 2;
            const bcY = y + 6.2;

            if (bcImg) {
              doc.addImage(bcImg, "PNG", bcX, bcY, bcW, bcH);
            }

            // 3. Barcode Code Text
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(15, 23, 42);
            doc.text(`* ${item.kode} *`, x + w / 2, bcY + bcH + 2.2, { align: "center", baseline: "middle" });

            // 4. Book Title (Max 2 lines)
            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.6);
            doc.setTextColor(30, 41, 59);
            const rawLines = doc.splitTextToSize(item.judul, w - 8);
            let titleLines = rawLines.slice(0, 2);
            if (rawLines.length > 2) {
              let last = titleLines[1];
              if (last.length > 3) last = last.substring(0, last.length - 3) + "...";
              titleLines[1] = last;
            }

            const titleStartY = bcY + bcH + 5.0;
            if (titleLines.length === 1) {
              doc.text(titleLines[0], x + w / 2, titleStartY + 1.2, { align: "center", baseline: "middle" });
            } else {
              doc.text(titleLines[0], x + w / 2, titleStartY + 0.5, { align: "center", baseline: "middle" });
              doc.text(titleLines[1], x + w / 2, titleStartY + 3.0, { align: "center", baseline: "middle" });
            }

            // 5. Bottom Location Pill Badge
            if (showLocation) {
              const badgeText = `${item.rakNama}  ·  c.${item.copyNumber}`;
              const pillW = Math.min(w - 12, 34);
              const pillH = 3.4;
              const pillX = x + (w - pillW) / 2;
              const pillY = y + h - 4.6;

              doc.setFillColor(241, 245, 249);
              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.15);
              doc.roundedRect(pillX, pillY, pillW, pillH, 0.7, 0.7, "FD");

              doc.setFont("helvetica", "bold");
              doc.setFontSize(5.0);
              doc.setTextColor(71, 85, 105);
              doc.text(badgeText, pillX + pillW / 2, pillY + pillH / 2, { align: "center", baseline: "middle" });
            }
          }
        }
      }

      doc.save(`Label-Buku-SMKN1Beringin-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Gagal mengunduh PDF. Silakan gunakan tombol Cetak Langsung.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Render Label Preview Item
  const renderLabelContent = (item: ItemLabelBuku) => {
    const bcUrl = barcodeCache[item.kode];

    if (labelMode === "COMBI") {
      const ddcLen = (item.klasifikasi || "").length;
      return (
        <div className="w-full h-full flex bg-white text-slate-900 border border-slate-300 rounded-[3px] overflow-hidden select-none p-1 box-border shadow-2xs min-h-0 min-w-0">
          {/* Sisi Kiri: Spine (35%) */}
          <div className="w-[35%] border-r border-slate-300 flex flex-col items-center justify-between pr-1 py-0.5 text-center shrink-0 min-h-0">
            {showHeaderInstansi && (
              <div className="w-full border-b border-slate-200 pb-0.5 text-center leading-none shrink-0">
                <div className="text-[6.2px] font-black uppercase tracking-tight text-slate-900 leading-tight">
                  SMKN 1
                </div>
                <div className="text-[6.2px] font-black uppercase tracking-tight text-slate-900 leading-tight">
                  BERINGIN
                </div>
              </div>
            )}
            <div className="flex-1 flex flex-col items-center justify-center space-y-0.5 py-0.5 min-h-0">
              <div className={`font-mono font-black ${ddcLen > 5 ? "text-[9.5px]" : "text-[11px]"} leading-tight text-slate-950`}>
                {item.klasifikasi || "000"}
              </div>
              <div className="font-mono font-extrabold text-[8.5px] leading-tight text-slate-800 uppercase">
                {item.authorCode}
              </div>
              <div className="font-mono font-bold text-[8px] leading-tight text-slate-700">
                {item.titleCode}
              </div>
            </div>
            <div className="shrink-0 text-[6.5px] px-1.5 py-0.5 font-bold text-slate-600 bg-slate-100 rounded leading-none border border-slate-200">
              c.{item.copyNumber}
            </div>
          </div>

          {/* Sisi Kanan: Barcode (65%) */}
          <div className="w-[65%] pl-1.5 py-0.5 flex flex-col items-center justify-between text-center overflow-hidden min-w-0 min-h-0">
            {showHeaderInstansi && (
              <div className="text-[6.5px] font-extrabold uppercase text-slate-900 tracking-tight border-b border-slate-200 pb-0.5 w-full truncate leading-normal shrink-0">
                PERPUS SMKN 1 BERINGIN
              </div>
            )}
            <div className="w-full flex-1 flex items-center justify-center my-0.5 max-h-[22px] min-h-0">
              {bcUrl ? (
                <img src={bcUrl} alt={item.kode} className="h-full max-h-[20px] w-full object-contain" />
              ) : (
                <div className="h-4 w-full bg-slate-100 flex items-center justify-center font-mono text-[7.5px]">
                  {item.kode}
                </div>
              )}
            </div>
            <div className="font-mono font-black text-[8px] tracking-wider leading-none text-slate-950 shrink-0">
              {item.kode}
            </div>
            <div className="text-[7px] font-bold line-clamp-2 text-slate-900 leading-[1.1] w-full px-0.5 my-0.5 shrink-0">
              {item.judul}
            </div>
            {showLocation && (
              <div className="shrink-0 text-[6.5px] font-bold text-slate-600 truncate w-full leading-none">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block max-w-full truncate">
                  {item.rakNama}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (labelMode === "SPINE_ONLY") {
      const ddcLen = (item.klasifikasi || "").length;
      return (
        <div className="w-full h-full flex flex-col items-center justify-between bg-white text-slate-900 border border-slate-300 rounded-[3px] px-2 pt-1 pb-1 text-center select-none box-border shadow-2xs overflow-hidden min-h-0">
          {showHeaderInstansi && (
            <div className="w-full border-b border-slate-200 pb-0.5 text-center shrink-0">
              <div className="text-[8px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                SMKN 1 BERINGIN
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col items-center justify-center py-0.5 space-y-0.5 min-h-0">
            <div className={`font-mono font-black ${ddcLen > 5 ? "text-[11px]" : "text-[13px]"} leading-tight text-slate-950`}>
              {item.klasifikasi || "000"}
            </div>
            <div className="font-mono font-extrabold text-[10px] leading-tight text-slate-800 uppercase">
              {item.authorCode}
            </div>
            <div className="font-mono font-bold text-[9px] leading-tight text-slate-700">
              {item.titleCode}
            </div>
          </div>
          <div className="shrink-0 text-[7px] px-2.5 py-0.5 font-bold text-slate-600 bg-slate-100 rounded border border-slate-200 leading-none">
            c.{item.copyNumber} · {item.isReferensi ? "[R]" : "Koleksi"}
          </div>
        </div>
      );
    }

    // BARCODE ONLY
    return (
      <div className="w-full h-full flex flex-col items-center justify-between bg-white text-slate-900 border border-slate-300 rounded-[3px] px-2 pt-1 pb-1 text-center select-none box-border shadow-2xs overflow-hidden min-h-0">
        {showHeaderInstansi && (
          <div className="w-full border-b border-slate-200 pb-0.5 text-center shrink-0">
            <div className="text-[7.5px] font-black uppercase text-slate-900 tracking-wider leading-tight">
              PERPUSTAKAAN SMKN 1 BERINGIN
            </div>
          </div>
        )}
        <div className="w-full flex-1 flex items-center justify-center my-0.5 max-h-[26px] min-h-0">
          {bcUrl ? (
            <img src={bcUrl} alt={item.kode} className="h-full max-h-[24px] w-full object-contain" />
          ) : (
            <div className="h-4 w-full bg-slate-100 flex items-center justify-center font-mono text-[8px]">
              {item.kode}
            </div>
          )}
        </div>
        <div className="font-mono font-black text-[8px] tracking-widest leading-none text-slate-950 shrink-0">
          * {item.kode} *
        </div>
        <div className="text-[7px] font-bold line-clamp-2 text-slate-900 leading-[1.1] w-full px-1 my-0.5 shrink-0">
          {item.judul}
        </div>
        {showLocation && (
          <div className="shrink-0 text-[6.5px] font-bold text-slate-600 truncate w-full leading-none">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block max-w-full truncate">
              {item.rakNama}  ·  c.{item.copyNumber}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <BarcodeIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight">
                Generator Cetak Label Punggung &amp; Barcode
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Cetak stiker punggung buku DDC &amp; barcode inventaris fisik massal sesuai standar akreditasi perpustakaan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          <button
            type="button"
            onClick={handlePrintBrowser}
            disabled={selectedItems.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Langsung ({targetPages.length} Lembar)</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={selectedItems.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-white font-bold text-xs sm:text-sm border border-stone-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Excel ({selectedItems.length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={selectedItems.length === 0 || isGeneratingPdf}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-white font-bold text-xs sm:text-sm border border-stone-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            ) : (
              <Download className="w-4 h-4 text-emerald-500" />
            )}
            <span>{isGeneratingPdf ? "Memproses..." : `Unduh PDF (${targetPages.length} Lembar)`}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Book Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Pilih Koleksi Buku
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {selectedItems.length} terpilih
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul, penulis, barcode, atau DDC..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRak}
                  onChange={(e) => setSelectedRak(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Lokasi Rak</option>
                  {raks.map((r) => (
                    <option key={r.id} value={r.nama}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Selection Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Pilih Semua ({filteredItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:underline cursor-pointer"
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            {/* List of Items */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredItems.map((item) => {
                const isChecked = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs"
                        : "bg-white dark:bg-slate-950/60 border-stone-200 dark:border-slate-800/80 hover:border-stone-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.kode}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
                          c.{item.copyNumber}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1 mt-0.5">
                        {item.judul}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-slate-400 mt-1">
                        <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                          DDC: {item.klasifikasi}
                        </span>
                        <span>•</span>
                        <span className="truncate">{item.penulis}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-stone-500 dark:text-slate-400 text-xs">
                  Tidak ada koleksi buku yang cocok dengan filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Live Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Settings Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-slate-800 pb-3">
              <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Pengaturan Kertas &amp; Format Label
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Format / Mode Label */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1.5">
                  Model Stiker Label
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-slate-950 rounded-xl border border-stone-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLabelMode("COMBI")}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      labelMode === "COMBI"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-slate-400 hover:text-stone-900"
                    }`}
                  >
                    2-in-1 (Spine + Barcode)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("SPINE_ONLY")}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      labelMode === "SPINE_ONLY"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-slate-400 hover:text-stone-900"
                    }`}
                  >
                    Punggung Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("BARCODE_ONLY")}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      labelMode === "BARCODE_ONLY"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-slate-400 hover:text-stone-900"
                    }`}
                  >
                    Barcode Saja
                  </button>
                </div>
              </div>

              {/* Template Kertas */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1.5">
                  Template Kertas Stiker
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value as PaperTemplateId)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.values(PAPER_TEMPLATES).map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} — ({tpl.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showHeaderInstansi}
                    onChange={(e) => setShowHeaderInstansi(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700 dark:text-slate-300">Header Sekolah</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700 dark:text-slate-300">Garis Batas Stiker</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700 dark:text-slate-300">Lokasi Rak</span>
                </label>
              </div>

              {/* Skip Slot / Offset Control */}
              {!template.isContinuous && (
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-slate-400">
                    Mulai dari stiker slot:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={template.perPage - 1}
                    value={startOffset}
                    onChange={(e) =>
                      setStartOffset(
                        Math.max(0, Math.min(template.perPage - 1, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-14 px-2 py-1 text-center font-bold text-xs rounded-lg bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Page Selection Controls */}
            <div className="pt-3 border-t border-stone-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300">
                  Cakupan Halaman yang Dicetak
                </label>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {targetPages.length} dari {totalPages} lembar
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPageScope("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pageScope === "ALL"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200"
                  }`}
                >
                  Semua ({totalPages} Lembar)
                </button>
                <button
                  type="button"
                  onClick={() => setPageScope("ODD")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pageScope === "ODD"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200"
                  }`}
                >
                  Ganjil Saja (1, 3, 5...)
                </button>
                <button
                  type="button"
                  onClick={() => setPageScope("EVEN")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pageScope === "EVEN"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200"
                  }`}
                >
                  Genap Saja (2, 4, 6...)
                </button>
                <button
                  type="button"
                  onClick={() => setPageScope("CUSTOM")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pageScope === "CUSTOM"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200"
                  }`}
                >
                  Kustom
                </button>

                {pageScope === "CUSTOM" && (
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <input
                      type="text"
                      value={customPagesInput}
                      onChange={(e) => setCustomPagesInput(e.target.value)}
                      placeholder="contoh: 1, 2-3"
                      className="w-32 px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-stone-500 dark:text-slate-400">
                      (dari {totalPages} lembar)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Print Preview Sheet */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Pratinjau Lembar ({template.name})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-slate-400 hidden sm:inline">
                  {template.cols} × {template.rows} (16 label / lembar)
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 p-0.5 rounded-lg border border-stone-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={previewPageIdx <= 0}
                      onClick={() => setPreviewPageIdx((p) => Math.max(0, p - 1))}
                      className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Lembar Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold px-1 text-stone-700 dark:text-slate-200">
                      Lembar {previewPageIdx + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={previewPageIdx >= totalPages - 1}
                      onClick={() => setPreviewPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                      className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Lembar Berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Sheet Area */}
            <div className="p-4 bg-stone-200/70 dark:bg-slate-950/70 rounded-2xl overflow-x-auto flex items-center justify-center">
              <div
                style={{
                  width: `${template.sheetWidthMm * 2.5}px`,
                  height: `${template.sheetHeightMm * 2.5}px`,
                  padding: `${template.marginVertMm * 2.5}px ${template.marginHorizMm * 2.5}px`,
                }}
                className="bg-white shadow-xl rounded-sm border border-stone-300 relative box-border"
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${template.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${template.rows}, minmax(0, 1fr))`,
                    gap: `${template.gapVertMm * 2.5}px ${template.gapHorizMm * 2.5}px`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {Array.from({ length: template.perPage }).map((_, slotIdx) => {
                    const globalSlot = previewPageIdx * template.perPage + slotIdx;
                    if (globalSlot < startOffset) {
                      return (
                        <div
                          key={`skip-${slotIdx}`}
                          className="border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-[9px] text-stone-400 font-mono rounded"
                        >
                          (Kosong #{slotIdx + 1})
                        </div>
                      );
                    }
                    const itemIndex = globalSlot - startOffset;
                    if (itemIndex >= selectedItems.length) {
                      return (
                        <div
                          key={`empty-end-${slotIdx}`}
                          className="border border-dashed border-stone-200 bg-stone-50/50 rounded flex items-center justify-center text-[9px] text-stone-300"
                        >
                          (Slot Kosong)
                        </div>
                      );
                    }
                    const item = selectedItems[itemIndex];
                    return (
                      <div key={item.id} className="relative rounded w-full h-full min-h-0 min-w-0 overflow-hidden">
                        {renderLabelContent(item)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Container for Browser Window.print() */}
      <div className="printable-sheet-container hidden print:block">
        {targetPages.map((pageNum) => {
          const pageIdx = pageNum - 1;
          return (
            <div
              key={`page-${pageIdx}`}
              className="printable-sheet"
              style={{
                width: `${template.sheetWidthMm}mm`,
                height: `${template.sheetHeightMm}mm`,
                padding: `${template.marginVertMm}mm ${template.marginHorizMm}mm`,
                boxSizing: "border-box",
                background: "#ffffff",
                display: "grid",
                gridTemplateColumns: `repeat(${template.cols}, ${template.labelWidthMm}mm)`,
                gridTemplateRows: `repeat(${template.rows}, ${template.labelHeightMm}mm)`,
                gap: `${template.gapVertMm}mm ${template.gapHorizMm}mm`,
                overflow: "hidden",
                pageBreakAfter: "always",
                breakAfter: "page",
              }}
            >
              {Array.from({ length: template.perPage }).map((_, slotIdx) => {
                const globalSlot = pageIdx * template.perPage + slotIdx;
                if (globalSlot < startOffset) {
                  return (
                    <div
                      key={`empty-${slotIdx}`}
                      style={{ width: `${template.labelWidthMm}mm`, height: `${template.labelHeightMm}mm` }}
                    />
                  );
                }
                const itemIndex = globalSlot - startOffset;
                if (itemIndex >= selectedItems.length) {
                  return (
                    <div
                      key={`empty-end-${slotIdx}`}
                      style={{ width: `${template.labelWidthMm}mm`, height: `${template.labelHeightMm}mm` }}
                    />
                  );
                }
                const item = selectedItems[itemIndex];
                return (
                  <div
                    key={item.id}
                    style={{
                      width: `${template.labelWidthMm}mm`,
                      height: `${template.labelHeightMm}mm`,
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    {renderLabelContent(item)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
