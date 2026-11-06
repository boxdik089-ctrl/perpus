"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateNoAnggota } from "@/lib/generators";
import { requireAdminSession, checkRateLimit, sanitizeInput } from "@/lib/security";

/**
 * CRUD Anggota (SISWA / GURU / STAF). no_anggota auto-generate sequential.
 * createdAt dipakai sebagai "tanggal menjadi anggota" — realtime tampil di UI.
 */

export async function createAnggota(formData: FormData) {
  await requireAdminSession();
  const nama = (formData.get("nama") as string)?.trim();
  const jenis = (formData.get("jenis") as string) || "SISWA";
  const nisn = (formData.get("nisn") as string)?.trim() || null;
  const telepon = (formData.get("telepon") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const kelasId = (formData.get("kelasId") as string) || null;

  if (!nama) throw new Error("Nama wajib diisi");

  // SISWA wajib NISN & unik
  if (jenis === "SISWA") {
    if (!nisn) throw new Error("NISN wajib untuk anggota siswa");
    const dup = await prisma.anggota.findFirst({ where: { nisn } });
    if (dup) throw new Error(`NISN ${nisn} sudah terdaftar sebagai ${dup.nama}`);
  }

  const no_anggota = await generateNoAnggota();

  await prisma.anggota.create({
    data: {
      no_anggota,
      nama,
      jenis: jenis as any,
      nisn: jenis === "SISWA" ? nisn : null,
      kelasId: jenis === "SISWA" ? kelasId : null,
      telepon: telepon || null,
      alamat: alamat || null,
      status_aktif: true,
    },
  });

  revalidatePath("/admin/anggota");
  redirect("/admin/anggota");
}

export async function updateAnggota(id: string, formData: FormData) {
  await requireAdminSession();
  const nama = (formData.get("nama") as string)?.trim();
  const jenis = (formData.get("jenis") as string) || "SISWA";
  const nisn = (formData.get("nisn") as string)?.trim() || null;
  const telepon = (formData.get("telepon") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const kelasId = (formData.get("kelasId") as string) || null;
  const status_aktif = formData.get("status_aktif") === "on";

  if (!nama) throw new Error("Nama wajib diisi");

  const existing = await prisma.anggota.findUnique({ where: { id } });
  if (!existing) throw new Error("Anggota tidak ditemukan");

  if (jenis === "SISWA" && nisn) {
    const dup = await prisma.anggota.findFirst({
      where: { nisn, NOT: { id } },
    });
    if (dup) throw new Error(`NISN ${nisn} dipakai oleh ${dup.nama}`);
  }

  await prisma.anggota.update({
    where: { id },
    data: {
      nama,
      jenis: jenis as any,
      nisn: jenis === "SISWA" ? nisn : null,
      kelasId: jenis === "SISWA" ? kelasId : null,
      telepon: telepon || null,
      alamat: alamat || null,
      status_aktif,
    },
  });

  revalidatePath("/admin/anggota");
  redirect("/admin/anggota");
}

export async function deleteAnggota(id: string) {
  await requireAdminSession();
  const aktif = await prisma.transaksi.findFirst({
    where: { anggotaId: id, status: "DIPINJAM" },
  });
  if (aktif) {
    throw new Error("Tidak bisa hapus: masih ada buku dipinjam");
  }

  await prisma.anggota.delete({ where: { id } });
  revalidatePath("/admin/anggota");
}

export async function toggleStatusAnggota(id: string, aktif: boolean) {
  await requireAdminSession();
  await prisma.anggota.update({
    where: { id },
    data: { status_aktif: aktif },
  });
  revalidatePath("/admin/anggota");
}

export async function getAnggotaForKartu(query: string) {
  await requireAdminSession();
  const value = query.trim();
  if (!value) return null;

  const anggota = await prisma.anggota.findFirst({
    where: {
      OR: [
        { no_anggota: { equals: value, mode: "insensitive" } },
        { nisn: value },
        { nama: { contains: value, mode: "insensitive" } },
        { id: value },
      ],
      status_aktif: true,
    },
    include: {
      kelasRef: true,
    },
  });

  if (!anggota) return null;

  return {
    id: anggota.id,
    no_anggota: anggota.no_anggota,
    nama: anggota.nama,
    jenis: anggota.jenis,
    nisn: anggota.nisn,
    kelas: anggota.kelasRef?.nama_kelas ?? null,
  };
}

export async function getKartuDigitalSiswa(query: string) {
  const value = sanitizeInput(query || "", 80);
  if (!value || value.length < 3) return null;

  // Rate limiting pencarian kartu untuk mencegah automated scraping data siswa
  const rateCheck = checkRateLimit(`kartu_search:${value}`, 30, 60 * 1000);
  if (!rateCheck.allowed) {
    return null;
  }

  // 1. Cari di Anggota
  let anggota = await prisma.anggota.findFirst({
    where: {
      OR: [
        { nisn: { equals: value, mode: "insensitive" } },
        { no_anggota: { equals: value, mode: "insensitive" } },
        { nama: { equals: value, mode: "insensitive" } },
      ],
      status_aktif: true,
    },
    include: {
      kelasRef: true,
      transaksi: {
        where: { status: "DIPINJAM" },
        include: { buku: { select: { judul: true } } },
      },
    },
  });

  // 2. Jika belum ada di Anggota tapi ada di Siswa, daftarkan otomatis agar punya no_anggota & QR
  if (!anggota) {
    const siswa = await prisma.siswa.findFirst({
      where: {
        OR: [
          { nisn: { equals: value, mode: "insensitive" } },
          { nama: { equals: value, mode: "insensitive" } },
        ],
      },
      include: { kelasRef: true },
    });

    if (siswa) {
      const { generateNoAnggota } = await import("@/lib/generators");
      const no_anggota = await generateNoAnggota();

      anggota = await prisma.anggota.create({
        data: {
          no_anggota,
          nama: siswa.nama,
          jenis: "SISWA",
          nisn: siswa.nisn,
          kelasId: siswa.kelasId,
          status_aktif: true,
        },
        include: {
          kelasRef: true,
          transaksi: {
            where: { status: "DIPINJAM" },
            include: { buku: { select: { judul: true } } },
          },
        },
      });
    }
  }

  if (!anggota) return null;

  return {
    id: anggota.id,
    no_anggota: anggota.no_anggota,
    nama: anggota.nama,
    jenis: anggota.jenis,
    nisn: anggota.nisn,
    telepon: anggota.telepon
      ? anggota.telepon.slice(0, 4) + "••••" + anggota.telepon.slice(-3)
      : null,
    kelas: anggota.kelasRef?.nama_kelas ?? null,
    totalBukuDipinjam: anggota.transaksi.length,
    bukuDipinjam: anggota.transaksi.map((t) => t.buku?.judul).filter(Boolean) as string[],
    bergabungSejak: anggota.createdAt.toISOString(),
  };
}

/**
 * Update Nomor WhatsApp secara mandiri oleh siswa / anggota
 */
export async function updateWhatsAppMandiriAction(
  identifier: string,
  teleponInput: string
): Promise<{ ok: boolean; message: string; telepon?: string }> {
  try {
    const { formatNomorWhatsApp } = await import("@/lib/whatsapp");
    const cleanPhone = formatNomorWhatsApp(teleponInput);

    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        ok: false,
        message: "Nomor WhatsApp tidak valid. Masukkan minimal 10 digit (contoh: 08123456789).",
      };
    }

    const value = sanitizeInput(identifier || "", 80);
    if (!value) {
      return { ok: false, message: "Identitas anggota tidak valid." };
    }

    // Rate limiting ganda: per nomor telepon DAN per identitas anggota
    const rateCheckPhone = checkRateLimit(`wa_update_phone:${cleanPhone}`, 3, 5 * 60 * 1000);
    const rateCheckId = checkRateLimit(`wa_update_id:${value.toLowerCase()}`, 3, 5 * 60 * 1000);
    if (!rateCheckPhone.allowed || !rateCheckId.allowed) {
      const waitSec = Math.max(rateCheckPhone.retryAfterSeconds, rateCheckId.retryAfterSeconds);
      return {
        ok: false,
        message: `Terlalu banyak permintaan update. Harap tunggu ${waitSec} detik sebelum mencoba lagi.`,
      };
    }

    const anggota = await prisma.anggota.findFirst({
      where: {
        OR: [
          { id: value },
          { no_anggota: { equals: value, mode: "insensitive" } },
          { nisn: { equals: value, mode: "insensitive" } },
        ],
      },
    });

    if (!anggota) {
      return { ok: false, message: "Data anggota siswa tidak ditemukan di sistem." };
    }

    await prisma.anggota.update({
      where: { id: anggota.id },
      data: { telepon: cleanPhone },
    });

    revalidatePath("/kartu");
    revalidatePath("/admin/anggota");
    revalidatePath("/admin/whatsapp");
    revalidatePath("/admin/transaksi");

    return {
      ok: true,
      message: "Nomor WhatsApp berhasil didaftarkan dan tersimpan!",
      telepon: cleanPhone,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || "Gagal menyimpan nomor WhatsApp.",
    };
  }
}

// Helper untuk mencari kelas kenaikan tingkat berikutnya (10 -> 11, 11 -> 12, dst)
function findNextKelas(
  sourceKelas: { id: string; tingkat: string; jurusan: string; nomor: number; nama_kelas: string },
  allKelas: Array<{ id: string; tingkat: string; jurusan: string; nomor: number; nama_kelas: string }>
) {
  let nextTingkat: string | null = null;
  let altNextTingkat: string | null = null;

  if (sourceKelas.tingkat === "11") {
    nextTingkat = "12";
    altNextTingkat = "XII";
  } else if (sourceKelas.tingkat === "XI") {
    nextTingkat = "XII";
    altNextTingkat = "12";
  } else if (sourceKelas.tingkat === "10") {
    nextTingkat = "11";
    altNextTingkat = "XI";
  } else if (sourceKelas.tingkat === "X") {
    nextTingkat = "XI";
    altNextTingkat = "11";
  } else {
    return null;
  }

  // 1. Prioritas utama: kecocokan tingkat target, jurusan, dan nomor kelas
  let match = allKelas.find(
    (t) => t.tingkat === nextTingkat && t.jurusan === sourceKelas.jurusan && t.nomor === sourceKelas.nomor
  );

  // 2. Prioritas kedua: alternatif format romawi / angka arab
  if (!match && altNextTingkat) {
    match = allKelas.find(
      (t) => t.tingkat === altNextTingkat && t.jurusan === sourceKelas.jurusan && t.nomor === sourceKelas.nomor
    );
  }

  // 3. Prioritas ketiga: kecocokan nama_kelas dengan regex awalan tingkat
  if (!match) {
    const targetName = sourceKelas.nama_kelas.replace(
      new RegExp("^" + sourceKelas.tingkat + "\\b"),
      nextTingkat
    );
    match = allKelas.find((t) => t.nama_kelas === targetName);
  }

  return match || null;
}

/**
 * Mengambil ringkasan data siswa kelas 12, 11, dan 10 untuk keperluan kelulusan & kenaikan kelas
 */
export async function getInfoKelas12() {
  await requireAdminSession();

  const allKelas = await prisma.kelas.findMany({
    select: { id: true, tingkat: true, jurusan: true, nomor: true, nama_kelas: true },
  });

  // Cari semua kelas 12
  const kelas12List = allKelas.filter(
    (k) =>
      ["XII", "12"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("12") ||
      k.nama_kelas.startsWith("XII")
  );
  const kelas12Ids = kelas12List.map((k) => k.id);

  // Cari semua kelas 11
  const kelas11List = allKelas.filter(
    (k) =>
      ["XI", "11"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("11") ||
      k.nama_kelas.startsWith("XI")
  );
  const kelas11Ids = kelas11List.map((k) => k.id);

  // Cari semua kelas 10
  const kelas10List = allKelas.filter(
    (k) =>
      ["X", "10"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("10") ||
      k.nama_kelas.startsWith("X ")
  );
  const kelas10Ids = kelas10List.map((k) => k.id);

  // Cari total anggota di masing-masing jenjang
  const [totalSiswaKelas12, totalSiswaKelas11, totalSiswaKelas10] = await Promise.all([
    prisma.anggota.count({
      where: {
        jenis: "SISWA",
        kelasId: { in: kelas12Ids },
      },
    }),
    prisma.anggota.count({
      where: {
        jenis: "SISWA",
        kelasId: { in: kelas11Ids },
      },
    }),
    prisma.anggota.count({
      where: {
        jenis: "SISWA",
        kelasId: { in: kelas10Ids },
      },
    }),
  ]);

  // Cari apakah ada siswa kelas 12 yang masih meminjam buku
  const peminjamAktif = await prisma.transaksi.findMany({
    where: {
      status: "DIPINJAM",
      anggota: {
        jenis: "SISWA",
        kelasId: { in: kelas12Ids },
      },
    },
    include: {
      anggota: { select: { nama: true, no_anggota: true } },
      buku: { select: { judul: true } },
    },
    take: 20,
  });

  return {
    totalSiswa: totalSiswaKelas12,
    totalSiswaKelas11,
    totalSiswaKelas10,
    totalKelas: kelas12List.length,
    namaKelas: kelas12List.map((k) => k.nama_kelas).sort(),
    totalPeminjamAktif: peminjamAktif.length,
    peminjamAktif: peminjamAktif.map((t) => ({
      nama: t.anggota?.nama || "Siswa",
      no_anggota: t.anggota?.no_anggota || "-",
      judulBuku: t.buku?.judul || "Buku",
    })),
  };
}

/**
 * Hapus permanen data siswa kelas 12 yang sudah tamat,
 * dan otomatis menaikkan jenjang kelas siswa kelas 11 -> 12, dan kelas 10 -> 11.
 */
export async function hapusSiswaKelas12Permanen() {
  await requireAdminSession();

  const allKelas = await prisma.kelas.findMany({
    select: { id: true, tingkat: true, jurusan: true, nomor: true, nama_kelas: true },
  });

  // Ambil semua kelas 12
  const kelas12List = allKelas.filter(
    (k) =>
      ["XII", "12"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("12") ||
      k.nama_kelas.startsWith("XII")
  );
  const kelas12Ids = kelas12List.map((k) => k.id);

  if (kelas12Ids.length === 0) {
    return { ok: false, message: "Tidak ditemukan kelas 12 di database." };
  }

  // Cek apakah ada yang masih meminjam buku di kelas 12
  const masihPinjamCount = await prisma.transaksi.count({
    where: {
      status: "DIPINJAM",
      anggota: {
        jenis: "SISWA",
        kelasId: { in: kelas12Ids },
      },
    },
  });

  if (masihPinjamCount > 0) {
    return {
      ok: false,
      message: `Gagal: Ada ${masihPinjamCount} peminjaman buku oleh siswa kelas 12 yang belum dikembalikan. Harap selesaikan pengembalian buku terlebih dahulu sebelum memproses kelulusan!`,
    };
  }

  // Ambil semua ID anggota siswa kelas 12 yang akan diluluskan
  const anggotaKelas12 = await prisma.anggota.findMany({
    where: {
      jenis: "SISWA",
      kelasId: { in: kelas12Ids },
    },
    select: { id: true, nisn: true },
  });

  const anggota12Ids = anggotaKelas12.map((a) => a.id);
  const nisn12List = anggotaKelas12.map((a) => a.nisn).filter(Boolean) as string[];

  // Ambil kelas 11 dan kelas 10
  const kelas11List = allKelas.filter(
    (k) =>
      ["XI", "11"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("11") ||
      k.nama_kelas.startsWith("XI")
  );

  const kelas10List = allKelas.filter(
    (k) =>
      ["X", "10"].includes(k.tingkat) ||
      k.nama_kelas.startsWith("10") ||
      k.nama_kelas.startsWith("X ")
  );

  // Jalankan dalam transaksi atomic
  const result = await prisma.$transaction(async (tx) => {
    // 1. HAPUS SISWA KELAS 12 (TAMAT/LULUS)
    let deletedCount = 0;
    if (anggota12Ids.length > 0) {
      // Unlink relasi transaksi lama yang sudah dikembalikan agar foreign key constraint tidak gagal
      await tx.transaksi.updateMany({
        where: { anggotaId: { in: anggota12Ids } },
        data: { anggotaId: null },
      });

      // Hapus dari tabel Anggota
      const deletedAnggota = await tx.anggota.deleteMany({
        where: { id: { in: anggota12Ids } },
      });
      deletedCount = deletedAnggota.count;

      // Bersihkan juga dari tabel Siswa jika ada
      if (nisn12List.length > 0) {
        await tx.siswa.deleteMany({
          where: { nisn: { in: nisn12List } },
        });
      }
    }

    // 2. OTOMATIS NAIKKAN KELAS 11 -> KELAS 12 (DIJALANKAN DULUAN SEBELUM KELAS 10 AGAR TIDAK DOUBLE PROMOTION)
    let naik11Count = 0;
    for (const sourceK of kelas11List) {
      const targetK = findNextKelas(sourceK, allKelas);
      if (!targetK) continue;

      const updatedAnggota = await tx.anggota.updateMany({
        where: { jenis: "SISWA", kelasId: sourceK.id },
        data: { kelasId: targetK.id },
      });
      naik11Count += updatedAnggota.count;

      await tx.siswa.updateMany({
        where: { kelasId: sourceK.id },
        data: { kelasId: targetK.id, kelas: targetK.nama_kelas },
      });
      await tx.siswa.updateMany({
        where: { kelas: sourceK.nama_kelas },
        data: { kelasId: targetK.id, kelas: targetK.nama_kelas },
      });
    }

    // 3. OTOMATIS NAIKKAN KELAS 10 -> KELAS 11
    let naik10Count = 0;
    for (const sourceK of kelas10List) {
      const targetK = findNextKelas(sourceK, allKelas);
      if (!targetK) continue;

      const updatedAnggota = await tx.anggota.updateMany({
        where: { jenis: "SISWA", kelasId: sourceK.id },
        data: { kelasId: targetK.id },
      });
      naik10Count += updatedAnggota.count;

      await tx.siswa.updateMany({
        where: { kelasId: sourceK.id },
        data: { kelasId: targetK.id, kelas: targetK.nama_kelas },
      });
      await tx.siswa.updateMany({
        where: { kelas: sourceK.nama_kelas },
        data: { kelasId: targetK.id, kelas: targetK.nama_kelas },
      });
    }

    return {
      deletedCount,
      naik11Count,
      naik10Count,
    };
  });

  revalidatePath("/admin/anggota");
  revalidatePath("/admin/siswa");
  revalidatePath("/admin");

  return {
    ok: true,
    deletedCount: result.deletedCount,
    naik11Count: result.naik11Count,
    naik10Count: result.naik10Count,
    message: `Proses kelulusan & kenaikan kelas berhasil! ${result.deletedCount} siswa kelas 12 lulus & dihapus, ${result.naik11Count} siswa kelas 11 otomatis naik ke kelas 12, dan ${result.naik10Count} siswa kelas 10 otomatis naik ke kelas 11. Kelas 10 kini kosong dan siap diisi siswa baru!`,
  };
}


