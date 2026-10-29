"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession, checkRateLimit, sanitizeInput } from "@/lib/security";

export type CreateUlasanInput = {
  bukuId: string;
  nama: string;
  rating: number;
  komentar: string;
};

/**
 * Buat ulasan baru untuk buku (dari katalog publik oleh siswa/pembaca)
 */
export async function createUlasan(params: CreateUlasanInput) {
  const { bukuId, nama, rating, komentar } = params;

  if (!bukuId || typeof bukuId !== "string") {
    return { ok: false, error: "Buku tidak valid" };
  }

  // Rate limiting ulasan per buku untuk mencegah spam bot
  const rateKey = `ulasan:${bukuId}`;
  const rateCheck = checkRateLimit(rateKey, 10, 60 * 1000);
  if (!rateCheck.allowed) {
    return {
      ok: false,
      error: `Terlalu banyak ulasan dikirimkan sekaligus. Silakan tunggu ${rateCheck.retryAfterSeconds} detik.`,
    };
  }

  // Sanitasi & pembatasan panjang karakter (XSS & Buffer DoS Prevention)
  const cleanNama = sanitizeInput(nama || "", 60).replace(/[<>]/g, "");
  if (cleanNama.length < 2) {
    return { ok: false, error: "Nama pengulas minimal 2 karakter (maksimal 60 karakter)" };
  }

  const cleanRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  const cleanKomentar = sanitizeInput(komentar || "", 500).replace(/[<>]/g, "");
  if (cleanKomentar.length < 3) {
    return { ok: false, error: "Isi ulasan minimal 3 karakter (maksimal 500 karakter)" };
  }

  try {
    const bukuExists = await prisma.buku.findUnique({
      where: { id: bukuId },
      select: { id: true },
    });
    if (!bukuExists) {
      return { ok: false, error: "Buku tidak ditemukan di sistem." };
    }

    const created = await prisma.ulasan.create({
      data: {
        bukuId,
        nama: cleanNama,
        rating: cleanRating,
        komentar: cleanKomentar,
      },
      include: {
        buku: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/ulasan");
    return { ok: true, ulasan: created };
  } catch (error: any) {
    console.error("Gagal menambahkan ulasan:", error);
    return { ok: false, error: "Gagal menyimpan ulasan ke database." };
  }
}

/**
 * Hapus ulasan oleh petugas / admin perpustakaan
 */
export async function deleteUlasan(id: string) {
  await requireAdminSession();

  if (!id || typeof id !== "string") {
    return { ok: false, error: "ID ulasan tidak valid" };
  }

  try {
    await prisma.ulasan.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/ulasan");
    return { ok: true };
  } catch (error: any) {
    console.error("Gagal menghapus ulasan:", error);
    return { ok: false, error: "Gagal menghapus ulasan dari database." };
  }
}

/**
 * Ambil semua ulasan untuk manajemen moderasi admin
 */
export async function getAdminUlasanList(params?: {
  query?: string;
  rating?: number;
}) {
  await requireAdminSession();

  const where: any = {};
  if (params?.rating && params.rating > 0) {
    where.rating = params.rating;
  }

  if (params?.query && params.query.trim()) {
    const q = params.query.trim();
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { komentar: { contains: q, mode: "insensitive" } },
      { buku: { judul: { contains: q, mode: "insensitive" } } },
    ];
  }

  try {
    const list = await prisma.ulasan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        buku: {
          select: {
            id: true,
            judul: true,
            penulis: true,
            cover_url: true,
            kategori: true,
          },
        },
      },
    });

    return { ok: true, list };
  } catch (error: any) {
    console.error("Gagal memuat daftar ulasan admin:", error);
    return { ok: false, error: "Gagal memuat ulasan." };
  }
}
