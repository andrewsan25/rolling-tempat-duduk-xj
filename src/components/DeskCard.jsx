import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2, Lock } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const cleaned = name.trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function SeatInput({
  seat,
  positionLabel,
  onUpdateName,
  isHighlighted,
  canEdit,
}) {
  const [value, setValue] = useState(seat?.nama_siswa || '');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setValue(seat?.nama_siswa || '');
  }, [seat?.nama_siswa]);

  const commitChange = async () => {
    if (!canEdit) return;
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
          ? 'bg-amber-100/90 border-[#B87D3B] ring-2 ring-[#B87D3B]/40 shadow-sm'
          : isRight
            ? 'bg-gradient-to-b from-[#F3E7D8] to-[#EFE0CE]/70 border-[#D5BC9F] hover:border-[#B89772]'
            : 'bg-[#FAF5EE]/90 border-[#E6D7C3] hover:border-[#D5BC9F] hover:bg-[#FFFDF9]'
      } ${
        canEdit
          ? 'focus-within:bg-[#FFFDF9] focus-within:ring-2 focus-within:ring-[#8C6239]/30 focus-within:border-[#8C6239]'
          : ''
      }`}
    >
      {/* Top Row: Kode Kursi + Status */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center justify-center min-w-[1.6rem] h-5 px-1.5 rounded-md text-[10px] font-bold tracking-tight ${
            isRight
              ? 'bg-gradient-to-r from-[#8C6239] to-[#6F4E37] text-[#FFFDF9] shadow-xs'
              : 'bg-[#E5D4C0] text-[#4A3322]'
          }`}
          title={`Urutan Snake #${(seat?.snakeIndex ?? 0) + 1}`}
        >
          {seat?.kode_kursi}
        </span>

        <div className="flex items-center gap-1">
          {isSaving && <Loader2 className="w-3 h-3 text-[#8C6239] animate-spin" />}
          {justSaved && !isSaving && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              isRight ? 'text-[#6F4E37]' : 'text-[#9C8470]'
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
              ? 'bg-[#DFC7AC] text-[#4A3322] border border-[#C8AA88]'
              : 'bg-[#EAE0D2] text-[#5C4028] border border-[#D8C7B2]'
          }`}
        >
          {initials}
        </div>
        <input
          type="text"
          value={value}
          readOnly={!canEdit}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitChange}
          onKeyDown={handleKeyDown}
          placeholder="Nama siswa..."
          aria-label={`Kursi ${seat?.kode_kursi} (${positionLabel})`}
          className={`w-full min-w-0 bg-transparent text-xs sm:text-[13px] font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none truncate ${
            !canEdit ? 'cursor-default' : ''
          }`}
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
  canEdit = true,
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
      className="relative bg-[#FFFDF9]/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_2px_10px_-3px_rgba(92,64,40,0.07)] hover:shadow-[0_12px_28px_-8px_rgba(140,98,57,0.16)] border border-[#E2D2BE] transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Desk Warm Wood Accent Bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1 ${
          isEvenRow
            ? 'bg-gradient-to-r from-[#8C6239] via-[#A67B5B] to-[#C4A484]'
            : 'bg-gradient-to-r from-[#B87D3B] via-[#9C6634] to-[#7A5230]'
        }`}
      />

      {/* Header Meja */}
      <div className="flex items-center justify-between mb-2.5 pt-0.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#EFE5D8] text-[10px] font-bold text-[#5C4028]">
            {deskNumber}
          </span>
          <span className="text-[11px] font-semibold text-[#8C735E] uppercase tracking-wider">
            Meja {deskNumber}
          </span>
          {!canEdit && (
            <Lock
              className="w-3 h-3 text-[#B09A84]"
              title="Read-only untuk role Anda"
            />
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isEvenRow
              ? 'bg-[#EFE5D8] text-[#6F4E37]'
              : 'bg-[#F5E6D3] text-[#8C5828]'
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
          canEdit={canEdit}
        />
        <SeatInput
          seat={rightSeat}
          positionLabel="Kanan"
          onUpdateName={onUpdateName}
          isHighlighted={rightHighlighted}
          canEdit={canEdit}
        />
      </div>
    </motion.div>
  );
}
