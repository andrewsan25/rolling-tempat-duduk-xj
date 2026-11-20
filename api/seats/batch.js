import { batchUpdateSeats } from '../../server/seatsService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const payload = Array.isArray(body) ? body : body?.seats;
    const updatedSeats = await batchUpdateSeats(payload);
    return res.status(200).json({
      message: 'Batch update berhasil disimpan.',
      data: updatedSeats,
    });
  } catch (error) {
    console.error('PUT /api/seats/batch error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal menyimpan batch update ke Supabase.',
    });
  }
}
