const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EBOOKS = [
  {
    kode_buku: "978-602-536-101-1",
    judul: "Pemrograman Kompetitif Dasar: Panduan OSN & Algoritma",
    penulis: "William Gozali & Alham Fikri Aji (TOKI)",
    kategori: "Sains Komputer",
    klasifikasi: "005.13",
    tahun_ajaran: "2020",
    cover_url: "/uploads/covers/cover-ebook-01.jpg",
    file_url: "/uploads/ebooks/pemrograman-kompetitif-dasar.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    tipe_buku: "BIASA",
  },
  {
    kode_buku: "978-623-289-540-8",
    judul: "Belajar dengan Jenius: Pemrograman Go (Golang)",
    penulis: "Gun Gun Febrianza",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.276",
    tahun_ajaran: "2020",
    cover_url: "/uploads/covers/cover-ebook-02.jpg",
    file_url: "/uploads/ebooks/belajar-jenius-golang.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    tipe_buku: "BIASA",
  },
  {
    kode_buku: "978-979-291-882-3",
    judul: "Pemrograman Java Desktop: GUI Swing, Database & MVC",
    penulis: "Ifnu Bima",
    kategori: "Teknologi (PPLG)",
    klasifikasi: "005.133",
    tahun_ajaran: "2019",
    cover_url: "/uploads/covers/cover-ebook-03.jpg",
    file_url: "/uploads/ebooks/pemrograman-java-desktop.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    tipe_buku: "BIASA",
  },
  {
    kode_buku: "978-602-244-931-7",
    judul: "Administrasi Server & Jaringan Komputer SMK",
    penulis: "Eka Maulidia & Tim Kemendikdasmen",
    kategori: "Jaringan (TJKT)",
    klasifikasi: "004.6",
    tahun_ajaran: "2021",
    cover_url: "/uploads/covers/cover-ebook-04.jpg",
    file_url: "/uploads/ebooks/administrasi-server-jaringan.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    tipe_buku: "BIASA",
  },
  {
    kode_buku: "978-602-244-672-9",
    judul: "Boga Dasar: Persiapan & Pengolahan Masakan Indonesia",
    penulis: "Dra. Wiwi Rusmini, Dra. Laksmi Dharmayanti",
    kategori: "Tata Boga & Kuliner",
    klasifikasi: "641.595",
    tahun_ajaran: "2021",
    cover_url: "/uploads/covers/cover-ebook-05.jpg",
    file_url: "/uploads/ebooks/boga-dasar-kuliner.pdf",
    is_ebook: true,
    stok_total: 99,
    stok_tersedia: 99,
    is_referensi: false,
    tipe_buku: "BIASA",
  },
];

async function main() {
  console.log("Seeding 5 e-books into the database...");

  // Find a default or matching rak
  const defaultRak = await prisma.rak.findFirst();
  const rakId = defaultRak ? defaultRak.id : null;

  // Get current highest eksemplar kode
  const lastEksemplar = await prisma.eksemplar.findFirst({
    orderBy: { kode: "desc" },
    select: { kode: true },
  });
  let kodeNum = lastEksemplar && !isNaN(parseInt(lastEksemplar.kode, 10)) ? parseInt(lastEksemplar.kode, 10) : 1000;

  for (const item of EBOOKS) {
    // Check if book with this kode_buku or title already exists
    const existing = await prisma.buku.findFirst({
      where: {
        OR: [
          { kode_buku: item.kode_buku },
          { judul: item.judul }
        ]
      }
    });

    if (existing) {
      console.log(`Updating existing e-book: ${item.judul}`);
      await prisma.buku.update({
        where: { id: existing.id },
        data: {
          ...item,
        }
      });
    } else {
      console.log(`Creating new e-book: ${item.judul}`);
      const created = await prisma.buku.create({
        data: {
          ...item,
        }
      });

      // Add 1 virtual eksemplar for catalog completeness
      kodeNum += 1;
      await prisma.eksemplar.create({
        data: {
          kode: kodeNum.toString().padStart(8, "0"),
          bukuId: created.id,
          rakId: rakId,
          tipe_koleksi: "Reference",
          status: "TERSEDIA",
        }
      });
    }
  }

  const count = await prisma.buku.count({ where: { is_ebook: true } });
  console.log(`Successfully verified! Total e-books in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error seeding ebooks:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
