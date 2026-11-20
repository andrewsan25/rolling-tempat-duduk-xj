export const ROLES_CONFIG = [
  {
    id: 'ketua',
    roleName: 'Ketua Kelas',
    username: 'ketua',
    password: 'ketuaXJ2026',
    badgeColor: 'bg-[#8C6239] text-[#FFFDF9]',
    shortDesc: 'Mengatur denah kursi (geser & reroll), jadwal piket, serta memantau pengumuman dan laporan keuangan.',
    capabilities: [
      'Mengatur & mengedit aturan tempat duduk (Rotasi Biasa, Rotasi 5 Hari, Reroll/Acak Kursi, Edit Nama)',
      'Melihat Laporan Keuangan & saldo kas kelas (Read-Only)',
      'Melihat Papan Pengumuman, Tugas, Jadwal Ulangan & Kalender Kelas yang ter-sync (Read-Only)',
      'Melihat & mengatur Jadwal Piket harian kelas',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance'],
    permissions: {
      canEditSeats: true,
      canEditAnnouncements: false,
      canEditPiket: true,
      canEditFinance: false,
    },
  },
  {
    id: 'wakil',
    roleName: 'Wakil Ketua Kelas',
    username: 'wakil',
    password: 'wakilXJ2026',
    badgeColor: 'bg-[#9C7148] text-[#FFFDF9]',
    shortDesc: 'Mendampingi Ketua Kelas mengatur denah kursi (geser & reroll), jadwal piket, serta memantau pengumuman dan kas.',
    capabilities: [
      'Mengatur & mengedit aturan tempat duduk (Rotasi Biasa, Rotasi 5 Hari, Reroll/Acak Kursi, Edit Nama)',
      'Melihat Laporan Keuangan & saldo kas kelas (Read-Only)',
      'Melihat Papan Pengumuman, Tugas, Jadwal Ulangan & Kalender Kelas yang ter-sync (Read-Only)',
      'Melihat & mengatur Jadwal Piket harian kelas',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance'],
    permissions: {
      canEditSeats: true,
      canEditAnnouncements: false,
      canEditPiket: true,
      canEditFinance: false,
    },
  },
  {
    id: 'bendahara',
    roleName: 'Bendahara',
    username: 'bendahara',
    password: 'bendaharaXJ2026',
    badgeColor: 'bg-[#7A5C43] text-[#FFFDF9]',
    shortDesc: 'Mengelola pemasukan, pengeluaran, dan laporan keuangan kas kelas, serta dapat melihat denah kelas.',
    capabilities: [
      'Mengelola & mengedit penuh Laporan Keuangan (Tambah Pemasukan/Pengeluaran & Hapus Transaksi)',
      'Melihat Denah Tempat Duduk Kelas, Papan Pengumuman, & Jadwal Piket (Read-Only)',
    ],
    allowedTabs: ['finance', 'seats', 'announcements', 'piket'],
    permissions: {
      canEditSeats: false,
      canEditAnnouncements: false,
      canEditPiket: false,
      canEditFinance: true,
    },
  },
  {
    id: 'sekretaris',
    roleName: 'Sekretaris',
    username: 'sekretaris',
    password: 'sekretarisXJ2026',
    badgeColor: 'bg-[#A67B5B] text-[#FFFDF9]',
    shortDesc: 'Mengelola papan pengumuman, catatan tugas, jadwal ulangan (otomatis sync ke kalender), jadwal piket, serta melihat denah kelas.',
    capabilities: [
      'Menulis, mengedit, dan menghapus Catatan Kelas, Tugas, & Jadwal Ulangan',
      'Otomatis menyinkronkan tanggal catatan tugas/ulangan ke Kalender Kelas',
      'Mengelola daftar Jadwal Piket harian',
      'Melihat Denah Tempat Duduk Kelas (Read-Only)',
    ],
    allowedTabs: ['announcements', 'piket', 'seats'],
    permissions: {
      canEditSeats: false,
      canEditAnnouncements: true,
      canEditPiket: true,
      canEditFinance: false,
    },
  },
  {
    id: 'murid',
    roleName: 'Murid Biasa',
    username: 'murid',
    password: 'muridXJ2026',
    badgeColor: 'bg-[#C4A484] text-[#2C1E14]',
    shortDesc: 'Melihat posisi tempat duduk terbaru, papan pengumuman tugas/ulangan, kalender kelas, dan jadwal piket.',
    capabilities: [
      'Melihat urutan & posisi Denah Tempat Duduk terbaru (Read-Only)',
      'Melihat Papan Pengumuman, Catatan Tugas, & Jadwal Ulangan (Read-Only)',
      'Melihat Kalender Kelas yang ter-sync & Jadwal Piket harian (Read-Only)',
    ],
    allowedTabs: ['seats', 'announcements', 'piket'],
    permissions: {
      canEditSeats: false,
      canEditAnnouncements: false,
      canEditPiket: false,
      canEditFinance: false,
    },
  },
  {
    id: 'admin',
    roleName: 'Admin Utama',
    username: 'admin',
    password: 'adminXJ2026',
    badgeColor: 'bg-[#4A3322] text-[#FFFDF9]',
    shortDesc: 'Akses penuh (Full Control) ke seluruh fitur denah tempat duduk, pengumuman, kalender, piket, dan keuangan.',
    capabilities: [
      'Akses penuh melihat & mengedit Denah Tempat Duduk (Rotasi, Reroll, Edit Nama, Reset)',
      'Akses penuh menambah & mengubah Papan Pengumuman, Tugas, Ulangan & Kalender Kelas',
      'Akses penuh mengubah Jadwal Piket kelas',
      'Akses penuh mengelola Laporan Keuangan & transaksi kas kelas',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance'],
    permissions: {
      canEditSeats: true,
      canEditAnnouncements: true,
      canEditPiket: true,
      canEditFinance: true,
    },
  },
];

const AUTH_STORAGE_KEY = 'xj_portal_logged_user';
const USER_NAMES_STORAGE_KEY = 'xj_portal_custom_names';

export function getSavedCustomNames() {
  try {
    const raw = localStorage.getItem(USER_NAMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomNameForRole(roleId, customName) {
  try {
    const map = getSavedCustomNames();
    const trimmed = (customName || '').trim();
    if (trimmed) {
      map[roleId] = trimmed;
    } else {
      delete map[roleId];
    }
    localStorage.setItem(USER_NAMES_STORAGE_KEY, JSON.stringify(map));
    return trimmed;
  } catch {
    return '';
  }
}

export function attachCustomName(roleObj) {
  if (!roleObj) return null;
  const namesMap = getSavedCustomNames();
  return {
    ...roleObj,
    customName: namesMap[roleObj.id] || '',
  };
}

export function authenticateUser(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const found = ROLES_CONFIG.find(
    (r) => r.username.toLowerCase() === cleanUser && r.password === cleanPass
  );
  return found ? attachCustomName(found) : null;
}

export function getSavedUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const found = ROLES_CONFIG.find((r) => r.id === parsed.id);
    return found ? attachCustomName(found) : null;
  } catch {
    return null;
  }
}

export function saveLoggedUser(roleObj) {
  try {
    if (!roleObj) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: roleObj.id }));
    }
  } catch {
    // ignore storage errors
  }
}
