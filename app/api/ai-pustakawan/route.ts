import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

interface ChatHistoryItem {
  sender: "user" | "bot";
  text: string;
}

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

    // Batasi panjang pesan maksimal 500 karakter & bersihkan null-byte
    const raw = sanitizeInput(message, 500);
    if (!raw) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }
    const cleanMsg = raw.toLowerCase().trim();

    // 1. Ekstrak kata kunci untuk pencarian di database buku
    const stopWords = new Set([
      "buku", "tentang", "yang", "mau", "ada", "rekomendasi", "cari", "kak", "tolong", 
      "dong", "buat", "baca", "apa", "aja", "saya", "aku", "rekomendasikan", "pengen", 
      "info", "katalog", "apakah", "bagaimana", "punya", "bisa", "kasih", "tahu", "hari", "ini"
    ]);
    const searchTerms = cleanMsg
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
      .slice(0, 5); // Batasi maksimal 5 kata kunci untuk mencegah Query DoS & ReDoS

    // Cari buku relevan di database
    let relevantBooks: any[] = [];
    if (searchTerms.length > 0) {
      relevantBooks = await prisma.buku.findMany({
        where: {
          OR: searchTerms.map((term) => ({
            OR: [
              { judul: { contains: term, mode: "insensitive" } },
              { penulis: { contains: term, mode: "insensitive" } },
              { kategori: { contains: term, mode: "insensitive" } },
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

    // 2. OPSIONAL: JIKA ADA GOOGLE GEMINI API KEY AKTIF
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        const catalogSummary = catalogToUse
          .map((b) => {
            const rak = b.eksemplar?.[0]?.rak?.nama ? ` (Rak: ${b.eksemplar[0].rak.nama})` : "";
            const ebook = b.is_ebook || b.file_url ? " [E-Book]" : "";
            return `- "${b.judul}" oleh ${b.penulis} [Stok: ${b.stok_tersedia}]${rak}${ebook}`;
          })
          .join("\n");

        const prompt = `Kamu adalah "Tanya Pustaka", pustakawan digital resmi Perpustakaan SMK Negeri 1 Beringin.
Karakter:
- Bersikap layaknya pustakawan sekolah profesional: ramah, sopan, membantu, dan edukatif.
- Hindari bahasa robot atau istilah teknis AI yang berlebihan. Gunakan bahasa Indonesia yang santun dan mudah dipahami siswa serta guru.
- Format jawaban rapi dengan poin bullet dan penekanan teks penting.
- DILARANG menggunakan emoji. Jangan gunakan emoji dalam bentuk apa pun pada seluruh respon.
- Jam operasional perpustakaan: Senin - Jumat pukul 07.30 s/d 16.00 WIB (Katalog & E-Book dapat diakses online 24 jam).
- Jurusan SMKN 1 Beringin: PPLG, TJKT, Tata Busana, Kuliner, Perhotelan, Usaha Layanan Wisata (ULW), Tata Kecantikan.
- Masa peminjaman buku cetak: 7 hari kalender, dapat dilakukan mandiri di Kiosk perpustakaan.

Katalog Buku Relevan:
${catalogSummary || "- Katalog umum perpustakaan tersedia"}

Pesan Siswa: "${raw}"`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
            signal: AbortSignal.timeout(5000), // Timeout 5 detik agar tidak menggantung
          }
        );

        if (geminiRes.ok) {
          const aiData = await geminiRes.json();
          const replyText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            const matchedBooks = extractRecommendedBooks(replyText, cleanMsg, catalogToUse);
            return NextResponse.json({
              reply: replyText,
              recommendations: matchedBooks,
              provider: "pustaka-ai",
            });
          }
        }
      } catch (err: any) {
        console.warn("[Gemini Fallback] Mengalihkan ke Smart Conversational Engine:", err?.message);
      }
    }

    // 3. SMART CONVERSATIONAL ENGINE (Bawaan cepat, tanpa ketergantungan API pihak ketiga yang down)
    const smartFallback = generateSmartResponse(raw, cleanMsg, relevantBooks, fallbackCatalog);
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

// Mesin Cerdas Berbasis Pengetahuan Sekolah & Database Lokal
function generateSmartResponse(raw: string, cleanMsg: string, relevantBooks: any[], fallbackCatalog: any[]) {
  // Format helper buku
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

  // A. Emosi / Curhat / Sedih / Galau / Capek
  if (/(sedih|nangis|menangis|galau|kecewa|capek|lelah|down|hampa|patah hati|tertekan|stres|stress|depresi|putus asa|berat banget|lagi down)/i.test(cleanMsg)) {
    return {
      reply: `Wajar sekali jika ada hari-hari di mana kita merasa lelah, sedih, atau terbebani. Perasaan yang sedang kamu alami saat ini sangat manusiawi dan valid.\n\nJangan memaksakan diri terlalu keras. Ambil jeda sejenak, tarik napas perlahan, dan istirahat sejenak. Jika kamu butuh pengalihan pikiran yang menenangkan, membaca cerita santai atau novel fiksi di perpustakaan bisa jadi teman yang baik.\n\nTetap semangat, setiap tantangan akan membantumu tumbuh lebih kuat.`,
      recommendations: mapBooks(fallbackCatalog),
      provider: "pustaka-ai",
    };
  }

  // B. Senang / Bahagia / Gembira / Bersyukur
  if (/(senang|bahagia|gembira|alhamdulillah|bersyukur|happy|ceria)/i.test(cleanMsg)) {
    return {
      reply: `Senang mendengarnya. Tetap jaga semangat belajar dan energi positifmu. Semoga harimu di SMK Negeri 1 Beringin selalu produktif dan menyenangkan.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // C. Sapaan / Salam
  if (/^(halo|hai|hey|hei|p|halo p|assalamu|assalamualaikum|assalamu'alaikum|selamat pagi|selamat siang|selamat sore|selamat malam)/i.test(cleanMsg)) {
    const greetings = [
      `Halo, selamat datang di layanan Perpustakaan SMKN 1 Beringin. Ada yang bisa saya bantu terkait buku pelajaran, materi kejuruan, atau layanan pustaka hari ini?`,
      `Selamat datang di Perpustakaan Digital SMKN 1 Beringin. Saya siap membantu keperluan literasi dan referensi belajarmu.`,
      `Wa'alaikumsalam / Halo. Tanya Pustaka siap mendampingi kamu mencari referensi buku atau e-book di perpustakaan.`,
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // D. Apa Kabar
  if (/apa kabar|gimana kabarmu|bagaimana kabarmu/i.test(cleanMsg)) {
    return {
      reply: `Kabar baik dan sistem perpustakaan beroperasi normal. Terima kasih sudah menyapa. Bagaimana dengan kegiatan belajarmu hari ini?`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // E. Identitas
  if (/siapa kamu|kamu siapa|tentang kamu|nama kamu|siapa namamu/i.test(cleanMsg)) {
    return {
      reply: `Saya **Tanya Pustaka**, layanan bantuan virtual resmi di **Perpustakaan SMK Negeri 1 Beringin**.\n\nSaya siap membantu siswa dan guru dalam:\n- Menemukan buku cetak di rak fisik dan koleksi e-book digital.\n- Informasi materi pelajaran umum dan 7 konsentrasi keahlian SMK.\n- Informasi jam operasional dan tata tertib peminjaman di Kiosk.\n- Rekomendasi bacaan untuk mendukung kegiatan literasi sekolah.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  if (/siapa yang bikin|siapa pembuatmu|siapa ciptakan kamu|dibuat oleh siapa/i.test(cleanMsg)) {
    return {
      reply: `Layanan Tanya Pustaka dikembangkan oleh tim Perpustakaan SMK Negeri 1 Beringin untuk memudahkan seluruh warga sekolah mengakses informasi pustaka dan buku secara mandiri.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // F. Jam Operasional
  if (/jam|buka|tutup|operasional|hari apa|jadwal/i.test(cleanMsg)) {
    return {
      reply: `**Jam Operasional Perpustakaan SMKN 1 Beringin:**\n\n- **Hari:** Senin s/d Jumat\n- **Waktu Layanan Fisik:** 07.30 – 16.00 WIB\n- **Sabtu & Minggu:** Libur / Tutup\n\n*Catatan:* Portal perpustakaan web dan koleksi **E-Book** dapat dibaca online **24 jam** nonstop dari HP atau laptop.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // G. Aturan Pinjam / Denda / Kiosk
  if (/cara pinjam|syarat pinjam|aturan pinjam|kiosk|pinjam mandiri|denda|terlambat/i.test(cleanMsg)) {
    return {
      reply: `**Panduan Peminjaman Buku di SMKN 1 Beringin:**\n\n1. Cari buku di katalog web ini atau langsung di rak fisik perpustakaan.\n2. Datangi mesin **Kiosk Mandiri** di perpustakaan.\n3. Masukkan NISN atau scan barcode kartu perpustakaan kamu.\n4. Scan barcode buku yang ingin dipinjam.\n5. Durasi peminjaman adalah **7 hari** (dapat diperpanjang).\n6. Pengingat otomatis akan dikirimkan via WhatsApp sebelum masa pinjam berakhir agar terhindar dari denda.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // H. Jurusan di SMKN 1 Beringin
  if (/jurusan|pplg|tjkt|busana|kuliner|perhotelan|ulw|kecantikan|sekolah/i.test(cleanMsg)) {
    return {
      reply: `**7 Kompetensi Keahlian di SMK Negeri 1 Beringin:**\n\n1. **PPLG** (Pengembangan Perangkat Lunak dan Gim) — Rekayasa perangkat lunak, pemrograman web, mobile, dan basis data.\n2. **TJKT** (Teknik Jaringan Komputer & Telekomunikasi) — Jaringan komputer, administrasi server, fiber optic, dan keamanan jaringan.\n3. **Busana** (Tata Busana) — Desain busana, pembuatan pola, dan produksi busana.\n4. **Kuliner** (Tata Boga) — Pengolahan makanan nusantara/internasional, tata hidang, dan pastry.\n5. **Perhotelan** — Layanan front office, tata graha (housekeeping), dan operasional hotel.\n6. **ULW** (Usaha Layanan Wisata) — Pemanduan wisata, perencanaan perjalanan, dan tiket reservasi.\n7. **Kecantikan & Spa** — Perawatan kulit, tata rias, dan perawatan rambut.\n\nPerpustakaan menyediakan modul pelajaran dan buku referensi untuk seluruh jurusan ini.`,
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  // I. Coding & Pemrograman
  if (/coding|pemrograman|javascript|python|php|html|css|database|sql|koding/i.test(cleanMsg)) {
    const itBooks = (relevantBooks.length > 0 ? relevantBooks : fallbackCatalog).filter((b) =>
      /komputer|program|coding|jaringan|it|informatika|web|data/i.test(b.judul + (b.kategori || ""))
    );

    return {
      reply: `**Panduan Belajar Pemrograman:**\n\nKunci utama menguasai pemrograman adalah pemahaman konsep dasar dan latihan konsisten:\n1. Kuasai dasar logika pemrograman dan algoritma.\n2. Untuk Web: pelajari HTML, CSS, dan JavaScript secara bertahap.\n3. Untuk Backend & Data: pelajari bahasa pemrograman seperti PHP, Python, atau Node.js serta dasar SQL.\n4. Manfaatkan buku dan modul di perpustakaan sebagai referensi terstruktur.`,
      recommendations: mapBooks(itBooks.length > 0 ? itBooks : fallbackCatalog),
      provider: "pustaka-ai",
    };
  }

  // J. Pantun, Motivasi
  if (/pantun/i.test(cleanMsg)) {
    const pantunList = [
      "Pergi ke pasar membeli durian,\nDurian manis harum baunya.\nJangan malas membaca kawan,\nIlmu berguna sepanjang usia.",
      "Pagi hari embun menetes,\nBurung berkicau riang gembira.\nBelajar giat raihlah sukses,\nBanggakan sekolah dan orang tua.",
      "Pohon beringin rindang daunnya,\nTempat berteduh kala panas terik.\nBuku jendela ilmu dunia,\nMembaca rutin masa depan terbaik.",
    ];
    return {
      reply: pantunList[Math.floor(Math.random() * pantunList.length)],
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  if (/lelucon|jokes|lucu|humor|tebak-tebakan|tebakan/i.test(cleanMsg)) {
    const jokes = [
      "Kenapa keyboard komputer suka galau? Karena selalu ada 'Space' di antara tombol-tombolnya.",
      "Kenapa buku matematika selalu kelihatan rumit? Karena dari dulu soal dan masalahnya belum selesai-selesai.",
      "Pintu apa yang didorong sepuluh orang kuat tetap tidak terbuka? Jawabannya: Pintu yang tulisannya 'TARIK'.",
    ];
    return {
      reply: jokes[Math.floor(Math.random() * jokes.length)],
      recommendations: [],
      provider: "pustaka-ai",
    };
  }

  if (/malas|semangat|motivasi|tips belajar/i.test(cleanMsg)) {
    return {
      reply: `**Motivasi Belajar:**\n\n*\"Lelahnya belajar hari ini jauh lebih baik daripada perihnya penyesalan di masa depan.\"*\n\nJika merasa lelah, beristirahatlah sejenak untuk memulihkan energi, lalu lanjutkan kembali. Setiap hal yang kamu pelajari hari ini adalah bekal berharga untuk masa depanmu.`,
      recommendations: mapBooks(fallbackCatalog),
      provider: "pustaka-ai",
    };
  }

  // K. Pencarian Buku Relevan di Database
  if (relevantBooks.length > 0) {
    return {
      reply: `Berikut beberapa buku di katalog Perpustakaan SMKN 1 Beringin yang sesuai dengan pencarian "${raw}":\n\nKamu dapat langsung membaca secara daring (jika bertanda E-Book) atau meminjam buku fisik di rak perpustakaan.`,
      recommendations: mapBooks(relevantBooks),
      provider: "pustaka-ai",
    };
  }

  // L. Respon Terbuka / General Conversation
  return {
    reply: `Terkait pertanyaan "${raw}", saya siap membantu memberikan referensi bahan ajar, informasi operasional perpustakaan, maupun katalog buku yang tersedia di SMKN 1 Beringin.\n\nBerikut beberapa rekomendasi buku pilihan yang dapat kamu baca:`,
    recommendations: mapBooks(fallbackCatalog),
    provider: "pustaka-ai",
  };
}
