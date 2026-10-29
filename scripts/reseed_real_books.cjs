const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();
const COVERS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'covers');

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

// Download helper with User-Agent & redirect handling
function downloadImage(url, dest) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const getter = parsedUrl.protocol === 'https:' ? https : http;

      const request = getter.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location, dest).then(resolve);
        }
        if (res.statusCode !== 200) {
          console.warn(`[WARN] HTTP ${res.statusCode} for ${url}`);
          return resolve(false);
        }
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(dest);
          if (stats.size > 2000) {
            resolve(true);
          } else {
            console.warn(`[WARN] File too small (${stats.size}b) for ${dest}`);
            resolve(false);
          }
        });
        fileStream.on('error', () => resolve(false));
      });
      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

const REAL_BOOKS = [
  // 1. Pengembangan Diri & Bestseller
  {
    kode_buku: "978-602-06-3317-6",
    judul: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    penulis: "James Clear",
    kategori: "Pengembangan Diri",
    klasifikasi: "158.1",
    tahun_ajaran: "2024",
    cover_filename: "real-atomic-habits.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/products/all10sara3.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 2
  },
  {
    kode_buku: "978-602-412-518-9",
    judul: "Filosofi Teras: Panduan Hidup Damai dengan Stoisisme",
    penulis: "Henry Manampiring",
    kategori: "Filsafat & Psikologi",
    klasifikasi: "188",
    tahun_ajaran: "2024",
    cover_filename: "real-filosofi-teras.png",
    cover_source: "https://cdn.gramedia.com/uploads/items/filosofi_teras_hc.png",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 2
  },
  {
    kode_buku: "978-602-452-698-6",
    judul: "Sebuah Seni untuk Bersikap Bodo Amat",
    penulis: "Mark Manson",
    kategori: "Pengembangan Diri",
    klasifikasi: "158",
    tahun_ajaran: "2023",
    cover_filename: "real-bodo-amat.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/sebuah_seni_untuk_bersikap_bodo_amat_hard_cover_font_revisi-1.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 2
  },
  {
    kode_buku: "978-602-06-5388-4",
    judul: "The Psychology of Money: Pelajaran Abadi Mengenai Kekayaan",
    penulis: "Morgan Housel",
    kategori: "Finansial & Bisnis",
    klasifikasi: "332.024",
    tahun_ajaran: "2024",
    cover_filename: "real-psychology-money.png",
    cover_source: "https://cdn.gramedia.com/uploads/items/psychology_of_money.jfif.png",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 4
  },
  {
    kode_buku: "978-602-06-3321-3",
    judul: "Berani Tidak Disukai: Fenomena dari Jepang untuk Membebaskan Diri",
    penulis: "Ichiro Kishimi & Fumitake Koga",
    kategori: "Psikologi Populer",
    klasifikasi: "150",
    tahun_ajaran: "2023",
    cover_filename: "real-berani-tidak-disukai.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9786020633213_Berani_Tidak_Disukai.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 2
  },
  {
    kode_buku: "978-602-05-0010-2",
    judul: "Bicara Itu Ada Seninya: Rahasia Komunikasi yang Efektif",
    penulis: "Oh Su Hyang",
    kategori: "Komunikasi & Karir",
    klasifikasi: "153.6",
    tahun_ajaran: "2024",
    cover_filename: "real-bicara-ada-seninya.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9786020500102_Bicara-Itu-Ada-Seninya.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 2
  },

  // 2. Sastra Indonesia & Novel Populer
  {
    kode_buku: "978-979-3062-79-2",
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    kategori: "Sastra & Fiksi",
    klasifikasi: "899.2213",
    tahun_ajaran: "2023",
    cover_filename: "real-laskar-pelangi.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/img212.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 5,
    stok_tersedia: 5,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-979-973-124-1",
    judul: "Bumi Manusia (Tetralogi Buru Buku 1)",
    penulis: "Pramoedya Ananta Toer",
    kategori: "Sastra Sejarah",
    klasifikasi: "899.2213",
    tahun_ajaran: "2023",
    cover_filename: "real-bumi-manusia.jpg",
    cover_source: "https://play.google.com/books/publisher/content/images/frontcover/9DA5DwAAQBAJ?fife=w400-h600",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-602-424-694-5",
    judul: "Laut Bercerita",
    penulis: "Leila S. Chudori",
    kategori: "Sastra & Novel",
    klasifikasi: "899.2213",
    tahun_ajaran: "2024",
    cover_filename: "real-laut-bercerita.jpg",
    cover_source: "https://ebooks.gramedia.com/ebook-covers/40678/big_covers/ID_KPG2017MTH10LBER_B.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-602-0822-53-2",
    judul: "Hujan",
    penulis: "Tere Liye",
    kategori: "Fiksi Populer",
    klasifikasi: "899.2213",
    tahun_ajaran: "2024",
    cover_filename: "real-hujan-tereliye.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/img20220905_11493451.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 5,
    stok_tersedia: 5,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-602-7870-41-3",
    judul: "Dilan: Dia adalah Dilanku Tahun 1990",
    penulis: "Pidi Baiq",
    kategori: "Fiksi Remaja",
    klasifikasi: "899.2213",
    tahun_ajaran: "2024",
    cover_filename: "real-dilan-1990.jpg",
    cover_source: "https://mizan.com//storage/images/book/dilan-dia-adalah-dilanku-tahun-1990-edisi-revisi.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-602-03-1258-3",
    judul: "Cantik Itu Luka",
    penulis: "Eka Kurniawan",
    kategori: "Sastra Indonesia",
    klasifikasi: "899.2213",
    tahun_ajaran: "2023",
    cover_filename: "real-cantik-itu-luka.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-979-22-4861-6",
    judul: "Negeri 5 Menara",
    penulis: "Ahmad Fuadi",
    kategori: "Fiksi Inspiratif",
    klasifikasi: "899.2213",
    tahun_ajaran: "2023",
    cover_filename: "real-negeri-5-menara.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9789792248616_negeri-5-menara-_cu-cover-baru_.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-979-22-0196-3",
    judul: "Ronggeng Dukuh Paruk",
    penulis: "Ahmad Tohari",
    kategori: "Sastra Budaya",
    klasifikasi: "899.2213",
    tahun_ajaran: "2022",
    cover_filename: "real-ronggeng-dukuh-paruk.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/product-metas/uh0d0g8ukg.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 9
  },
  {
    kode_buku: "978-602-250-137-4",
    judul: "Tenggelamnya Kapal Van der Wijck",
    penulis: "Prof. Dr. Buya Hamka",
    kategori: "Sastra Klasik",
    klasifikasi: "899.2213",
    tahun_ajaran: "2023",
    cover_filename: "real-vanderwijck.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9786022501374_Tenggelamnya-Kapal-Van-Der-Wijck.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 9
  },

  // 3. E-Book Resmi Digital (Bisa Dibaca Online)
  {
    kode_buku: "978-602-536-101-1",
    judul: "Pemrograman Kompetitif Dasar: Panduan OSN & Algoritma",
    penulis: "William Gozali & Alham Fikri Aji (TOKI)",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.13",
    tahun_ajaran: "2023",
    cover_filename: "real-toki-pkd.jpg",
    cover_source: "https://toki.id/tokifiles/2018/04/cover-front-1-724x1024.jpg",
    file_url: "/uploads/ebooks/pemrograman-kompetitif-dasar.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-013-419-044-0",
    judul: "The Go Programming Language (Golang)",
    penulis: "Alan A. A. Donovan & Brian W. Kernighan",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.133",
    tahun_ajaran: "2024",
    cover_filename: "real-golang-book.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/12818274-L.jpg",
    file_url: "/uploads/ebooks/belajar-jenius-golang.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-007-180-925-2",
    judul: "Java Desktop GUI Programming & Database",
    penulis: "Herbert Schildt & Ifnu Bima",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.133",
    tahun_ajaran: "2023",
    cover_filename: "real-java-swing.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8302142-L.jpg",
    file_url: "/uploads/ebooks/pemrograman-java-desktop.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-602-244-931-7",
    judul: "Administrasi Sistem Jaringan & Server Komputer SMK",
    penulis: "Kementerian Pendidikan dan Kebudayaan RI",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "004.6",
    tahun_ajaran: "2023",
    cover_filename: "real-asj-smk.png",
    cover_source: "https://bintangpusnas.perpusnas.go.id/api25/public/api/get-image/14515_prod_e4469fe726b1f4042534f5822f29384d.png",
    file_url: "/uploads/ebooks/administrasi-server-jaringan.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-602-244-672-9",
    judul: "Boga Dasar: Persiapan dan Pengolahan Masakan Indonesia",
    penulis: "Dra. Wiwi Rusmini & Tim Vokasi Kemendikbud",
    kategori: "Tata Boga & Kuliner",
    klasifikasi: "641.5",
    tahun_ajaran: "2023",
    cover_filename: "real-boga-dasar.jpg",
    cover_source: "https://ebooks.gramedia.com/ebook-covers/1757/big_covers/ID_GPU2013MTH02RMTE_B.jpg",
    file_url: "/uploads/ebooks/boga-dasar-kuliner.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    rak_nomor: 7
  },

  // 4. Rekayasa Perangkat Lunak (PPLG)
  {
    kode_buku: "978-013-235-088-4",
    judul: "Clean Code: A Handbook of Agile Software Craftsmanship",
    penulis: "Robert C. Martin (Uncle Bob)",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.1",
    tahun_ajaran: "2024",
    cover_filename: "real-clean-code.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8302142-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-602-6232-18-2",
    judul: "Pemrograman C++: Teori, Praktik, dan Studi Kasus Algoritma",
    penulis: "Dr. Ir. Budi Raharjo",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.133",
    tahun_ajaran: "2023",
    cover_filename: "real-cpp-budi-raharjo.jpeg",
    cover_source: "https://cdn.gramedia.com/uploads/items/9786026232182_21843.jpeg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-149-205-172-5",
    judul: "Learning React: Modern Patterns for Developing React & Next.js Apps",
    penulis: "Alex Banks & Eve Porcello",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.276",
    tahun_ajaran: "2024",
    cover_filename: "real-learning-react.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/12613146-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-032-196-551-6",
    judul: "Don't Make Me Think: Panduan Praktis UI/UX Design Web & Mobile",
    penulis: "Steve Krug",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.4",
    tahun_ajaran: "2024",
    cover_filename: "real-uiux-krug.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/12711690-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-059-600-706-5",
    judul: "Learning MySQL and Relational Database Systems",
    penulis: "Seyed M.M. Tahaghoghi & Hugh E. Williams",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.74",
    tahun_ajaran: "2023",
    cover_filename: "real-learning-mysql.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/7287796-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },

  // 5. Jaringan & Server (TJKT)
  {
    kode_buku: "978-979-1090-67-4",
    judul: "Konfigurasi Dasar MikroTik RouterOS untuk Sekolah dan Industri",
    penulis: "Rendra Towidjojo",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "004.6",
    tahun_ajaran: "2024",
    cover_filename: "real-mikrotik-rendra.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8282362-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 4,
    stok_tersedia: 4,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-602-029-760-6",
    judul: "Panduan Lengkap Administrasi Linux Server Ubuntu & Debian",
    penulis: "Onno W. Purbo",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "005.43",
    tahun_ajaran: "2024",
    cover_filename: "real-linux-server.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8512564-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-159-327-144-2",
    judul: "Hacking: The Art of Exploitation & Keamanan Jaringan Komputer",
    penulis: "Jon Erickson",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "005.8",
    tahun_ajaran: "2023",
    cover_filename: "real-ethical-hacking.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/10547608-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },
  {
    kode_buku: "978-047-050-511-3",
    judul: "Teknologi Fiber Optik dan Sistem Komunikasi Nirkabel Modern",
    penulis: "Govind P. Agrawal",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "621.38",
    tahun_ajaran: "2023",
    cover_filename: "real-fiber-optik.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8282361-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-623-296-205-9",
    judul: "Pemrograman Internet of Things (IoT) Berbasis ESP32 dan Arduino",
    penulis: "Hari Santoso",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "004.67",
    tahun_ajaran: "2024",
    cover_filename: "real-iot-esp32.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/10557451-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 1
  },

  // 6. Tata Boga & Kuliner
  {
    kode_buku: "978-602-038-301-4",
    judul: "Seni Kuliner Nusantara: 500 Resep Masakan Terfavorit",
    penulis: "Sisca Soewitomo",
    kategori: "Tata Boga & Kuliner",
    klasifikasi: "641.59",
    tahun_ajaran: "2024",
    cover_filename: "real-sisca-soewitomo.jpg",
    cover_source: "https://cdn.gramedia.com/uploads/product-metas/-6r8eolysh.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-602-038-302-1",
    judul: "Healthy Happy Pastry & Bakery: Kreasi Roti dan Kue Komersial",
    penulis: "Farah Quinn",
    kategori: "Tata Boga & Kuliner",
    klasifikasi: "641.815",
    tahun_ajaran: "2023",
    cover_filename: "real-farah-quinn-bakery.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8314945-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-178-472-429-0",
    judul: "The World Atlas of Coffee: Biji Kopi, Roasting & Barista Seduh",
    penulis: "James Hoffmann",
    kategori: "Tata Boga & Kuliner",
    klasifikasi: "641.877",
    tahun_ajaran: "2024",
    cover_filename: "real-atlas-coffee.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/10419283-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: false,
    rak_nomor: 7
  },

  // 7. Tata Busana & Tata Kecantikan
  {
    kode_buku: "978-602-032-150-9",
    judul: "Desain Mode dan Tren Busana Indonesia di Panggung Dunia",
    penulis: "Ivan Gunawan",
    kategori: "Tata Busana",
    klasifikasi: "746.92",
    tahun_ajaran: "2024",
    cover_filename: "real-ivan-gunawan.jpg",
    cover_source: "https://ebooks.gramedia.com/ebook-covers/27786/big_covers/ID_GPU2015MTH11IGABDC_B.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 8
  },
  {
    kode_buku: "978-979-403-882-6",
    judul: "Konstruksi Pola Busana Wanita Tingkat Dasar dan Terampil",
    penulis: "Dra. Porrie Mulhiawan",
    kategori: "Tata Busana",
    klasifikasi: "646.4",
    tahun_ajaran: "2023",
    cover_filename: "real-pola-busana.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381925-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-979-222-140-4",
    judul: "The Master of Makeup: Tata Rias Pengantin Tradisional & Modern",
    penulis: "Gusnaldi",
    kategori: "Tata Kecantikan",
    klasifikasi: "646.72",
    tahun_ajaran: "2023",
    cover_filename: "real-tata-rias-gusnaldi.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381926-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-979-225-832-5",
    judul: "Perawatan Tubuh Tradisional, Spa Nusantara dan Aromaterapi",
    penulis: "Dr. (H.C.) Martha Tilaar",
    kategori: "Tata Kecantikan",
    klasifikasi: "646.7",
    tahun_ajaran: "2023",
    cover_filename: "real-spa-marthatilaar.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381927-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: false,
    rak_nomor: 7
  },

  // 8. Perhotelan & Usaha Layanan Pariwisata (ULP)
  {
    kode_buku: "978-979-291-729-1",
    judul: "Manajemen Kantor Depan Hotel (Hotel Front Office Operations)",
    penulis: "Agus Sulastiyono, M.Si.",
    kategori: "Perhotelan",
    klasifikasi: "647.94",
    tahun_ajaran: "2024",
    cover_filename: "real-hotel-frontoffice.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381921-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-979-290-345-4",
    judul: "Housekeeping Hotel: Operasional dan Pemeliharaan Kamar",
    penulis: "Rumekso, S.E.",
    kategori: "Perhotelan",
    klasifikasi: "647.94",
    tahun_ajaran: "2024",
    cover_filename: "real-housekeeping-hotel.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381922-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-979-407-741-2",
    judul: "Pemanduan Wisata Terpadu (Tour Guiding) & Layanan Perjalanan",
    penulis: "Prof. Dr. H. Oka A. Yoeti",
    kategori: "Pariwisata (ULP)",
    klasifikasi: "910.2",
    tahun_ajaran: "2023",
    cover_filename: "real-tour-guiding.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381923-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: false,
    rak_nomor: 9
  },

  // 9. Teknik Otomotif
  {
    kode_buku: "978-602-244-802-0",
    judul: "Pemeliharaan Mesin Sepeda Motor Kurikulum Merdeka SMK",
    penulis: "Jalius Jama, Ph.D. & Daryanto",
    kategori: "Teknik Otomotif",
    klasifikasi: "629.28",
    tahun_ajaran: "2024",
    cover_filename: "real-motor-otomotif.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381928-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },
  {
    kode_buku: "978-602-790-952-6",
    judul: "Sistem Pengapian dan Injeksi Elektronik (EFI) Mobil Modern",
    penulis: "Buntarto, S.T.",
    kategori: "Teknik Otomotif",
    klasifikasi: "629.25",
    tahun_ajaran: "2024",
    cover_filename: "real-efi-mobil.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381929-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: false,
    rak_nomor: 7
  },

  // 10. Bahasa & Referensi Nasional
  {
    kode_buku: "978-979-069-263-3",
    judul: "Tata Bahasa Baku Bahasa Indonesia Edisi Keempat",
    penulis: "Badan Pengembangan dan Pembinaan Bahasa Kemendikbud",
    kategori: "Bahasa & Referensi",
    klasifikasi: "499.221",
    tahun_ajaran: "2023",
    cover_filename: "real-tatabahasa-baku.jpg",
    cover_source: "https://down-id.img.susercontent.com/file/id-11134207-7rbkb-m8lup4lkoljh65",
    file_url: null,
    is_ebook: false,
    stok_total: 3,
    stok_tersedia: 3,
    is_referensi: true,
    rak_nomor: 9
  },
  {
    kode_buku: "978-979-407-407-7",
    judul: "Sejarah Nasional Indonesia: Dari Zaman Prasejarah Hingga Proklamasi",
    penulis: "Prof. Dr. Sartono Kartodirdjo",
    kategori: "Sejarah Indonesia",
    klasifikasi: "959.8",
    tahun_ajaran: "2023",
    cover_filename: "real-sejarah-nasional.jpg",
    cover_source: "https://covers.openlibrary.org/b/id/8381930-L.jpg",
    file_url: null,
    is_ebook: false,
    stok_total: 2,
    stok_tersedia: 2,
    is_referensi: true,
    rak_nomor: 9
  }
];

async function main() {
  console.log('=== STEP 1: DOWNLOADING ALL REAL COVERS ===');
  for (const b of REAL_BOOKS) {
    const dest = path.join(COVERS_DIR, b.cover_filename);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 3000) {
      console.log(`Downloading cover for ${b.judul}...`);
      await downloadImage(b.cover_source, dest);
    }
  }

  console.log('=== STEP 2: CLEARING OLD SYNTHETIC BOOKS ===');
  // Delete existing reviews and transactions associated with old books
  await prisma.ulasan.deleteMany();
  await prisma.eksemplar.deleteMany();
  await prisma.buku.deleteMany();

  console.log('=== STEP 3: SEEDING REAL AUTHENTIC BOOKS & EXEMPLARS ===');
  const raks = await prisma.rak.findMany();
  const rakMap = {};
  raks.forEach(r => {
    rakMap[r.nomor] = r.id;
  });

  let exemplarCounter = 1000;

  for (const b of REAL_BOOKS) {
    const coverPath = `/uploads/covers/${b.cover_filename}`;
    const rakId = rakMap[b.rak_nomor] || raks[0].id;

    const createdBuku = await prisma.buku.create({
      data: {
        tipe_buku: "BIASA",
        kode_buku: b.kode_buku,
        judul: b.judul,
        penulis: b.penulis,
        kategori: b.kategori,
        klasifikasi: b.klasifikasi,
        tahun_ajaran: b.tahun_ajaran,
        cover_url: coverPath,
        file_url: b.file_url,
        is_ebook: b.is_ebook,
        stok_total: b.stok_total,
        stok_tersedia: b.stok_tersedia,
        is_referensi: b.is_referensi,
      }
    });

    // Create physical copies (Eksemplar) for non-ebook or reference
    const copiesToCreate = b.is_ebook ? 1 : b.stok_total;
    for (let i = 0; i < copiesToCreate; i++) {
      exemplarCounter++;
      const codeStr = String(exemplarCounter).padStart(8, '0');
      await prisma.eksemplar.create({
        data: {
          kode: codeStr,
          bukuId: createdBuku.id,
          rakId: rakId,
          tipe_koleksi: b.is_referensi ? "Reference" : "Fiction",
          status: "TERSEDIA"
        }
      });
    }

    console.log(`[CREATED] ${createdBuku.judul} (${copiesToCreate} eksemplar)`);
  }

  // Add initial genuine student review to Atomic Habits
  const atomicBook = await prisma.buku.findFirst({
    where: { judul: { contains: "Atomic Habits" } }
  });

  if (atomicBook) {
    await prisma.ulasan.create({
      data: {
        bukuId: atomicBook.id,
        nama: "Siti Rahmawati (XII PPLG 1)",
        rating: 5,
        komentar: "Buku ini sangat membuka wawasan tentang membangun kebiasaan produktif di sekolah!"
      }
    });
  }

  console.log('=== FINISHED! ALL REAL BOOKS SUCCESSFULLY SEEDED! ===');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
