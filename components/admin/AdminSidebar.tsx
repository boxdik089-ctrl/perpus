"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ScanLine,
  QrCode,
  BookOpen,
  Scan,
  BookCheck,
  FileSpreadsheet,
  Boxes,
  Users,
  CreditCard,
  CalendarDays,
  GraduationCap,
  BarChart3,
  MessageCircle,
  Star,
  ExternalLink,
  LogOut,
  KeyRound,
  ShieldCheck,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { performLogout } from "@/lib/logout";
import { UbahPasswordModal } from "@/components/admin/UbahPasswordModal";
import ThemeToggle from "@/components/theme/ThemeToggle";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  target?: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "UTAMA",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: "LAYANAN SIRKULASI",
    items: [
      {
        label: "Peminjaman & Kembali",
        href: "/admin/transaksi",
        icon: ArrowLeftRight,
      },
      {
        label: "Scan Sirkulasi Cepat",
        href: "/admin/sirkulasi",
        icon: ScanLine,
        badge: "Barcode",
        badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      },
      {
        label: "Layar Kios Presensi",
        href: "/kiosk",
        icon: QrCode,
        badge: "Monitor",
        badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
        target: "_blank",
      },
    ],
  },
  {
    groupLabel: "KATALOG & BUKU",
    items: [
      {
        label: "Data Buku & E-Book",
        href: "/admin/buku",
        icon: BookOpen,
      },
      {
        label: "Scan & Tambah ISBN",
        href: "/admin/buku/scan",
        icon: Scan,
      },
      {
        label: "Cetak Label Barcode",
        href: "/admin/buku/cetak-label",
        icon: BookCheck,
      },
      {
        label: "Import Excel Buku",
        href: "/admin/buku/import",
        icon: FileSpreadsheet,
      },
      {
        label: "Stock Opname Fisik",
        href: "/admin/stock-opname",
        icon: Boxes,
      },
    ],
  },
  {
    groupLabel: "ANGGOTA & TAMU",
    items: [
      {
        label: "Data Anggota",
        href: "/admin/anggota",
        icon: Users,
      },
      {
        label: "Cetak Kartu Anggota",
        href: "/admin/anggota/cetak-kartu",
        icon: CreditCard,
      },
      {
        label: "Buku Kunjungan",
        href: "/admin/kunjungan",
        icon: CalendarDays,
      },
      {
        label: "Data Siswa Dapodik",
        href: "/admin/siswa",
        icon: GraduationCap,
      },
    ],
  },
  {
    groupLabel: "LAPORAN & LAYANAN",
    items: [
      {
        label: "Laporan & Statistik",
        href: "/admin/laporan",
        icon: BarChart3,
      },
      {
        label: "Pengingat WhatsApp",
        href: "/admin/whatsapp",
        icon: MessageCircle,
      },
      {
        label: "Ulasan Pembaca",
        href: "/admin/ulasan",
        icon: Star,
      },
    ],
  },
];

interface AdminSidebarProps {
  user?: { name?: string | null; email?: string | null };
  onCloseMobile?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  user,
  onCloseMobile,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const collapsed = !isMobile && isCollapsed;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await performLogout();
  };

  const userName = user?.name || "Administrator";
  const userInitial = userName.charAt(0).toUpperCase() || "A";

  const isRouteActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
        {/* Brand Header */}
        <div className={`h-16 border-b border-slate-200/80 dark:border-slate-800 shrink-0 flex items-center ${
          collapsed ? "px-2 justify-center" : "px-4 sm:px-5 justify-between"
        }`}>
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center transition-all group shadow-2xs"
              title="Perbesar Menu (Expand Sidebar)"
            >
              <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <>
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center gap-3 min-w-0 group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <img
                    src="/assets/logo.png"
                    alt="Logo SMKN 1 Beringin"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                      Perpustakaan
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sistem Aktif" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    SMKN 1 Beringin
                  </p>
                </div>
              </Link>

              {/* Minimize toggle button on desktop */}
              {!isMobile && onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Kecilkan Menu (Minimize Sidebar)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}

              {/* Close button for mobile drawer */}
              {isMobile && onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Menu List */}
        <div className={`flex-1 overflow-y-auto ${
          collapsed ? "px-2 py-3 space-y-2.5" : "px-3 py-3 space-y-5"
        } scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700`}>
          {ADMIN_NAV_GROUPS.map((group, gIdx) => (
            <div key={group.groupLabel} className="space-y-1">
              {collapsed ? (
                gIdx > 0 && (
                  <div className="my-2.5 mx-1 border-t border-slate-200/70 dark:border-slate-800" />
                )
              ) : (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {group.groupLabel}
                </div>
              )}

              {group.items.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;

                if (collapsed) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.target}
                      onClick={onCloseMobile}
                      title={`${item.label}${item.badge ? ` (${item.badge})` : ""}`}
                      className={`relative group flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-sky-600 text-white shadow-xs font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      {item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.target}
                    onClick={onCloseMobile}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-sky-600 text-white shadow-xs font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-sky-100 dark:group-hover:bg-slate-700 group-hover:text-sky-600 dark:group-hover:text-sky-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                          active
                            ? "bg-white/20 text-white border-white/30"
                            : item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Quick Public Link */}
        <div className={`border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 ${
          collapsed ? "p-2 flex justify-center" : "px-3 py-2"
        }`}>
          {collapsed ? (
            <Link
              href="/"
              target="_blank"
              title="Katalog Siswa / Publik"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs group"
            >
              <ExternalLink className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 truncate">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 shrink-0" />
                <span className="truncate">Katalog Siswa / Publik</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </Link>
          )}
        </div>

        {/* Footer Admin Profile Card */}
        <div className={`border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 ${
          collapsed ? "p-2 flex flex-col items-center gap-2" : "p-3"
        }`}>
          {collapsed ? (
            <>
              <div
                className="w-9 h-9 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs"
                title={`${userName} (Pustakawan)`}
              >
                {userInitial}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Ganti Password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {userInitial}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {userName}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Pustakawan</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Ganti Password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ubah Password */}
      <UbahPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}

