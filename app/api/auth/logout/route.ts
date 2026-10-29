import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

async function handleLogout(req: NextRequest) {
  const cookieStore = await cookies();

  // 1. Hapus via Next.js cookieStore
  for (const name of COOKIE_NAMES_TO_CLEAR) {
    try {
      cookieStore.delete(name);
      cookieStore.set(name, "", { maxAge: 0, path: "/" });
    } catch {
      // ignore
    }
  }

  // Hapus juga cookie lain yang mengandung kata next-auth atau session
  try {
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.includes("next-auth") || c.name.includes("session")) {
        cookieStore.delete(c.name);
        cookieStore.set(c.name, "", { maxAge: 0, path: "/" });
      }
    }
  } catch {
    // ignore
  }

  const isJson = req.headers.get("accept")?.includes("application/json") || req.method === "POST";
  const loginUrl = new URL("/login", req.url);

  const response = isJson
    ? NextResponse.json({ success: true, message: "Berhasil keluar sesi", redirectUrl: "/login" })
    : NextResponse.redirect(loginUrl, { status: 302 });

  // 2. Tambahkan Set-Cookie kadaluarsa eksplisit pada HTTP Header respon
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

  // Anti-cache header
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export async function GET(req: NextRequest) {
  return handleLogout(req);
}

export async function POST(req: NextRequest) {
  return handleLogout(req);
}
