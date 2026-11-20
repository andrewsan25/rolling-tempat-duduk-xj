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
  Sparkles,
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
      setErrorMsg('Username atau password tidak sesuai. Silakan cek daftar akun di bawah.');
      return;
    }
    setErrorMsg('');
    onLogin(role);
    navigate('/dashboard');
  };

  const handleQuickLogin = (role) => {
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
              Portal Kelas X-Jentreng 2026 &bull; Role-Based Access Control
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C1E14] leading-[1.12]">
            X-Jentreng{' '}
            <span className="bg-gradient-to-r from-[#8C6239] via-[#A67B5B] to-[#6F4E37] bg-clip-text text-transparent">
              2026
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6E5644] leading-relaxed max-w-2xl">
            Setiap pengurus dan warga kelas memiliki hak akses khusus sesuai jabatannya:
            mulai dari <span className="font-bold text-[#4A3322]">Denah Kursi (Geser & Reroll)</span>,{' '}
            <span className="font-bold text-[#4A3322]">Papan Pengumuman & Kalender Ter-Sync</span>,{' '}
            <span className="font-bold text-[#4A3322]">Jadwal Piket</span>, hingga{' '}
            <span className="font-bold text-[#4A3322]">Laporan Keuangan Kas</span>.
          </p>

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
                    {currentUser.roleName} (<code className="text-xs">{currentUser.username}</code>)
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6239] to-[#6F4E37] text-[#FFFDF9] text-sm font-semibold shadow-md cursor-pointer"
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
                    Masuk sesuai role untuk membuka tab akses Anda
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
                placeholder="ketua / wakil / bendahara / sekretaris / murid / admin"
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
                placeholder="Masukkan password role..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8C6239] to-[#6F4E37] hover:from-[#7A5230] hover:to-[#5C3D22] text-[#FFFDF9] font-semibold text-sm shadow-md shadow-[#8C6239]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Portal Kelas</span>
            </button>

            <div className="pt-2 border-t border-[#E6D7C3] text-[11px] text-[#7A624E] text-center">
              Atau klik tombol <strong>&ldquo;Masuk Cepat&rdquo;</strong> pada salah satu kartu Role di bawah ini:
            </div>
          </form>
        </motion.div>
      </div>

      {/* Daftar 6 Role, Deskripsi Tugas & Akun (User + Password) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C6239]">
              Pembagian Hak Akses & Akun
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2C1E14]">
              Deskripsi Role & Kredensial Login
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
                {/* Role Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-xs ${role.badgeColor}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{role.roleName}</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#8C735E]">
                    {role.allowedTabs.length} Tab Aktif
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5C4028] font-medium mb-4 leading-relaxed">
                  {role.shortDesc}
                </p>

                {/* Capabilities List */}
                <div className="space-y-2 mb-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                    Yang Bisa Dilakukan:
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

              {/* Credentials Box + Quick Login Button */}
              <div className="pt-4 border-t border-[#E6D7C3] space-y-3">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-[#FAF5EE] border border-[#E2D2BE] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8C735E] block">
                      Username
                    </span>
                    <code className="font-bold text-[#2C1E14]">{role.username}</code>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8C735E] block">
                      Password
                    </span>
                    <code className="font-bold text-[#8C6239]">{role.password}</code>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EFE5D8] hover:bg-[#8C6239] text-[#4A3322] hover:text-[#FFFDF9] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Masuk Cepat sebagai {role.roleName}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
