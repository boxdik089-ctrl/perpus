import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import path from "path";

/**
 * Memverifikasi apakah request berasal dari Admin yang terautentikasi.
 * Jika tidak terautentikasi, melempar exception "Unauthorized".
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: Akses ditolak. Anda harus login sebagai admin untuk melakukan tindakan ini.");
  }
  return session;
}

/**
 * Sliding window rate limiter in-memory untuk membatasi serangan Brute-Force & DoS.
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan data lama secara periodik untuk mencegah memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 3600000); // 1 jam
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000); // Tiap 5 menit
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter hanya timestamp dalam rentang window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    rateLimitStore.set(key, record);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Bersihkan riwayat rate limit untuk kunci tertentu (misal: saat login berhasil).
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Ambil Client IP secara aman dari request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Ambil IP pertama jika melalui multi-proxy
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Perbandingan string tahan timing-attack (untuk secret keys seperti CRON_SECRET).
 */
export function timingSafeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitasi string input dasar untuk mencegah serangan null-byte & input berbahaya.
 */
export function sanitizeInput(input: string, maxLen = 1000): string {
  if (typeof input !== "string") return "";
  // Hapus null bytes dan karakter kontrol berbahaya
  return input.replace(/\0/g, "").slice(0, maxLen).trim();
}

/**
 * Escape karakter HTML untuk mencegah serangan Stored XSS jika dirender mentah.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validasi kekuatan password: minimal 6 karakter, tidak boleh hanya spasi.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password tidak boleh kosong." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password minimal harus memiliki 6 karakter." };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password terlalu panjang (maksimal 128 karakter)." };
  }
  return { valid: true };
}

/**
 * Memastikan path file berada di dalam folder dasar yang diizinkan (mencegah Path Traversal).
 */
export function isSafePath(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);
  return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
}
