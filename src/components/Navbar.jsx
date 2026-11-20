import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home, Sparkles, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Beranda & Role', icon: Home },
    { path: '/dashboard', label: 'Portal Kelas', icon: LayoutGrid },
  ];

  const handleSignOut = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-5 rounded-2xl glass-panel flex items-center justify-between gap-2">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C6239] via-[#7A5230] to-[#5C3D22] flex items-center justify-center text-[#FFFDF9] shadow-md shadow-[#8C6239]/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-[#2C1E14] leading-none">
                X-Jentreng 2026
              </span>
            </div>
            <span className="text-[11px] text-[#7A624E] font-medium block mt-0.5">
              Classroom Portal &bull; Kelas X-J
            </span>
          </div>
        </Link>

        {/* Center / Right Navigation + Active Role Pill */}
        <div className="flex items-center gap-2.5">
          <nav className="relative flex items-center gap-1 bg-[#EFE5D8]/85 p-1 rounded-xl border border-[#DECBB3]/80">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors z-10 ${
                    isActive
                      ? 'text-[#5C3D22]'
                      : 'text-[#7A624E] hover:text-[#2C1E14]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-[#FFFDF9] rounded-lg shadow-sm border border-[#DECBB3]/70 -z-10"
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1">
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs ${currentUser.badgeColor}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser.roleName}</span>
              </span>
              <button
                onClick={handleSignOut}
                title="Ganti Akun / Logout"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] text-xs font-semibold border border-[#DECBB3] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
