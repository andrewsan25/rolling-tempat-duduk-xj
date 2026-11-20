export const ROLES_CONFIG = [
  {
    id: 'ketua',
    roleName: 'Ketua Kelas',
    username: 'ketua',
    password: 'ketuaXJ2026',
    badgeColor: 'bg-[#8C6239] text-[#FFFDF9]',
    shortDesc: 'Mengatur denah kursi (geser & reroll), jadwal piket, memantau pengumuman, kas, serta catatan pribadi.',
    capabilities: [
      'Mengatur & mengedit aturan tempat duduk (Rotasi Biasa, Rotasi 5 Hari, Reroll/Acak Kursi, Edit Nama)',
      'Melihat Laporan Keuangan & saldo kas kelas (Read-Only)',
      'Melihat Papan Pengumuman, Tugas, Jadwal Ulangan & Kalender Kelas yang ter-sync (Read-Only)',
      'Melihat & mengatur Jadwal Piket harian serta mengakses Catatan & Kalender Pribadi',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance', 'personal'],
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
    shortDesc: 'Mendampingi Ketua Kelas mengatur denah kursi (geser & reroll), jadwal piket, memantau kas, serta catatan pribadi.',
    capabilities: [
      'Mengatur & mengedit aturan tempat duduk (Rotasi Biasa, Rotasi 5 Hari, Reroll/Acak Kursi, Edit Nama)',
      'Melihat Laporan Keuangan & saldo kas kelas (Read-Only)',
      'Melihat Papan Pengumuman, Tugas, Jadwal Ulangan & Kalender Kelas yang ter-sync (Read-Only)',
      'Melihat & mengatur Jadwal Piket harian serta mengakses Catatan & Kalender Pribadi',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance', 'personal'],
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
    shortDesc: 'Mengelola pemasukan, pengeluaran, dan laporan keuangan kas kelas, melihat denah kelas, serta catatan pribadi.',
    capabilities: [
      'Mengelola & mengedit penuh Laporan Keuangan (Tambah Pemasukan/Pengeluaran & Hapus Transaksi)',
      'Melihat Denah Tempat Duduk Kelas, Papan Pengumuman, & Jadwal Piket (Read-Only)',
      'Mengakses & menulis Catatan Pribadi (Notes) beserta Kalender Pribadi',
    ],
    allowedTabs: ['finance', 'seats', 'announcements', 'piket', 'personal'],
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
    shortDesc: 'Mengelola papan pengumuman, catatan tugas, jadwal ulangan (sync kalender), jadwal piket, serta catatan pribadi.',
    capabilities: [
      'Menulis, mengedit, dan menghapus Catatan Kelas, Tugas, & Jadwal Ulangan (Auto-Sync Kalender Kelas)',
      'Mengelola daftar Jadwal Piket harian',
      'Melihat Denah Tempat Duduk Kelas (Read-Only)',
      'Mengakses & menulis Catatan Pribadi (Notes) beserta Kalender Pribadi',
    ],
    allowedTabs: ['announcements', 'piket', 'seats', 'personal'],
    permissions: {
      canEditSeats: false,
      canEditAnnouncements: true,
      canEditPiket: true,
      canEditFinance: false,
    },
  },
  {
    id: 'murid',
    roleName: 'Murid',
    username: 'murid',
    password: 'muridXJ2026',
    badgeColor: 'bg-[#C4A484] text-[#2C1E14]',
    shortDesc: 'Cukup register dengan Nama untuk melihat denah kursi, pengumuman kelas, serta mengelola Notes & Kalender Pribadi.',
    capabilities: [
      'Register instan hanya dengan Nama Siswa',
      'Memiliki ruang Catatan Pribadi (Notes) & Kalender Pribadi yang tersimpan sesuai nama masing-masing',
      'Melihat urutan & posisi Denah Tempat Duduk terbaru (Read-Only)',
      'Melihat Papan Pengumuman Tugas/Ulangan, Kalender Kelas, & Jadwal Piket (Read-Only)',
    ],
    allowedTabs: ['seats', 'personal', 'announcements', 'piket'],
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
    shortDesc: 'Akses penuh (Full Control) ke seluruh fitur denah tempat duduk, pengumuman, kalender, piket, keuangan, dan catatan pribadi.',
    capabilities: [
      'Akses penuh melihat & mengedit Denah Tempat Duduk (Rotasi, Reroll, Edit Nama, Reset)',
      'Akses penuh menambah & mengubah Papan Pengumuman, Tugas, Ulangan & Kalender Kelas',
      'Akses penuh mengubah Jadwal Piket kelas & Laporan Keuangan kas kelas',
      'Mengakses Catatan Pribadi (Notes) & Kalender Pribadi',
    ],
    allowedTabs: ['seats', 'announcements', 'piket', 'finance', 'personal'],
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

export function getUserStorageKey(userObj) {
  if (!userObj) return 'guest';
  const namePart = (userObj.customName || userObj.roleName || userObj.id || 'user')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return `${userObj.id}_${namePart}`;
}

export function attachCustomName(roleObj, explicitName) {
  if (!roleObj) return null;
  const namesMap = getSavedCustomNames();
  const resolvedName =
    typeof explicitName === 'string' && explicitName.trim()
      ? explicitName.trim()
      : roleObj.customName || namesMap[roleObj.id] || '';
  const merged = {
    ...roleObj,
    customName: resolvedName,
  };
  merged.userKey = getUserStorageKey(merged);
  return merged;
}

/**
 * Register / Masuk Murid hanya dengan menulis Nama saja
 */
export function registerStudentByName(studentName) {
  const cleanName = (studentName || '').trim();
  if (!cleanName) return null;

  const muridBase = ROLES_CONFIG.find((r) => r.id === 'murid');
  const studentSession = {
    ...muridBase,
    customName: cleanName,
    isStudentRegistered: true,
  };
  studentSession.userKey = `murid_${cleanName.toLowerCase().replace(/\s+/g, '_')}`;
  saveCustomNameForRole('murid', cleanName);
  saveLoggedUser(studentSession);
  return studentSession;
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
    if (!found) return null;
    return attachCustomName(found, parsed.customName);
  } catch {
    return null;
  }
}

export function saveLoggedUser(roleObj) {
  try {
    if (!roleObj) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          id: roleObj.id,
          customName: roleObj.customName || '',
        })
      );
    }
  } catch {
    // ignore storage errors
  }
}
