import React, { useState, useMemo } from 'react';
import {
  NotebookPen,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Eye,
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAY_HEADERS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const PERSONAL_CATEGORY_STYLES = {
  'Catatan Belajar': 'bg-[#8C6239] text-[#FFFDF9]',
  'Target / To-Do': 'bg-[#5C3D22] text-[#FFFDF9]',
  'Pengingat Pribadi': 'bg-[#B87D3B] text-[#FFFDF9]',
  'Jadwal Les / Ekskul': 'bg-[#C4A484] text-[#2C1E14]',
};

export default function PersonalNotesTab({
  currentUser,
  personalNotes = [],
  classAnnouncements = [],
  onSavePersonalNotes,
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [showClassEventsInCalendar, setShowClassEventsInCalendar] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Catatan Belajar');
  const [date, setDate] = useState(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [content, setContent] = useState('');

  const ownerName = currentUser?.customName || currentUser?.roleName || 'Saya';

  // Map tanggal -> agenda di Kalender Pribadi (gabungan Notes Pribadi + opsional Jadwal Kelas)
  const calendarEventsByDate = useMemo(() => {
    const map = {};
    personalNotes.forEach((note) => {
      if (!note.date) return;
      if (!map[note.date]) map[note.date] = [];
      map[note.date].push({ ...note, source: 'personal' });
    });

    if (showClassEventsInCalendar) {
      classAnnouncements.forEach((ann) => {
        if (!ann.date) return;
        if (!map[ann.date]) map[ann.date] = [];
        map[ann.date].push({ ...ann, source: 'class' });
      });
    }
    return map;
  }, [personalNotes, classAnnouncements, showClassEventsInCalendar]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const events = calendarEventsByDate[dateStr] || [];
      const personalCount = events.filter((e) => e.source === 'personal').length;
      const classCount = events.filter((e) => e.source === 'class').length;
      cells.push({
        day: d,
        dateStr,
        events,
        personalCount,
        classCount,
      });
    }
    return cells;
  }, [viewYear, viewMonth, calendarEventsByDate]);

  const filteredNotes = useMemo(() => {
    return personalNotes
      .filter((note) => {
        if (filterCategory !== 'Semua' && note.category !== filterCategory) {
          return false;
        }
        if (selectedDate && note.date !== selectedDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [personalNotes, filterCategory, selectedDate]);

  const handleAddPersonalNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newNote = {
      id: `pnote-${Date.now()}`,
      title: title.trim(),
      category,
      date,
      content: content.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const [y, m] = date.split('-').map(Number);
    if (y && m) {
      setViewYear(y);
      setViewMonth(m - 1);
    }

    onSavePersonalNotes([newNote, ...personalNotes]);
    setTitle('');
    setContent('');
  };

  const handleToggleComplete = (id) => {
    const updated = personalNotes.map((n) =>
      n.id === id ? { ...n, completed: !n.completed } : n
    );
    onSavePersonalNotes(updated);
  };

  const handleDeletePersonalNote = (id) => {
    const updated = personalNotes.filter((n) => n.id !== id);
    onSavePersonalNotes(updated);
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

  const handleSelectDate = (dateStr) => {
    setSelectedDate((prev) => (prev === dateStr ? '' : dateStr));
    setDate(dateStr);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Kiri (7 col): Form Notes Pribadi + Daftar Notes Pribadi */}
      <div className="lg:col-span-7 space-y-6">
        {/* Header Banner */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8C6239] text-[#FFFDF9] flex items-center justify-center shadow-sm">
              <NotebookPen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#2C1E14]">
                Catatan & Kalender Pribadi &mdash; {ownerName}
              </h2>
              <p className="text-xs text-[#7A624E]">
                Ruang khusus untuk menulis notes belajar, pengingat tugas, dan jadwal pribadi Anda.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8C6239] text-[#FFFDF9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Privasi: Milik {ownerName}</span>
          </span>
        </div>

        {/* Form Tambah Catatan Pribadi */}
        <form
          onSubmit={handleAddPersonalNote}
          className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 border-2 border-[#C8AA88]"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[#2C1E14] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#8C6239]" />
              <span>Tulis Notes Pribadi Baru (Sync Kalender Pribadi)</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#8C6239] bg-[#EFE5D8] px-2.5 py-0.5 rounded-full">
              Auto-Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Kategori Notes
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] focus:outline-none focus:border-[#8C6239]"
              >
                <option value="Catatan Belajar">Catatan Belajar</option>
                <option value="Target / To-Do">Target / To-Do List</option>
                <option value="Pengingat Pribadi">Pengingat Pribadi</option>
                <option value="Jadwal Les / Ekskul">Jadwal Les / Ekskul</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Tanggal Agenda (Sync ke Kalender Pribadi)
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
              Judul Notes
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Rangkuman Rumus Fisika / Latihan Basket / Beli Buku..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C4028] mb-1">
              Isi Catatan Pribadi
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis catatan lengkap, daftar hal yang harus dikerjakan, atau poin materi di sini..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Notes Pribadi</span>
            </button>
          </div>
        </form>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              'Semua',
              'Catatan Belajar',
              'Target / To-Do',
              'Pengingat Pribadi',
              'Jadwal Les / Ekskul',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#1C140E] text-[#FAF5EE] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#6F4E37] border border-[#DECBB3] hover:bg-[#EFE5D8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE5D8] text-[#5C3D22] text-xs font-bold border border-[#DECBB3] cursor-pointer"
            >
              <span>Filter Tanggal: {selectedDate}</span>
              <span>&times;</span>
            </button>
          )}
        </div>

        {/* Daftar Notes Pribadi */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-sm text-[#8C735E]">
              Belum ada catatan pribadi untuk filter ini. Yuk tulis notes pertamamu di atas!
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`glass-panel rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                  note.completed ? 'opacity-70 bg-[#FAF5EE]/60' : 'hover:border-[#C8AA88]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(note.id)}
                    className="mt-0.5 text-[#8C6239] hover:text-[#5C3D22] cursor-pointer shrink-0"
                    title={note.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {note.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          PERSONAL_CATEGORY_STYLES[note.category] ||
                          PERSONAL_CATEGORY_STYLES['Catatan Belajar']
                        }`}
                      >
                        {note.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6239]">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {note.date}
                      </span>
                    </div>

                    <h4
                      className={`font-display font-bold text-base text-[#2C1E14] ${
                        note.completed ? 'line-through text-[#8C735E]' : ''
                      }`}
                    >
                      {note.title}
                    </h4>

                    {note.content && (
                      <p className="text-xs sm:text-sm text-[#6E5644] leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePersonalNote(note.id)}
                  title="Hapus notes pribadi"
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kolom Kanan (5 col): Kalender Pribadi Interaktif */}
      <div className="lg:col-span-5">
        <div className="glass-panel rounded-3xl p-5 sm:p-6 sticky top-24">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6239] block">
                Kalender Pribadi &bull; {ownerName}
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#2C1E14]">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#5C3D22] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toggle Tampilkan Jadwal Kelas di Kalender Pribadi */}
          <div className="mb-4 flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF5EE] border border-[#E6D7C3]">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C4028]">
              <Eye className="w-3.5 h-3.5 text-[#8C6239]" />
              <span>Tampilkan juga Tugas/Ulangan Kelas</span>
            </span>
            <input
              type="checkbox"
              checked={showClassEventsInCalendar}
              onChange={(e) => setShowClassEventsInCalendar(e.target.checked)}
              className="w-4 h-4 accent-[#8C6239] rounded cursor-pointer"
            />
          </div>

          {/* Header Hari */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-[11px] font-bold text-[#8C735E] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid Tanggal Kalender Pribadi */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-14 rounded-xl bg-transparent" />;
              }

              const isSelected = selectedDate === cell.dateStr;
              const hasPersonal = cell.personalCount > 0;
              const hasClass = cell.classCount > 0;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`h-14 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C140E] text-[#FFFDF9] border-[#1C140E] shadow-md'
                      : hasPersonal
                        ? 'bg-[#F3E5D5] border-[#8C6239] hover:bg-[#EAD7C0]'
                        : hasClass
                          ? 'bg-[#FAF0E4] border-[#DECBB3] hover:bg-[#EFE5D8]'
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

                  <div className="flex items-center gap-1 flex-wrap">
                    {hasPersonal && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-bold truncate ${
                          isSelected
                            ? 'bg-[#FFFDF9] text-[#1C140E]'
                            : 'bg-[#8C6239] text-[#FFFDF9]'
                        }`}
                      >
                        {cell.personalCount} Notes
                      </span>
                    )}
                    {!hasPersonal && hasClass && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-bold truncate ${
                          isSelected
                            ? 'bg-[#E06D3B] text-white'
                            : 'bg-[#DFC7AC] text-[#4A3322]'
                        }`}
                      >
                        {cell.classCount} Kelas
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ringkasan Agenda pada Tanggal yang Dipilih */}
          {selectedDate && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#DECBB3] space-y-2">
              <div className="text-xs font-bold text-[#2C1E14]">
                Agenda Tanggal {selectedDate}:
              </div>
              {(calendarEventsByDate[selectedDate] || []).length === 0 ? (
                <div className="text-xs text-[#8C735E]">
                  Belum ada notes pribadi atau tugas kelas di tanggal ini.
                </div>
              ) : (
                (calendarEventsByDate[selectedDate] || []).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between gap-2 text-xs bg-[#FFFDF9] px-3 py-1.5 rounded-xl border border-[#E6D7C3]"
                  >
                    <span className="font-semibold text-[#2C1E14] truncate">
                      {ev.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        ev.source === 'personal'
                          ? 'bg-[#8C6239] text-[#FFFDF9]'
                          : 'bg-[#EFE5D8] text-[#5C3D22]'
                      }`}
                    >
                      {ev.source === 'personal' ? 'Pribadi' : `Kelas (${ev.category})`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#DECBB3] flex items-center gap-4 flex-wrap text-xs text-[#6E5644]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C6239]" />
              <span>Notes Pribadi Anda</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DFC7AC]" />
              <span>Jadwal Tugas/Ulangan Kelas</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
