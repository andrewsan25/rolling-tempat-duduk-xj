import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Check,
  X,
} from 'lucide-react';

const TAB_ITEMS = [
  {
    id: 'seats',
    label: 'Denah Kelas',
    title: 'Denah Tempat Duduk',
    subtitle: '40 kursi pola ular & pencarian posisi siswa',
  },
  {
    id: 'announcements',
    label: 'Pengumuman',
    title: 'Papan Pengumuman & Kalender',
    subtitle: 'Catatan tugas, jadwal ulangan & kalender sync',
  },
  {
    id: 'piket',
    label: 'Jadwal Piket',
    title: 'Jadwal Piket Harian',
    subtitle: 'Pembagian regu kebersihan Senin hingga Jumat',
  },
  {
    id: 'finance',
    label: 'Keuangan',
    title: 'Laporan Keuangan Kas',
    subtitle: 'Catatan pemasukan, pengeluaran & saldo kelas',
  },
  {
    id: 'personal',
    label: 'Catatan Pribadi',
    title: 'Notes & Kalender Pribadi',
    subtitle: 'Catatan belajar & kalender agenda pribadi Anda',
  },
];

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  isSettingsOpen,
  setIsSettingsOpen,
  onUpdateUserName,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const dropdownRef = useRef(null);

  const isDashboard = location.pathname === '/dashboard';

  // Sinkronkan input nama saat modal settings dibuka
  useEffect(() => {
    if (currentUser) {
      setNameInput(currentUser.customName || '');
    }
  }, [currentUser, isSettingsOpen]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleTabs = currentUser
    ? TAB_ITEMS.filter((t) => currentUser.allowedTabs.includes(t.id))
    : [];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setAccountDropdownOpen(false);
    if (!isDashboard) {
      navigate('/dashboard');
    }
  };

  const handleSignOut = () => {
    setAccountDropdownOpen(false);
    onLogout();
    navigate('/');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateUserName(nameInput);
    setIsSettingsOpen(false);
  };

  const displayName = currentUser?.customName || currentUser?.roleName || '';

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-4 pb-2">
        <div className="max-w-4xl mx-auto relative" ref={dropdownRef}>
          {/* Floating Pill Navbar (Tanpa scrollbar / arrow key sama sekali) */}
          <div className="pill-navbar rounded-full px-3.5 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Solid Warm Terracotta/Caramel Circle + Title */}
            <Link
              to="/"
              onClick={() => setAccountDropdownOpen(false)}
              className="flex items-center gap-2.5 pl-1 group shrink-0"
            >
              <span className="w-8 h-8 rounded-full bg-[#E06D3B] group-hover:scale-105 transition-transform block shrink-0 shadow-sm" />
              <span className="font-display font-bold text-sm tracking-tight text-[#FAF5EE] hidden md:inline">
                X-Jentreng 2026
              </span>
            </Link>

            {/* Center: Clean Text Links without overflow-x-auto so no scrollbar arrows ever appear */}
            <nav className="flex items-center justify-center flex-wrap gap-3 sm:gap-6 px-1">
              <Link
                to="/"
                onClick={() => setAccountDropdownOpen(false)}
                className={`relative py-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  !isDashboard
                    ? 'text-[#FAF5EE] font-semibold'
                    : 'text-[#B09E8E] hover:text-[#FAF5EE]'
                }`}
              >
                <span>Beranda</span>
                {!isDashboard && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#FAF5EE] rounded-full"
                  />
                )}
              </Link>

              {visibleTabs.map((tab) => {
                const isActive = isDashboard && activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`relative py-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-[#FAF5EE] font-semibold'
                        : 'text-[#B09E8E] hover:text-[#FAF5EE]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#FAF5EE] rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Account Dropdown Trigger (Settings & Log Out) or Masuk Portal */}
            <div className="shrink-0 relative">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#FAF5EE] hover:bg-[#EFE5D8] text-[#1C140E] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span className="max-w-[110px] sm:max-w-[150px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      accountDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#FAF5EE] hover:bg-[#EFE5D8] text-[#1C140E] text-xs sm:text-sm font-semibold transition-all shadow-sm"
                >
                  <span>Portal Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Dropdown Opsi Settings & Log Out */}
              <AnimatePresence>
                {accountDropdownOpen && currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-3 w-64 espresso-panel rounded-2xl p-2 shadow-2xl z-50"
                  >
                    <div className="px-3.5 py-2.5 border-b border-white/10">
                      <div className="font-display font-bold text-sm text-[#FAF5EE] truncate">
                        {currentUser.customName || 'Belum Mengisi Nama'}
                      </div>
                      <div className="text-[11px] font-medium text-[#E06D3B]">
                        Role: {currentUser.roleName}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#FAF5EE] hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#E06D3B]" />
                        <div>
                          <div>Settings</div>
                          <div className="text-[11px] font-normal text-[#B09E8E]">
                            Ubah nama panggilan profil
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <div>
                          <div>Log Out</div>
                          <div className="text-[11px] font-normal text-[#B09E8E]">
                            Keluar dari sesi akun ini
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Settings: Form Isi Nama */}
      <AnimatePresence>
        {isSettingsOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1E14]/50 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#FFFDF9] shadow-2xl border border-[#DECBB3]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#2C1E14]">
                      Settings Profil
                    </h3>
                    <p className="text-xs text-[#7A624E]">
                      Role Aktif: <strong className="text-[#5C3D22]">{currentUser.roleName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-xl bg-[#EFE5D8] text-[#5C3D22] hover:bg-[#E2D2BE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C4028] mb-1.5">
                    Nama Anda (Tampil di Beranda & Navbar)
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={`Masukkan nama Anda (mis. ${currentUser.roleName})...`}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
                  />
                  <p className="text-[11px] text-[#7A624E] mt-1.5">
                    Nama ini akan ditampilkan pada sapaan <strong>&ldquo;Welcome, [Nama]&rdquo;</strong> di halaman utama.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 rounded-full bg-[#EFE5D8] text-[#5C3D22] text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] text-xs sm:text-sm font-semibold shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Nama</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
