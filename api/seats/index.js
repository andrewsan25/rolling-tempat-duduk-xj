import { getAllSeats } from '../../server/seatsService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const seats = await getAllSeats();
    return res.status(200).json(seats);
  } catch (error) {
    console.error('GET /api/seats error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Gagal mengambil data kursi dari Supabase.',
    });
  }
}
