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

    // Batasi panjang pesan maksimal 600 karakter & bersihkan null-byte
    const raw = sanitizeInput(message, 600);
    if (!raw) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }
    const cleanMsg = raw.toLowerCase().trim();

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

    // 3. UTAMA: GOOGLE GEMINI AI ENGINE DENGAN MULTI-TURN CONVERSATION MEMORY
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        const catalogSummary = catalogToUse
          .map((b) => {
            const rak = b.eksemplar?.[0]?.rak?.nama ? ` (Rak Fisik: ${b.eksemplar[0].rak.nama})` : "";
            const ebook = b.is_ebook || b.file_url ? " [Tersedia E-Book Online]" : "";
            return `- "${b.judul}" karya ${b.penulis} [Stok: ${b.stok_tersedia}]${rak}${ebook}`;
          })
          .join("\n");

        const systemPrompt = `Kamu adalah "Tanya Pustaka", pustakawan virtual cerdas, berilmu luas, dan asisten belajar resmi di Perpustakaan SMK Negeri 1 Beringin.

Karakter & Nilai Utama:
- Berpendidikan tinggi, ramah, edukatif, santun, dan sangat menguasai materi kejuruan maupun akademik sekolah.
- Mampu menjawab beragam topik: materi pelajaran, tugas sekolah, konsep teori, penjelasan coding, rumus sains, bimbingan kejuruan, hingga rekomendasi dan ringkasan buku.
- Menjawab dengan bahasa Indonesia yang jelas, runut, memakai poin-poin terstruktur jika diperlukan, dan memberikan contoh konkret.
- DILARANG menggunakan kata-kata klise AI slop: "delve", "tapestry", "landscape", "pivotal", "robust", "seamlessly", "di era digital yang serba cepat ini".
- Hindari penggunaan emoji yang berlebihan. Respon harus tetap rapi, profesional, dan nyaman dibaca.

Informasi Resmi SMKN 1 Beringin:
- Motto Sekolah: "Berilmu, Berkarakter, Berdaya Saing".
- 7 Konsentrasi Keahlian / Jurusan:
  1. PPLG (Pengembangan Perangkat Lunak dan Gim)
  2. TJKT (Teknik Jaringan Komputer dan Telekomunikasi)
  3. Desain & Produksi Busana (Tata Busana)
  4. Kuliner (Tata Boga)
  5. Perhotelan (Hospitality)
  6. Usaha Layanan Wisata (ULW)
  7. Tata Kecantikan & Spa
- Jam Layanan Fisik Perpustakaan: Senin - Jumat pukul 07.30 s/d 16.00 WIB (Portal Katalog & E-Book dapat diakses 24 jam).
- Peminjaman Buku Cetak: Durasi 7 hari kalender, peminjaman mandiri melalui Kiosk digital dengan scan NISN/kartu siswa dan barcode buku. Pengingat batas waktu dikirim otomatis via WhatsApp.

Data Buku Relevan di Perpustakaan Saat Ini:
${catalogSummary || "- Katalog umum perpustakaan tersedia"}

Jika siswa bertanya tentang buku atau rekomendasi bacaan, sebutkan judul buku yang relevan dari data di atas beserta informasi rak dan stoknya secara jelas. Jika siswa bertanya tentang konsep pelajaran/teori/kejuruan, jelaskan dengan cerdas, akurat, dan mudah dipahami.`;

        // Susun riwayat obrolan (Multi-turn conversation memory)
        const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history) && history.length > 0) {
          // Ambil maksimal 8 percakapan terakhir agar konteks utuh tapi hemat token
          for (const item of history.slice(-8)) {
            if (item && typeof item.text === "string" && item.text.trim()) {
              contents.push({
                role: item.sender === "user" ? "user" : "model",
                parts: [{ text: item.text.slice(0, 800) }],
              });
            }
          }
        }

        // Tambahkan pesan user saat ini
        contents.push({
          role: "user",
          parts: [{ text: raw }],
        });

        // Request ke model Gemini Flash terbaru (dengan fallback bertingkat)
        const candidateModels = [
          "gemini-flash-lite-latest",
          "gemini-3.5-flash-lite",
          "gemini-flash-latest",
          "gemini-2.5-flash"
        ];
        let aiReplyText: string | null = null;

        for (const modelName of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey.trim()}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: systemPrompt }],
                  },
                  contents: contents,
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1200,
                  },
                }),
                signal: AbortSignal.timeout(12000), // Timeout 12 detik
              }
            );

            if (geminiRes.ok) {
              const aiData = await geminiRes.json();
              const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.trim()) {
                aiReplyText = text.trim();
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`[Gemini API] Percobaan model ${modelName} gagal:`, modelErr);
          }
        }

        if (aiReplyText) {
          const matchedBooks = extractRecommendedBooks(aiReplyText, cleanMsg, catalogToUse);
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

    // 4. MESIN PENGETAHUAN CERDAS BAWAAN (OFFLINE ENHANCED ENGINE)
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

// Mesin Cerdas Berbasis Pengetahuan Sekolah & Database Lokal (Offline Fallback Engine)
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

  // A. Emosi / Curhat / Sedih / Galau / Capek
  if (/(sedih|nangis|menangis|galau|kecewa|capek|lelah|down|hampa|patah hati|tertekan|stres|stress|depresi|putus asa|berat banget|lagi down)/i.test(cleanMsg)) {
    return {
      reply: `Wajar sekali jika ada hari-hari di mana kita merasa lelah, sedih, atau terbebani. Perasaan yang sedang kamu alami saat ini sangat manusiawi dan valid.\n\nJangan memaksakan diri terlalu keras. Ambil jeda sejenak, tarik napas perlahan, dan istirahat sejenak. Jika kamu butuh pengalihan pikiran yang menenangkan, membaca cerita santai atau novel fiksi di perpustakaan bisa jadi teman yang baik.\n\nTetap semangat, setiap tantangan akan membantumu tumbuh lebih kuat.`,
      recommendations: mapBooks(fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  // B. Senang / Bahagia / Gembira / Bersyukur
  if (/(senang|bahagia|gembira|alhamdulillah|bersyukur|happy|ceria)/i.test(cleanMsg)) {
    return {
      reply: `Senang mendengarnya. Tetap jaga semangat belajar dan energi positifmu. Semoga harimu di SMK Negeri 1 Beringin selalu produktif dan menyenangkan.`,
      recommendations: [],
      provider: "pustaka-local",
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
      provider: "pustaka-local",
    };
  }

  // D. Apa Kabar
  if (/apa kabar|gimana kabarmu|bagaimana kabarmu/i.test(cleanMsg)) {
    return {
      reply: `Kabar baik dan sistem perpustakaan beroperasi normal. Terima kasih sudah menyapa. Bagaimana dengan kegiatan belajarmu hari ini?`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // E. Identitas
  if (/siapa kamu|kamu siapa|tentang kamu|nama kamu|siapa namamu/i.test(cleanMsg)) {
    return {
      reply: `Saya **Tanya Pustaka**, pustakawan virtual dan asisten literasi resmi di **Perpustakaan SMK Negeri 1 Beringin**.\n\nSaya siap membantu siswa dan guru dalam:\n- Menemukan buku cetak di rak fisik dan koleksi e-book digital.\n- Menjelaskan materi pelajaran umum dan 7 konsentrasi keahlian SMK.\n- Informasi jam operasional dan tata tertib peminjaman di Kiosk.\n- Rekomendasi bacaan untuk mendukung kegiatan literasi sekolah.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  if (/siapa yang bikin|siapa pembuatmu|siapa ciptakan kamu|dibuat oleh siapa/i.test(cleanMsg)) {
    return {
      reply: `Layanan Tanya Pustaka dikembangkan oleh tim Perpustakaan SMK Negeri 1 Beringin untuk memudahkan seluruh warga sekolah mengakses informasi pustaka dan buku secara mandiri.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // F. Jam Operasional
  if (/jam|buka|tutup|operasional|hari apa|jadwal/i.test(cleanMsg)) {
    return {
      reply: `**Jam Operasional Perpustakaan SMKN 1 Beringin:**\n\n- **Hari:** Senin s/d Jumat\n- **Waktu Layanan Fisik:** 07.30 – 16.00 WIB\n- **Sabtu & Minggu:** Libur / Tutup\n\n*Catatan:* Portal perpustakaan web dan koleksi **E-Book** dapat dibaca online **24 jam** nonstop dari HP atau laptop.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // G. Aturan Pinjam / Denda / Kiosk
  if (/cara pinjam|syarat pinjam|aturan pinjam|kiosk|pinjam mandiri|denda|terlambat/i.test(cleanMsg)) {
    return {
      reply: `**Panduan Peminjaman Buku di SMKN 1 Beringin:**\n\n1. Cari buku di katalog web ini atau langsung di rak fisik perpustakaan.\n2. Datangi mesin **Kiosk Mandiri** di perpustakaan.\n3. Masukkan NISN atau scan barcode kartu perpustakaan kamu.\n4. Scan barcode buku yang ingin dipinjam.\n5. Durasi peminjaman adalah **7 hari** (dapat diperpanjang).\n6. Pengingat otomatis akan dikirimkan via WhatsApp sebelum masa pinjam berakhir agar terhindar dari denda.`,
      recommendations: [],
      provider: "pustaka-local",
    };
  }

  // H. Pengetahuan 7 Konsentrasi Keahlian SMKN 1 Beringin
  if (/pplg|coding|pemrograman|web|software|aplikasi|frontend|backend|database|sql|python|javascript|php/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan PPLG (Pengembangan Perangkat Lunak & Gim):**\n\nJurusan PPLG di SMKN 1 Beringin mempelajari pembuatan perangkat lunak, aplikasi web, mobile, dan game. Kunci sukses di jurusan ini:\n1. **Logika Dasar:** Struktur algoritma, variabel, percabangan (if/else), perulangan (loop), dan fungsi.\n2. **Web Development:** HTML5, CSS3/Tailwind, JavaScript modern, dan framework seperti React/Next.js.\n3. **Backend & Basis Data:** PHP/Node.js/Python serta perancangan database relasional SQL (MySQL/PostgreSQL).\n4. **Manajemen Versi:** Menguasai Git & GitHub untuk kolaborasi proyek.\n\nPerpustakaan menyediakan buku-buku pemrograman dan modul kejuruan di Rak Komputer & Informatika.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/tjkt|jaringan|network|mikrotik|cisco|router|switch|lan|wan|ip address|subnetting|fiber|server/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan TJKT (Teknik Jaringan Komputer & Telekomunikasi):**\n\nJurusan TJKT di SMKN 1 Beringin fokus pada instalasi, konfigurasi, dan pengamanan infrastruktur jaringan:\n1. **Dasar Jaringan:** Model OSI Layer, TCP/IP, pengalamatan IPv4 & IPv6, serta teknik Subnetting (VLSM/CIDR).\n2. **Routing & Switching:** Konfigurasi perangkat router/switch (Mikrotik, Cisco), VLAN, DHCP, NAT, dan firewall.\n3. **Telekomunikasi:** Penyambungan kabel Fiber Optic (splicing), OTB, ODP, dan teknologi transmisi nirkabel.\n4. **Administrasi Server:** Instalasi Linux Server (Debian/Ubuntu Server), web server, DNS, dan cloud computing.\n\nModul praktikum dan buku referensi jaringan tersedia di Rak Jaringan & Sistem Komputer.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/busana|fashion|pola baju|menjahit|kain|tekstil|draping/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan Desain & Produksi Busana:**\n\nJurusan Tata Busana membekali siswa keahlian merancang hingga memproduksi pakaian siap pakai (ready-to-wear) maupun adibusana:\n1. **Desain Busana:** Ilustrasi mode, proporsi anatomi tubuh, pemilihan warna, dan analisis tren busana.\n2. **Konstruksi Pola:** Pembuatan pola dasar wanita/pria/anak, pecah pola, grading, dan teknik draping.\n3. **Teknologi Menjahit:** Pengoperasian mesin jahit industri, mesin obras, teknik penyelesaian tepi, dan pemasangan furing.\n4. **Pengetahuan Tekstil:** Karakteristik serat alami (katun, sutra, wol) dan sintetis (poliester, nilon).\n\nBuku desain mode dan panduan pembuatan pola tersedia di Rak Tata Busana & Desain.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/kuliner|tata boga|masak|resep|pastry|bakery|boga|food/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan Kuliner (Tata Boga):**\n\nJurusan Kuliner di SMKN 1 Beringin melatih keterampilan memasak profesional berstandar industri perhotelan dan restoran:\n1. **Sanitasi & K3:** Penerapan HACCP, personal hygiene, penanganan bahan makanan aman, dan keselamatan kerja dapur.\n2. **Pengolahan Nusantara & Kontinental:** Teknik dasar pengolahan (boiling, sautéing, roasting, braising), pembuatan stok, saus dasar (mother sauces), dan hidangan utama.\n3. **Pastry & Bakery:** Pembuatan roti (yeast dough), kue (sponge cake, butter cake), pastry (puff/choux), dan dekorasi kue.\n4. **Food Costing & Tata Hidang:** Perhitungan harga pokok produksi (HPP), penataan meja (table set-up), dan layanan restoran.\n\nBuku resep dan standar kuliner tersedia di Rak Kuliner & Tata Boga.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/perhotelan|hotel|front office|housekeeping|tamu|kamar/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan Perhotelan:**\n\nJurusan Perhotelan membina keahlian operasional akomodasi dan keramahan (hospitality service):\n1. **Front Office (Kantor Depan):** Prosedur reservasi, check-in, check-out, penanganan telepon (telephone courtesy), dan informasi tamu.\n2. **Housekeeping (Tata Graha):** Pembersihan dan penataan kamar tamu (making bed), pemeliharaan area publik, dan penanganan linen/laundry.\n3. **Hospitality Attitude:** Standar grooming, etika komunikasi profesional, dan penanganan keluhan tamu (guest complaints).\n\nBuku operasional hotel dan pelayanan tamu tersedia di Rak Pariwisata & Perhotelan.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/ulw|wisata|tour|travel|itinerary|pemandu/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan Usaha Layanan Wisata (ULW):**\n\nJurusan ULW menyiapkan tenaga profesional di industri perjalanan dan pariwisata:\n1. **Perencanaan Perjalanan Wisata:** Penyusunan paket tour (itinerary planning), perhitungan harga paket wisata, dan reservasi tiket/akomodasi.\n2. **Pemanduan Wisata (Tour Guiding):** Teknik komunikasi pemandu wisata, penguasaan objek wisata lokal/nasional, dan etika mendampingi wisatawan.\n3. **MICE & Event:** Pengelolaan pertemuan, insentif, konvensi, dan pameran (MICE).\n\nModul pariwisata dan geografi wisata tersedia di Rak Layanan Wisata.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  if (/kecantikan|spa|makeup|tata rias|kulit|rambut/i.test(cleanMsg)) {
    return {
      reply: `**Materi Kejuruan Tata Kecantikan & Spa:**\n\nJurusan Kecantikan mengajarkan perawatan kecantikan estetika kulit, rambut, dan tata rias:\n1. **Perawatan Kulit Wajah:** Analisis jenis kulit, pembersihan mendalam (facial), masker, dan penggunaan alat kecantikan modern.\n2. **Tata Rias (Makeup Artistry):** Rias wajah sehari-hari, rias panggung, rias pengantin adat/modern, dan koreksi bentuk wajah.\n3. **Perawatan Rambut & Tubuh:** Pangkas rambut dasar, pewarnaan, penataan sanggul, perawatan tangan & kaki (manicure-pedicure), serta body massage/spa.\n\nBuku anatomi kecantikan dan modul tata rias tersedia di Rak Tata Kecantikan.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  // I. Mata Pelajaran Umum (Matematika, IPA, Bahasa)
  if (/matematika|rumus|aljabar|trigonometri|kalkulus|integral|turunan|persamaan|hitung/i.test(cleanMsg)) {
    return {
      reply: `**Pembahasan Materi Matematika:**\n\nMatematika mengasah kemampuan bernalar logis dan pemecahan masalah secara terstruktur:\n- **Aljabar:** Persamaan linear, kuadrat, sistem persamaan (SPLDV/SPLTV), dan matriks.\n- **Geometri & Trigonometri:** Perhitungan sudut, teorema Pythagoras, aturan sinus/cosinus, dan bangun ruang.\n- **Statistika & Peluang:** Mean, median, modus, kuartil, dan permutasi/kombinasi.\n\nTips belajar: Jangan hanya menghafal rumus, pahami pola konsep dan latih soal-soal bertingkat dari mudah ke menantang. Buku pelajaran Matematika Kurikulum Merdeka tersedia lengkap di perpustakaan.`,
      recommendations: mapBooks(relevantBooks.length > 0 ? relevantBooks : fallbackCatalog),
      provider: "pustaka-local",
    };
  }

  // J. Pencarian Buku Relevan di Database
  if (relevantBooks.length > 0) {
    return {
      reply: `Berikut beberapa buku di katalog Perpustakaan SMKN 1 Beringin yang sesuai dengan pencarian "${raw}":\n\nKamu dapat langsung membaca secara daring (jika bertanda E-Book) atau meminjam buku fisik di rak perpustakaan.`,
      recommendations: mapBooks(relevantBooks),
      provider: "pustaka-local",
    };
  }

  // K. Respon Bantuan Terbuka (Ketika belum terkoneksi ke Gemini AI)
  return {
    reply: `Halo! Saya **Tanya Pustaka**, siap membantumu mencari referensi buku, materi 7 jurusan kejuruan SMKN 1 Beringin, atau layanan perpustakaan.\n\n*Tips Pintar:* Untuk mengaktifkan kecerdasan percakapan tanpa batas (mampu menjawab semua tugas, merangkum buku apapun, dan menguraikan soal sains/coding secara bebas), silakan hubungkan **Google Gemini API Key** di pengaturan sistem perpustakaan.\n\nSementara itu, berikut beberapa rekomendasi buku pilihan yang dapat kamu pelajari:`,
    recommendations: mapBooks(fallbackCatalog),
    provider: "pustaka-local",
  };
}
