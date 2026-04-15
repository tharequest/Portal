/**
 * ceksurat.js
 * ─────────────────────────────────────────────
 * Gabungan dari tableapi.js + decodstatsurat.js
 * Disesuaikan dengan class "cs-" portal
 * ─────────────────────────────────────────────
 *
 * BAGIAN 1 — SCRAMBLE EFFECT (dari decodstatsurat.js)
 * BAGIAN 2 — CARD 3D TILT
 * BAGIAN 3 — FETCH API GOOGLE SHEET
 * BAGIAN 4 — RENDER TABEL HASIL
 * BAGIAN 5 — QR CODE MODAL
 *
 * Kalau mau ganti API → ubah API_URL di bawah
 */

/* ══════════════════════════════════════════════
   BAGIAN 1 — SCRAMBLE EFFECT
   ══════════════════════════════════════════════ */

const SCRAMBLE_CHARS = "█▓▒░#@$%&*+=?ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SCRAMBLE_DELAY = 2000; // jeda antar siklus (ms)

/**
 * Efek teks scramble / decode pada elemen
 * @param {HTMLElement} element  - elemen target
 * @param {string}      finalText - teks akhir yang dituju
 * @param {string}      colorFinal    - warna saat sudah terdecode
 * @param {string}      colorScramble - warna saat masih scramble
 */
function createScramble(element, finalText, colorFinal = "#1a4f8a", colorScramble = "#c5c7cc") {
  let iteration  = 0;
  let frameId;
  let isDecoding = false;

  function tick() {
    element.textContent = finalText.split("").map((char, i) => {
      if (char === " ") return " ";
      if (i < iteration) return finalText[i];
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }).join("");

    element.style.color = isDecoding ? colorFinal : colorScramble;

    if (iteration <= finalText.length) {
      iteration += 0.5;
      frameId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameId);
      isDecoding = !isDecoding;
      setTimeout(() => {
        iteration = 0;
        frameId = requestAnimationFrame(tick);
      }, SCRAMBLE_DELAY);
    }
  }

  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════
   BAGIAN 2 — CARD 3D TILT
   ══════════════════════════════════════════════ */

function initCardTilt() {
  const card      = document.getElementById("tilt-card");
  const container = document.querySelector(".cs-card-container");
  if (!card || !container) return;

  container.addEventListener("mousemove", (e) => {
    const rect  = card.getBoundingClientRect();
    const xNorm = ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
    const yNorm = ((e.clientY - rect.top)   / rect.height) * 2 - 1;
    const MAX   = 6;
    card.style.transform = `rotateX(${-yNorm*MAX}deg) rotateY(${xNorm*MAX}deg) translateZ(12px)`;
  });

  container.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
  });
}

/* ══════════════════════════════════════════════
   BAGIAN 3 — FETCH API GOOGLE SHEET
   Ganti API_URL dengan endpoint Apps Script kamu
   ══════════════════════════════════════════════ */

const API_URL = "https://script.google.com/macros/s/AKfycbx_fgFroV_E7VtVpkgm1HjSAmy9pPc-HxNia8TGev9-mVLjVjOo8pzh8YX0lmu7LRRU5Q/exec";

async function cariSurat() {
  const inputEl  = document.getElementById("searchInput");
  const selectEl = document.getElementById("jenisSurat");
  const hasilEl  = document.getElementById("hasil");

  const keyword    = inputEl.value.trim();
  const jenisSurat = selectEl.value.trim();

  // Reset error class
  inputEl.classList.remove("error");

  // Validasi input kosong
  if (!keyword) {
    inputEl.classList.add("error");
    hasilEl.innerHTML = `<div class="cs-error-msg">⚠️ Masukkan Nama atau NIM terlebih dahulu.</div>`;
    inputEl.focus();
    return;
  }

  if (!jenisSurat) {
    hasilEl.innerHTML = `<div class="cs-error-msg">⚠️ Pilih jenis surat terlebih dahulu.</div>`;
    return;
  }

  // Tampilkan loading
  hasilEl.innerHTML = `<div class="cs-loading">Memuat data...</div>`;

  try {
    const url = `${API_URL}?nama=${encodeURIComponent(keyword)}&jenis=${encodeURIComponent(jenisSurat)}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (!data || data.length === 0) {
      hasilEl.innerHTML = `<div class="cs-no-result">❌ Data tidak ditemukan untuk "<strong>${keyword}</strong>".</div>`;
      return;
    }

    renderHasil(data);

  } catch (err) {
    console.error("Fetch error:", err);
    hasilEl.innerHTML = `<div class="cs-error-msg">⚠️ Server tidak merespons. Coba beberapa saat lagi.</div>`;
  }
}

// Enter key juga bisa cari
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter") cariSurat();
  });
});

/* ══════════════════════════════════════════════
   BAGIAN 4 — RENDER TABEL HASIL
   ══════════════════════════════════════════════ */

function renderHasil(data) {
  const hasilEl = document.getElementById("hasil");

  let rows = data.map(row => `
    <tr>
      <td>${row.nama  || "–"}</td>
      <td>${row.nim   || "–"}</td>
      <td>${row.surat || "–"}</td>
      <td>
        <button class="cs-file-btn" onclick="openQR('${row.file || ""}')">
          📄 Lihat File
        </button>
      </td>
    </tr>`).join("");

  hasilEl.innerHTML = `
    <table class="cs-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>NIM</th>
          <th>Jenis Surat</th>
          <th>File</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ══════════════════════════════════════════════
   BAGIAN 5 — QR CODE MODAL
   ══════════════════════════════════════════════ */

/**
 * Ekstrak Google Drive File ID dari berbagai format URL
 */
function extractFileId(url) {
  if (!url) return null;
  let m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  m = url.match(/id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return null;
}

/**
 * Buka modal QR code untuk file Google Drive
 * @param {string} fileUrl - URL Google Drive
 */
function openQR(fileUrl) {
  if (!fileUrl) {
    alert("File belum tersedia.");
    return;
  }

  const fileId = extractFileId(fileUrl);
  if (!fileId) {
    alert("Format URL file tidak valid.");
    return;
  }

  const previewURL = `https://drive.google.com/uc?id=${fileId}&export=view`;

  // Coba Google Charts QR, fallback ke qrserver
  const qrImg = document.getElementById("qrImage");
  qrImg.src   = `https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=${encodeURIComponent(previewURL)}`;
  qrImg.onerror = () => {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(previewURL)}`;
    qrImg.onerror = null;
  };

  // Tampilkan modal
  const modal = document.getElementById("qrModal");
  modal.style.display = "flex";
  modal.classList.add("open");
}

/**
 * Tutup modal QR
 */
function closeQR() {
  const modal = document.getElementById("qrModal");
  modal.style.display = "none";
  modal.classList.remove("open");
  document.getElementById("qrImage").src = "";
}

// Klik overlay tutup modal
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("qrModal")?.addEventListener("click", e => {
    if (e.target.id === "qrModal") closeQR();
  });

  // Hilangkan placeholder dropdown setelah dipilih
  const select = document.getElementById("jenisSurat");
  select?.addEventListener("change", () => {
    const placeholder = select.querySelector('option[value=""]');
    if (placeholder) placeholder.remove();
  });
});

/* ══════════════════════════════════════════════
   INIT — jalankan semua saat DOM siap
   ══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // Scramble effect pada 2 baris judul
  const el1 = document.getElementById("linesurat");
  const el2 = document.getElementById("linesurat2");
  if (el1) createScramble(el1, "Cek Status",       "#1a4f8a", "#c5c7cc");
  if (el2) createScramble(el2, "Surat Mahasiswa",   "#e8a020", "#c5c7cc");

  // 3D tilt card
  initCardTilt();
});
