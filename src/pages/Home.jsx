import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-2xl w-full text-center"
      >
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#eaeaea] shadow-xs mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-gray-600">
            Smart Classroom Seating System • 40 Kursi (20 Meja)
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
          Sistem Rolling{' '}
          <span className="text-blue-500">Tempat Duduk</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
          Atur dan rotasikan denah tempat duduk kelas secara otomatis dengan pola{' '}
          <span className="text-gray-800 font-medium">Snake Pattern</span> maupun{' '}
          <span className="text-gray-800 font-medium">Rotasi 5 Harian</span> dalam satu klik.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:scale-[0.99] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>Lihat Denah Kelas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaea] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              Rotasi Biasa (Ular)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Menggeser seluruh siswa maju 1 langkah mengikuti indeks alur ular (A → B → C ... → nn → A).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eaeaea] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              Rotasi 5 Hari (Kursi Kanan)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Khusus siswa di kursi kanan maju 1 baris ke depan di kolom yang sama, sementara kursi kiri tetap.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#eaeaea] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              Inline Live Editing
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Klik langsung pada nama siswa untuk mengubah dan menyimpan otomatis ke database Supabase.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
