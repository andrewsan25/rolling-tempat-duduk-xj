import { getPortalData, savePortalData } from '../server/portalService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const data = await getPortalData();
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const saved = await savePortalData(body);
      return res.status(200).json({
        message: 'Data portal kelas berhasil disimpan ke Supabase.',
        data: saved,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('/api/portal error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal memproses data portal kelas di Supabase.',
    });
  }
}
