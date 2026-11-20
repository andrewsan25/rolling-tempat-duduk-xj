import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getAllSeats,
  updateSingleSeat,
  batchUpdateSeats,
} from './seatsService.js';

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

// PUT /api/seats/batch — Update massal saat rotasi / reset
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

app.listen(PORT, () => {
  console.log(`Backend Rolling Tempat Duduk aktif di http://localhost:${PORT}`);
});
