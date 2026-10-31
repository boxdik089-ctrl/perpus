"use client";

import { useState } from "react";
import { ShieldAlert, ArrowRight, X } from "lucide-react";
import { UbahPasswordModal } from "@/components/admin/UbahPasswordModal";

export function SecurityAlertBanner({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 shadow-2xs animate-fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                Pemberitahuan Keamanan: Akun Masih Menggunakan Password Bawaan
              </h4>
              <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/80 font-medium mt-1 leading-relaxed">
                Akun petugas ini masih menggunakan password bawaan standar (<code className="px-1.5 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-900/70 font-mono text-[11px] font-bold">admin123</code>). Segera perbarui demi menjaga keamanan data perpustakaan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Ganti Password Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-2 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer"
              title="Tutup pemberitahuan sementara"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <UbahPasswordModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userName={userName}
      />
    </>
  );
}

