/**
 * /api/save-data.js — Vercel Serverless Function
 * GET  → baca data portal-data.json dari GitHub
 * POST → simpan data portal-data.json ke GitHub
 */

const DATA_PATH = 'data/portal-data.json';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH = 'main' } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'ENV belum lengkap di Vercel.' });
  }

  const apiUrl    = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // ── GET ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const ghRes = await fetch(apiUrl, { headers: ghHeaders });
      if (ghRes.status === 404) {
        return res.status(200).json({ slides: [], news: [], initialized: false });
      }
      if (!ghRes.ok) return res.status(500).json({ error: 'Gagal baca data dari GitHub' });

      const file    = await ghRes.json();
      const decoded = Buffer.from(file.content, 'base64').toString('utf-8');
      return res.status(200).json(JSON.parse(decoded));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST ─────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { slides, news } = req.body;
      if (!slides || !news) return res.status(400).json({ error: 'slides dan news wajib ada' });

      // Cek SHA file yang ada
      let sha;
      const checkRes = await fetch(apiUrl, { headers: ghHeaders });
      if (checkRes.ok) { sha = (await checkRes.json()).sha; }

      const data = { slides, news, updatedAt: new Date().toISOString() };
      const base64Content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

      const saveRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Update data: ${new Date().toLocaleString('id-ID')}`,
          content: base64Content,
          branch: GITHUB_BRANCH,
          ...(sha && { sha })
        })
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        return res.status(500).json({ error: 'Gagal simpan: ' + (err.message || JSON.stringify(err)) });
      }

      return res.status(200).json({ success: true, message: 'Data berhasil disimpan ke GitHub' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
