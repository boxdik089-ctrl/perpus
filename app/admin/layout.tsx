import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex-1 pb-4 sm:pb-6">{children}</div>
      <footer className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-3 px-4 sm:px-6 text-center text-[10px] sm:text-[11px] text-slate-500 items-center justify-between gap-1 mb-16 sm:mb-0">
        <span>© {new Date().getFullYear()} Sistem Perpustakaan SMK Negeri 1 Beringin</span>
        <span>
          Ciptaan &amp; Hak Cipta dilindungi:{" "}
          <a
            href="https://instagram.com/dprxz_"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Dika Armadana (@dprxz_)</span>
          </a>
        </span>
      </footer>
      <AdminMobileNav />
    </div>
  );
}
