import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ArrowUpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Info,
} from 'lucide-react';
import DeskCard from '../components/DeskCard';
import {
  createDefaultSeats,
  getDeskSeats,
  rotateSnakeOneStep,
  rotateFiveDaysRightSeats,
  SNAKE_LABELS,
} from '../utils/seatingLogic';

const API_BASE_URL = 'http://localhost:5000/api/seats';

export default function Dashboard() {
  const [seats, setSeats] = useState(() => createDefaultSeats());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  // Normalisasi data dari API agar selalu berjumlah 40 kursi sesuai urutan indeks 0-39
  const normalizeApiSeats = (apiData) => {
    const defaults = createDefaultSeats();
    if (!Array.isArray(apiData) || apiData.length === 0) return defaults;

    return defaults.map((defSeat, idx) => {
      const matched =
        apiData.find(
          (item) =>
            item.snakeIndex === idx ||
            item.id_posisi === idx ||
            item.kode_kursi === SNAKE_LABELS[idx] ||
            item.id === idx + 1
        ) || apiData[idx];

      if (!matched) return defSeat;
      return {
        ...defSeat,
        id: matched.id ?? defSeat.id,
        nama_siswa: matched.nama_siswa ?? matched.name ?? defSeat.nama_siswa,
      };
    });
  };

  // 1. GET /api/seats saat komponen dimuat
  useEffect(() => {
    let isMounted = true;

    async function fetchSeats() {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          const normalized = normalizeApiSeats(Array.isArray(data) ? data : data.data);
          setSeats(normalized);
          setIsOfflineMode(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsOfflineMode(true);
          showToast(
            'Server localhost:5000 belum aktif — berjalan dalam mode lokal (fallback).',
            'warning'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSeats();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // 2. PATCH /api/seats/:id saat nama siswa diedit (onBlur / Enter)
  const handleUpdateSingleSeat = async (seatId, newName, snakeIndex) => {
    // Optimistic UI update
    setSeats((prev) =>
      prev.map((s, idx) =>
        idx === snakeIndex ? { ...s, nama_siswa: newName } : s
      )
    );

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

      if (!response.ok) throw new Error('Gagal menyimpan ke backend');
      setIsOfflineMode(false);
      showToast(`Nama pada kursi ${SNAKE_LABELS[snakeIndex]} berhasil disimpan.`);
    } catch (error) {
      setIsOfflineMode(true);
      showToast(
        `Kursi ${SNAKE_LABELS[snakeIndex]} diperbarui di state lokal (Backend offline).`,
        'warning'
      );
    }
  };

  // Helper untuk mengirim PUT /api/seats/batch setelah rotasi
  const syncBatchToBackend = async (updatedSeats, labelRotasi) => {
    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/batch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: updatedSeats }),
      });

      if (!response.ok) throw new Error('Gagal melakukan batch update');
      setIsOfflineMode(false);
      showToast(`${labelRotasi} berhasil disimpan ke server!`);
    } catch (error) {
      setIsOfflineMode(true);
      showToast(
        `${labelRotasi} diterapkan di UI (Backend localhost:5000 offline).`,
        'warning'
      );
    } finally {
      setSyncing(false);
    }
  };

  // 3. Tombol Rotasi Biasa (Geser 1 Langkah mengikuti Snake Pattern)
  const handleNormalRotation = () => {
    const nextSeats = rotateSnakeOneStep(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi Biasa (Geser 1)');
  };

  // 4. Tombol Rotasi 5 Hari (Kursi Kanan Maju 1 Baris di Kolom yang Sama)
  const handleFiveDayRotation = () => {
    const nextSeats = rotateFiveDaysRightSeats(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi 5 Hari (Kursi Kanan Maju 1 Baris)');
  };

  // Reset ke urutan awal (Siswa A .. Siswa nn)
  const handleResetDefault = () => {
    const defaults = createDefaultSeats();
    setSeats(defaults);
    syncBatchToBackend(defaults, 'Reset Formasi Awal');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification (Glassmorphism) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#eaeaea] shadow-lg text-sm font-medium text-gray-800"
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

      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-[#eaeaea] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Denah Tempat Duduk Kelas
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isOfflineMode
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {isOfflineMode ? 'Mode Lokal' : 'API Terhubung'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Klik pada nama siswa untuk mengedit langsung (tekan <kbd className="px-1.5 py-0.5 text-[11px] bg-gray-100 rounded border border-gray-200">Enter</kbd> atau klik di luar untuk menyimpan).
          </p>
        </div>

        {/* Tombol Kontrol Rotasi */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleNormalRotation}
            disabled={syncing || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Rotasi Biasa (Geser 1)</span>
          </button>

          <button
            onClick={handleFiveDayRotation}
            disabled={syncing || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-400" />
            <span>Rotasi 5 Hari (Kanan Maju 1 Baris)</span>
          </button>

          <button
            onClick={handleResetDefault}
            disabled={syncing || loading}
            title="Kembalikan ke urutan default"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-700 font-medium text-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Area Papan Tulis / Meja Guru (Depan Kelas) */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-full max-w-md py-2.5 px-6 rounded-2xl bg-white/90 border border-[#eaeaea] shadow-xs flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <Monitor className="w-4 h-4 text-blue-500" />
          <span>Papan Tulis / Depan Kelas</span>
        </div>
      </div>

      {/* Grid 5 Baris x 4 Kolom Meja Ganda */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-2xl bg-white border border-[#eaeaea] p-4 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {[0, 1, 2, 3, 4].map((row) => {
            const isEvenRow = row % 2 === 0;
            return (
              <div key={row} className="space-y-2">
                {/* Indikator Baris & Arah Snake */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Baris {row + 1}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    {isEvenRow
                      ? 'Alur Ular: Kiri → Kanan'
                      : 'Alur Ular: Kanan → Kiri'}
                  </span>
                </div>

                {/* 4 Kolom Meja pada Baris Ini */}
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
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend / Keterangan Alur */}
      <div className="mt-8 p-4 rounded-2xl bg-white/70 border border-[#eaeaea] flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
            <Info className="w-4 h-4 text-blue-500" />
            Petunjuk Kursi:
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
            <span>Kursi Kiri (Tetap saat Rotasi 5 Hari)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>Kursi Kanan (Maju 1 Baris saat Rotasi 5 Hari: HH → ee → R → O → B → HH)</span>
          </span>
        </div>
        <span className="text-gray-400">
          Endpoint: <code className="text-gray-600">{API_BASE_URL}</code>
        </span>
      </div>
    </div>
  );
}
