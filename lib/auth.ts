import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { isRateLimited, recordFailedAttempt, clearRateLimit, sanitizeInput, getClientIp } from "@/lib/security";

const isHttps = process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  useSecureCookies: isHttps,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        const username = sanitizeInput(credentials.username.trim(), 100);
        if (!username) {
          throw new Error("Username tidak valid");
        }

        const clientIp = getClientIp(req as any);
        const ipRateLimitKey = `login_ip:${clientIp}`;
        const userRateLimitKey = `login_user:${username.toLowerCase()}`;

        // 1. Cek rate limiting per IP (maksimal 15 percobaan gagal per 10 menit)
        const ipRateCheck = isRateLimited(ipRateLimitKey, 15, 10 * 60 * 1000);
        if (ipRateCheck.limited) {
          throw new Error(
            `Terlalu banyak percobaan login gagal dari jaringan Anda. Akses dibatasi sementara selama ${ipRateCheck.retryAfterSeconds} detik.`
          );
        }

        // 2. Cek rate limiting per Username (maksimal 5 percobaan gagal per 5 menit)
        const userRateCheck = isRateLimited(userRateLimitKey, 5, 5 * 60 * 1000);
        if (userRateCheck.limited) {
          throw new Error(
            `Terlalu banyak percobaan login yang gagal. Akun dibatasi sementara. Silakan coba lagi dalam ${userRateCheck.retryAfterSeconds} detik.`
          );
        }

        const admin = await prisma.admin.findUnique({
          where: { username },
        });

        if (!admin) {
          recordFailedAttempt(userRateLimitKey);
          recordFailedAttempt(ipRateLimitKey);
          throw new Error("Username atau password salah");
        }

        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );
        } catch {
          isPasswordValid = false;
        }

        // Fallback jika password di database masih tersimpan dalam format teks biasa (plain text)
        if (!isPasswordValid && admin.password === credentials.password) {
          isPasswordValid = true;
          // Otomatis update ke bcrypt hash di background
          const newHashed = await bcrypt.hash(credentials.password, 10);
          await prisma.admin.update({
            where: { id: admin.id },
            data: { password: newHashed },
          });
        }

        if (!isPasswordValid) {
          recordFailedAttempt(userRateLimitKey);
          recordFailedAttempt(ipRateLimitKey);
          throw new Error("Username atau password salah");
        }

        // Bersihkan rate limit saat login sukses
        clearRateLimit(userRateLimitKey);
        clearRateLimit(ipRateLimitKey);

        return {
          id: admin.id,
          name: admin.nama,
          email: admin.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // Sesi aktif maksimal 12 jam
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; name?: string | null; email?: string | null }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
