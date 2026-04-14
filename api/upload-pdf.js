/**
 * /api/upload-pdf.js — Vercel Serverless Function
 * Upload PDF ke GitHub, kembalikan raw URL (bukan base64)
 * Repo harus PUBLIC agar URL bisa diakses browser
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH = 'main' } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'ENV belum lengkap di Vercel.' });
  }

  try {
    const { filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: 'filename dan content wajib' });

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `assets/pdf/${safeFilename}`;
    const apiUrl   = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const base64Content = content.includes(',') ? content.split(',')[1] : content;

    // Cek SHA jika file sudah ada
    let sha;
    const checkRes = await fetch(apiUrl, { headers: ghHeaders });
    if (checkRes.ok) { sha = (await checkRes.json()).sha; }

    const uploadRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Upload PDF: ${safeFilename}`,
        content: base64Content,
        branch: GITHUB_BRANCH,
        ...(sha && { sha })
      })
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return res.status(500).json({ error: 'Gagal upload PDF: ' + (err.message || JSON.stringify(err)) });
    }

    // Kembalikan raw URL — bisa langsung dirender browser karena repo public
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

    return res.status(200).json({
      success: true,
      path: filePath,
      url: rawUrl,
      message: 'PDF berhasil diupload ke GitHub'
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
