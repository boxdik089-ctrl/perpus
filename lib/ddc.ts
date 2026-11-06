import { prisma } from "./prisma";

export type DdcResult = {
  ok: boolean;
  ddc: string;
  label: string;
  kategori?: string;
  source: string;
  judul?: string;
  penulis?: string;
  cover_url?: string | null;
  confidence: "HIGH" | "MEDIUM" | "ESTIMATED";
};

export interface QuickDdcOption {
  ddc: string;
  label: string;
  kategori: string;
}

export const QUICK_DDC_OPTIONS: QuickDdcOption[] = [
  { ddc: "004", label: "Komputer & TI", kategori: "Teknologi Informasi" },
  { ddc: "004.6", label: "Jaringan (TJKT)", kategori: "Teknologi Informasi" },
  { ddc: "005.1", label: "Pemrograman (PPLG)", kategori: "Teknologi Informasi" },
  { ddc: "005.74", label: "Basis Data", kategori: "Teknologi Informasi" },
  { ddc: "158.1", label: "Pengembangan Diri", kategori: "Pengembangan Diri" },
  { ddc: "297", label: "Agama Islam", kategori: "Lainnya" },
  { ddc: "330", label: "Ekonomi", kategori: "Ekonomi" },
  { ddc: "420", label: "Bahasa Inggris", kategori: "Bahasa Inggris" },
  { ddc: "499.221", label: "Bahasa Indonesia", kategori: "Bahasa Indonesia" },
  { ddc: "510", label: "Matematika", kategori: "Matematika" },
  { ddc: "530", label: "Fisika", kategori: "Fisika" },
  { ddc: "540", label: "Kimia", kategori: "Kimia" },
  { ddc: "570", label: "Biologi", kategori: "Biologi" },
  { ddc: "629.2", label: "Teknik Otomotif", kategori: "Lainnya" },
  { ddc: "641.5", label: "Tata Boga / Kuliner", kategori: "Lainnya" },
  { ddc: "646.4", label: "Tata Busana", kategori: "Lainnya" },
  { ddc: "646.7", label: "Tata Kecantikan & Spa", kategori: "Lainnya" },
  { ddc: "647.94", label: "Perhotelan", kategori: "Lainnya" },
  { ddc: "657", label: "Akuntansi", kategori: "Akuntansi" },
  { ddc: "796", label: "Olahraga / PJOK", kategori: "Pendidikan Jasmani" },
  { ddc: "899.2213", label: "Novel / Sastra Fiksi", kategori: "Bahasa Indonesia" },
  { ddc: "910.2", label: "Pariwisata (ULW)", kategori: "Geografi" },
  { ddc: "959.8", label: "Sejarah Indonesia", kategori: "Sejarah" },
];

export const CATEGORY_TO_DDC: Record<string, { ddc: string; label: string }> = {
  "Matematika": { ddc: "510", label: "Matematika" },
  "IPA": { ddc: "500", label: "Ilmu Pengetahuan Alam" },
  "Fisika": { ddc: "530", label: "Fisika" },
  "Kimia": { ddc: "540", label: "Kimia" },
  "Biologi": { ddc: "570", label: "Biologi" },
  "Teknologi Informasi": { ddc: "004", label: "Teknologi Informasi & Komputer" },
  "Bahasa Indonesia": { ddc: "499.221", label: "Bahasa Indonesia" },
  "Bahasa Inggris": { ddc: "420", label: "Bahasa Inggris" },
  "Sejarah": { ddc: "959.8", label: "Sejarah Indonesia" },
  "Geografi": { ddc: "910", label: "Geografi" },
  "Ekonomi": { ddc: "330", label: "Ekonomi" },
  "Akuntansi": { ddc: "657", label: "Akuntansi" },
  "Hukum Dagang": { ddc: "346", label: "Hukum Bisnis / Dagang" },
  "Seni Budaya": { ddc: "700", label: "Seni Budaya" },
  "Pendidikan Jasmani": { ddc: "796", label: "Pendidikan Jasmani & Olahraga" },
  "IPS": { ddc: "300", label: "Ilmu Pengetahuan Sosial" },
  "Pengembangan Diri": { ddc: "158.1", label: "Pengembangan Diri & Motivasi" },
  "Filsafat & Psikologi": { ddc: "100", label: "Filsafat & Psikologi" },
};

// Aturan inferensi DDC berbasis kata kunci judul, topik, subjek, dan kategori
interface KeywordRule {
  pattern: RegExp;
  ddc: string;
  label: string;
  kategori: string;
  priority?: number;
}

const DDC_KEYWORD_RULES: KeywordRule[] = [
  // 1. Kejuruan Spesifik SMKN 1 Beringin (Prioritas Tertinggi)
  // Jaringan Komputer / TJKT
  {
    pattern: /\b(jaringan komputer|administrasi sistem jaringan|server komputer|mikrotik|cisco|tcp\/?ip|routing|router|switch|lan|wan|wlan|nirkabel|fiber optik|tjkt|telekomunikasi|keamanan jaringan|infrastruktur jaringan)\b/i,
    ddc: "004.6",
    label: "Jaringan Komputer & Telekomunikasi (TJKT)",
    kategori: "Teknologi Informasi",
    priority: 10,
  },
  // Basis Data / SQL
  {
    pattern: /\b(basis data|database|sql|mysql|postgresql|oracle|mongodb|query)\b/i,
    ddc: "005.74",
    label: "Basis Data / Database",
    kategori: "Teknologi Informasi",
    priority: 9,
  },
  // Pemrograman Web & Mobile
  {
    pattern: /\b(pemrograman web|web programming|react|next\.?js|html|css|javascript|typescript|php|laravel|vue|angular|frontend|backend|android|mobile app|flutter|kotlin|swift|perangkat bergerak)\b/i,
    ddc: "005.2",
    label: "Pemrograman Web & Perangkat Bergerak",
    kategori: "Teknologi Informasi",
    priority: 9,
  },
  // Bahasa Pemrograman & Algoritma
  {
    pattern: /\b(python|java\b|c\+\+|golang|algoritma|pemrograman kompetitif|struktur data|bahasa pemrograman)\b/i,
    ddc: "005.13",
    label: "Bahasa Pemrograman Spesifik",
    kategori: "Teknologi Informasi",
    priority: 8,
  },
  // Rekayasa Perangkat Lunak / PPLG
  {
    pattern: /\b(rekayasa perangkat lunak|rpl|pplg|software engineering|pemodelan perangkat lunak|clean code|software craftsmanship|agile|scrum|koding|coding|pemrograman)\b/i,
    ddc: "005.1",
    label: "Rekayasa Perangkat Lunak (PPLG)",
    kategori: "Teknologi Informasi",
    priority: 7,
  },
  // Kecerdasan Buatan / AI
  {
    pattern: /\b(kecerdasan buatan|artificial intelligence|machine learning|deep learning|ai|robotika)\b/i,
    ddc: "006.3",
    label: "Kecerdasan Buatan / AI",
    kategori: "Teknologi Informasi",
  },
  // Multimedia & Grafika Komputer
  {
    pattern: /\b(multimedia|grafika komputer|photoshop|coreldraw|blender|3d|animasi|gim|game development)\b/i,
    ddc: "006.6",
    label: "Multimedia & Grafika Komputer",
    kategori: "Teknologi Informasi",
  },
  // Komputer & Sistem Operasi
  {
    pattern: /\b(sistem operasi|operating system|linux|ubuntu|debian|windows|server|hardware|perangkat keras|komputer|informatika)\b/i,
    ddc: "004",
    label: "Ilmu Komputer & Sistem",
    kategori: "Teknologi Informasi",
  },

  // Kuliner / Tata Boga
  {
    pattern: /\b(tata boga|boga dasar|kuliner|resep|memasak|masakan|pastry|bakery|roti|kue|pengolahan makanan|tata hidang|barista|kopi|roasting)\b/i,
    ddc: "641.5",
    label: "Tata Boga & Kuliner",
    kategori: "Lainnya",
    priority: 9,
  },

  // Tata Busana
  {
    pattern: /\b(tata busana|desain busana|konstruksi pola|pola busana|menjahit|tekstil|garmen|pembuatan busana|fashion design|tren busana|desain mode)\b/i,
    ddc: "646.4",
    label: "Tata Busana & Desain Mode",
    kategori: "Lainnya",
    priority: 9,
  },

  // Tata Kecantikan & Spa
  {
    pattern: /\b(tata kecantikan|spa|perawatan tubuh|perawatan kulit|rias|makeup|kosmetik|kulit|rambut|aromaterapi)\b/i,
    ddc: "646.7",
    label: "Tata Kecantikan & Spa",
    kategori: "Lainnya",
    priority: 9,
  },

  // Perhotelan
  {
    pattern: /\b(perhotelan|hotel|front office|housekeeping|tata graha|laundry hotel|kantor depan hotel)\b/i,
    ddc: "647.94",
    label: "Perhotelan & Akomodasi",
    kategori: "Lainnya",
    priority: 9,
  },

  // Usaha Layanan Wisata (ULW)
  {
    pattern: /\b(layanan wisata|pemanduan wisata|tour guiding|kepariwisataan|destinasi wisata|pariwisata|travel agent|ulw)\b/i,
    ddc: "910.2",
    label: "Usaha Layanan Wisata (ULW)",
    kategori: "Geografi",
    priority: 9,
  },

  // Teknik Otomotif
  {
    pattern: /\b(otomotif|sepeda motor|injeksi elektronik|efi|mesin diesel|chasis|kelistrikan bodi|mobil|bengkel kendaraan)\b/i,
    ddc: "629.2",
    label: "Teknik Otomotif & Kendaraan",
    kategori: "Lainnya",
    priority: 8,
  },

  // Teknik Ketenagalistrikan / Elektro
  {
    pattern: /\b(kelistrikan|listrik|elektro|elektronika|arus lemah|instalasi penerangan|mikrokontroler|arduino|esp32)\b/i,
    ddc: "621.3",
    label: "Teknik Elektro & Kelistrikan",
    kategori: "Lainnya",
    priority: 8,
  },

  // Akuntansi & Keuangan
  {
    pattern: /\b(akuntansi|pembukuan|buku besar|jurnal|neraca|myob|laporan keuangan|audit|pajak|perpajakan)\b/i,
    ddc: "657",
    label: "Akuntansi & Keuangan",
    kategori: "Akuntansi",
    priority: 8,
  },

  // Manajemen & Bisnis
  {
    pattern: /\b(manajemen|kewirausahaan|pkk|produk kreatif|wirausaha|marketing|pemasaran|bisnis)\b/i,
    ddc: "658",
    label: "Manajemen & Kewirausahaan",
    kategori: "Ekonomi",
  },

  // 2. Agama & Filsafat
  {
    pattern: /\b(islam|al-?qur'?an|hadits|fiqih|fikih|akidah|akhlak|tajwid|pai|tarikh|sejarah kebudayaan islam|ski|syariah|rasulullah|shalat|puasa)\b/i,
    ddc: "297",
    label: "Agama Islam",
    kategori: "Lainnya",
    priority: 7,
  },
  {
    pattern: /\b(kristen|katolik|alkitab|injil|teologi)\b/i,
    ddc: "230",
    label: "Agama Kristen",
    kategori: "Lainnya",
  },
  {
    pattern: /\b(filosofi teras|stoisisme|stoic|filsafat|etika|logika)\b/i,
    ddc: "188",
    label: "Filsafat & Etika",
    kategori: "Filsafat & Psikologi",
    priority: 7,
  },
  {
    pattern: /\b(atomic habits|kebiasaan|habit|bodo amat|berani tidak disukai|pengembangan diri|self improvement|motivasi|mindset|sukses)\b/i,
    ddc: "158.1",
    label: "Pengembangan Diri & Motivasi",
    kategori: "Pengembangan Diri",
    priority: 7,
  },
  {
    pattern: /\b(komunikasi|bicara|public speaking|presentasi|negosiasi)\b/i,
    ddc: "153.6",
    label: "Komunikasi Interpersonal",
    kategori: "Pengembangan Diri",
  },
  {
    pattern: /\b(psikologi|psychology|kepribadian|kejiwaan)\b/i,
    ddc: "150",
    label: "Psikologi Populer",
    kategori: "Filsafat & Psikologi",
  },

  // 3. Ilmu Sosial & Finansial
  {
    pattern: /\b(psikologi uang|psychology of money|keuangan|finansial|investasi|saham|reksadana|pasar modal|perbankan|uang)\b/i,
    ddc: "332",
    label: "Keuangan & Investasi",
    kategori: "Ekonomi",
    priority: 7,
  },
  {
    pattern: /\b(ekonomi|mikroekonomi|makroekonomi|perdagangan|pasar)\b/i,
    ddc: "330",
    label: "Ekonomi",
    kategori: "Ekonomi",
  },
  {
    pattern: /\b(hukum bisnis|hukum dagang|perdata|pidana|hukum|undang-undang)\b/i,
    ddc: "346",
    label: "Hukum Bisnis & Perdata",
    kategori: "Hukum Dagang",
  },
  {
    pattern: /\b(pkn|ppkn|kewarganegaraan|pancasila|uud 1945|tata negara|politik|demokrasi)\b/i,
    ddc: "320.4598",
    label: "Kewarganegaraan & Pancasila",
    kategori: "IPS",
  },
  {
    pattern: /\b(sosiologi|masyarakat|interaksi sosial)\b/i,
    ddc: "301",
    label: "Sosiologi",
    kategori: "IPS",
  },
  {
    pattern: /\b(pendidikan|pedagogi|kurikulum|modul ajar|guru|pembelajaran|sekolah)\b/i,
    ddc: "370",
    label: "Pendidikan & Pengajaran",
    kategori: "Lainnya",
  },

  // 4. Bahasa
  {
    pattern: /\b(bahasa inggris|english|grammar|toefl|ielts|vocabulary|reading english)\b/i,
    ddc: "420",
    label: "Bahasa Inggris",
    kategori: "Bahasa Inggris",
    priority: 7,
  },
  {
    pattern: /\b(tata bahasa baku|tata bahasa indonesia|bahasa indonesia|ejaan|puebi|kbbi|linguistik indonesia)\b/i,
    ddc: "499.221",
    label: "Tata Bahasa Indonesia",
    kategori: "Bahasa Indonesia",
    priority: 6,
  },

  // 5. Sains / Ilmu Murni
  {
    pattern: /\b(matematika|kalkulus|aljabar|geometri|trigonometri|statistika|peluang|matriks|math)\b/i,
    ddc: "510",
    label: "Matematika",
    kategori: "Matematika",
    priority: 7,
  },
  {
    pattern: /\b(fisika|physics|mekanika|termodinamika|optika|listrik statis|magnet|gelombang)\b/i,
    ddc: "530",
    label: "Fisika",
    kategori: "Fisika",
    priority: 7,
  },
  {
    pattern: /\b(kimia|chemistry|larutan|stoikiometri|senyawa|unsur|tabel periodik|reaksi kimia)\b/i,
    ddc: "540",
    label: "Kimia",
    kategori: "Kimia",
    priority: 7,
  },
  {
    pattern: /\b(biologi|biology|ekosistem|sel|genetika|anatomi|hewan|tumbuhan|flora|fauna)\b/i,
    ddc: "570",
    label: "Biologi",
    kategori: "Biologi",
    priority: 7,
  },
  {
    pattern: /\b(ipa|ilmu pengetahuan alam|sains)\b/i,
    ddc: "500",
    label: "Ilmu Pengetahuan Alam (IPA)",
    kategori: "IPA",
  },

  // 6. Sastra & Fiksi
  {
    pattern: /\b(puisi|sajak|syair|antologi puisi)\b/i,
    ddc: "899.2211",
    label: "Puisi Indonesia",
    kategori: "Bahasa Indonesia",
  },
  {
    pattern: /\b(novel|cerpen|fiksi|roman|antologi cerpen|dongeng|laskar pelangi|bumi manusia|laut bercerita|dilan|cantik itu luka|negeri 5 menara|ronggeng dukuh paruk|tenggelamnya kapal van der wijck|tere liye|andrea hirata|pramoedya)\b/i,
    ddc: "899.2213",
    label: "Sastra Fiksi & Novel Indonesia",
    kategori: "Bahasa Indonesia",
    priority: 8,
  },
  {
    pattern: /\b(sastra|kesusastraan|literature)\b/i,
    ddc: "899.221",
    label: "Kesusastraan",
    kategori: "Bahasa Indonesia",
  },

  // 7. Sejarah & Geografi
  {
    pattern: /\b(sejarah nasional indonesia|sejarah indonesia|kemerdekaan|proklamasi|nusantara|kolonial|orde baru|reformasi)\b/i,
    ddc: "959.8",
    label: "Sejarah Indonesia",
    kategori: "Sejarah",
    priority: 8,
  },
  {
    pattern: /\b(sejarah|history|perang dunia|peradaban)\b/i,
    ddc: "900",
    label: "Sejarah Umum",
    kategori: "Sejarah",
  },
  {
    pattern: /\b(geografi|peta|atlas|iklim|kependudukan)\b/i,
    ddc: "910",
    label: "Geografi",
    kategori: "Geografi",
  },
  {
    pattern: /\b(biografi|otobiografi|memoar|riwayat hidup)\b/i,
    ddc: "920",
    label: "Biografi",
    kategori: "Sejarah",
  },

  // 8. Olahraga & Kesenian
  {
    pattern: /\b(penjas|pjok|penjasorkes|olahraga|atletik|sepak bola|bola voli|basket|bulu tangkis|senam|renang)\b/i,
    ddc: "796",
    label: "Pendidikan Jasmani & Olahraga",
    kategori: "Pendidikan Jasmani",
  },
  {
    pattern: /\b(seni rupa|desain grafis|nirmana|ilustrasi|gambar|kriya)\b/i,
    ddc: "740",
    label: "Seni Rupa & Desain",
    kategori: "Seni Budaya",
  },
  {
    pattern: /\b(musik|lagu|vokal|not balok|instrumen|gitar|piano)\b/i,
    ddc: "780",
    label: "Seni Musik",
    kategori: "Seni Budaya",
  },
  {
    pattern: /\b(seni budaya|kesenian)\b/i,
    ddc: "700",
    label: "Seni Budaya Umum",
    kategori: "Seni Budaya",
  },
];

// Database lokal kurikulum & buku kejuruan SMK / nasional
const LOCAL_SMK_REGISTRY: Record<string, { judul: string; penulis: string; kategori: string; klasifikasi: string; cover_url?: string }> = {
  "9786025612831": {
    judul: "Penanganan Gangguan TCP/IP Layer untuk SMK/MAK",
    penulis: "Maryuli Darmawan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.6",
  },
  "9786025612671": {
    judul: "Literasi Sains dan Materi Pembelajaran Bahasa Indonesia",
    penulis: "Dyah Werdiningsih",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.221",
  },
  "9786025612367": {
    judul: "Konfigurasi Jaringan Nirkabel",
    penulis: "Maryuli Darmawan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.65",
  },
  "9786025612350": {
    judul: "Administrasi Infrastruktur Jaringan",
    penulis: "Maryuli Darmawan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.6",
  },
  "9786025612374": {
    judul: "Teknologi Jaringan Berbasis Luas (WAN)",
    penulis: "Maryuli Darmawan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.67",
  },
  "9786024866167": {
    judul: "Pemrograman Web dan Perangkat Bergerak",
    penulis: "Patwiyanto, S.Kom.",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.2",
  },
  "9786024866174": {
    judul: "Basis Data SMK/MAK Kelas XI",
    penulis: "Patwiyanto, S.Kom.",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.74",
  },
  "9786024866181": {
    judul: "Sistem Komputer",
    penulis: "Patwiyanto, S.Kom.",
    kategori: "Teknologi Informasi",
    klasifikasi: "004",
  },
  "9786024866198": {
    judul: "Komputer dan Jaringan Dasar",
    penulis: "Patwiyanto, S.Kom.",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.6",
  },
  "9786024346850": {
    judul: "Pemodelan Perangkat Lunak",
    penulis: "Novianto",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.1",
  },
  "9786024346867": {
    judul: "Administrasi Server Jaringan",
    penulis: "Novianto",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.62",
  },
  "9786020633930": {
    judul: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    penulis: "James Clear",
    kategori: "Pengembangan Diri",
    klasifikasi: "158.1",
  },
  "9786020633176": {
    judul: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    penulis: "James Clear",
    kategori: "Pengembangan Diri",
    klasifikasi: "158.1",
  },
  "9789793062792": {
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
  "9786231941282": {
    judul: "Dasar-Dasar Pengembangan Perangkat Lunak dan Gim (PPLG) Kelas X",
    penulis: "Kementerian Pendidikan dan Kebudayaan",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.1",
  },
  "9786026232458": {
    judul: "Teknik Jaringan Komputer dan Telekomunikasi (TJKT) Kelas XI",
    penulis: "Kementerian Pendidikan dan Kebudayaan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.6",
  },
  "9789791227216": {
    judul: "Filosofi Kopi: Kumpulan Cerita dan Prosa Satu Dekade",
    penulis: "Dee Lestari",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
  "9786022449317": {
    judul: "Administrasi Sistem Jaringan & Server Komputer SMK",
    penulis: "Kementerian Pendidikan dan Kebudayaan",
    kategori: "Teknologi Informasi",
    klasifikasi: "004.6",
  },
  "9786022446729": {
    judul: "Boga Dasar: Persiapan dan Pengolahan Masakan Indonesia",
    penulis: "Kementerian Pendidikan dan Kebudayaan",
    kategori: "Lainnya",
    klasifikasi: "641.5",
  },
  "9786025361011": {
    judul: "Pemrograman Kompetitif Dasar: Panduan OSN & Algoritma",
    penulis: "Ikatan Alumni TOKI",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.13",
  },
  "9780134190440": {
    judul: "The Go Programming Language (Golang)",
    penulis: "Alan A. A. Donovan, Brian W. Kernighan",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.133",
  },
  "9780071809252": {
    judul: "Java: A Beginner's Guide",
    penulis: "Herbert Schildt",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.133",
  },
  "9780596007065": {
    judul: "Learning MySQL and Relational Database Systems",
    penulis: "Seyed M.M. Tahaghoghi, Hugh E. Williams",
    kategori: "Teknologi Informasi",
    klasifikasi: "005.74",
  },
  "9786024125189": {
    judul: "Filosofi Teras: Panduan Hidup Damai dengan Stoisisme",
    penulis: "Henry Manampiring",
    kategori: "Filsafat & Psikologi",
    klasifikasi: "188",
  },
  "9786024526986": {
    judul: "Sebuah Seni untuk Bersikap Bodo Amat",
    penulis: "Mark Manson",
    kategori: "Pengembangan Diri",
    klasifikasi: "158.1",
  },
  "9786020653884": {
    judul: "The Psychology of Money: Pelajaran Abadi Mengenai Kekayaan",
    penulis: "Morgan Housel",
    kategori: "Ekonomi",
    klasifikasi: "332",
  },
  "9786020633213": {
    judul: "Berani Tidak Disukai",
    penulis: "Ichiro Kishimi, Fumitake Koga",
    kategori: "Filsafat & Psikologi",
    klasifikasi: "158.1",
  },
  "9786020500102": {
    judul: "Bicara Itu Ada Seninya",
    penulis: "Oh Su Hyang",
    kategori: "Pengembangan Diri",
    klasifikasi: "153.6",
  },
  "9789799731241": {
    judul: "Bumi Manusia",
    penulis: "Pramoedya Ananta Toer",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
  "9786024246945": {
    judul: "Laut Bercerita",
    penulis: "Leila S. Chudori",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
  "9786020822532": {
    judul: "Hujan",
    penulis: "Tere Liye",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
  "9786027870413": {
    judul: "Dilan: Dia adalah Dilanku Tahun 1990",
    penulis: "Pidi Baiq",
    kategori: "Bahasa Indonesia",
    klasifikasi: "899.2213",
  },
};

/**
 * Inferensi nomor DDC berdasarkan teks gabungan (judul, kategori, subjek)
 */
export function inferDdcFromText(
  text: string,
  preferredCategory?: string
): { ddc: string; label: string; kategori: string } {
  const combined = (text || "").trim();

  // Urutkan aturan berdasarkan prioritas tertinggi terlebih dahulu
  const sortedRules = [...DDC_KEYWORD_RULES].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const rule of sortedRules) {
    if (rule.pattern.test(combined)) {
      return {
        ddc: rule.ddc,
        label: rule.label,
        kategori: rule.kategori,
      };
    }
  }

  // Fallback berdasarkan kategori jika ada
  if (preferredCategory && CATEGORY_TO_DDC[preferredCategory]) {
    const catMatch = CATEGORY_TO_DDC[preferredCategory];
    return {
      ddc: catMatch.ddc,
      label: catMatch.label,
      kategori: preferredCategory,
    };
  }

  // Default umum DDC: 000 (Karya Umum)
  return {
    ddc: "000",
    label: "Karya Umum & Komputer",
    kategori: preferredCategory || "Lainnya",
  };
}

/**
 * Resolusi otomatis nomor DDC berdasarkan ISBN:
 * 1. Cek database lokal perpustakaan SMKN 1 Beringin (Akurasi 100%)
 * 2. Cek database buku pelajaran SMK / kurikulum nasional
 * 3. Query OpenLibrary API (klasifikasi Dewey & subjek)
 * 4. Query Google Books API (kategori & deskripsi)
 * 5. Inferensi cerdas berbasis judul dan kata kunci
 */
export async function resolveDdcFromIsbn(rawIsbn: string): Promise<DdcResult> {
  const clean = rawIsbn.trim().replace(/[-\s]/g, "");
  if (!clean || clean.length < 8) {
    return {
      ok: false,
      ddc: "000",
      label: "Format ISBN tidak valid",
      source: "Validation",
      confidence: "ESTIMATED",
    };
  }

  // 1. Cek database internal perpustakaan
  try {
    const existingRows = await prisma.$queryRaw<
      Array<{
        id: string;
        judul: string;
        penulis: string;
        klasifikasi: string | null;
        kategori: string | null;
        cover_url: string | null;
      }>
    >`
      SELECT id, judul, penulis, klasifikasi, kategori, cover_url
      FROM "Buku"
      WHERE REPLACE(REPLACE(COALESCE(kode_buku, ''), '-', ''), ' ', '') = ${clean}
         OR kode_buku = ${clean}
         OR id = ${clean}
      LIMIT 1
    `;

    const foundFirst = existingRows[0];
    if (foundFirst && foundFirst.klasifikasi) {
      return {
        ok: true,
        ddc: foundFirst.klasifikasi,
        label: `Katalog SMKN 1 Beringin (${foundFirst.judul})`,
        kategori: foundFirst.kategori || undefined,
        judul: foundFirst.judul,
        penulis: foundFirst.penulis,
        cover_url: foundFirst.cover_url,
        source: "Katalog SMKN 1 Beringin",
        confidence: "HIGH",
      };
    }
  } catch {
    // Lanjut ke sumber berikutnya jika query database bermasalah
  }

  // 2. Cek Registry Buku Sekolah & SMK Terkurasi
  if (LOCAL_SMK_REGISTRY[clean]) {
    const item = LOCAL_SMK_REGISTRY[clean];
    return {
      ok: true,
      ddc: item.klasifikasi,
      label: item.judul,
      kategori: item.kategori,
      judul: item.judul,
      penulis: item.penulis,
      cover_url: item.cover_url || null,
      source: "Katalog Nasional SMK",
      confidence: "HIGH",
    };
  }

  let title = "";
  let authors = "";
  let coverUrl: string | null = null;
  let ddcFound = "";
  let subjectsCombined = "";

  // 3. OpenLibrary API dengan timeout 3.5 detik
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const olRes = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&jscmd=data&format=json`,
      { signal: controller.signal, cache: "no-store" }
    );
    clearTimeout(timeout);

    if (olRes.ok) {
      const olJson = await olRes.json();
      const bookData = olJson[`ISBN:${clean}`];
      if (bookData) {
        title = bookData.title || "";
        if (Array.isArray(bookData.authors)) {
          authors = bookData.authors.map((a: { name: string }) => a.name).join(", ");
        }
        coverUrl = bookData.cover?.large || bookData.cover?.medium || null;

        // Cek apakah OpenLibrary memiliki field dewey_decimal_class langsung
        if (Array.isArray(bookData.classifications?.dewey_decimal_class) && bookData.classifications.dewey_decimal_class.length > 0) {
          const directDdc = bookData.classifications.dewey_decimal_class[0].trim();
          if (directDdc) {
            ddcFound = directDdc;
          }
        }

        // Kumpulkan subjek
        if (Array.isArray(bookData.subjects)) {
          subjectsCombined = bookData.subjects.map((s: { name: string }) => s.name).join(" ");
        }
      }
    }
  } catch {
    // Abaikan kegagalan jaringan OpenLibrary
  }

  // 4. Google Books API Fallback (jika OpenLibrary belum menemukan judul)
  if (!title) {
    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : "";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const gRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}${apiKey}`,
        { signal: controller.signal, cache: "no-store" }
      );
      clearTimeout(timeout);

      if (gRes.ok) {
        const gJson = await gRes.json();
        if (gJson.items && gJson.items.length > 0) {
          const info = gJson.items[0].volumeInfo;
          title = info.title || "";
          authors = (info.authors || []).join(", ");
          coverUrl =
            info.imageLinks?.extraLarge ||
            info.imageLinks?.large ||
            info.imageLinks?.medium ||
            info.imageLinks?.thumbnail ||
            null;
          if (Array.isArray(info.categories)) {
            subjectsCombined = info.categories.join(" ") + " " + (info.description || "");
          }
        }
      }
    } catch {
      // Abaikan kegagalan Google Books
    }
  }

  // 5. Analisis Hasil dan Inferensi DDC Cerdas
  if (ddcFound) {
    const inferred = inferDdcFromText(`${title} ${subjectsCombined}`);
    return {
      ok: true,
      ddc: ddcFound,
      label: inferred.label,
      kategori: inferred.kategori,
      source: "OpenLibrary DDC",
      judul: title || undefined,
      penulis: authors || undefined,
      cover_url: coverUrl,
      confidence: "HIGH",
    };
  }

  if (title) {
    const inferred = inferDdcFromText(`${title} ${subjectsCombined}`);
    return {
      ok: true,
      ddc: inferred.ddc,
      label: inferred.label,
      kategori: inferred.kategori,
      source: "Online Catalog + Smart DDC Inference",
      judul: title,
      penulis: authors,
      cover_url: coverUrl,
      confidence: "MEDIUM",
    };
  }

  return {
    ok: false,
    ddc: "000",
    label: "Belum ditemukan di katalog online",
    source: "Not Found",
    confidence: "ESTIMATED",
  };
}
