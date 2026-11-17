import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ArrowUpCircle,
  RotateCcw,
  CheckCircle2,
  Monitor,
  Info,
  HardDrive,
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

// Normalisasi data dari LocalStorage agar selalu berjumlah 40 kursi sesuai urutan indeks 0-39
function normalizeStoredSeats(storedData) {
  const defaults = createDefaultSeats();
  if (!Array.isArray(storedData) || storedData.length === 0) return defaults;

  return defaults.map((defSeat, idx) => {
    const matched =
      storedData.find(
        (item) =>
          item.snakeIndex === idx ||
          item.id_posisi === idx ||
          item.kode_kursi === SNAKE_LABELS[idx] ||
          item.id === idx + 1
      ) || storedData[idx];

    if (!matched) return defSeat;
    return {
      ...defSeat,
      id: matched.id ?? defSeat.id,
      nama_siswa: matched.nama_siswa ?? matched.name ?? defSeat.nama_siswa,
    };
  });
}

function loadSeatsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultSeats();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return normalizeStoredSeats(parsed);
  } catch (err) {
    console.error('Gagal membaca LocalStorage:', err);
    return createDefaultSeats();
  }
}

function saveSeatsToStorage(seatsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seatsData));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan ke LocalStorage:', err);
    return false;
  }
}

export default function Dashboard() {
  const [seats, setSeats] = useState(() => loadSeatsFromStorage());
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2500);
  }, []);

  // Pastikan data tersimpan ke LocalStorage setiap kali state seats berubah
  useEffect(() => {
    saveSeatsToStorage(seats);
  }, [seats]);

  // 1. Update satu nama kursi saat diedit (onBlur / Enter)
  const handleUpdateSingleSeat = async (seatId, newName, snakeIndex) => {
    setSeats((prev) => {
      const updated = prev.map((s, idx) =>
        idx === snakeIndex ? { ...s, nama_siswa: newName } : s
      );
      saveSeatsToStorage(updated);
      return updated;
    });
    showToast(`Nama pada kursi ${SNAKE_LABELS[snakeIndex]} berhasil disimpan.`);
  };

  // 2. Tombol Rotasi Biasa (Geser 1 Langkah mengikuti Snake Pattern)
  const handleNormalRotation = () => {
    setSeats((prev) => {
      const nextSeats = rotateSnakeOneStep(prev);
      saveSeatsToStorage(nextSeats);
      return nextSeats;
    });
    showToast('Rotasi Biasa (Geser 1) berhasil diterapkan & disimpan!');
  };

  // 3. Tombol Rotasi 5 Hari (Kursi Kanan Maju 1 Baris di Kolom yang Sama)
  const handleFiveDayRotation = () => {
    setSeats((prev) => {
      const nextSeats = rotateFiveDaysRightSeats(prev);
      saveSeatsToStorage(nextSeats);
      return nextSeats;
    });
    showToast('Rotasi 5 Hari (Kursi Kanan Maju 1 Baris) berhasil disimpan!');
  };

  // 4. Reset ke urutan awal (Siswa A .. Siswa nn)
  const handleResetDefault = () => {
    const defaults = createDefaultSeats();
    setSeats(defaults);
    saveSeatsToStorage(defaults);
    showToast('Formasi berhasil di-reset ke urutan awal.');
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
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tersimpan di LocalStorage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Klik pada nama siswa untuk mengedit langsung (tekan{' '}
            <kbd className="px-1.5 py-0.5 text-[11px] bg-gray-100 rounded border border-gray-200">
              Enter
            </kbd>{' '}
            atau klik di luar untuk menyimpan otomatis).
          </p>
        </div>

        {/* Tombol Kontrol Rotasi */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleNormalRotation}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rotasi Biasa (Geser 1)</span>
          </button>

          <button
            onClick={handleFiveDayRotation}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-medium text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-400" />
            <span>Rotasi 5 Hari (Kanan Maju 1 Baris)</span>
          </button>

          <button
            onClick={handleResetDefault}
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
        <span className="inline-flex items-center gap-1.5 text-gray-400">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Key: <code className="text-gray-600">{STORAGE_KEY}</code></span>
        </span>
      </div>
    </div>
  );
}
