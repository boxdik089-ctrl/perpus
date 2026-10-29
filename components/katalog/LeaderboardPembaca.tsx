import { Trophy, Star, TrendingUp, Medal, Flame, Award, Sparkles } from "lucide-react";

export type TopReaderItem = {
  nama: string;
  kelas: string;
  poin: number;
  badge: string;
  rank: number;
};

export default function LeaderboardPembaca({ 
  isDark, 
  readers = [] 
}: { 
  isDark: boolean;
  readers?: TopReaderItem[];
}) {
  const topReaders = readers.length > 0 ? readers : [
    { nama: "Budi Santoso", kelas: "XII RPL 1", poin: 1250, badge: "Master", rank: 1 },
    { nama: "Siti Aminah", kelas: "XI TKJ 2", poin: 980, badge: "Expert", rank: 2 },
    { nama: "Ahmad Rizky", kelas: "X TKR 1", poin: 840, badge: "Advanced", rank: 3 },
  ];

  const maxPoints = Math.max(...topReaders.map((r) => r.poin), 1000);

  return (
    <div className={`mb-8 sm:mb-12 rounded-3xl p-5 sm:p-6 transition-all duration-300 border ${
      isDark 
        ? "bg-slate-900/60 border-slate-800/90 backdrop-blur-xl shadow-lg" 
        : "bg-white border-slate-200/90 backdrop-blur-xl shadow-sm"
    }`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-5">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase mb-1.5 border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Prestasi Literasi Siswa</span>
          </div>
          <h2 className={`text-lg sm:text-xl font-black flex items-center justify-center sm:justify-start gap-2 ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            <span>Top Pembaca Bulan Ini</span>
          </h2>
          <p className={`text-xs mt-0.5 max-w-lg font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Siswa dengan frekuensi peminjaman buku sirkulasi &amp; ulasan teraktif di perpustakaan.
          </p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shrink-0 ${
          isDark 
            ? "bg-slate-800/80 border-slate-700/80 text-amber-300" 
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          <span>Leaderboard Poin</span>
        </div>
      </div>

      {/* Reader Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {topReaders.map((reader) => {
          const isGold = reader.rank === 1;
          const isSilver = reader.rank === 2;
          const isBronze = reader.rank === 3;

          const progressPercent = Math.min(Math.round((reader.poin / maxPoints) * 100), 100);

          return (
            <div
              key={reader.rank}
              className={`relative flex flex-col justify-between p-4.5 sm:p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 cursor-default group overflow-hidden ${
                isGold
                  ? isDark
                    ? "bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-400"
                    : "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300 shadow-md shadow-amber-500/10 hover:border-amber-400"
                  : isSilver
                  ? isDark
                    ? "bg-gradient-to-br from-slate-400/10 via-slate-900/90 to-slate-900 border-slate-700 hover:border-slate-500"
                    : "bg-gradient-to-br from-slate-50 via-white to-slate-100/50 border-slate-300 hover:border-slate-400"
                  : isDark
                  ? "bg-gradient-to-br from-orange-500/10 via-slate-900/90 to-slate-900 border-orange-500/30 hover:border-orange-400"
                  : "bg-gradient-to-br from-orange-50/80 via-white to-orange-50/30 border-orange-200 hover:border-orange-300"
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 inset-x-0 h-1 ${
                isGold 
                  ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" 
                  : isSilver 
                  ? "bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400" 
                  : "bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800"
              }`} />

              <div className="flex items-start gap-3.5 mb-3.5">
                {/* Avatar with rank medal */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center shadow-md border-2 transition-transform group-hover:scale-105 ${
                    isGold
                      ? "bg-amber-400 text-slate-950 border-amber-200 shadow-amber-500/30"
                      : isSilver
                      ? "bg-slate-200 text-slate-800 border-white shadow-slate-400/30"
                      : "bg-amber-700 text-amber-50 border-amber-500 shadow-amber-900/30"
                  }`}>
                    {reader.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 shadow-xs ${
                    isGold
                      ? "bg-amber-500 text-slate-950 border-amber-100"
                      : isSilver
                      ? "bg-slate-300 text-slate-900 border-slate-100"
                      : "bg-orange-600 text-white border-orange-200"
                  }`}>
                    #{reader.rank}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className={`font-bold text-sm sm:text-base leading-tight truncate ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}>
                      {reader.nama}
                    </h3>
                    {isGold && (
                      <span className="shrink-0 text-amber-500" title="Peringkat 1">
                        <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 truncate font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {reader.kelas}
                  </p>
                </div>
              </div>

              {/* Points & Progress Bar */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-lg ${
                    isGold
                      ? isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
                      : isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
                  }`}>
                    <Star className="w-3 h-3 fill-current" />
                    <span>{reader.poin.toLocaleString("id-ID")} Pts</span>
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    isDark ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}>
                    <Medal className="w-3 h-3" />
                    <span>{reader.badge}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isGold
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                        : isSilver
                        ? "bg-gradient-to-r from-slate-400 to-sky-400"
                        : "bg-gradient-to-r from-amber-700 to-orange-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
