import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Lock,
} from 'lucide-react';
import { ROLES_CONFIG, authenticateUser } from '../utils/authRoles';

export default function Home({ currentUser, onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const role = authenticateUser(username, password);
    if (!role) {
      setErrorMsg('Username atau password yang Anda masukkan salah.');
      return;
    }
    setErrorMsg('');
    onLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Hero Section + Login Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-14">
        {/* Left: Hero Intro */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="lg:col-span-7 space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel">
            <span className="w-2 h-2 rounded-full bg-[#8C6239] animate-pulse" />
            <span className="text-xs font-bold text-[#5C3D22]">
              Portal Kelas X-Jentreng 2026 &bull; Satu Kelas, Satu Keluarga
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C1E14] leading-[1.12]">
            X-Jentreng{' '}
            <span className="bg-gradient-to-r from-[#8C6239] via-[#A67B5B] to-[#6F4E37] bg-clip-text text-transparent">
              2026
            </span>
          </h1>

          {/* Teks Karangan Kelas yang Kompak + Teks Sesuai Foto */}
          <div className="space-y-3.5 max-w-2xl">
            <p className="text-base sm:text-lg text-[#6E5644] leading-relaxed">
              Di <span className="font-bold text-[#4A3322]">X-Jentreng 2026</span>, empat puluh
              kepala dengan cerita dan mimpi yang berbeda tumbuh menjadi satu keluarga yang utuh.
              Kami percaya bahwa kekompakan bukan sekadar duduk di ruangan yang sama, melainkan
              tentang saling merangkul, berbagi tawa di sela padatnya pelajaran, bergerak bersama
              menjaga kenyamanan kelas, dan memastikan tidak ada satu pun teman yang berjalan
              sendirian.
            </p>

            <p className="text-base sm:text-lg text-[#6E5644] leading-relaxed">
              Setiap pengurus dan warga kelas memiliki hak akses khusus sesuai jabatannya:
              mulai dari <span className="font-bold text-[#4A3322]">Denah Kursi (Geser & Reroll)</span>,{' '}
              <span className="font-bold text-[#4A3322]">Papan Pengumuman & Kalender Ter-Sync</span>,{' '}
              <span className="font-bold text-[#4A3322]">Jadwal Piket</span>, hingga{' '}
              <span className="font-bold text-[#4A3322]">Laporan Keuangan Kas</span>.
            </p>
          </div>

          {currentUser && (
            <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 border-2 border-[#C8AA88]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7A624E]">
                    Sedang login sebagai:
                  </div>
                  <div className="font-display font-bold text-base text-[#2C1E14]">
                    {currentUser.roleName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] text-sm font-semibold shadow-md cursor-pointer"
              >
                <span>Buka Dashboard Anda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Right: Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="lg:col-span-5"
        >
          <form
            onSubmit={handleFormSubmit}
            className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#DECBB3] shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8C6239] to-[#5C3D22] text-[#FFFDF9] flex items-center justify-center shadow-sm">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-[#2C1E14]">
                    Login Portal Kelas
                  </h2>
                  <p className="text-xs text-[#7A624E]">
                    Masukkan akun pengurus atau warga kelas X-J
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Portal Kelas</span>
            </button>
          </form>
        </motion.div>
      </div>

      {/* Daftar 6 Role & Deskripsi Tugas (Tanpa Username/Password & Tanpa Masuk Cepat) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C6239]">
              Struktur & Pembagian Akses Kelas
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2C1E14]">
              Deskripsi Peran & Hak Akses
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7A624E]">
            Setiap role hanya dapat membuka tab yang diizinkan sesuai wewenangnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES_CONFIG.map((role) => (
            <motion.div
              key={role.id}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-[#DECBB3]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-xs ${role.badgeColor}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{role.roleName}</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#8C735E]">
                    {role.allowedTabs.length} Tab Akses
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5C4028] font-medium mb-4 leading-relaxed">
                  {role.shortDesc}
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                    Wewenang & Hak Akses:
                  </div>
                  {role.capabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#4A3322] leading-snug"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6239] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
