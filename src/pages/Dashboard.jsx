import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ArrowUpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Info,
  Database,
  Search,
  X,
  Users,
  Sparkles,
} from 'lucide-react';
import DeskCard from '../components/DeskCard';
import {
  createDefaultSeats,
  getDeskSeats,
  rotateSnakeOneStep,
  rotateFiveDaysRightSeats,
  SNAKE_LABELS,
} from '../utils/seatingLogic';

const STORAGE_KEY = 'rolling_tempat_duduk_xj_seats';
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/seats' : '/api/seats');

function normalizeSeats(rawData) {
  const defaults = createDefaultSeats();
  if (!Array.isArray(rawData) || rawData.length === 0) return defaults;

  return defaults.map((defSeat, idx) => {
    const matched =
      rawData.find(
        (item) =>
          item.snakeIndex === idx ||
          item.snake_index === idx ||
          item.id_posisi === idx ||
          item.kode_kursi === SNAKE_LABELS[idx] ||
          item.id === idx + 1
      ) || rawData[idx];

    if (!matched) return defSeat;
    return {
      ...defSeat,
      id: matched.id ?? defSeat.id,
      nama_siswa: matched.nama_siswa ?? matched.name ?? defSeat.nama_siswa,
    };
  });
}

function loadCachedSeats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSeats();
    return normalizeSeats(JSON.parse(raw));
  } catch {
    return createDefaultSeats();
  }
}

function saveCachedSeats(seatsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seatsData));
  } catch {
    // Abaikan error quota localStorage
  }
}

export default function Dashboard() {
  const [seats, setSeats] = useState(() => loadCachedSeats());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  // Hitung jumlah siswa yang sudah diisi nama asli (bukan default "Siswa X")
  const namedCount = useMemo(() => {
    return seats.filter(
      (s) => s.nama_siswa && !s.nama_siswa.startsWith('Siswa ')
    ).length;
  }, [seats]);

  // 1. GET /api/seats dari Backend (Supabase) saat halaman dimuat
  useEffect(() => {
    let isMounted = true;

    async function fetchSeatsFromSupabase() {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const normalized = normalizeSeats(Array.isArray(data) ? data : data.data);
        if (isMounted) {
          setSeats(normalized);
          saveCachedSeats(normalized);
          setIsOfflineMode(false);
        }
      } catch {
        if (isMounted) {
          setIsOfflineMode(true);
          showToast(
            'Backend/Supabase belum terhubung — menggunakan cache lokal sementara.',
            'warning'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSeatsFromSupabase();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // 2. PATCH /api/seats/:id saat nama siswa diedit (onBlur / Enter)
  const handleUpdateSingleSeat = async (seatId, newName, snakeIndex) => {
    setSeats((prev) => {
      const updated = prev.map((s, idx) =>
        idx === snakeIndex ? { ...s, nama_siswa: newName } : s
      );
      saveCachedSeats(updated);
      return updated;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/${seatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: seatId,
          snakeIndex,
          kode_kursi: SNAKE_LABELS[snakeIndex],
          nama_siswa: newName,
        }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan ke Supabase');
      setIsOfflineMode(false);
      showToast(`Kursi ${SNAKE_LABELS[snakeIndex]} berhasil disimpan ke Supabase.`);
    } catch {
      setIsOfflineMode(true);
      showToast(
        `Kursi ${SNAKE_LABELS[snakeIndex]} tersimpan di cache lokal (Supabase offline).`,
        'warning'
      );
    }
  };

  // Helper PUT /api/seats/batch untuk menyimpan hasil rotasi / reset ke Supabase
  const syncBatchToBackend = async (updatedSeats, labelRotasi) => {
    saveCachedSeats(updatedSeats);
    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/batch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: updatedSeats }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan batch update');
      setIsOfflineMode(false);
      showToast(`${labelRotasi} berhasil disimpan ke Supabase!`);
    } catch {
      setIsOfflineMode(true);
      showToast(
        `${labelRotasi} tersimpan di cache lokal (Supabase offline).`,
        'warning'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleNormalRotation = () => {
    const nextSeats = rotateSnakeOneStep(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi Biasa (Geser 1)');
  };

  const handleFiveDayRotation = () => {
    const nextSeats = rotateFiveDaysRightSeats(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi 5 Hari (Kursi Kanan Maju 1 Baris)');
  };

  const confirmResetDefault = () => {
    const defaults = createDefaultSeats();
    setSeats(defaults);
    setShowResetModal(false);
    syncBatchToBackend(defaults, 'Reset Formasi Awal');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Toast Notification (Glassmorphism) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel text-sm font-semibold text-slate-800 shadow-xl"
          >
            {toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 rounded-3xl bg-white shadow-2xl border border-slate-200/80"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 mb-1.5">
                Reset Semua Nama Kursi?
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Tindakan ini akan mengembalikan seluruh 40 kursi menjadi nama default (<code className="text-slate-700">Siswa A</code> – <code className="text-slate-700">Siswa nn</code>) di database Supabase.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmResetDefault}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Center Header Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-7">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Title + Live Badges */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Denah Tempat Duduk
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isOfflineMode
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                {isOfflineMode ? 'Cache Lokal' : 'Supabase Live'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Klik langsung nama siswa untuk mengedit, lalu tekan{' '}
              <kbd className="px-1.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                Enter
              </kbd>{' '}
              atau klik di luar untuk menyimpan otomatis.
            </p>
          </div>

          {/* Primary Rotation Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleNormalRotation}
              disabled={syncing || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>Rotasi Biasa (Geser 1)</span>
            </button>

            <button
              onClick={handleFiveDayRotation}
              disabled={syncing || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-slate-900/20 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4 text-sky-400" />
              <span>Rotasi 5 Hari (Kanan Maju)</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              disabled={syncing || loading}
              title="Reset ke formasi awal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200/90 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Quick Stats + Student Search */}
        <div className="mt-5 pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 text-xs font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>40 Kursi • 20 Meja</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 text-xs font-semibold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{namedCount} / 40 Nama Terisi</span>
            </span>
          </div>

          {/* Search / Highlight Student */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau kode (mis. HH)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Front Stage / Whiteboard */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-x-6 -bottom-3 h-8 bg-blue-500/15 blur-xl rounded-full pointer-events-none" />
          <div className="relative py-3 px-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/15 border border-slate-700/80 flex items-center justify-center gap-2.5">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-100">
              Papan Tulis &bull; Depan Kelas
            </span>
          </div>
        </div>
      </div>

      {/* Grid 5 Baris x 4 Kolom Meja Ganda */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 rounded-2xl bg-white/80 border border-slate-200/70 p-4 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {[0, 1, 2, 3, 4].map((row) => {
            const isEvenRow = row % 2 === 0;
            return (
              <div key={row} className="space-y-2.5">
                {/* Row Header Bar */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
                      Baris {row + 1}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        isEvenRow
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {isEvenRow
                        ? 'Alur Ular: Kiri → Kanan'
                        : 'Alur Ular: Kanan → Kiri'}
                    </span>
                  </div>
                </div>

                {/* 4 Kolom Meja */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((col) => {
                    const { leftSeat, rightSeat } = getDeskSeats(seats, row, col);
                    return (
                      <DeskCard
                        key={`desk-${row}-${col}`}
                        row={row}
                        col={col}
                        leftSeat={leftSeat}
                        rightSeat={rightSeat}
                        onUpdateName={handleUpdateSingleSeat}
                        searchQuery={searchQuery}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Legend */}
      <div className="mt-8 p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-4 h-4 text-blue-600" />
            Keterangan:
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
            <span>Kursi Kiri (Tetap saat Rotasi 5 Hari)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-indigo-600 inline-block" />
            <span>Kursi Kanan (Maju 1 Baris: HH → ee → R → O → B → HH)</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Synced via <code className="text-slate-700 font-semibold">{API_BASE_URL}</code></span>
        </span>
      </div>
    </div>
  );
}
