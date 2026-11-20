import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Lock,
  Settings,
  UserPlus,
} from 'lucide-react';
import {
  ROLES_CONFIG,
  authenticateUser,
  registerStudentByName,
  saveRolePasswordsMap,
} from '../utils/authRoles';

const PORTAL_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api/portal'
  : '/api/portal';

export default function Home({ currentUser, onLogin, onOpenSettings }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('student'); // 'student' | 'officer'
  const [studentName, setStudentName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sinkronkan perubahan password dari Admin (Supabase) agar login selalu menggunakan password terbaru
  useEffect(() => {
    let mounted = true;
    fetch(PORTAL_API_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.rolePasswords) {
          saveRolePasswordsMap(data.rolePasswords);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleStudentRegister = (e) => {
    e.preventDefault();
    const clean = studentName.trim();
    if (!clean) {
      setErrorMsg('Silakan tulis nama Anda terlebih dahulu.');
      return;
    }
    setErrorMsg('');
    const studentSession = registerStudentByName(clean);
    if (studentSession) {
      // Sinkronkan juga daftar murid terdaftar ke Supabase di background
      fetch(PORTAL_API_URL)
        .then((res) => (res.ok ? res.json() : null))
        .then((portalJson) => {
          if (!portalJson) return;
          const baseList = Array.isArray(portalJson.registeredStudents)
            ? portalJson.registeredStudents
            : [];
          const exists = baseList.some(
            (s) =>
              s.userKey === studentSession.userKey ||
              (s.name && s.name.toLowerCase() === clean.toLowerCase())
          );
          if (!exists) {
            const nowIso = new Date().toISOString();
            const nextStudents = [
              {
                id: studentSession.userKey,
                name: clean,
                userKey: studentSession.userKey,
                registeredAt: nowIso,
                lastLoginAt: nowIso,
              },
              ...baseList,
            ];
            fetch(PORTAL_API_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...portalJson,
                registeredStudents: nextStudents,
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});

      onLogin(studentSession);
      navigate('/dashboard');
    }
  };

  const handleOfficerLogin = (e) => {
    e.preventDefault();
    const role = authenticateUser(username, password);
    if (!role) {
      setErrorMsg('Username atau password pengurus yang Anda masukkan salah.');
      return;
    }
    setErrorMsg('');
    onLogin(role);
    navigate('/dashboard');
  };

  const welcomeName = currentUser?.customName || currentUser?.roleName || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Welcome Banner jika sudah login */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-5 sm:p-6 rounded-3xl espresso-panel text-[#FAF5EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E06D3B] text-white flex items-center justify-center shrink-0 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#E06D3B]">
                Status Login Aktif &bull; {currentUser.roleName}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF5EE]">
                Welcome, {welcomeName}!
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF5EE] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#E06D3B]" />
              <span>{currentUser.customName ? 'Ubah Nama' : 'Isi Nama di Settings'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF5EE] hover:bg-[#EFE5D8] text-[#1C140E] text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section (+ Register/Login Card HANYA jika belum login) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-14">
        {/* Left: Hero Intro (Full width jika sudah login) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`${currentUser ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-5`}
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
          <div className="space-y-3.5 max-w-3xl">
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
        </motion.div>

        {/* Right: Register Murid / Login Pengurus — HANYA MUNCUL JIKA BELUM LOGIN (!currentUser) */}
        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-5"
          >
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#DECBB3] shadow-xl space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#EFE5D8] border border-[#DECBB3]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('student');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${authMode === 'student'
                    ? 'bg-[#1C140E] text-[#FAF5EE] shadow-sm'
                    : 'text-[#5C4028] hover:text-[#2C1E14]'
                    }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Murid</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('officer');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${authMode === 'officer'
                    ? 'bg-[#1C140E] text-[#FAF5EE] shadow-sm'
                    : 'text-[#5C4028] hover:text-[#2C1E14]'
                    }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Login Pengurus</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              {authMode === 'student' ? (
                <form onSubmit={handleStudentRegister} className="space-y-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#2C1E14]">
                      Register / Masuk Murid
                    </h2>
                    <p className="text-xs text-[#7A624E] mt-0.5">
                      Cukup tulis nama Anda untuk membuka Denah Kelas, Notes Pribadi, & Kalender Pribadi.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C4028] mb-1.5">
                      Nama Lengkap / Panggilan
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                      placeholder="Tulis nama Anda (mis. Madeline)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Masuk sebagai Murid</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOfficerLogin} className="space-y-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#2C1E14]">
                      Login Pengurus Kelas
                    </h2>
                    <p className="text-xs text-[#7A624E] mt-0.5">
                      Khusus Ketua Kelas, Wakil, Bendahara, Sekretaris, dan Admin
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C4028] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Masukkan username pengurus..."
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
                    <span>Masuk Pengurus</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Daftar 6 Role & Deskripsi Tugas */}
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
            Setiap murid & pengurus memiliki akses ke Denah Kelas serta Notes & Kalender Pribadi.
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
