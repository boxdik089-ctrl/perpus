import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, checkRateLimit } from "@/lib/security";

const nextAuthHandler = NextAuth(authOptions);

const COOKIE_NAMES_TO_CLEAR = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.pkce.code_verifier",
  "__Secure-next-auth.pkce.code_verifier",
  "next-auth.state",
  "__Secure-next-auth.state",
];

function applyClearCookieHeaders(response: Response | NextResponse) {
  for (const name of COOKIE_NAMES_TO_CLEAR) {
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    );
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
    );
  }
  return response;
}

export async function GET(req: NextRequest, ctx: any) {
  const res = await nextAuthHandler(req, ctx);
  if (req.nextUrl.pathname.includes("/signout")) {
    return applyClearCookieHeaders(res);
  }
  return res;
}

export async function POST(req: NextRequest, ctx: any) {
  // Perlindungan terhadap serangan Brute-Force & Password Spraying berbasis IP
  if (req.nextUrl.pathname.includes("/callback/credentials")) {
    const clientIp = getClientIp(req);
    // Maksimal 15 percobaan login per 5 menit per IP
    const rateCheck = checkRateLimit(`login_ip:${clientIp}`, 15, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login dari IP Anda. Akses dibatasi sementara selama ${rateCheck.retryAfterSeconds} detik.`,
        },
        { status: 429 }
      );
    }
  }

  const res = await nextAuthHandler(req, ctx);
  if (req.nextUrl.pathname.includes("/signout")) {
    return applyClearCookieHeaders(res);
  }
  return res;
}
