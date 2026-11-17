import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Home, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-[#eaeaea] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-600 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-gray-900 block leading-none">
              Seating Roll
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Classroom Manager
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-full border border-gray-200/60">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              location.pathname === '/'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Denah Kelas</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
