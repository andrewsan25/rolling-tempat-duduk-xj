import { getSupabaseClient } from './supabase.js';
import { buildDefaultSeatRows, mapDbRowToApi, SNAKE_LABELS } from './seatingSeed.js';

const TABLE_NAME = 'seats';

/**
 * Mengambil seluruh 40 kursi dari Supabase (diurutkan berdasarkan snake_index 0..39).
 * Jika tabel masih kosong, otomatis mengisi 40 kursi awal.
 */
export async function getAllSeats() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .gte('snake_index', 0)
    .lte('snake_index', 39)
    .order('snake_index', { ascending: true });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    const seedRows = buildDefaultSeatRows();
    const { data: inserted, error: seedError } = await supabase
      .from(TABLE_NAME)
      .upsert(seedRows, { onConflict: 'id' })
      .select('*')
      .order('snake_index', { ascending: true });

    if (seedError) {
      throw seedError;
    }

    return (inserted || []).map(mapDbRowToApi);
  }

  return data.map(mapDbRowToApi);
}

/**
 * Memperbarui satu nama siswa berdasarkan id kursi (1..40).
 */
export async function updateSingleSeat(id, namaSiswa) {
  const seatId = Number(id);
  if (!Number.isInteger(seatId) || seatId < 1 || seatId > 40) {
    const err = new Error('ID kursi tidak valid (harus angka 1 sampai 40).');
    err.statusCode = 400;
    throw err;
  }

  if (typeof namaSiswa !== 'string') {
    const err = new Error('Field nama_siswa wajib berupa teks.');
    err.statusCode = 400;
    throw err;
  }

  const supabase = getSupabaseClient();
  const cleanName = namaSiswa.trim();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ nama_siswa: cleanName })
    .eq('id', seatId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapDbRowToApi(data);
}

/**
 * Memperbarui seluruh 40 kursi secara massal (dipakai saat Rotasi Biasa, Rotasi 5 Hari, atau Reset).
 */
export async function batchUpdateSeats(seatsPayload) {
  if (!Array.isArray(seatsPayload) || seatsPayload.length !== 40) {
    const err = new Error('Payload seats harus berupa array berisi tepat 40 kursi.');
    err.statusCode = 400;
    throw err;
  }

  const defaults = buildDefaultSeatRows();

  const rowsToUpsert = defaults.map((defRow, idx) => {
    const incoming =
      seatsPayload.find(
        (item) =>
          item.snakeIndex === idx ||
          item.snake_index === idx ||
          item.id === idx + 1 ||
          item.kode_kursi === SNAKE_LABELS[idx]
      ) || seatsPayload[idx];

    return {
      ...defRow,
      nama_siswa:
        typeof incoming?.nama_siswa === 'string'
          ? incoming.nama_siswa.trim()
          : defRow.nama_siswa,
    };
  });

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(rowsToUpsert, { onConflict: 'id' })
    .select('*')
    .order('snake_index', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapDbRowToApi);
}
