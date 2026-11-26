import { prisma } from "@/lib/prisma";
import { hitungDenda } from "@/lib/utils";
import {
  formatNomorWhatsApp,
  generateBatchPinjamMessage,
  generateWeeklyDigestMessage,
  getFonnteDeviceStatus,
  sendViaWhatsAppGateway,
  type WeeklyDigestBookItem,
} from "@/lib/whatsapp";

const WEEKLY_COOLDOWN_MS = 6 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const INTER_RECIPIENT_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Kirim notifikasi bukti peminjaman WhatsApp secara non-blocking di background.
 * Sengaja tidak melempar exception agar frontend sirkulasi/transaksi selalu responsif.
 */
export function notifyBorrowNonBlocking(params: {
  transaksiIds: string[];
  anggotaId?: string | null;
  siswaNisn?: string | null;
  telepon?: string | null;
  nama: string;
  kelas?: string | null;
  noAnggota?: string | null;
  judulList: string[];
  tglPinjam: Date;
  batasKembali: Date;
}) {
  void (async () => {
    try {
      let targetPhone = params.telepon?.trim() || "";

      if (!targetPhone && (params.anggotaId || params.siswaNisn)) {
        const anggota = await prisma.anggota.findFirst({
          where: {
            OR: [
              ...(params.anggotaId ? [{ id: params.anggotaId }] : []),
              ...(params.siswaNisn ? [{ nisn: params.siswaNisn }] : []),
            ],
            telepon: { not: null },
          },
          select: { telepon: true, no_anggota: true },
        });
        targetPhone = anggota?.telepon || "";
      }

      const cleanPhone = formatNomorWhatsApp(targetPhone);
      if (!cleanPhone) return;

      const tglStr = params.tglPinjam.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const batasStr = params.batasKembali.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const message = generateBatchPinjamMessage({
        nama: params.nama,
        kelas: params.kelas,
        no_anggota: params.noAnggota || undefined,
        judul_list: params.judulList,
        tgl_pinjam: tglStr,
        batas_kembali: batasStr,
      });

      const res = await sendViaWhatsAppGateway(cleanPhone, message, {
        delay: "3-8",
        timeoutMs: 8000,
      });

      if (res.ok && params.transaksiIds.length > 0) {
        await prisma.transaksi.updateMany({
          where: { id: { in: params.transaksiIds } },
          data: { waLastSentAt: new Date() },
        });
      } else if (!res.ok) {
        console.warn("[WA Pinjam] Gagal mengirim otomatis:", res.message);
      }
    } catch (err) {
      console.error("[WA Pinjam] Error background notification:", err);
    }
  })();
}

export type WeeklyBroadcastResult = {
  ok: boolean;
  message: string;
  timestamp: string;
  totalActiveLoans: number;
  eligibleLoans: number;
  skippedCooldownCount: number;
  skippedNoPhoneCount: number;
  sentCount: number;
  failedCount: number;
  deviceConnected: boolean;
  logs: Array<{
    nama: string;
    telepon: string | null;
    bookCount: number;
    status: "SENT" | "FAILED" | "SKIPPED";
    detail?: string;
  }>;
};

/**
 * Menjalankan broadcast pengingat mingguan otomatis (maksimal 1x seminggu per peminjaman).
 * Menggabungkan seluruh buku milik 1 nomor WA menjadi satu pesan ringkas dengan jeda anti-ban.
 */
export async function runWeeklyWhatsAppBroadcast(options?: {
  force?: boolean;
  onlyOverdue?: boolean;
  transaksiIds?: string[];
}): Promise<WeeklyBroadcastResult> {
  const now = new Date();
  const force = Boolean(options?.force);
  const onlyOverdue = Boolean(options?.onlyOverdue);
  const sevenDaysFromNow = new Date(now.getTime() + SEVEN_DAYS_MS);
  const cooldownCutoff = new Date(now.getTime() - WEEKLY_COOLDOWN_MS);

  const transactions = await prisma.transaksi.findMany({
    where: {
      status: "DIPINJAM",
      ...(onlyOverdue
        ? { batas_kembali: { lt: now } }
        : { batas_kembali: { lte: sevenDaysFromNow } }),
      ...(options?.transaksiIds && options.transaksiIds.length > 0
        ? { id: { in: options.transaksiIds } }
        : {}),
    },
    include: {
      siswa: { select: { nama: true, kelas: true, nisn: true } },
      anggota: {
        select: {
          nama: true,
          telepon: true,
          nisn: true,
          jenis: true,
          kelasRef: { select: { nama_kelas: true } },
        },
      },
      buku: { select: { judul: true } },
      eksemplar: {
        select: {
          buku: { select: { judul: true } },
        },
      },
    },
    orderBy: { batas_kembali: "asc" },
  });

  if (transactions.length === 0) {
    return {
      ok: true,
      message: "Tidak ada peminjaman buku aktif/terlambat yang perlu diingatkan minggu ini.",
      timestamp: now.toISOString(),
      totalActiveLoans: 0,
      eligibleLoans: 0,
      skippedCooldownCount: 0,
      skippedNoPhoneCount: 0,
      sentCount: 0,
      failedCount: 0,
      deviceConnected: true,
      logs: [],
    };
  }

  // Filter cooldown 1x seminggu agar tidak pernah spam walau dipanggil berulang
  let skippedCooldownCount = 0;
  const dueForReminder = transactions.filter((t) => {
    if (!force && t.waLastSentAt && t.waLastSentAt > cooldownCutoff) {
      skippedCooldownCount++;
      return false;
    }
    return true;
  });

  if (dueForReminder.length === 0) {
    return {
      ok: true,
      message: `Semua ${transactions.length} peminjaman sudah menerima notifikasi WA minggu ini.`,
      timestamp: now.toISOString(),
      totalActiveLoans: transactions.length,
      eligibleLoans: 0,
      skippedCooldownCount,
      skippedNoPhoneCount: 0,
      sentCount: 0,
      failedCount: 0,
      deviceConnected: true,
      logs: [],
    };
  }

  // Cek kesehatan device Fonnte sebelum melakukan pengiriman massal
  const deviceStatus = await getFonnteDeviceStatus();
  if (deviceStatus.configured && !deviceStatus.connected) {
    return {
      ok: false,
      message: `Perangkat Fonnte saat ini terputus (${deviceStatus.deviceStatus}). Pengiriman ditunda agar tidak gagal massal.`,
      timestamp: now.toISOString(),
      totalActiveLoans: transactions.length,
      eligibleLoans: dueForReminder.length,
      skippedCooldownCount,
      skippedNoPhoneCount: 0,
      sentCount: 0,
      failedCount: 0,
      deviceConnected: false,
      logs: [],
    };
  }

  // Fallback lookup nomor WA via NISN anggota bila transaksi legacy hanya memiliki siswaId
  const missingPhoneNisns = Array.from(
    new Set(
      dueForReminder
        .filter((t) => !t.anggota?.telepon && t.siswa?.nisn)
        .map((t) => t.siswa!.nisn)
    )
  );
  const nisnPhoneMap = new Map<string, string>();
  if (missingPhoneNisns.length > 0) {
    const matchedAnggota = await prisma.anggota.findMany({
      where: {
        nisn: { in: missingPhoneNisns },
        telepon: { not: null },
      },
      select: { nisn: true, telepon: true },
    });
    for (const a of matchedAnggota) {
      if (a.nisn && a.telepon) {
        nisnPhoneMap.set(a.nisn, a.telepon);
      }
    }
  }

  type RecipientGroup = {
    cleanPhone: string;
    nama: string;
    kelas: string | null;
    transaksiIds: string[];
    items: WeeklyDigestBookItem[];
  };

  const groups = new Map<string, RecipientGroup>();
  const logs: WeeklyBroadcastResult["logs"] = [];
  let skippedNoPhoneCount = 0;

  for (const t of dueForReminder) {
    const nama = t.anggota?.nama || t.siswa?.nama || "Peminjam";
    const kelas =
      t.siswa?.kelas ||
      t.anggota?.kelasRef?.nama_kelas ||
      (t.anggota?.jenis === "GURU" ? "GURU" : t.anggota?.jenis === "STAF" ? "STAF" : null);
    const rawPhone = t.anggota?.telepon || (t.siswa?.nisn ? nisnPhoneMap.get(t.siswa.nisn) : null);
    const cleanPhone = formatNomorWhatsApp(rawPhone);

    if (!cleanPhone) {
      skippedNoPhoneCount++;
      logs.push({
        nama,
        telepon: null,
        bookCount: 1,
        status: "SKIPPED",
        detail: "Nomor WhatsApp belum terdaftar di data anggota.",
      });
      continue;
    }

    const judul = t.buku?.judul || t.eksemplar?.buku?.judul || "Buku Perpustakaan";
    const isOverdue = t.batas_kembali < now;
    const terlambatHari = isOverdue
      ? Math.max(1, Math.floor((now.getTime() - t.batas_kembali.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    const denda = isOverdue ? hitungDenda(t.batas_kembali, now) : 0;

    const existing = groups.get(cleanPhone) ?? {
      cleanPhone,
      nama,
      kelas,
      transaksiIds: [],
      items: [],
    };
    existing.transaksiIds.push(t.id);
    existing.items.push({
      judul,
      batasKembali: new Date(t.batas_kembali).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      terlambatHari,
      denda,
    });
    groups.set(cleanPhone, existing);
  }

  let sentCount = 0;
  let failedCount = 0;
  const recipientList = Array.from(groups.values());

  for (let i = 0; i < recipientList.length; i++) {
    const group = recipientList[i];
    const message = generateWeeklyDigestMessage({
      nama: group.nama,
      kelas: group.kelas,
      items: group.items,
    });

    const res = await sendViaWhatsAppGateway(group.cleanPhone, message, {
      delay: "5-12",
      timeoutMs: 8000,
    });

    if (res.ok) {
      sentCount++;
      await prisma.transaksi.updateMany({
        where: { id: { in: group.transaksiIds } },
        data: { waLastSentAt: now },
      });
      logs.push({
        nama: group.nama,
        telepon: group.cleanPhone,
        bookCount: group.items.length,
        status: "SENT",
        detail: res.message,
      });
    } else {
      failedCount++;
      logs.push({
        nama: group.nama,
        telepon: group.cleanPhone,
        bookCount: group.items.length,
        status: "FAILED",
        detail: res.message,
      });
    }

    if (i < recipientList.length - 1) {
      await sleep(INTER_RECIPIENT_DELAY_MS);
    }
  }

  return {
    ok: failedCount === 0 || sentCount > 0,
    message:
      recipientList.length === 0
        ? "Tidak ada peminjam yang memiliki nomor WhatsApp terdaftar."
        : `Pengingat mingguan diproses: ${sentCount} penerima berhasil, ${failedCount} gagal, ${skippedNoPhoneCount} tanpa nomor WA.`,
    timestamp: now.toISOString(),
    totalActiveLoans: transactions.length,
    eligibleLoans: dueForReminder.length,
    skippedCooldownCount,
    skippedNoPhoneCount,
    sentCount,
    failedCount,
    deviceConnected: deviceStatus.connected,
    logs,
  };
}
