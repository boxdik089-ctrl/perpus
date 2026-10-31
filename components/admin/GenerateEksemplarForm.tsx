'use client';

import { useState } from 'react';
import { generateEksemplar } from '@/actions/eksemplar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GenerateEksemplarFormProps {
  bukuId: string;
}

export default function GenerateEksemplarForm({
  bukuId,
}: GenerateEksemplarFormProps) {
  const [jumlah, setJumlah] = useState<string>('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumlah, 10);
    if (isNaN(num) || num < 1 || num > 500) {
      toast.error('Jumlah harus 1-500');
      return;
    }

    setLoading(true);
    try {
      const hasil = await generateEksemplar(bukuId, num);
      toast.success(`${hasil.length} eksemplar dibuat: ${hasil.join(', ')}`);
      setJumlah('1');
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Gagal generate'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">Generate Eksemplar Baru</h2>
          <p className="text-xs text-stone-500 dark:text-slate-400">
            Buat kode barcode eksemplar unik 8-digit otomatis
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-lg">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
            Jumlah Eksemplar Baru (1-500)
          </label>
          <input
            type="number"
            min="1"
            max="500"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="Contoh: 5"
            disabled={loading}
            className="w-full h-11 font-mono border border-stone-300 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 bg-stone-50 dark:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Membuat...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Generate Eksemplar</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-stone-500 dark:text-slate-500 mt-3">
        Kode 8-digit akan di-generate otomatis (misal: <span className="font-mono text-emerald-600 dark:text-emerald-400">00001234</span>). Rak akan auto-assign berdasarkan nomor klasifikasi DDC buku.
      </p>
    </form>
  );
}
