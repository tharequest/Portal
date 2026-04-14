/**
 * Portal Informasi v3 – Data Store
 * Data diambil dari /api/save-data (GitHub) bukan localStorage.
 * localStorage hanya dipakai sebagai cache sementara.
 */

const CACHE_KEY = 'portal_v3_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

// ── Generate ID unik ─────────────────────────────────
function genId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Format ukuran file ────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── File ke Base64 ────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

// ── Ambil data dari API (dengan cache) ────────────────
async function fetchPortalData(forceRefresh = false) {
  // Cek cache dulu
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        }
      }
    } catch (_) {}
  }

  // Fetch dari API
  const res = await fetch('/api/save-data');
  if (!res.ok) throw new Error('Gagal mengambil data dari server');
  const data = await res.json();

  // Simpan ke cache
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (_) {}

  return data;
}

// ── Simpan data ke API ────────────────────────────────
async function savePortalData(slides, news) {
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slides, news })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menyimpan data');
  }

  // Hapus cache agar frontend refresh
  try { localStorage.removeItem(CACHE_KEY); } catch (_) {}

  return res.json();
}

// ── Upload gambar ke GitHub via API ──────────────────
async function uploadImage(file) {
  const base64 = await fileToBase64(file);
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content: base64 })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal upload gambar');
  }

  return res.json(); // { success, path, url }
}

// ── Upload PDF ke GitHub via API ──────────────────────
async function uploadPdf(file) {
  const base64 = await fileToBase64(file);
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

  const res = await fetch('/api/upload-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content: base64 })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal upload PDF');
  }

  return res.json(); // { success, path, url }
}
