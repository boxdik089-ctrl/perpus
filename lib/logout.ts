"use client";

import { signOut } from "next-auth/react";

export async function performLogout() {
  try {
    // 1. Panggil server-side endpoint khusus logout untuk menghapus cookie di level server
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("Gagal memanggil endpoint logout:", err);
  }

  // 2. Bersihkan cookie pada browser sisi klien jika ada
  if (typeof document !== "undefined") {
    try {
      const cookies = document.cookie.split(";");
      for (const c of cookies) {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        if (name.includes("next-auth") || name.includes("session")) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;`;
        }
      }
    } catch {
      // ignore
    }

    try {
      sessionStorage.clear();
      localStorage.removeItem("nextauth.message");
    } catch {
      // ignore
    }
  }

  // 3. Panggil NextAuth signOut internal untuk mereset React context
  try {
    await signOut({ redirect: false });
  } catch (err) {
    console.error("NextAuth signOut error:", err);
  }

  // 4. Hard redirect ke /login dengan replace agar riwayat sesi bersih tuntas
  window.location.replace("/login");
}
