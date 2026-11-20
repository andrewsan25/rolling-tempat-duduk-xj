import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/dashboard', label: 'Denah Kelas', icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-5 rounded-2xl glass-panel flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-slate-900 leading-none">
                Seating Roll
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200/70">
                Kelas X-J
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Smart Classroom Seating
            </span>
          </div>
        </Link>

        {/* Animated Pill Navigation */}
        <nav className="relative flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors z-10 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
