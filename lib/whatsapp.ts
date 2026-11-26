/**
 * Helper WhatsApp Notification & Template Generator
 * Sistem Manajemen Perpustakaan SMKN 1 Beringin
 */

export function formatNomorWhatsApp(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // Hapus semua karakter non-angka
  let clean = phone.replace(/\D/g, "");
  
  // Jika diawali 08..., ubah menjadi 628...
  if (clean.startsWith("08")) {
    clean = "62" + clean.slice(1);
  } else if (clean.startsWith("8")) {
    clean = "62" + clean;
  } else if (clean.startsWith("62")) {
    // sudah benar
  }
  
  return clean;
}

export type WhatsAppPayloadPinjam = {
  nama: string;
  kelas?: string | null;
  no_anggota?: string;
  judul_buku: string;
  kode_eksemplar?: string;
  tgl_pinjam: string;
  batas_kembali: string;
};

export type WhatsAppPayloadPengingat = {
  nama: string;
  kelas?: string | null;
  judul_buku: string;
  batas_kembali: string;
  sisa_hari?: number;
};

export type WhatsAppPayloadTerlambat = {
  nama: string;
  kelas?: string | null;
  judul_buku: string;
  batas_kembali: string;
  hari_terlambat: number;
  denda: number;
};

export type WhatsAppPayloadKembali = {
  nama: string;
  judul_buku: string;
  tgl_kembali: string;
  denda: number;
  status_denda?: "Lunas" | "Belum Bayar" | "Tidak Ada Denda";
};

/**
 * 1. Pesan Peminjaman Baru
 */
export function generatePinjamMessage(data: WhatsAppPayloadPinjam): string {
  const identitas = data.kelas ? `${data.nama} (${data.kelas})` : data.nama;
  return `📚 *PERPUSTAKAAN SMK NEGERI 1 BERINGIN*
Halo *${identitas}*,

Peminjaman buku Anda telah berhasil dicatat di sistem perpustakaan:
📖 *Judul Buku:* ${data.judul_buku}${data.kode_eksemplar ? `\n🏷️ *Kode Eksemplar:* ${data.kode_eksemplar}` : ""}${data.no_anggota ? `\n💳 *No. Anggota:* ${data.no_anggota}` : ""}
📅 *Tanggal Pinjam:* ${data.tgl_pinjam}
⏳ *Batas Pengembalian (Jatuh Tempo):* ${data.batas_kembali}

_Mohon menjaga kondisi buku dengan baik dan mengembalikan buku tepat waktu sebelum tanggal jatuh tempo. Terima kasih dan selamat membaca!_ ✨`;
}

/**
 * 2. Pesan Pengingat Jatuh Tempo (H-1 atau Hari H)
 */
export function generatePengingatMessage(data: WhatsAppPayloadPengingat): string {
  const identitas = data.kelas ? `${data.nama} (${data.kelas})` : data.nama;
  return `🔔 *PENGINGAT PENGEMBALIAN BUKU*
*Perpustakaan SMK Negeri 1 Beringin*

Halo *${identitas}*,
Kami ingin mengingatkan bahwa masa peminjaman buku perpustakaan Anda akan/sudah jatuh tempo:

📖 *Judul Buku:* ${data.judul_buku}
⏳ *Batas Pengembalian:* ${data.batas_kembali}

Silakan segera melakukan pengembalian atau perpanjangan peminjaman langsung di meja sirkulasi perpustakaan.

_Terima kasih atas kerja samanya dalam memelihara literasi sekolah!_ 📖`;
}

/**
 * 3. Pesan Keterlambatan & Denda
 */
export function generateTerlambatMessage(data: WhatsAppPayloadTerlambat): string {
  const identitas = data.kelas ? `${data.nama} (${data.kelas})` : data.nama;
  const dendaFormatted = data.denda.toLocaleString("id-ID");
  
  return `⚠️ *PEMBERITAHUAN KETERLAMBATAN PENGEMBALIAN BUKU*
*Perpustakaan SMK Negeri 1 Beringin*

Yth. *${identitas}*,
Buku yang Anda pinjam telah melewati batas waktu pengembalian yang ditentukan:

📖 *Judul Buku:* ${data.judul_buku}
📅 *Batas Jatuh Tempo:* ${data.batas_kembali}
⏱️ *Keterlambatan:* ${data.hari_terlambat} Hari
💰 *Akumulasi Denda:* Rp ${dendaFormatted}

Mohon segera mengembalikan buku fisik ke Perpustakaan SMKN 1 Beringin hari ini guna mencegah penambahan denda harian.

_Pesan otomatis dikirim oleh Sistem Informasi Perpustakaan SMKN 1 Beringin._`;
}

/**
 * 4. Pesan Konfirmasi Pengembalian Buku
 */
export function generateKembaliMessage(data: WhatsAppPayloadKembali): string {
  const dendaText = data.denda > 0 ? `Rp ${data.denda.toLocaleString("id-ID")} (${data.status_denda || "Lunas"})` : "Rp 0 (Tepat Waktu)";
  return `✅ *BUKU TELAH DIKEMBALIKAN*
*Perpustakaan SMK Negeri 1 Beringin*

Halo *${data.nama}*,
Buku perpustakaan telah berhasil dikembalikan:

📖 *Judul Buku:* ${data.judul_buku}
📅 *Tanggal Kembali:* ${data.tgl_kembali}
💰 *Status Denda:* ${dendaText}

Terima kasih telah membaca dan mengembalikan buku perpustakaan! 🙏`;
}

/**
 * Buat Direct URL wa.me untuk WhatsApp Web / Desktop / Mobile
 */
export function createWhatsAppWebUrl(phone: string, message: string): string {
  const cleanPhone = formatNomorWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export type FonnteDeviceStatus = {
  configured: boolean;
  connected: boolean;
  deviceStatus: string;
  name?: string;
  packageName?: string;
  quota?: string;
  expired?: string;
  messagesCount?: number;
  reason?: string;
};

export type WeeklyDigestBookItem = {
  judul: string;
  batasKembali: string;
  terlambatHari: number;
  denda: number;
};

/**
 * 1b. Pesan Peminjaman Kolektif (beberapa buku sekaligus dalam 1 pesan)
 */
export function generateBatchPinjamMessage(data: {
  nama: string;
  kelas?: string | null;
  no_anggota?: string;
  judul_list: string[];
  tgl_pinjam: string;
  batas_kembali: string;
}): string {
  if (data.judul_list.length <= 1) {
    return generatePinjamMessage({
      nama: data.nama,
      kelas: data.kelas,
      no_anggota: data.no_anggota,
      judul_buku: data.judul_list[0] || "Buku Perpustakaan",
      tgl_pinjam: data.tgl_pinjam,
      batas_kembali: data.batas_kembali,
    });
  }

  const identitas = data.kelas ? `${data.nama} (${data.kelas})` : data.nama;
  const daftar = data.judul_list.map((j, idx) => `${idx + 1}. ${j}`).join("\n");
  return `📚 *PERPUSTAKAAN SMK NEGERI 1 BERINGIN*
Halo *${identitas}*,

Peminjaman ${data.judul_list.length} buku Anda telah berhasil dicatat:
${daftar}${data.no_anggota ? `\n💳 *No. Anggota:* ${data.no_anggota}` : ""}
📅 *Tanggal Pinjam:* ${data.tgl_pinjam}
⏳ *Batas Pengembalian:* ${data.batas_kembali}

_Mohon menjaga kondisi buku dengan baik dan mengembalikan tepat waktu. Terima kasih dan selamat membaca!_`;
}

/**
 * 2b. Pesan Rekap Mingguan Otomatis (1 pesan per peminjam untuk semua buku aktif/terlambat)
 */
export function generateWeeklyDigestMessage(data: {
  nama: string;
  kelas?: string | null;
  items: WeeklyDigestBookItem[];
}): string {
  const identitas = data.kelas ? `${data.nama} (${data.kelas})` : data.nama;
  const totalDenda = data.items.reduce((sum, item) => sum + item.denda, 0);
  const hasOverdue = data.items.some((item) => item.terlambatHari > 0);

  const lines = data.items.map((item, idx) => {
    const statusText =
      item.terlambatHari > 0
        ? `⚠️ Terlambat ${item.terlambatHari} hari (Denda Rp ${item.denda.toLocaleString("id-ID")})`
        : `⏳ Batas kembali: ${item.batasKembali}`;
    return `${idx + 1}. *${item.judul}*\n   ${statusText}`;
  });

  const header = hasOverdue
    ? "⚠️ *PENGINGAT MINGGUAN & KETERLAMBATAN BUKU*"
    : "🔔 *PENGINGAT MINGGUAN PEMINJAMAN BUKU*";

  const footerNote = hasOverdue
    ? `💰 *Total Akumulasi Denda:* Rp ${totalDenda.toLocaleString("id-ID")}\nMohon segera mengembalikan buku ke meja sirkulasi Perpustakaan SMKN 1 Beringin agar denda harian tidak terus bertambah.`
    : "Mohon menjaga kondisi buku dengan baik dan mengembalikan sebelum tanggal jatuh tempo di Kiosk / meja sirkulasi Perpustakaan SMKN 1 Beringin.";

  return `${header}
*Perpustakaan SMK Negeri 1 Beringin*

Halo *${identitas}*,
Berikut rincian buku perpustakaan yang masih tercatat dipinjam atas nama Anda:

${lines.join("\n")}

${footerNote}

_Pesan otomatis mingguan Sistem Perpustakaan SMKN 1 Beringin._`;
}

/**
 * Cek status koneksi perangkat WhatsApp di Fonnte Gateway (non-throwing, timeout 5 detik).
 */
export async function getFonnteDeviceStatus(): Promise<FonnteDeviceStatus> {
  const fonnteToken = process.env.FONNTE_TOKEN?.trim();
  if (!fonnteToken) {
    return {
      configured: false,
      connected: false,
      deviceStatus: "unconfigured",
      reason: "FONNTE_TOKEN belum dikonfigurasi di .env",
    };
  }

  try {
    const res = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: {
        Authorization: fonnteToken,
      },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const deviceStatus = String(data?.device_status || (data?.status ? "connect" : "disconnect"));
    const connected = Boolean(data?.status) && deviceStatus.toLowerCase() === "connect";

    return {
      configured: true,
      connected,
      deviceStatus,
      name: data?.name ? String(data.name) : undefined,
      packageName: data?.package ? String(data.package) : undefined,
      quota: data?.quota !== undefined ? String(data.quota) : undefined,
      expired: data?.expired ? String(data.expired) : undefined,
      messagesCount: typeof data?.messages === "number" ? data.messages : undefined,
      reason: data?.reason ? String(data.reason) : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Timeout koneksi Fonnte";
    return {
      configured: true,
      connected: false,
      deviceStatus: "unreachable",
      reason: msg,
    };
  }
}

/**
 * Kirim via Gateway API (Fonnte / Wabot / Generic REST) dengan timeout & anti-ban delay.
 */
export async function sendViaWhatsAppGateway(
  targetPhone: string,
  message: string,
  options?: { delay?: string; timeoutMs?: number }
): Promise<{ ok: boolean; message: string; response?: Record<string, unknown> }> {
  const cleanPhone = formatNomorWhatsApp(targetPhone);
  if (!cleanPhone) {
    return { ok: false, message: "Nomor WhatsApp tidak valid atau belum diisi." };
  }

  const timeoutMs = options?.timeoutMs ?? 8000;

  // 1. Cek konfigurasi Fonnte
  const fonnteToken = process.env.FONNTE_TOKEN?.trim();
  if (fonnteToken) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: fonnteToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: cleanPhone,
          message,
          countryCode: "62",
          delay: options?.delay ?? "5-12",
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const resData = (await res.json()) as Record<string, unknown>;
      if (resData.status === true || resData.status === "true") {
        return { ok: true, message: "Pesan WhatsApp berhasil dikirim via Fonnte Gateway.", response: resData };
      }
      return {
        ok: false,
        message: String(resData.reason || resData.message || "Gagal mengirim pesan via Fonnte."),
        response: resData,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Koneksi ke Fonnte timeout";
      return { ok: false, message: `Error koneksi Gateway: ${msg}` };
    }
  }

  // 2. Cek Custom Generic WA Gateway
  const customGatewayUrl = process.env.WA_GATEWAY_URL;
  const customGatewayApiKey = process.env.WA_GATEWAY_API_KEY;
  if (customGatewayUrl) {
    try {
      const res = await fetch(customGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customGatewayApiKey ? { Authorization: `Bearer ${customGatewayApiKey}` } : {}),
        },
        body: JSON.stringify({
          phone: cleanPhone,
          message,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const resData = (await res.json()) as Record<string, unknown>;
      return { ok: res.ok, message: "Permintaan kirim WhatsApp telah diteruskan ke gateway.", response: resData };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Timeout gateway";
      return { ok: false, message: `Error koneksi custom gateway: ${msg}` };
    }
  }

  // Fallback jika belum pasang API Key di .env
  return {
    ok: false,
    message: "Gateway API otomatis belum dikonfigurasi (FONNTE_TOKEN atau WA_GATEWAY_URL). Anda dapat menggunakan tombol Kirim via WhatsApp Web langsung.",
  };
}
