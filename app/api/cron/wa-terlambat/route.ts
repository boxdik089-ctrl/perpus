import { NextResponse } from "next/server";
import { timingSafeCompare } from "@/lib/security";
import { runWeeklyWhatsAppBroadcast } from "@/lib/whatsapp-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/wa-terlambat
 * Endpoint Cron Otomatis Mingguan (1x seminggu) untuk pengingat pinjaman & keterlambatan buku via WhatsApp.
 * Dilewati otomatis jika tidak ada peminjam aktif atau jika sudah dikirim dalam 6 hari terakhir.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const secretKey = searchParams.get("key") || authHeader?.replace(/^Bearer\s+/i, "");

    const expectedSecret = process.env.CRON_SECRET;
    if (!expectedSecret || !timingSafeCompare(secretKey, expectedSecret)) {
      return NextResponse.json(
        { error: "Akses ditolak. Secret key tidak valid atau CRON_SECRET belum disetel." },
        { status: 401 }
      );
    }

    const force = searchParams.get("force") === "1";
    const onlyOverdue = searchParams.get("mode") === "overdue";

    const result = await runWeeklyWhatsAppBroadcast({
      force,
      onlyOverdue,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron WA Mingguan Error:", error);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan internal saat memproses pengingat WhatsApp mingguan." },
      { status: 500 }
    );
  }
}
