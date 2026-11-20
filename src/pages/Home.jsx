import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  RefreshCw,
  Calendar,
  Sparkles,
  Database,
  Users,
  Layers,
  Zap,
} from 'lucide-react';

const MINI_PREVIEW_ROWS = [
  { row: 1, dir: 'ltr', pairs: [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']] },
  { row: 2, dir: 'rtl', pairs: [['P', 'O'], ['N', 'M'], ['L', 'K'], ['J', 'I']] },
  { row: 3, dir: 'ltr', pairs: [['Q', 'R'], ['S', 'T'], ['U', 'V'], ['W', 'X']] },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
        {/* Left Column: Copy + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="lg:col-span-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              Terhubung Live dengan Supabase Cloud
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5">
            Atur Denah Kelas{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Lebih Cerdas & Adil.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
            Sistem rolling tempat duduk modern untuk{' '}
            <span className="font-semibold text-slate-800">40 siswa (20 meja ganda)</span>.
            Dilengkapi pola <span className="font-semibold text-blue-600">Snake Pattern</span>,{' '}
            <span className="font-semibold text-indigo-600">Rotasi 5 Harian</span>, dan sinkronisasi
            real-time otomatis.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Buka Denah Kelas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/75 border border-slate-200/80 text-xs font-semibold text-slate-600">
              <Users className="w-4 h-4 text-blue-500" />
              <span>5 Baris × 4 Kolom</span>
            </div>
          </div>

          {/* Mini Stats Strip */}
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <div className="p-3.5 rounded-2xl glass-panel">
              <div className="font-display text-xl font-extrabold text-slate-900">40</div>
              <div className="text-[11px] font-medium text-slate-500">Total Kursi</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel">
              <div className="font-display text-xl font-extrabold text-blue-600">2 Mode</div>
              <div className="text-[11px] font-medium text-slate-500">Auto Rotasi</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel">
              <div className="font-display text-xl font-extrabold text-emerald-600">Live</div>
              <div className="text-[11px] font-medium text-slate-500">Supabase DB</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Visual Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="lg:col-span-6"
        >
          <div className="relative p-5 sm:p-6 rounded-3xl glass-panel border border-white shadow-xl">
            {/* Decorative Top Bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                Preview Pola Snake Pattern
              </span>
            </div>

            {/* Mini Whiteboard */}
            <div className="w-3/4 mx-auto mb-5 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-center text-[10px] font-bold uppercase tracking-widest text-sky-300 shadow-sm">
              Papan Tulis / Depan Kelas
            </div>

            {/* Mini Classroom Grid */}
            <div className="space-y-2.5">
              {MINI_PREVIEW_ROWS.map((r) => (
                <div key={r.row} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 px-1">
                    <span>Baris {r.row}</span>
                    <span className={r.dir === 'ltr' ? 'text-blue-500' : 'text-amber-500'}>
                      {r.dir === 'ltr' ? 'Kiri → Kanan' : 'Kanan → Kiri'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {r.pairs.map(([left, right]) => (
                      <div
                        key={left + right}
                        className="p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs grid grid-cols-2 gap-1"
                      >
                        <div className="py-1.5 rounded-lg bg-slate-100 text-center text-[11px] font-bold text-slate-700">
                          {left}
                        </div>
                        <div className="py-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-center text-[11px] font-bold text-white shadow-xs">
                          {right}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Caption */}
            <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Biru = Kursi Kanan (Rotasi 5 Hari)
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Coba Sekarang →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bento Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-4">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 mb-2">
            Rotasi Biasa (Snake Pattern)
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Menggeser seluruh 40 siswa maju 1 langkah mengikuti alur ular dari kursi A hingga nn secara mulus dan merata.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-sky-400 flex items-center justify-center shadow-md shadow-slate-900/20 mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 mb-2">
            Rotasi 5 Hari (Kursi Kanan)
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Khusus siswa di kursi kanan maju 1 baris ke depan di kolom yang sama (HH → ee → R → O → B → HH) agar teman sebangku terus berganti.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl glass-panel transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 mb-2">
            Inline Edit & Supabase Sync
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Klik langsung pada nama siswa untuk mengedit, cari posisi siswa secara instan, dan simpan otomatis ke database Supabase.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
