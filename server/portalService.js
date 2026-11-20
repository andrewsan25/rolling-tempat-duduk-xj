import { getSupabaseClient } from './supabase.js';

const TABLE_NAME = 'seats';
const PORTAL_STATE_ID = 999;

export function getDefaultPortalData() {
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
      {
        id: 'ann-4',
        title: 'Ulangan Tengah Semester Bahasa Inggris',
        category: 'Ulangan',
        subject: 'Bahasa Inggris',
        date: `${year}-${month}-25`,
        notes: 'Materi Reading Comprehension & Passive Voice.',
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

export async function getPortalData() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', PORTAL_STATE_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const defaults = getDefaultPortalData();

  if (!data || !data.nama_siswa) {
    await savePortalData(defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(data.nama_siswa);
    return {
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : defaults.announcements,
      piket: Array.isArray(parsed.piket) ? parsed.piket : defaults.piket,
      finance: Array.isArray(parsed.finance) ? parsed.finance : defaults.finance,
    };
  } catch {
    return defaults;
  }
}

export async function savePortalData(portalPayload) {
  const defaults = getDefaultPortalData();
  const cleanPayload = {
    announcements: Array.isArray(portalPayload?.announcements)
      ? portalPayload.announcements
      : defaults.announcements,
    piket: Array.isArray(portalPayload?.piket)
      ? portalPayload.piket
      : defaults.piket,
    finance: Array.isArray(portalPayload?.finance)
      ? portalPayload.finance
      : defaults.finance,
  };

  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      id: PORTAL_STATE_ID,
      snake_index: PORTAL_STATE_ID,
      kode_kursi: '__PORTAL_STATE__',
      nama_siswa: JSON.stringify(cleanPayload),
      row_index: 99,
      col_index: 99,
      is_right_seat: false,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }

  return cleanPayload;
}
