import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();

    // Security Headers di level middleware
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");

    return response;
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: async ({ req, token }) => {
        if (token) return true;

        // Fallback check jika cookie ada tanpa prefix __Secure-
        const fallbackCookie = req.cookies.get("next-auth.session-token")?.value;
        if (fallbackCookie) {
          try {
            const fallbackToken = await getToken({
              req,
              secret: process.env.NEXTAUTH_SECRET,
              cookieName: "next-auth.session-token",
            });
            return !!fallbackToken;
          } catch {
            return false;
          }
        }

        return false;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/upload-audio",
    "/api/upload-cover",
    "/api/upload-ebook",
    "/api/upload-audio",
  ],
};
