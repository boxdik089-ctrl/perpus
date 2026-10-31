import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

interface ChatHistoryItem {
  sender: "user" | "bot";
  text: string;
}

// Cache In-Memory untuk pertanyaan berulang (menghemat 80% kuota & latensi 0ms)
interface CacheEntry {
  reply: string;
  recommendations: any[];
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit
let lastKeyIndex = 0;

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting per IP: Maksimal 30 request per menit
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`ai:${clientIp}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan ke AI. Silakan tunggu ${rateCheck.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Batasi panjang pesan maksimal 600 karakter & bersihkan null-byte
    const raw = sanitizeInput(message, 600);
    if (!raw) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }
    const cleanMsg = raw.toLowerCase().trim();

    // 2. CEK CACHE IN-MEMORY (Jika pertanyaan berulang tanpa riwayat panjang)
    const isSingleTurn = !Array.isArray(history) || history.length <= 1;
    if (isSingleTurn) {
      const cached = queryCache.get(cleanMsg);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({
          reply: cached.reply,
          recommendations: cached.recommendations,
          provider: "cache-hit",
        });
      }
    }

    // 2. Ekstrak kata kunci untuk pencarian di database buku
    const stopWords = new Set([
      "buku", "tentang", "yang", "mau", "ada", "rekomendasi", "cari", "kak", "tolong", 
      "dong", "buat", "baca", "apa", "aja", "saya", "aku", "rekomendasikan", "pengen", 
      "info", "katalog", "apakah", "bagaimana", "punya", "bisa", "kasih", "tahu", "hari", "ini"
    ]);
    const searchTerms = cleanMsg
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, 5);

    // Cari buku relevan di database perpustakaan
    let relevantBooks: any[] = [];
    if (searchTerms.length > 0) {
      relevantBooks = await prisma.buku.findMany({
        where: {
          OR: searchTerms.map((term) => ({
            OR: [
              { judul: { contains: term, mode: "insensitive" } },
              { penulis: { contains: term, mode: "insensitive" } },
              { kategori: { contains: term, mode: "insensitive" } },
              { klasifikasi: { contains: term, mode: "insensitive" } },
            ],
          })),
        },
        take: 8,
        select: {
          id: true,
          judul: true,
          penulis: true,
          kategori: true,
          klasifikasi: true,
          stok_tersedia: true,
          is_ebook: true,
          file_url: true,
          cover_url: true,
          eksemplar: {
            take: 1,
            select: { rak: { select: { nama: true } } },
          },
        },
      });
    }

    // Ambil sampel buku untuk rekomendasi fallback
    const fallbackCatalog = await prisma.buku.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        judul: true,
        penulis: true,
        kategori: true,
        klasifikasi: true,
        stok_tersedia: true,
        is_ebook: true,
        file_url: true,
        cover_url: true,
        eksemplar: {
          take: 1,
          select: { rak: { select: { nama: true } } },
        },
      },
    });

    const catalogToUse = (relevantBooks.length > 0 ? relevantBooks : fallbackCatalog).slice(0, 5);

    // 3. UTAMA: GOOGLE GEMINI DENGAN GUARDRAIL KHUSUS & MULTI-KEY ROTATION
    const rawKeys = process.env.GEMINI_API_KEY || "";
    const geminiKeys = rawKeys
      .split(/[,\n]/)
      .map((k) => k.trim().replace(/^["']|["']$/g, ""))
      .filter((k) => k.length > 0);

    if (geminiKeys.length > 0) {
      try {
        const catalogSummary = catalogToUse
          .map((b) => {
            const rak = b.eksemplar?.[0]?.rak?.nama ? ` (Rak Fisik: ${b.eksemplar[0].rak.nama})` : "";
            const ebook = b.is_ebook || b.file_url ? " [Tersedia E-Book Online]" : "";
            return `- "${b.judul}" karya ${b.penulis} [Stok: ${b.stok_tersedia}]${rak}${ebook}`;
          })
          .join("\n");

        const systemPrompt = `Kamu adalah "Tanya Pustaka", asisten virtual resmi KHUSUS Layanan Perpustakaan SMK Negeri 1 Beringin.

=== BATASAN KETAT & PROTOKOL KEAMANAN (MUTLAK DIPATUHI) ===
1. PERAN TUNGGAL & KHUSUS:
   - Kamu adalah PUSTAKAWAN SEKOLAH, BUKAN asisten umum (bukan ChatGPT/Copilot umum).
   - Tugas UTAMA kamu HANYA:
     * Memberikan informasi buku, pencarian katalog, lokasi rak fisik, dan e-book di perpustakaan SMKN 1 Beringin.
     * Merekomendasikan buku bacaan dan bahan literasi yang relevan untuk siswa dan guru.
     * Menginformasikan tata tertib perpustakaan (peminjaman 7 hari di Kiosk mandiri, jam operasional, dsb).
     * Memberikan ringkasan/sinopsis buku yang ada di perpustakaan.

2. DILARANG MENULIS KODE PEMROGRAMAN / SCRIPT / CODING:
   - Jika pengguna meminta membuatkan script, menulis baris kode (HTML, CSS, JS, PHP, Python, SQL, C++, dsb), atau skrip teknis:
     TOLAK DENGAN SANTUN. Jelaskan bahwa kamu adalah asisten pustakawan dan tidak menyediakan pembuatan kode instan. Arahkan siswa untuk meminjam dan membaca buku teks pemrograman di Rak Komputer perpustakaan SMKN 1 Beringin.

3. DILARANG KONSULTASI HUKUM / PASAL / PIDANA / PERDATA:
   - Jika pengguna menanyakan pasal hukum (seperti pasal KUHP, UU, kasus hukum, bantuan hukum):
     TOLAK DENGAN SANTUN. Jelaskan bahwa layanan ini khusus untuk informasi perpustakaan sekolah dan literasi, bukan konsultasi hukum. Sarankan membaca buku referensi PPKN atau hukum tata negara yang tersedia di perpustakaan.

4. DILARANG MENGERJAKAN TUGAS SEKOLAH SECARA INSTAN / MEMBUATKAN MAKALAH:
   - Jangan membuatkan tugas, esai lengkap, atau kunci jawaban langsung. Pandu siswa mengenai buku atau bab mana yang bisa mereka baca di perpustakaan untuk mengerjakan tugas tersebut secara mandiri.

5. DILARANG TOPIK DI LUAR PENDIDIKAN & PERPUSTAKAAN:
   - Tolak topik sensitif, politik praktis, medis, perjudian, hacking, atau konten tidak pantas. Selalu alihkan pembicaraan kembali ke: "Ada buku atau layanan perpustakaan yang bisa saya bantu carikan?"

6. SELALU BERMUARA PADA KOLEKSI BUKU PERPUSTAKAAN:
   - Setiap respon harus mengutamakan literasi dan merekomendasikan buku yang tersedia di perpustakaan jika relevan dengan minat baca siswa.

=== INFORMASI PERPUSTAKAAN SMKN 1 BERINGIN ===
- Jam Operasional Fisik: Senin - Jumat pukul 07.30 s/d 16.00 WIB.
- Layanan Digital: Katalog Web & E-Book online dapat diakses 24 jam nonstop.
- Masa Peminjaman Buku: 7 hari kalender, peminjaman mandiri menggunakan Kiosk Digital (scan kartu perpustakaan/NISN dan barcode buku).
- 7 Jurusan SMKN 1 Beringin: PPLG, TJKT, Desain & Produksi Busana, Kuliner, Perhotelan, Usaha Layanan Wisata (ULW), Tata Kecantikan & Spa.

Daftar Buku Relevan di Perpustakaan Saat Ini:
${catalogSummary || "- Katalog perpustakaan tersedia"}

Gunakan bahasa Indonesia yang santun, ramah, dan bernuansa pustakawan sekolah terpercaya.`;

        // Susun riwayat obrolan (Multi-turn conversation memory)
        const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            if (item && typeof item.text === "string" && item.text.trim()) {
              contents.push({
                role: item.sender === "user" ? "user" : "model",
                parts: [{ text: item.text.slice(0, 600) }],
              });
            }
          }
        }

        // Tambahkan pesan user saat ini
        contents.push({
          role: "user",
          parts: [{ text: raw }],
        });

        // Request ke model Gemini Flash dengan failover multi-key & multi-model
        const candidateModels = [
          "gemini-flash-lite-latest",
          "gemini-3.5-flash-lite",
          "gemini-flash-latest",
          "gemini-2.5-flash",
        ];
        let aiReplyText: string | null = null;

        const startingIndex = lastKeyIndex;
        lastKeyIndex = (lastKeyIndex + 1) % geminiKeys.length;

        keyLoop: for (let kIdx = 0; kIdx < geminiKeys.length; kIdx++) {
          const currentKey = geminiKeys[(startingIndex + kIdx) % geminiKeys.length];

          for (const modelName of candidateModels) {
            try {
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${currentKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    system_instruction: {
                      parts: [{ text: systemPrompt }],
                    },
                    contents: contents,
                    generationConfig: {
                      temperature: 0.4, // Suhu konsisten untuk ketaatan guardrail
                      maxOutputTokens: 800,
                    },
                  }),
                  signal: AbortSignal.timeout(9000),
                }
              );

              if (geminiRes.status === 429) {
                console.warn(
                  `[Gemini API] Key #${(startingIndex + kIdx) % geminiKeys.length} terkena rate limit (429), failover ke key berikutnya...`
                );
                break; // Coba key berikutnya di keyLoop
              }

              if (geminiRes.ok) {
                const aiData = await geminiRes.json();
                const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text && text.trim()) {
                  aiReplyText = text.trim();
                  break keyLoop; // Selesai berhasil
                }
              }
            } catch (modelErr) {
              console.warn(`[Gemini API] Percobaan model ${modelName} gagal:`, modelErr);
            }
          }
        }

        if (aiReplyText) {
          const matchedBooks = extractRecommendedBooks(aiReplyText, cleanMsg, catalogToUse);

          // Simpan ke Cache In-Memory untuk pertanyaan tunggal agar pertanyaan serupa 0ms
          if (isSingleTurn) {
            queryCache.set(cleanMsg, {
              reply: aiReplyText,
              recommendations: matchedBooks,
              timestamp: Date.now(),
            });
            if (queryCache.size > 500) {
              const oldestKey = queryCache.keys().next().value;
              if (oldestKey) queryCache.delete(oldestKey);
            }
          }

          return NextResponse.json({
            reply: aiReplyText,
            recommendations: matchedBooks,
            provider: "gemini-ai",
          });
        }
      } catch (err: any) {
        console.warn("[Gemini API Fallback] Gagal memanggil Gemini, menggunakan mesin lokal:", err?.message);
      }
    }

    // 4. MESIN PENGETAHUAN CERDAS BAWAAN (OFFLINE ENHANCED ENGINE DENGAN GUARDRAIL KETAT)
    const smartFallback = generateSmartResponse(raw, cleanMsg, relevantBooks, fallbackCatalog);

    // Cache fallback jawaban standar agar super cepat
    if (isSingleTurn) {
      queryCache.set(cleanMsg, {
        reply: smartFallback.reply,
        recommendations: smartFallback.recommendations,
        timestamp: Date.now(),
      });
      if (queryCache.size > 500) {
        const oldestKey = queryCache.keys().next().value;
        if (oldestKey) queryCache.delete(oldestKey);
      }
    }

    return NextResponse.json(smartFallback);
  } catch (error: any) {
    console.error("AI Pustakawan Error:", error);
    return NextResponse.json({ error: "Gagal memproses pesan AI" }, { status: 500 });
  }
}

// Helper untuk mengekstrak kartu buku yang relevan dari jawaban
function extractRecommendedBooks(replyText: string, cleanMsg: string, books: any[]) {
  const wantsBook = /buku|novel|baca|pinjam|katalog|rak|komik|referensi|koleksi|ebook|e-book/i.test(cleanMsg);
  if (!wantsBook && books.length === 0) return [];

  const replyLower = replyText.toLowerCase();
  const matched = books.filter((b) => {
    const title = b.judul.toLowerCase();
    const author = b.penulis.toLowerCase();
    return replyLower.includes(title) || cleanMsg.includes(title) || cleanMsg.includes(author);
  });

  const finalSelection = matched.length > 0 ? matched : wantsBook ? books.slice(0, 3) : [];

  return finalSelection.slice(0, 3).map((b) => ({
    id: b.id,
    judul: b.judul,
    penulis: b.penulis,
    stok_tersedia: b.stok_tersedia,
    is_ebook: b.is_ebook || Boolean(b.file_url),
    cover_url: b.cover_url,
    rakNama: b.eksemplar?.[0]?.rak?.nama || null,
  }));
}

// Mesin Cerdas Berbasis Pengetahuan Sekolah & Database Lokal (Offline Fallback Engine dengan Guardrail)
function generateSmartResponse(raw: string, cleanMsg: string, relevantBooks: any[], fallbackCatalog: any[]) {
  const mapBooks = (list: any[]) =>
    list.slice(0, 3).map((b) => ({
      id: b.id,
      judul: b.judul,
      penulis: b.penulis,
      stok_tersedia: b.stok_tersedia,
      is_ebook: b.is_ebook || Boolean(b.file_url),
      cover_url: b.cover_url,
      rakNama: b.eksemplar?.[0]?.rak?.nama || null,
    }));

  // GUARDRAIL 1: Menolak Penulisan Kode / Script Pemrograman
  if (/(buatkan kode|bikinin kode|tulis kode|bikin script|buat script|codingan|source code|hack|script html|script php|script python)/i.test(cleanMsg)) {
    return {
      reply: `Mohon maaf, sebagai asisten **Tanya Pustaka**, saya bertugas khusus untuk layanan perpustakaan, pencarian katalog, dan literasi sekolah—bukan untuk membuatkan kode program atau skrip instan.\n\nJika kamu ingin belajar pemrograman, perpustakaan SMKN 1 Beringin memiliki berbagai buku referensi pemrograman dan rekayasa perangkat lunak yang bisa kamu pinjam di **Rak Komputer & Informatika**.\n\nAda judul buku pemrograman tertentu yang ingin kamu cari?`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-guardrail",
    };
  }

  // GUARDRAIL 2: Menolak Pasal Hukum / Konsultasi Hukum
  if (/(pasal|kuhp|kuhper|uu nomor|hukum pidana|hukum perdata|tindak pidana|vonis|sidang)/i.test(cleanMsg)) {
    return {
      reply: `Mohon maaf, layanan **Tanya Pustaka** adalah asisten informasi perpustakaan sekolah dan literasi bacaan, bukan layanan konsultasi hukum atau tafsir pasal undang-undang.\n\nUntuk materi hukum dan ketatanegaraan siswa, kamu dapat membaca dan meminjam buku referensi **Pendidikan Pancasila dan Kewarganegaraan (PPKN)** yang tersedia di rak perpustakaan kami.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-guardrail",
    };
  }

  // A. Emosi / Curhat / Sedih / Galau / Capek
  if (/(sedih|nangis|menangis|galau|kecewa|capek|lelah|down|hampa|patah hati|tertekan|stres|stress|depresi|putus asa|berat banget|lagi down)/i.test(cleanMsg)) {
    return {
      reply: `Wajar sekali jika ada hari-hari di mana kita merasa lelah atau penat dengan kegiatan belajar. Ambil jeda sejenak untuk beristirahat.\n\nJika kamu butuh pengalihan pikiran yang menenangkan, kamu bisa datang ke perpustakaan untuk membaca buku cerita santai atau novel fiksi yang inspiratif.`,
      recommendations: mapBooks(fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  // B. Sapaan / Salam
  if (/^(halo|hai|hey|hei|p|halo p|assalamu|assalamualaikum|assalamu'alaikum|selamat pagi|selamat siang|selamat sore|selamat malam)/i.test(cleanMsg)) {
    const greetings = [
      `Halo! Selamat datang di layanan Perpustakaan SMKN 1 Beringin. Ada judul buku, e-book, atau informasi perpustakaan yang bisa saya bantu carikan hari ini?`,
      `Selamat datang di Perpustakaan Digital SMKN 1 Beringin. Saya siap mendampingi kamu menemukan buku pelajaran atau referensi kejuruan.`,
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // C. Identitas
  if (/siapa kamu|kamu siapa|tentang kamu|nama kamu|siapa namamu/i.test(cleanMsg)) {
    return {
      reply: `Saya **Tanya Pustaka**, asisten virtual resmi di **Perpustakaan SMK Negeri 1 Beringin**.\n\nTugas saya khusus membantu warga sekolah dalam:\n- Menemukan buku cetak di rak fisik perpustakaan.\n- Mengakses koleksi e-book digital secara daring.\n- Panduan peminjaman mandiri 7 hari di Kiosk perpustakaan.\n- Memberikan rekomendasi bacaan literasi sesuai minat atau jurusanmu.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // D. Jam Operasional
  if (/jam|buka|tutup|operasional|hari apa|jadwal/i.test(cleanMsg)) {
    return {
      reply: `**Jam Operasional Perpustakaan SMKN 1 Beringin:**\n\n- **Hari:** Senin s/d Jumat\n- **Waktu Layanan Fisik:** 07.30 – 16.00 WIB\n- **Sabtu & Minggu:** Libur / Tutup\n\n*Catatan:* Portal perpustakaan web dan koleksi **E-Book** dapat dibaca online **24 jam** nonstop dari HP atau laptop.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // E. Aturan Pinjam / Denda / Kiosk
  if (/cara pinjam|syarat pinjam|aturan pinjam|kiosk|pinjam mandiri|denda|terlambat/i.test(cleanMsg)) {
    return {
      reply: `**Panduan Peminjaman Buku di SMKN 1 Beringin:**\n\n1. Cari buku di katalog web ini atau langsung di rak fisik perpustakaan.\n2. Datangi mesin **Kiosk Mandiri** di perpustakaan.\n3. Masukkan NISN atau scan barcode kartu perpustakaan kamu.\n4. Scan barcode buku yang ingin dipinjam.\n5. Durasi peminjaman adalah **7 hari** (dapat diperpanjang).\n6. Pengingat otomatis akan dikirimkan via WhatsApp sebelum masa pinjam berakhir agar terhindar dari denda.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // F. 7 Jurusan di SMKN 1 Beringin
  if (/jurusan|pplg|tjkt|busana|kuliner|perhotelan|ulw|kecantikan/i.test(cleanMsg)) {
    return {
      reply: `Perpustakaan SMKN 1 Beringin menyediakan modul pembelajaran dan buku kejuruan untuk 7 konsentrasi keahlian:\n- **PPLG:** Pemrograman dan rekayasa perangkat lunak (Rak Komputer).\n- **TJKT:** Jaringan komputer dan telekomunikasi (Rak Jaringan).\n- **Busana:** Desain dan produksi busana (Rak Tata Busana).\n- **Kuliner:** Pengolahan makanan dan boga (Rak Tata Boga).\n- **Perhotelan:** Layanan perhotelan dan front office (Rak Pariwisata).\n- **ULW:** Usaha layanan wisata dan tour planning (Rak Wisata).\n- **Kecantikan & Spa:** Tata rias dan perawatan (Rak Tata Kecantikan).\n\nSilakan sebutkan jurusan atau topik yang sedang kamu pelajari agar saya bantu carikan bukunya.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  // G. Pencarian Buku Relevan di Database
  if (relevantBooks.length > 0) {
    return {
      reply: `Berikut beberapa buku di katalog Perpustakaan SMKN 1 Beringin yang sesuai dengan pencarian "${raw}":\n\nKamu dapat langsung membaca secara daring (jika bertanda E-Book) atau meminjam buku fisik di rak perpustakaan.`,
      recommendations: mapBooks(relevantBooks),
      provider: "pustaka-local",
    };
  }

  // H. Respon Penutup Standar Perpustakaan
  return {
    reply: `Halo! Sebagai asisten perpustakaan, saya siap membantumu mencari judul buku, mengecek lokasi rak buku, atau panduan peminjaman di perpustakaan SMKN 1 Beringin.\n\nApakah ada judul buku atau topik pelajaran yang ingin kamu cari di katalog kami?`,
    recommendations: mapBooks(fallbackCatalog),
    provider: "pustaka-local",
  };
}
