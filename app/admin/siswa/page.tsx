import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteSiswa } from "@/actions/siswa";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  GraduationCap, 
  Hash,
  AlertCircle,
  BookOpen
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const siswa = await prisma.siswa.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transaksi: {
            where: { status: "DIPINJAM" }
          }
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-stone-200/80 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <img
                src="/assets/logo.png"
                alt="Logo SMK Negeri 1 Beringin"
                className="w-8 h-8 object-contain rounded-xl bg-white/60 dark:bg-white/10 border border-stone-200 dark:border-white/20 p-1 shrink-0"
              />
              <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white whitespace-nowrap">
                Data Siswa Roster
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <ThemeToggle />
              <Link href="/admin/siswa/create">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm text-xs shrink-0">
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span className="hidden xs:inline">Tambah Siswa</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Daftar Siswa Perpustakaan
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Total {siswa.length} siswa terdaftar di database roster</p>
          </div>

          <Link href="/admin/siswa/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm">
              <UserPlus className="w-4 h-4 text-white" />
              Tambah Siswa Baru
            </Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-slate-800 text-xs sm:text-sm">
              <thead className="bg-stone-100 dark:bg-slate-950/60 border-b border-stone-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5 text-left text-xs font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
                    NISN &amp; Nama Siswa
                  </th>
                  <th className="px-5 sm:px-6 py-3.5 text-left text-xs font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
                    Kelas / Jurusan
                  </th>
                  <th className="px-5 sm:px-6 py-3.5 text-left text-xs font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
                    Status Peminjaman
                  </th>
                  <th className="px-5 sm:px-6 py-3.5 text-right text-xs font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-slate-800/60">
                {siswa.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                          {s.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">{s.nama}</div>
                          <div className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Hash className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            {s.nisn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      {s._count.transaksi > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                          <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {s._count.transaksi} buku dipinjam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-medium text-stone-400 dark:text-slate-400">
                          Tidak ada pinjaman
                        </span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 sm:gap-2">
                        <Link href={`/admin/siswa/${s.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs rounded-xl border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800">
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                        </Link>
                        <form action={deleteSiswa.bind(null, s.id)}>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            type="submit"
                            className="h-8 px-2.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Hapus</span>
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {siswa.length === 0 && (
            <div className="px-6 py-12 text-center text-stone-500 dark:text-slate-500">
              <AlertCircle className="w-8 h-8 text-stone-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600 dark:text-slate-400">Belum ada data siswa terdaftar.</p>
              <Link href="/admin/siswa/create" className="mt-3 inline-block">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                  <UserPlus className="w-4 h-4" />
                  Tambah Siswa Pertama
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
