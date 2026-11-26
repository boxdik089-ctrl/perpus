"use server";

import { prisma } from "@/lib/prisma";
import { hitungDenda } from "@/lib/utils";
import { requireAdminSession } from "@/lib/security";
import {
  generateTerlambatMessage,
  createWhatsAppWebUrl,
  sendViaWhatsAppGateway,
  getFonnteDeviceStatus,
  type FonnteDeviceStatus,
} from "@/lib/whatsapp";
import { runWeeklyWhatsAppBroadcast } from "@/lib/whatsapp-server";

/**
 * Ambil daftar peminjam terlambat lengkap dengan info kontak siswa/anggota
 */
export async function getDaftarPeminjamTerlambat() {
  await requireAdminSession();
  const now = new Date();

  const transaksiList = await prisma.transaksi.findMany({
    where: {
      status: "DIPINJAM",
      batas_kembali: { lt: now },
    },
    include: {
      siswa: true,
      buku: true,
      anggota: true,
      eksemplar: { include: { buku: true } },
    },
    orderBy: { batas_kembali: "asc" },
  });

  // Lookup fallback telepon dari Anggota berdasarkan NISN bila transaksi hanya menautkan siswaId
  const missingNisns = Array.from(
    new Set(
      transaksiList
        .filter((t) => !t.anggota?.telepon && t.siswa?.nisn)
        .map((t) => t.siswa!.nisn)
    )
  );
  const nisnPhoneMap = new Map<string, string>();
  if (missingNisns.length > 0) {
    const matched = await prisma.anggota.findMany({
      where: { nisn: { in: missingNisns }, telepon: { not: null } },
      select: { nisn: true, telepon: true },
    });
    for (const m of matched) {
      if (m.nisn && m.telepon) nisnPhoneMap.set(m.nisn, m.telepon);
    }
  }

  return transaksiList.map((t) => {
    const hariTerlambat = Math.max(
      1,
      Math.floor((now.getTime() - new Date(t.batas_kembali).getTime()) / (1000 * 60 * 60 * 24))
    );
    const denda = hitungDenda(t.batas_kembali, now);

    const nama = t.anggota?.nama || t.siswa?.nama || "Peminjam";
    const kelas = t.siswa?.kelas || (t.anggota?.jenis === "GURU" ? "GURU" : t.anggota?.jenis === "STAF" ? "STAF" : null);
    const telepon = t.anggota?.telepon || (t.siswa?.nisn ? nisnPhoneMap.get(t.siswa.nisn) ?? null : null);
    const nisn = t.siswa?.nisn || t.anggota?.nisn || null;
    const no_anggota = t.anggota?.no_anggota || null;
    const judul = t.buku?.judul || t.eksemplar?.buku?.judul || "Buku Perpustakaan";
    const kode = t.eksemplar?.kode || t.buku?.kode_buku || "";

    const message = generateTerlambatMessage({
      nama,
      kelas,
      judul_buku: judul,
      batas_kembali: new Date(t.batas_kembali).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      hari_terlambat: hariTerlambat,
      denda,
    });

    const waUrl = telepon ? createWhatsAppWebUrl(telepon, message) : null;

    return {
      id: t.id,
      nama,
      kelas,
      nisn,
      no_anggota,
      telepon,
      judul,
      kode,
      tgl_pinjam: new Date(t.tgl_pinjam).toISOString(),
      batas_kembali: new Date(t.batas_kembali).toISOString(),
      hariTerlambat,
      denda,
      defaultMessage: message,
      waUrl,
    };
  });
}

/**
 * Cek status live perangkat Fonnte dari panel admin.
 */
export async function cekStatusFonnteAction(): Promise<FonnteDeviceStatus> {
  await requireAdminSession();
  return await getFonnteDeviceStatus();
}

/**
 * Kirim pesan notifikasi WhatsApp via Gateway API
 */
export async function kirimWhatsAppAction(
  targetPhone: string,
  message: string
): Promise<{ ok: boolean; message: string; response?: Record<string, unknown> }> {
  await requireAdminSession();
  return await sendViaWhatsAppGateway(targetPhone, message, { delay: "3-8", timeoutMs: 8000 });
}

/**
 * Jalankan broadcast pengingat mingguan dari tombol panel admin (dikelompokkan per nomor & berjeda aman).
 */
export async function jalankanCronMingguanAction(force = false) {
  await requireAdminSession();
  return await runWeeklyWhatsAppBroadcast({ force, onlyOverdue: false });
}

/**
 * Batch broadcast pengingat terlambat ke semua siswa terlambat yang memiliki nomor telepon
 */
export async function broadcastPengingatTerlambatAction(transaksiIds?: string[]) {
  await requireAdminSession();
  const res = await runWeeklyWhatsAppBroadcast({
    force: true,
    onlyOverdue: true,
    transaksiIds,
  });

  return {
    ok: res.sentCount > 0,
    message: res.message,
    totalSent: res.sentCount + res.failedCount,
    totalSuccess: res.sentCount,
  };
}
