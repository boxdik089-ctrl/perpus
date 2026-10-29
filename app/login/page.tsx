"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { performLogout } from "@/lib/logout";
import Link from "next/link";
import { Lock, User, ArrowLeft, AlertCircle, ShieldCheck, Eye, EyeOff, LogOut, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const { isDark } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    const form = e.currentTarget;
    const formUser = ((form.elements.namedItem("username") as HTMLInputElement)?.value || username).trim();
    const formPass = (form.elements.namedItem("password") as HTMLInputElement)?.value || password;

    if (!formUser) {
      setError("Silakan masukkan username admin.");
      (form.elements.namedItem("username") as HTMLInputElement)?.focus();
      return;
    }

    if (!formPass) {
      setError("Silakan masukkan password admin.");
      (form.elements.namedItem("password") as HTMLInputElement)?.focus();
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formUser,
        password: formPass,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (!result) {
        setError("Tidak ada respon dari server autentikasi.");
        setLoading(false);
        return;
      }

      if (result.error) {
        if (result.error === "CredentialsSignin") {
          setError("Username atau password salah. Periksa kembali huruf besar/kecil.");
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else if (result.url && (result.url.includes("csrf=true") || result.url.includes("error="))) {
        setError("Sesi login atau token keamanan kadaluarsa. Memuat ulang halaman...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else if (result.ok) {
        window.location.replace("/admin");
      } else {
        setError("Gagal masuk. Periksa kembali username dan password Anda.");
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan jaringan atau server. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col justify-center items-center px-4 py-12 overflow-hidden transition-colors duration-500 ${
      isDark
        ? "bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white"
        : "bg-slate-100 text-slate-900 selection:bg-sky-600 selection:text-white"
    }`}>
      {/* Clean Architectural Grid Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none" aria-hidden="true">
        <div className={`absolute inset-0 ${
          isDark 
            ? "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" 
            : "bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-[size:40px_40px]"
        }`} />
      </div>

      {/* Standard Floating Island Navbar */}
      <PublicNavbar currentPage="login" autoHideOnScroll={false} />

      <div className="relative max-w-md w-full space-y-5 z-10 pt-16 sm:pt-20">

        {/* Login Card */}
        <div className={`rounded-2xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
          isDark
            ? "bg-slate-900 border-slate-800 shadow-xl"
            : "bg-white border-slate-200/90 shadow-lg shadow-slate-200/40"
        }`}>

          {/* Header */}
          <div className="text-center mb-7 space-y-3">
            <div className="flex items-center justify-center gap-2.5">
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <img
                  src="/assets/logo.png"
                  alt="Logo SMK Negeri 1 Beringin"
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                />
              </div>
              <img
                src="/assets/logo-kolaborasi.png"
                alt="Logo Kolaborasi Sumut Berkah"
                className="h-8 w-auto object-contain opacity-90"
              />
            </div>
            
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                Login Petugas Perpustakaan
              </h1>
              <p className={`text-xs mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Sistem Informasi &amp; Sirkulasi SMKN 1 Beringin
              </p>
            </div>
          </div>

          {/* Active session notice */}
          {status === "authenticated" && session?.user && (
            <div className={`mb-6 p-4 rounded-xl border text-xs space-y-3 ${
              isDark
                ? "bg-sky-950/40 border-sky-500/25 text-sky-200"
                : "bg-sky-50 border-sky-200 text-sky-900"
            }`}>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs">Anda sudah masuk</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Terhubung sebagai <strong className="font-semibold">{session.user.name || session.user.email}</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm active:scale-95"
                >
                  <span>Buka Panel Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await performLogout();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer active:scale-95 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-rose-950/50 hover:border-rose-800 hover:text-rose-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-xs font-medium ${
                isDark
                  ? "bg-rose-500/10 border border-rose-500/25 text-rose-400"
                  : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Username</span>
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Masukkan username"
                className={`w-full rounded-xl h-11 px-3.5 text-sm transition-all border focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500"
                }`}
              />
            </div>

            <div>
              <label htmlFor="password" className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <Lock className="w-3.5 h-3.5 text-sky-500" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Masukkan password"
                  className={`w-full rounded-xl h-11 px-3.5 pr-11 text-sm transition-all border focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className={`mt-5 pt-4 border-t text-center ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Perpustakaan SMK Negeri 1 Beringin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
