import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';

function SeatInput({ seat, positionLabel, onUpdateName }) {
  const [value, setValue] = useState(seat?.nama_siswa || '');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Sinkronisasi state lokal saat terjadi rotasi dari parent
  useEffect(() => {
    setValue(seat?.nama_siswa || '');
  }, [seat?.nama_siswa]);

  const commitChange = async () => {
    const trimmed = value.trim();
    if (!seat || trimmed === seat.nama_siswa) return;

    setIsSaving(true);
    await onUpdateName(seat.id ?? seat.snakeIndex, trimmed, seat.snakeIndex);
    setIsSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setValue(seat?.nama_siswa || '');
      e.currentTarget.blur();
    }
  };

  const isRight = positionLabel === 'Kanan';

  return (
    <motion.div
      layout
      key={`${seat?.kode_kursi}-${seat?.nama_siswa}`}
      initial={{ opacity: 0.7, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`relative flex flex-col p-2.5 rounded-xl border transition-all ${
        isRight
          ? 'bg-blue-50/40 border-blue-200/70 hover:border-blue-300'
          : 'bg-gray-50/70 border-gray-200/80 hover:border-gray-300'
      } focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500`}
    >
      {/* Header Kursi: Kode Snake & Badge Kiri/Kanan */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`inline-flex items-center justify-center min-w-[1.6rem] h-5 px-1.5 rounded-md text-[11px] font-bold tracking-tight ${
            isRight
              ? 'bg-blue-500 text-white shadow-xs'
              : 'bg-gray-200/90 text-gray-700'
          }`}
          title={`Indeks Urutan: ${seat?.snakeIndex}`}
        >
          {seat?.kode_kursi}
        </span>

        <div className="flex items-center gap-1">
          {isSaving && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
          {justSaved && !isSaving && <Check className="w-3 h-3 text-emerald-500" />}
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${
              isRight ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {positionLabel}
          </span>
        </div>
      </div>

      {/* Inline Input Nama Siswa */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        placeholder="Nama siswa..."
        aria-label={`Kursi ${seat?.kode_kursi} (${positionLabel})`}
        className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none truncate"
      />
    </motion.div>
  );
}

export default function DeskCard({
  row,
  col,
  leftSeat,
  rightSeat,
  onUpdateName,
}) {
  const isEvenRow = row % 2 === 0;
  const deskNumber = row * 4 + col + 1;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md border border-[#eaeaea] transition-shadow duration-200 flex flex-col justify-between"
    >
      {/* Header Meja */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Meja {deskNumber}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400"
          title={
            isEvenRow
              ? 'Alur Ular: Kiri ke Kanan'
              : 'Alur Ular: Kanan ke Kiri'
          }
        >
          {isEvenRow ? (
            <>
              <span>Alur</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
            </>
          ) : (
            <>
              <ArrowLeft className="w-3 h-3 text-amber-500" />
              <span>Alur</span>
            </>
          )}
        </span>
      </div>

      {/* 2 Kursi dalam 1 Meja Ganda: Kiri & Kanan */}
      <div className="grid grid-cols-2 gap-2">
        <SeatInput
          seat={leftSeat}
          positionLabel="Kiri"
          onUpdateName={onUpdateName}
        />
        <SeatInput
          seat={rightSeat}
          positionLabel="Kanan"
          onUpdateName={onUpdateName}
        />
      </div>
    </motion.div>
  );
}
