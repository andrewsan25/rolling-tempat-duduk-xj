import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const cleaned = name.trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function SeatInput({ seat, positionLabel, onUpdateName, isHighlighted }) {
  const [value, setValue] = useState(seat?.nama_siswa || '');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

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
  const initials = getInitials(value);

  return (
    <motion.div
      layout
      key={`${seat?.kode_kursi}-${seat?.nama_siswa}`}
      initial={{ opacity: 0.72, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className={`group/seat relative flex flex-col p-2.5 rounded-xl border transition-all duration-200 ${
        isHighlighted
          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
          : isRight
            ? 'bg-gradient-to-b from-blue-50/90 to-indigo-50/50 border-blue-200/80 hover:border-blue-300 hover:shadow-xs'
            : 'bg-slate-50/90 border-slate-200/80 hover:border-slate-300 hover:bg-white'
      } focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/25 focus-within:border-blue-500`}
    >
      {/* Top Row: Kode Kursi + Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center justify-center min-w-[1.6rem] h-5 px-1.5 rounded-md text-[10px] font-bold tracking-tight ${
            isRight
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-blue-500/20'
              : 'bg-slate-200/90 text-slate-700'
          }`}
          title={`Urutan Snake #${(seat?.snakeIndex ?? 0) + 1}`}
        >
          {seat?.kode_kursi}
        </span>

        <div className="flex items-center gap-1">
          {isSaving && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
          {justSaved && !isSaving && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              isRight ? 'text-blue-600/90' : 'text-slate-400'
            }`}
          >
            {positionLabel}
          </span>
        </div>
      </div>

      {/* Avatar + Inline Input */}
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
            isRight
              ? 'bg-blue-100 text-blue-700 border border-blue-200/80'
              : 'bg-slate-200/80 text-slate-700 border border-slate-300/60'
          }`}
        >
          {initials}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitChange}
          onKeyDown={handleKeyDown}
          placeholder="Nama siswa..."
          aria-label={`Kursi ${seat?.kode_kursi} (${positionLabel})`}
          className="w-full min-w-0 bg-transparent text-xs sm:text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none truncate"
        />
      </div>
    </motion.div>
  );
}

export default function DeskCard({
  row,
  col,
  leftSeat,
  rightSeat,
  onUpdateName,
  searchQuery = '',
}) {
  const isEvenRow = row % 2 === 0;
  const deskNumber = row * 4 + col + 1;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const leftHighlighted =
    normalizedQuery.length > 0 &&
    (leftSeat?.nama_siswa?.toLowerCase().includes(normalizedQuery) ||
      leftSeat?.kode_kursi?.toLowerCase() === normalizedQuery);

  const rightHighlighted =
    normalizedQuery.length > 0 &&
    (rightSeat?.nama_siswa?.toLowerCase().includes(normalizedQuery) ||
      rightSeat?.kode_kursi?.toLowerCase() === normalizedQuery);

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="relative bg-white/90 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] border border-slate-200/80 transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle Top Desk Accent Bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1 ${
          isEvenRow
            ? 'bg-gradient-to-r from-blue-500/80 via-indigo-500/70 to-sky-400/70'
            : 'bg-gradient-to-r from-amber-400/80 via-orange-400/70 to-rose-400/60'
        }`}
      />

      {/* Header Meja */}
      <div className="flex items-center justify-between mb-2.5 pt-0.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
            {deskNumber}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Meja {deskNumber}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isEvenRow
              ? 'bg-blue-50 text-blue-600'
              : 'bg-amber-50 text-amber-600'
          }`}
          title={
            isEvenRow
              ? 'Alur Ular: Kiri ke Kanan'
              : 'Alur Ular: Kanan ke Kiri'
          }
        >
          {isEvenRow ? (
            <>
              <span>Kiri</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </>
          ) : (
            <>
              <ArrowLeft className="w-2.5 h-2.5" />
              <span>Kanan</span>
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
          isHighlighted={leftHighlighted}
        />
        <SeatInput
          seat={rightSeat}
          positionLabel="Kanan"
          onUpdateName={onUpdateName}
          isHighlighted={rightHighlighted}
        />
      </div>
    </motion.div>
  );
}
