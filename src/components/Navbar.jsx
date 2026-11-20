import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const TAB_ITEMS = [
  {
    id: 'seats',
    label: 'Denah Kursi',
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
];

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = location.pathname === '/dashboard';

  const visibleTabs = currentUser
    ? TAB_ITEMS.filter((t) => currentUser.allowedTabs.includes(t.id))
    : [];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    if (!isDashboard) {
      navigate('/dashboard');
    }
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    onLogout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-4 pb-2">
      <div className="max-w-3xl mx-auto relative">
        {/* Floating Pill Navbar (Persis seperti gambar referensi) */}
        <div className="pill-navbar rounded-full px-3.5 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Solid Warm Terracotta/Caramel Circle + Title */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 pl-1 group shrink-0"
          >
            <span className="w-8 h-8 rounded-full bg-[#E06D3B] group-hover:scale-105 transition-transform block shrink-0 shadow-sm" />
            <span className="font-display font-bold text-sm tracking-tight text-[#FAF5EE] hidden sm:inline">
              X-Jentreng 2026
            </span>
          </Link>

          {/* Center: Clean Text Links with Underline on Active Item */}
          <nav className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar px-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`relative py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                !isDashboard && !menuOpen
                  ? 'text-[#FAF5EE] font-semibold'
                  : 'text-[#B09E8E] hover:text-[#FAF5EE]'
              }`}
            >
              <span>Beranda</span>
              {!isDashboard && !menuOpen && (
                <motion.span
                  layoutId="navUnderline"
                  className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#FAF5EE] rounded-full"
                />
              )}
            </Link>

            {visibleTabs.map((tab) => {
              const isActive = isDashboard && activeTab === tab.id && !menuOpen;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
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

            {currentUser && (
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`relative py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer ${
                  menuOpen
                    ? 'text-[#FAF5EE] font-semibold'
                    : 'text-[#B09E8E] hover:text-[#FAF5EE]'
                }`}
              >
                <span>Menu</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
                {menuOpen && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#FAF5EE] rounded-full"
                  />
                )}
              </button>
            )}
          </nav>

          {/* Right: Crisp Cream Pill CTA Button with Arrow */}
          <div className="shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#FAF5EE] hover:bg-[#EFE5D8] text-[#1C140E] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
              >
                <span>{currentUser.roleName} &bull; Keluar</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
          </div>
        </div>

        {/* 2-Column Minimalist Dropdown Panel below Pill Navbar (Persis seperti gambar referensi) */}
        <AnimatePresence>
          {menuOpen && currentUser && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mt-3 espresso-panel rounded-3xl p-6 sm:p-7"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                {visibleTabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className="text-left group cursor-pointer"
                  >
                    <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE] group-hover:text-[#E06D3B] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                      {item.subtitle}
                    </div>
                  </button>
                ))}

                <div className="text-left">
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE]">
                    Role Aktif: {currentUser.roleName}
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    {currentUser.shortDesc}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-left group cursor-pointer"
                >
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#E06D3B] group-hover:underline">
                    Ganti Akun / Keluar &rarr;
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    Kembali ke halaman login utama
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
