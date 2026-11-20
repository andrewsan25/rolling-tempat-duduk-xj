import { updateSingleSeat } from '../../server/seatsService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const updatedSeat = await updateSingleSeat(id, body?.nama_siswa);
    return res.status(200).json({
      message: 'Nama siswa berhasil diperbarui.',
      data: updatedSeat,
    });
  } catch (error) {
    console.error('PATCH /api/seats/[id] error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal memperbarui nama siswa di Supabase.',
    });
  }
}
