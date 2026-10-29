import { prisma } from "@/lib/prisma";
import { updateSiswa } from "@/actions/siswa";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft, User, Hash, GraduationCap, Save } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditSiswaPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const siswa = await prisma.siswa.findUnique({ where: { id } });
  if (!siswa) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      {/* Top Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs mb-6 sm:mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link 
              href="/admin/siswa" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Kembali ke Daftar Siswa
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-slate-900 dark:text-slate-200">{siswa.nisn}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-12 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-8">
          <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center p-1 shrink-0 shadow-xs">
              <img
                src="/assets/logo.png"
                alt="Logo Perpustakaan"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Edit Data Siswa</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perbarui informasi NISN, nama lengkap, atau kelas siswa</p>
            </div>
          </div>

          <form action={updateSiswa.bind(null, siswa.id)} className="space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <Input 
                name="nisn" 
                defaultValue={siswa.nisn} 
                required 
                maxLength={10} 
                className="font-mono bg-white dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 rounded-xl shadow-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Nama Lengkap Siswa
              </label>
              <Input 
                name="nama" 
                defaultValue={siswa.nama} 
                required 
                className="bg-white dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 rounded-xl shadow-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Kelas / Rombel
              </label>
              <Input 
                name="kelas" 
                defaultValue={siswa.kelas} 
                required 
                className="bg-white dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 rounded-xl shadow-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
                <Save className="w-4 h-4 text-white" />
                Simpan Perubahan
              </Button>
              <Link href="/admin/siswa">
                <Button variant="outline" type="button" className="h-10 rounded-xl border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
