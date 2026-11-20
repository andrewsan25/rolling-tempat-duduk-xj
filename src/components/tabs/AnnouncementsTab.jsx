import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CATEGORY_STYLES = {
  Ulangan: 'bg-[#8C4A32] text-[#FFFDF9]',
  Tugas: 'bg-[#8C6239] text-[#FFFDF9]',
  Pengumuman: 'bg-[#C4A484] text-[#2C1E14]',
};

export default function AnnouncementsTab({
  announcements = [],
  canEdit = false,
  onSaveAnnouncements,
  currentUser,
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0..11
  const [selectedDate, setSelectedDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  // Form state untuk Sekretaris / Admin
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tugas');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [notes, setNotes] = useState('');

  // Map tanggal (YYYY-MM-DD) -> daftar catatan untuk Kalender Sync
  const eventsByDate = useMemo(() => {
    const map = {};
    announcements.forEach((item) => {
      if (!item.date) return;
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [announcements]);

  // Bangun grid kalender bulan aktif
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        events: eventsByDate[dateStr] || [],
      });
    }
    return cells;
  }, [viewYear, viewMonth, eventsByDate]);

  const filteredList = useMemo(() => {
    return announcements
      .filter((item) => {
        if (filterCategory !== 'Semua' && item.category !== filterCategory) {
          return false;
        }
        if (selectedDate && item.date !== selectedDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [announcements, filterCategory, selectedDate]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!canEdit || !title.trim() || !date) return;

    const newItem = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      category,
      subject: subject.trim() || 'Umum',
      date,
      notes: notes.trim(),
      author: currentUser?.roleName || 'Sekretaris',
    };

    // Sinkronkan bulan kalender ke tanggal yang baru ditulis
    const [y, m] = date.split('-').map(Number);
    if (y && m) {
      setViewYear(y);
      setViewMonth(m - 1);
    }

    onSaveAnnouncements([newItem, ...announcements]);
    setTitle('');
    setSubject('');
    setNotes('');
  };

  const handleDeleteNote = (id) => {
    if (!canEdit) return;
    onSaveAnnouncements(announcements.filter((item) => item.id !== id));
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectCalendarDate = (dateStr) => {
    setSelectedDate((prev) => (prev === dateStr ? '' : dateStr));
    if (canEdit) {
      setDate(dateStr);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Kiri (7 col): Form Catatan Kelas (Sekretaris/Admin) + Daftar Pengumuman Tugas & Ulangan */}
      <div className="lg:col-span-7 space-y-6">
        {/* Banner Status Akses */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#2C1E14]">
                Papan Pengumuman, Tugas & Jadwal Ulangan
              </h2>
              <p className="text-xs text-[#7A624E]">
                Setiap tanggal tugas/ulangan yang ditulis di Catatan Kelas otomatis ter-sync ke Kalender Kelas.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              canEdit
                ? 'bg-[#8C6239] text-[#FFFDF9]'
                : 'bg-[#EFE5D8] text-[#6F4E37] border border-[#DECBB3]'
            }`}
          >
            {canEdit ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mode Edit ({currentUser?.roleName})</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Hanya Lihat (Read-Only)</span>
              </>
            )}
          </span>
        </div>

        {/* Form Input Catatan Kelas — Hanya untuk Sekretaris & Admin */}
        {canEdit && (
          <form
            onSubmit={handleAddNote}
            className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 border-2 border-[#C8AA88]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[#2C1E14] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#8C6239]" />
                <span>Tulis Catatan Kelas / Jadwal Baru (Auto-Sync Kalender)</span>
              </h3>
              <span className="text-[11px] font-semibold text-[#8C6239] bg-[#EFE5D8] px-2.5 py-0.5 rounded-full">
                Sync Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5C4028] mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] focus:outline-none focus:border-[#8C6239]"
                >
                  <option value="Tugas">Tugas / PR</option>
                  <option value="Ulangan">Jadwal Ulangan</option>
                  <option value="Pengumuman">Pengumuman Kelas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4028] mb-1">
                  Mata Pelajaran / Topik
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mis: Matematika, Biologi..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4028] mb-1">
                  Tanggal (Sync Kalender)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] focus:outline-none focus:border-[#8C6239]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Judul Pengumuman / Tugas / Ulangan
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Contoh: Ulangan Harian Kimia Bab Stoikiometri..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Detail Catatan Kelas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis rincian materi, halaman buku, atau syarat pengumpulan..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6239] to-[#6F4E37] hover:from-[#7A5230] hover:to-[#5C3D22] text-[#FFFDF9] text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan & Sync ke Kalender</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Semua', 'Tugas', 'Ulangan', 'Pengumuman'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#8C6239] text-[#FFFDF9] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#6F4E37] border border-[#DECBB3] hover:bg-[#EFE5D8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EFE5D8] text-[#5C3D22] text-xs font-bold border border-[#DECBB3] cursor-pointer"
            >
              <span>Filter Tanggal: {selectedDate}</span>
              <span>&times;</span>
            </button>
          )}
        </div>

        {/* Daftar Pengumuman / Tugas / Ulangan */}
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-sm text-[#8C735E]">
              Tidak ada catatan tugas atau jadwal ulangan pada filter ini.
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-[#C8AA88] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Pengumuman
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#EFE5D8] text-[#5C4028] text-xs font-bold">
                      <BookOpen className="w-3 h-3" />
                      {item.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6239]">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-[#2C1E14]">
                    {item.title}
                  </h4>

                  {item.notes && (
                    <p className="text-xs sm:text-sm text-[#6E5644] leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleDeleteNote(item.id)}
                    title="Hapus catatan"
                    className="self-end sm:self-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kolom Kanan (5 col): Kalender Kelas Interaktif (Auto-Sync) */}
      <div className="lg:col-span-5">
        <div className="glass-panel rounded-3xl p-5 sm:p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6239] block">
                Kalender Kelas Ter-Sync
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#2C1E14]">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] transition-colors cursor-pointer"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] transition-colors cursor-pointer"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Header Hari */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="text-[11px] font-bold text-[#8C735E] py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-14 rounded-xl bg-transparent" />;
              }

              const isSelected = selectedDate === cell.dateStr;
              const hasEvents = cell.events.length > 0;
              const hasExam = cell.events.some((e) => e.category === 'Ulangan');

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelectCalendarDate(cell.dateStr)}
                  className={`h-14 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C6239] text-[#FFFDF9] border-[#6F4E37] shadow-md'
                      : hasEvents
                        ? 'bg-[#F3E5D5] border-[#C8AA88] hover:bg-[#EAD7C0]'
                        : 'bg-[#FFFDF9]/80 border-[#E6D7C3] hover:bg-[#EFE5D8]/60'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#FFFDF9]' : 'text-[#2C1E14]'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {hasEvents && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold truncate max-w-full ${
                          isSelected
                            ? 'bg-[#FFFDF9] text-[#5C3D22]'
                            : hasExam
                              ? 'bg-[#8C4A32] text-[#FFFDF9]'
                              : 'bg-[#8C6239] text-[#FFFDF9]'
                        }`}
                      >
                        {cell.events.length} Agenda
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Keterangan Kalender */}
          <div className="mt-5 pt-4 border-t border-[#DECBB3] space-y-2 text-xs text-[#6E5644]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6239]" />
                Klik tanggal untuk memfilter jadwal pada hari tersebut
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C4A32]" />
                <span>Jadwal Ulangan</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C6239]" />
                <span>Tugas / PR</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C4A484]" />
                <span>Pengumuman</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
