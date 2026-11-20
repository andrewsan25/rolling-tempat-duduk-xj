import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Info,
  Database,
  Search,
  X,
  Lock,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import DeskCard from '../components/DeskCard';
import AnnouncementsTab from '../components/tabs/AnnouncementsTab';
import PiketTab from '../components/tabs/PiketTab';
import FinanceTab from '../components/tabs/FinanceTab';
import {
  createDefaultSeats,
  getDeskSeats,
  rotateSnakeOneStep,
  rotateFiveDaysRightSeats,
  rerollRandomSeats,
  SNAKE_LABELS,
} from '../utils/seatingLogic';
import { authenticateUser } from '../utils/authRoles';

const STORAGE_KEY = 'rolling_tempat_duduk_xj_seats';
const PORTAL_STORAGE_KEY = 'rolling_tempat_duduk_xj_portal';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/seats' : '/api/seats');

const PORTAL_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api/portal'
  : '/api/portal';

function getInitialPortalFallback() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return {
    announcements: [
      {
        id: 'ann-1',
        title: 'Ulangan Harian Matematika Bab Trigonometri',
        category: 'Ulangan',
        subject: 'Matematika',
        date: `${year}-${month}-12`,
        notes: 'Pelajari latihan soal halaman 45-52. Bawa penggaris dan alat tulis lengkap.',
        author: 'Sekretaris',
      },
      {
        id: 'ann-2',
        title: 'Pengumpulan Tugas Makalah Sejarah Indonesia',
        category: 'Tugas',
        subject: 'Sejarah',
        date: `${year}-${month}-18`,
        notes: 'Format PDF dikumpulkan melalui ketua kelompok masing-masing sebelum pukul 15.00 WIB.',
        author: 'Sekretaris',
      },
      {
        id: 'ann-3',
        title: 'Praktikum Biologi & Laporan Pengamatan Sel',
        category: 'Tugas',
        subject: 'Biologi',
        date: `${year}-${month}-22`,
        notes: 'Wajib membawa jas lab dan buku gambar A4 untuk dokumentasi mikroskop.',
        author: 'Sekretaris',
      },
    ],
    piket: [
      {
        day: 'Senin',
        members: ['Javier', 'Madeline', 'Fiona', 'Keanu', 'Hayden', 'Rachel', 'Siswa G', 'Siswa H'],
        note: 'Menyapu lantai, membersihkan papan tulis, dan membuang sampah.',
      },
      {
        day: 'Selasa',
        members: ['Jayvohn', 'Siswa I', 'Siswa J', 'Siswa K', 'Siswa L', 'Siswa M', 'Siswa N', 'Siswa O'],
        note: 'Menyapu kelas, merapikan barisan meja ganda, dan menghapus whiteboard.',
      },
      {
        day: 'Rabu',
        members: ['Siswa P', 'Siswa Q', 'Siswa R', 'Siswa S', 'Siswa T', 'Siswa U', 'Siswa V', 'Siswa W'],
        note: 'Membersihkan kaca jendela, menyapu lantai, dan mengisi spidol.',
      },
      {
        day: 'Kamis',
        members: ['Siswa X', 'Siswa Y', 'Siswa Z', 'Siswa aa', 'Siswa bb', 'Siswa cc', 'Siswa dd', 'Siswa ee'],
        note: 'Menyapu lantai, mengepel area depan kelas, dan merapikan pojok baca.',
      },
      {
        day: 'Jumat',
        members: ['Siswa ff', 'Siswa gg', 'Siswa HH', 'Siswa ii', 'Siswa jj', 'Siswa kk', 'Siswa ll', 'Siswa mm'],
        note: 'Jumat Bersih: menyapu seluruh kelas, membuang sampah, dan merapikan taplak meja guru.',
      },
    ],
    finance: [
      {
        id: 'fin-1',
        date: `${year}-${month}-02`,
        title: 'Iuran Kas Kelas Minggu ke-1 (40 Siswa)',
        category: 'Uang Kas',
        type: 'income',
        amount: 400000,
      },
      {
        id: 'fin-2',
        date: `${year}-${month}-05`,
        title: 'Pembelian Spidol Boardmarker, Penghapus & Tinta Refill',
        category: 'Perlengkapan',
        type: 'expense',
        amount: 65000,
      },
      {
        id: 'fin-3',
        date: `${year}-${month}-09`,
        title: 'Iuran Kas Kelas Minggu ke-2 (40 Siswa)',
        category: 'Uang Kas',
        type: 'income',
        amount: 400000,
      },
      {
        id: 'fin-4',
        date: `${year}-${month}-14`,
        title: 'Pembelian Sapu, Pengki & Pengharum Ruangan Kelas',
        category: 'Kebersihan',
        type: 'expense',
        amount: 110000,
      },
    ],
  };
}

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
    // ignore quota error
  }
}

function loadCachedPortal() {
  try {
    const raw = localStorage.getItem(PORTAL_STORAGE_KEY);
    if (!raw) return getInitialPortalFallback();
    const parsed = JSON.parse(raw);
    const fb = getInitialPortalFallback();
    return {
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : fb.announcements,
      piket: Array.isArray(parsed.piket) ? parsed.piket : fb.piket,
      finance: Array.isArray(parsed.finance) ? parsed.finance : fb.finance,
    };
  } catch {
    return getInitialPortalFallback();
  }
}

function saveCachedPortal(portalData) {
  try {
    localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(portalData));
  } catch {
    // ignore quota error
  }
}

export default function Dashboard({
  currentUser,
  onLogin,
  activeTab,
  setActiveTab,
}) {
  const [seats, setSeats] = useState(() => loadCachedSeats());
  const [portalData, setPortalData] = useState(() => loadCachedPortal());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (currentUser && !currentUser.allowedTabs.includes(activeTab)) {
      setActiveTab(currentUser.allowedTabs[0]);
    }
  }, [currentUser, activeTab, setActiveTab]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  const namedCount = useMemo(() => {
    return seats.filter(
      (s) => s.nama_siswa && !s.nama_siswa.startsWith('Siswa ')
    ).length;
  }, [seats]);

  useEffect(() => {
    let isMounted = true;

    async function fetchAllData() {
      setLoading(true);
      try {
        const [seatsRes, portalRes] = await Promise.all([
          fetch(API_BASE_URL),
          fetch(PORTAL_API_URL),
        ]);

        if (!seatsRes.ok) throw new Error(`HTTP ${seatsRes.status}`);
        const seatsJson = await seatsRes.json();
        const normalizedSeats = normalizeSeats(
          Array.isArray(seatsJson) ? seatsJson : seatsJson.data
        );

        if (isMounted) {
          setSeats(normalizedSeats);
          saveCachedSeats(normalizedSeats);
          setIsOfflineMode(false);
        }

        if (portalRes.ok) {
          const portalJson = await portalRes.json();
          if (isMounted && portalJson) {
            const mergedPortal = {
              announcements: Array.isArray(portalJson.announcements)
                ? portalJson.announcements
                : portalData.announcements,
              piket: Array.isArray(portalJson.piket)
                ? portalJson.piket
                : portalData.piket,
              finance: Array.isArray(portalJson.finance)
                ? portalJson.finance
                : portalData.finance,
            };
            setPortalData(mergedPortal);
            saveCachedPortal(mergedPortal);
          }
        }
      } catch {
        if (isMounted) {
          setIsOfflineMode(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncPortalToBackend = async (nextPortalData, successMsg) => {
    setPortalData(nextPortalData);
    saveCachedPortal(nextPortalData);
    try {
      const res = await fetch(PORTAL_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPortalData),
      });
      if (!res.ok) throw new Error('Failed to sync portal data');
      setIsOfflineMode(false);
      showToast(successMsg);
    } catch {
      setIsOfflineMode(true);
      showToast(`${successMsg} (Tersimpan di cache lokal)`, 'warning');
    }
  };

  const handleUpdateSingleSeat = async (seatId, newName, snakeIndex) => {
    if (!currentUser?.permissions?.canEditSeats) return;

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
      showToast(`Kursi ${SNAKE_LABELS[snakeIndex]} berhasil disimpan.`);
    } catch {
      setIsOfflineMode(true);
      showToast(
        `Kursi ${SNAKE_LABELS[snakeIndex]} tersimpan di cache lokal.`,
        'warning'
      );
    }
  };

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
      showToast(`${labelRotasi} tersimpan di cache lokal.`, 'warning');
    } finally {
      setSyncing(false);
    }
  };

  const handleNormalRotation = () => {
    if (!currentUser?.permissions?.canEditSeats) return;
    const nextSeats = rotateSnakeOneStep(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi Biasa (Geser 1)');
  };

  const handleFiveDayRotation = () => {
    if (!currentUser?.permissions?.canEditSeats) return;
    const nextSeats = rotateFiveDaysRightSeats(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Rotasi 5 Hari (Kursi Kanan Maju 1 Baris)');
  };

  const handleRerollSeats = () => {
    if (!currentUser?.permissions?.canEditSeats) return;
    const nextSeats = rerollRandomSeats(seats);
    setSeats(nextSeats);
    syncBatchToBackend(nextSeats, 'Reroll (Acak Tempat Duduk)');
  };

  const confirmResetDefault = () => {
    if (!currentUser?.permissions?.canEditSeats) return;
    const defaults = createDefaultSeats();
    setSeats(defaults);
    setShowResetModal(false);
    syncBatchToBackend(defaults, 'Reset Formasi Awal');
  };

  // Login Gate (tanpa daftar username/password & tanpa masuk cepat)
  if (!currentUser) {
    const handleGateLogin = (e) => {
      e.preventDefault();
      const role = authenticateUser(loginUser, loginPass);
      if (!role) {
        setLoginError('Username atau password yang Anda masukkan salah.');
        return;
      }
      setLoginError('');
      onLogin(role);
    };

    return (
      <div className="max-w-md mx-auto px-4 py-14">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#DECBB3] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8C6239] to-[#5C3D22] text-[#FFFDF9] flex items-center justify-center shadow-md shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#2C1E14]">
                Login Portal Kelas
              </h1>
              <p className="text-xs text-[#7A624E]">
                Silakan masuk dengan akun role Anda untuk mengakses dashboard.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Username
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Masukkan username..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C4028] mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Masukkan password..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:border-[#8C6239]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-full bg-[#1C140E] hover:bg-[#2C1E14] text-[#FAF5EE] font-semibold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Sekarang</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const canEditSeats = Boolean(currentUser.permissions?.canEditSeats);
  const canEditAnnouncements = Boolean(currentUser.permissions?.canEditAnnouncements);
  const canEditPiket = Boolean(currentUser.permissions?.canEditPiket);
  const canEditFinance = Boolean(currentUser.permissions?.canEditFinance);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel text-sm font-semibold text-[#2C1E14] shadow-xl"
          >
            {toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1E14]/40 backdrop-blur-sm"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 rounded-3xl bg-[#FFFDF9] shadow-2xl border border-[#DECBB3]"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#2C1E14] mb-1.5">
                Reset Semua Nama Kursi?
              </h3>
              <p className="text-sm text-[#6E5644] mb-6 leading-relaxed">
                Tindakan ini akan mengembalikan seluruh 40 kursi menjadi nama default (<code>Siswa A</code> – <code>Siswa nn</code>) di Supabase.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-full bg-[#EFE5D8] text-[#5C3D22] text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmResetDefault}
                  className="px-4 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TAB 1: DENAH TEMPAT DUDUK ================= */}
      {activeTab === 'seats' && currentUser.allowedTabs.includes('seats') && (
        <div>
          {/* 2-Column Espresso Command Panel directly below Pill Navbar (Persis gaya kartu 2 kolom pada gambar referensi) */}
          <div className="max-w-3xl mx-auto espresso-panel rounded-3xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-lg sm:text-xl font-bold text-[#FAF5EE]">
                    Denah Tempat Duduk
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.08] text-[#FAF5EE]">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    {isOfflineMode ? 'Cache Lokal' : 'Supabase Live'}
                  </span>
                  <span className="text-xs text-[#B09E8E]">
                    &bull; {namedCount}/40 Terisi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#B09E8E] mt-1">
                  {canEditSeats
                    ? 'Pilih aksi kontrol di bawah atau klik nama siswa pada meja untuk mengedit.'
                    : 'Mode Lihat (Murid Biasa): Gunakan pencarian untuk menemukan kursi Anda.'}
                </p>
              </div>

              {/* Search Student Input */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-[#B09E8E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa / kursi..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-[#120D09] border border-white/15 text-xs text-[#FAF5EE] placeholder-[#8C7A6B] focus:outline-none focus:border-[#FAF5EE]/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B09E8E] hover:text-[#FAF5EE] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2-Column Action Grid inside the Panel (Persis seperti AI agency / Web design agency di gambar referensi) */}
            {canEditSeats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <button
                  type="button"
                  onClick={handleNormalRotation}
                  disabled={syncing || loading}
                  className="text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE] group-hover:text-[#E06D3B] transition-colors flex items-center gap-2">
                    <span>Rotasi Biasa (Geser 1)</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#E06D3B]" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    Geser seluruh siswa maju 1 langkah mengikuti pola ular
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleFiveDayRotation}
                  disabled={syncing || loading}
                  className="text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE] group-hover:text-[#E06D3B] transition-colors flex items-center gap-2">
                    <span>Rotasi 5 Hari (Kanan Maju)</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#E06D3B]" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    Khusus kursi kanan maju 1 baris di kolom yang sama
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleRerollSeats}
                  disabled={syncing || loading}
                  className="text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE] group-hover:text-[#E06D3B] transition-colors flex items-center gap-2">
                    <span>Reroll / Acak Tempat Duduk</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#E06D3B]" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    Acak otomatis posisi 40 kursi secara merata
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={syncing || loading}
                  className="text-left group cursor-pointer disabled:opacity-50"
                >
                  <div className="font-display font-bold text-sm sm:text-[15px] text-[#FAF5EE] group-hover:text-rose-400 transition-colors flex items-center gap-2">
                    <span>Reset Formasi Default</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-rose-400" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#B09E8E] mt-0.5">
                    Kembalikan urutan kursi ke formasi awal (Siswa A – nn)
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <div className="font-display font-bold text-sm text-[#FAF5EE] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#E06D3B]" />
                    <span>Akses Hanya Lihat</span>
                  </div>
                  <div className="text-xs text-[#B09E8E] mt-0.5">
                    Urutan tempat duduk diatur oleh Ketua Kelas & Wakil
                  </div>
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#FAF5EE]">
                    Pola Snake Pattern (5 Baris &times; 4 Kolom)
                  </div>
                  <div className="text-xs text-[#B09E8E] mt-0.5">
                    40 kursi terbagi dalam 20 meja ganda (Kiri & Kanan)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Papan Tulis / Meja Guru */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-full max-w-xl py-2.5 px-6 rounded-full pill-navbar flex items-center justify-center gap-2.5">
              <Monitor className="w-4 h-4 text-[#E06D3B]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAF5EE]">
                Papan Tulis &bull; Depan Kelas
              </span>
            </div>
          </div>

          {/* Grid 5 Baris x 4 Kolom */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-2xl bg-[#FFFDF9]/80 border border-[#DECBB3] p-4 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {[0, 1, 2, 3, 4].map((row) => {
                const isEvenRow = row % 2 === 0;
                return (
                  <div key={row} className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#DECBB3] text-xs font-bold text-[#4A3322] shadow-xs">
                          Baris {row + 1}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
                            isEvenRow
                              ? 'bg-[#EFE5D8] text-[#6F4E37] border border-[#DECBB3]'
                              : 'bg-[#F5E6D3] text-[#8C5828] border border-[#DFC29F]'
                          }`}
                        >
                          {isEvenRow
                            ? 'Alur Ular: Kiri → Kanan'
                            : 'Alur Ular: Kanan → Kiri'}
                        </span>
                      </div>
                    </div>

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
                            canEdit={canEditSeats}
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
          <div className="mt-8 p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 text-xs text-[#6E5644]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#2C1E14]">
                <Info className="w-4 h-4 text-[#8C6239]" />
                Keterangan:
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#E5D4C0] inline-block" />
                <span>Kursi Kiri (Tetap saat Rotasi 5 Hari)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-r from-[#8C6239] to-[#6F4E37] inline-block" />
                <span>Kursi Kanan (Maju 1 Baris: HH → ee → R → O → B → HH)</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[#7A624E] font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supabase Cloud Sync</span>
            </span>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PAPAN PENGUMUMAN & KALENDER SYNC ================= */}
      {activeTab === 'announcements' && currentUser.allowedTabs.includes('announcements') && (
        <AnnouncementsTab
          announcements={portalData.announcements}
          canEdit={canEditAnnouncements}
          currentUser={currentUser}
          onSaveAnnouncements={(nextList) =>
            syncPortalToBackend(
              { ...portalData, announcements: nextList },
              'Papan Pengumuman & Kalender berhasil diperbarui!'
            )
          }
        />
      )}

      {/* ================= TAB 3: JADWAL PIKET ================= */}
      {activeTab === 'piket' && currentUser.allowedTabs.includes('piket') && (
        <PiketTab
          piket={portalData.piket}
          canEdit={canEditPiket}
          currentUser={currentUser}
          onSavePiket={(nextPiket) =>
            syncPortalToBackend(
              { ...portalData, piket: nextPiket },
              'Jadwal Piket berhasil diperbarui!'
            )
          }
        />
      )}

      {/* ================= TAB 4: LAPORAN KEUANGAN ================= */}
      {activeTab === 'finance' && currentUser.allowedTabs.includes('finance') && (
        <FinanceTab
          finance={portalData.finance}
          canEdit={canEditFinance}
          currentUser={currentUser}
          onSaveFinance={(nextFinance) =>
            syncPortalToBackend(
              { ...portalData, finance: nextFinance },
              'Laporan Keuangan Kas berhasil diperbarui!'
            )
          }
        />
      )}
    </div>
  );
}
