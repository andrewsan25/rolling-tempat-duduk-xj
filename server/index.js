import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getAllSeats,
  updateSingleSeat,
  batchUpdateSeats,
} from './seatsService.js';
import { getPortalData, savePortalData } from './portalService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'supabase' });
});

// GET /api/seats — Ambil seluruh 40 kursi
app.get('/api/seats', async (_req, res) => {
  try {
    const seats = await getAllSeats();
    res.json(seats);
  } catch (error) {
    console.error('GET /api/seats error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal mengambil data kursi dari Supabase.',
    });
  }
});

// PUT /api/seats/batch — Update massal saat rotasi / reroll / reset
app.put('/api/seats/batch', async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : req.body?.seats;
    const updatedSeats = await batchUpdateSeats(payload);
    res.json({ message: 'Batch update berhasil disimpan.', data: updatedSeats });
  } catch (error) {
    console.error('PUT /api/seats/batch error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal menyimpan batch update ke Supabase.',
    });
  }
});

// PATCH /api/seats/:id — Update 1 nama siswa saat edit inline
app.patch('/api/seats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_siswa } = req.body || {};
    const updatedSeat = await updateSingleSeat(id, nama_siswa);
    res.json({ message: 'Nama siswa berhasil diperbarui.', data: updatedSeat });
  } catch (error) {
    console.error('PATCH /api/seats/:id error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal memperbarui nama siswa di Supabase.',
    });
  }
});

// GET /api/portal — Ambil data Papan Pengumuman, Kalender, Piket & Keuangan
app.get('/api/portal', async (_req, res) => {
  try {
    const data = await getPortalData();
    res.json(data);
  } catch (error) {
    console.error('GET /api/portal error:', error);
    res.status(500).json({
      error: error.message || 'Gagal mengambil data portal kelas dari Supabase.',
    });
  }
});

// PUT /api/portal — Simpan perubahan Papan Pengumuman, Piket & Keuangan
app.put('/api/portal', async (req, res) => {
  try {
    const saved = await savePortalData(req.body);
    res.json({ message: 'Data portal kelas berhasil disimpan.', data: saved });
  } catch (error) {
    console.error('PUT /api/portal error:', error);
    res.status(500).json({
      error: error.message || 'Gagal menyimpan data portal kelas ke Supabase.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Rolling Tempat Duduk aktif di http://localhost:${PORT}`);
});
