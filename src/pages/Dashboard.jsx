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
  Shuffle,
  LayoutGrid,
  Bell,
  ClipboardCheck,
  Wallet,
  Lock,
  KeyRound,
  ShieldCheck,
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
import { ROLES_CONFIG, authenticateUser } from '../utils/authRoles';

const STORAGE_KEY = 'rolling_tempat_duduk_xj_seats';
const PORTAL_STORAGE_KEY = 'rolling_tempat_duduk_xj_portal';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/seats' : '/api/seats');

const PORTAL_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api/portal'
  : '/api/portal';

const ALL_TABS = [
  { id: 'seats', label: 'Denah Tempat Duduk', icon: LayoutGrid },
  { id: 'announcements', label: 'Papan Pengumuman & Kalender', icon: Bell },
  { id: 'piket', label: 'Jadwal Piket', icon: ClipboardCheck },
  { id: 'finance', label: 'Laporan Keuangan', icon: Wallet },
];

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

export default function Dashboard({ currentUser, onLogin }) {
  const [seats, setSeats] = useState(() => loadCachedSeats());
  const [portalData, setPortalData] = useState(() => loadCachedPortal());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Login gate state jika belum login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab aktif (hanya boleh dari allowedTabs role yang sedang login)
  const allowedTabObjects = useMemo(() => {
    if (!currentUser) return [];
    return ALL_TABS.filter((t) => currentUser.allowedTabs.includes(t.id));
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState(() =>
    currentUser?.allowedTabs?.[0] || 'seats'
  );

  // Pastikan setiap ganti role, activeTab otomatis menyesuaikan tab yang diizinkan
  useEffect(() => {
    if (currentUser && !currentUser.allowedTabs.includes(activeTab)) {
      setActiveTab(currentUser.allowedTabs[0]);
    }
  }, [currentUser, activeTab]);

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

  // Fetch data kursi & data portal (Pengumuman, Piket, Keuangan) dari Supabase
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

  // Helper simpan perubahan Portal Data (Pengumuman / Piket / Keuangan) ke Supabase
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

  // Update 1 nama kursi
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
      showToast(`Kursi ${SNAKE_LABELS[snakeIndex]} berhasil disimpan ke Supabase.`);
    } catch {
      setIsOfflineMode(true);
      showToast(
        `Kursi ${SNAKE_LABELS[snakeIndex]} tersimpan di cache lokal.`,
        'warning'
      );
    }
  };

  // Batch update kursi setelah rotasi / reroll / reset
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

  // Jika belum login, tampilkan Login Gate
  if (!currentUser) {
    const handleGateLogin = (e) => {
      e.preventDefault();
      const role = authenticateUser(loginUser, loginPass);
      if (!role) {
        setLoginError('Username atau password salah. Klik salah satu role di bawah untuk auto-login.');
        return;
      }
      setLoginError('');
      onLogin(role);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#DECBB3] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8C6239] to-[#5C3D22] text-[#FFFDF9] flex items-center justify-center shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-[#2C1E14]">
                Login Diperlukan
              </h1>
              <p className="text-xs sm:text-sm text-[#7A624E]">
                Silakan masuk dengan akun role Anda untuk mengakses tab dashboard yang sesuai.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {loginError}
            </div>
          )}

          <form onSubmit={handleGateLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <input
              type="text"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="Username (mis: ketua)"
              required
              className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
            />
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="Password"
              required
              className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-sm font-semibold text-[#2C1E14]"
            />
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#8C6239] to-[#6F4E37] text-[#FFFDF9] font-semibold text-sm shadow-md cursor-pointer"
            >
              Masuk Sekarang
            </button>
          </form>

          <div className="pt-5 border-t border-[#E6D7C3]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C6239] mb-3">
              Pilih Role untuk Masuk Cepat:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ROLES_CONFIG.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onLogin(r)}
                  className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#EFE5D8] border border-[#DECBB3] text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-display font-bold text-xs text-[#2C1E14]">
                      {r.roleName}
                    </div>
                    <div className="text-[11px] text-[#7A624E]">
                      <code>{r.username}</code> / <code>{r.password}</code>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-[#8C6239]" />
                </button>
              ))}
            </div>
          </div>
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
                  className="px-4 py-2 rounded-xl bg-[#EFE5D8] text-[#5C3D22] text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmResetDefault}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  Ya, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Banner & Allowed Navigation Tabs */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 mb-6 border border-[#DECBB3]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Info Role Aktif */}
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-2 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 ${currentUser.badgeColor}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{currentUser.roleName}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#2C1E14]">
                Hak Akses Role: {currentUser.roleName}
              </div>
              <div className="text-[11px] text-[#7A624E]">
                {currentUser.shortDesc}
              </div>
            </div>
          </div>

          {/* Tab Switcher — HANYA menampilkan tab yang diizinkan untuk Role ini */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#EFE5D8]/90 p-1.5 rounded-2xl border border-[#DECBB3]">
            {allowedTabObjects.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8C6239] text-[#FFFDF9] shadow-sm'
                      : 'text-[#5C4028] hover:bg-[#FFFDF9]/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TAB 1: DENAH TEMPAT DUDUK ================= */}
      {activeTab === 'seats' && currentUser.allowedTabs.includes('seats') && (
        <div>
          {/* Command Header Card */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-7">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C1E14]">
                    Denah Tempat Duduk Kelas X-J
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isOfflineMode
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOfflineMode ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse'
                      }`}
                    />
                    {isOfflineMode ? 'Cache Lokal' : 'Supabase Live'}
                  </span>

                  {!canEditSeats && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EFE5D8] text-[#6F4E37] border border-[#DECBB3]">
                      <Lock className="w-3 h-3" />
                      <span>Hanya Lihat (Murid Biasa)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#7A624E]">
                  {canEditSeats
                    ? 'Ketua Kelas, Wakil, & Admin dapat mengedit nama siswa langsung, menggeser rotasi, atau mengacak kursi (Reroll).'
                    : 'Mode Lihat: Gunakan kolom pencarian di bawah untuk menemukan posisi tempat duduk Anda.'}
                </p>
              </div>

              {/* Tombol Kontrol Rotasi & Reroll — Hanya untuk Ketua, Wakil, dan Admin */}
              {canEditSeats && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleNormalRotation}
                    disabled={syncing || loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6239] to-[#6F4E37] hover:from-[#7A5230] hover:to-[#5C3D22] active:scale-[0.98] text-[#FFFDF9] font-semibold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Rotasi Biasa (Geser 1)</span>
                  </button>

                  <button
                    onClick={handleFiveDayRotation}
                    disabled={syncing || loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4A3322] to-[#2C1E14] hover:from-[#5C3D22] hover:to-[#3A281B] active:scale-[0.98] text-[#FFFDF9] font-semibold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-[#DFC7AC]" />
                    <span>Rotasi 5 Hari (Kanan Maju)</span>
                  </button>

                  <button
                    onClick={handleRerollSeats}
                    disabled={syncing || loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EFE5D8] hover:bg-[#E2D2BE] text-[#4A3322] border border-[#C8AA88] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4 text-[#8C6239]" />
                    <span>Reroll (Acak)</span>
                  </button>

                  <button
                    onClick={() => setShowResetModal(true)}
                    disabled={syncing || loading}
                    title="Reset ke formasi awal"
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-rose-50 hover:text-rose-700 text-[#6E5644] border border-[#DECBB3] font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-bar: Quick Stats + Student Search */}
            <div className="mt-5 pt-4 border-t border-[#E6D7C3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE5D8] text-xs font-bold text-[#4A3322]">
                  <Users className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span>40 Kursi &bull; 20 Meja Ganda</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3E5D5] text-xs font-bold text-[#6F4E37]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span>{namedCount} / 40 Nama Terisi</span>
                </span>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#9C8470] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa atau kode kursi..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FFFDF9] border border-[#DECBB3] text-xs sm:text-sm text-[#2C1E14] placeholder-[#A8927E] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C8470] hover:text-[#2C1E14] cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Papan Tulis / Meja Guru */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute -inset-x-6 -bottom-3 h-8 bg-[#8C6239]/15 blur-xl rounded-full pointer-events-none" />
              <div className="relative py-3 px-6 rounded-2xl bg-gradient-to-r from-[#4A3322] via-[#5C3D22] to-[#4A3322] text-[#FFFDF9] shadow-lg border border-[#7A5230] flex items-center justify-center gap-2.5">
                <Monitor className="w-4 h-4 text-[#DFC7AC]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FAF5EE]">
                  Papan Tulis &bull; Depan Kelas
                </span>
              </div>
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#DECBB3] text-xs font-bold text-[#4A3322] shadow-xs">
                          Baris {row + 1}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
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
