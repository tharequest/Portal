/**
 * kontak.js
 * ─────────────────────────────────────────────
 * Berisi: Data kontak 5 orang dengan link WhatsApp
 *         openKontakPopup() — buka popup
 *         closeKontakPopup() — tutup popup
 *         Render kartu kontak dengan avatar inisial
 * ─────────────────────────────────────────────
 * Cara pakai:
 *   1. Tambahkan <link rel="stylesheet" href="kontak.css"> di <head>
 *   2. Tambahkan <script src="kontak.js"> sebelum </body>
 *   3. Tambahkan HTML popup (lihat bagian TEMPLATE HTML di bawah)
 *   4. Tambahkan menu di nav: <a onclick="openKontakPopup()">Kontak</a>
 *
 * TEMPLATE HTML (tempel sebelum </body>):
 * ─────────────────────────────────────────────
 * <div id="kontak-overlay" class="kontak-overlay">
 *   <div class="kontak-modal">
 *     <button class="kontak-close" id="kontak-close-btn">&#x2715;</button>
 *     <div class="kontak-header">
 *       <div class="kontak-header-icon">📞</div>
 *       <div class="kontak-header-text">
 *         <div class="kontak-title">Hubungi Kami</div>
 *         <div class="kontak-subtitle">Klik nama untuk chat WhatsApp</div>
 *       </div>
 *     </div>
 *     <div class="kontak-list" id="kontak-list"></div>
 *     <div class="kontak-footer">Aktif pada jam kerja · Senin – Jumat</div>
 *   </div>
 * </div>
 */

/* ── Data kontak ── */
const KONTAK_DATA = [
  {
    name:  "Bu Ana",
    phone: "+6285822020466",
    initials: "BA"
  },
  {
    name:  "Bu Primanita",
    phone: "+6285750325925",
    initials: "BP"
  },
  {
    name:  "Onny",
    phone: "+6289651758517",
    initials: "ON"
  },
  {
    name:  "Agung",
    phone: "+6285882959315",
    initials: "AG"
  },
  {
    name:  "Thareq",
    phone: "+6285787908406",
    initials: "TH"
  }
];

/* Warna avatar — berulang sesuai jumlah item */
const AVATAR_COLORS = [
  { bg: "rgba(99,179,237,0.35)",  border: "rgba(99,179,237,0.55)"  },
  { bg: "rgba(154,215,160,0.35)", border: "rgba(154,215,160,0.55)" },
  { bg: "rgba(246,173,85,0.35)",  border: "rgba(246,173,85,0.55)"  },
  { bg: "rgba(229,122,122,0.35)", border: "rgba(229,122,122,0.55)" },
  { bg: "rgba(183,148,246,0.35)", border: "rgba(183,148,246,0.55)" }
];

/* ── Format nomor WA agar tampil rapi ── */
function formatPhone(phone) {
  /* Ubah +62 → 0 untuk tampilan */
  return phone.replace(/^\+62/, "0");
}

/* ── Buat link WhatsApp ── */
function buildWaUrl(phone) {
  /* Hapus tanda + dan spasi, lalu buat link WA */
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}`;
}

/* ── Icon WhatsApp SVG ── */
const WA_SVG = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2.9C8.8 2.9 3 8.7 3 15.9c0 2.3.6 4.5 1.8 6.5L3 29.1l6.9-1.8c1.9 1 4 1.6 6.1 1.6 7.2 0 13-5.8 13-13S23.2 2.9 16 2.9zm6.4 18.1c-.3.8-1.5 1.5-2.1 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.8 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.1.2-.3.4-.4.5-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.8.9 2.1 1 .3.2.5.3.6.4.1.3.1 1-.2 1.7z"/>
</svg>`;

/* ── Render daftar kontak ── */
function renderKontakList() {
  const container = document.getElementById("kontak-list");
  if (!container) return;

  container.innerHTML = KONTAK_DATA.map((person, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const waUrl = buildWaUrl(person.phone);
    const displayPhone = formatPhone(person.phone);

    return `
      <a class="kontak-item"
         href="${waUrl}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Chat WhatsApp dengan ${person.name}">
        <div class="kontak-avatar"
             style="background:${color.bg};border-color:${color.border}">
          ${person.initials}
        </div>
        <div class="kontak-info">
          <div class="kontak-name">${person.name}</div>
          <div class="kontak-phone">${displayPhone}</div>
        </div>
        <div class="kontak-wa-icon">${WA_SVG}</div>
      </a>`;
  }).join("");
}

/* ── Buka popup ── */
function openKontakPopup() {
  renderKontakList();
  document.getElementById("kontak-overlay")?.classList.add("open");
}

/* ── Tutup popup ── */
function closeKontakPopup() {
  document.getElementById("kontak-overlay")?.classList.remove("open");
}

/* ── Event listeners ── */
document.addEventListener("DOMContentLoaded", () => {
  /* Tombol X */
  document.getElementById("kontak-close-btn")
    ?.addEventListener("click", closeKontakPopup);

  /* Klik overlay (luar modal) → tutup */
  document.getElementById("kontak-overlay")
    ?.addEventListener("click", e => {
      if (e.target.id === "kontak-overlay") closeKontakPopup();
    });

  /* Escape → tutup */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeKontakPopup();
  });
});
