'use client';

import { useState } from 'react';
import { Printer, X, BookText, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BarcodeLabel } from '@/components/admin/BarcodeLabel';
import { SpineLabel } from '@/components/admin/SpineLabel';
import { buildCallNumber, printWithPageSize, LABEL_SIZES } from '@/lib/label';

interface PrintLabelDialogProps {
  kode: string;
  judul: string;
  rakNama?: string;
  klasifikasi?: string | null;
  penulis?: string | null;
  isReferensi?: boolean;
}

type Tab = 'BARCODE' | 'PUNGGUNG';

export default function PrintLabelDialog({
  kode,
  judul,
  rakNama,
  klasifikasi,
  penulis,
  isReferensi,
}: PrintLabelDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('BARCODE');

  const callNumber = buildCallNumber({
    klasifikasi,
    penulis,
    judul,
    isReferensi,
  });

  const handlePrint = () => {
    if (tab === 'BARCODE') {
      printWithPageSize(LABEL_SIZES.eksemplar.width, LABEL_SIZES.eksemplar.height);
    } else {
      printWithPageSize(LABEL_SIZES.punggung.width, LABEL_SIZES.punggung.height);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Cetak Label</span>
      </button>

      {/* Print-only area */}
      {open && (
        <div className="print-area">
          {tab === 'BARCODE' ? (
            <BarcodeLabel kode={kode} judul={judul} rakNama={rakNama} size="large" />
          ) : (
            <SpineLabel callNumber={callNumber} />
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 print-hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">Cetak Label Fisik</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-slate-950/70 border border-stone-200 dark:border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTab('BARCODE')}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'BARCODE'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                <Barcode className="w-4 h-4" />
                Label Barcode
              </button>
              <button
                type="button"
                onClick={() => setTab('PUNGGUNG')}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'PUNGGUNG'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                <BookText className="w-4 h-4" />
                Label Punggung
              </button>
            </div>

            {/* Preview Box */}
            <div className="flex flex-col items-center gap-3 py-6 px-4 bg-stone-50 dark:bg-slate-950 rounded-2xl border border-stone-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-inner">
              {tab === 'BARCODE' ? (
                <BarcodeLabel kode={kode} judul={judul} rakNama={rakNama} size="large" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <SpineLabel callNumber={callNumber} />
                  <p className="text-[11px] font-mono font-bold text-stone-600 dark:text-slate-400">{callNumber}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-stone-500 dark:text-slate-400 text-center">
              {tab === 'BARCODE'
                ? 'Ukuran standar 70 × 35 mm. Tempel di cover bagian dalam.'
                : 'Ukuran standar 40 × 60 mm. Tempel di punggung buku.'}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 font-semibold text-sm transition-all border border-stone-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
