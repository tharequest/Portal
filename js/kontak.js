/**
 * kontak.js
 * ─────────────────────────────────────────────
 * Popup daftar kontak WhatsApp
 * Gaya seragam dengan layanan-popup.js
 * ─────────────────────────────────────────────
 * Cara pakai:
 *   1. <link rel="stylesheet" href="kontak.css"> di <head>
 *   2. <script src="kontak.js"> sebelum </body>
 *   3. Tempel HTML popup di bawah sebelum </body>
 *   4. Nav header: <a onclick="openKontakPopup()">Kontak</a>
 *
 * TEMPLATE HTML (tempel sebelum </body>):
 * ─────────────────────────────────────────────
 * <div id="kt-overlay" class="kt-overlay">
 *   <div class="kt-modal">
 *     <div class="kt-header">
 *       <div class="kt-header-icon">
 *         <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.4A16 16 0 0 0 14.6 16.09l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
 *       </div>
 *       <div>
 *         <div class="kt-header-title">Hubungi Kami</div>
 *         <div class="kt-header-sub">Klik nama untuk chat WhatsApp</div>
 *       </div>
 *       <button class="kt-close" id="kt-close-btn">&#x2715;</button>
 *     </div>
 *     <div class="kt-list" id="kt-list"></div>
 *     <div class="kt-footer">
 *       <span class="kt-footer-note">Aktif pada jam kerja · Senin – Jumat</span>
 *       <span class="kt-badge">
 *         <svg width="10" height="10" viewBox="0 0 32 32" fill="#0f6e56"><path d="M16 2.9C8.8 2.9 3 8.7 3 15.9c0 2.3.6 4.5 1.8 6.5L3 29.1l6.9-1.8c1.9 1 4 1.6 6.1 1.6 7.2 0 13-5.8 13-13S23.2 2.9 16 2.9z"/></svg>
 *         WhatsApp
 *       </span>
 *     </div>
 *   </div>
 * </div>
 */

/* ── Data kontak ── */
const KONTAK_DATA = [
  {
    name:     "Bu Ana",
    phone:    "+6285822020466",
    initials: "BA"
  },
  {
    name:     "Bu Primanita",
    phone:    "+6285750325925",
    initials: "BP"
  },
  {
    name:     "Onny",
    phone:    "+6289651758517",
    initials: "ON"
  },
  {
    name:     "Agung",
    phone:    "+6285882959315",
    initials: "AG"
  },
  {
    name:     "Thareq",
    phone:    "+6285787908406",
    initials: "TH"
  }
];

/* Warna avatar — seragam dengan BADGE_COLORS layanan-popup.js */
const KONTAK_AVATAR_COLORS = [
  { bg: "#e8f0fd", text: "#1a4f8a" },
  { bg: "#e6f7f0", text: "#0f6e56" },
  { bg: "#fef3e2", text: "#854f0b" },
  { bg: "#fce8f3", text: "#993556" },
  { bg: "#eeedfe", text: "#3c3489" }
];

/* ── Format nomor untuk tampilan (0858...) ── */
function ktFormatPhone(phone) {
  return phone.replace(/^\+62/, "0");
}

/* ── Buat URL WhatsApp ── */
function ktBuildWaUrl(phone) {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}`;
}

/* ── SVG WhatsApp ── */
const KT_WA_SVG = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#fff">
  <path d="M16 2.9C8.8 2.9 3 8.7 3 15.9c0 2.3.6 4.5 1.8 6.5L3 29.1l6.9-1.8
           c1.9 1 4 1.6 6.1 1.6 7.2 0 13-5.8 13-13S23.2 2.9 16 2.9zm6.4 18.1
           c-.3.8-1.5 1.5-2.1 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6
           -3-1.3-4.9-4.3-5.1-4.5-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6
           c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.8 2 .9 2.1.1.2.1.4 0 .6
           -.1.2-.2.3-.3.5-.1.2-.3.4-.4.5-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1
           c1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1
           .3.1 1.8.9 2.1 1 .3.2.5.3.6.4.1.3.1 1-.2 1.7z"/>
</svg>`;

/* ── Render daftar kontak ── */
function renderKontakList() {
  const container = document.getElementById("kt-list");
  if (!container) return;

  container.innerHTML = KONTAK_DATA.map((person, i) => {
    const color = KONTAK_AVATAR_COLORS[i % KONTAK_AVATAR_COLORS.length];
    const waUrl = ktBuildWaUrl(person.phone);

    return `
      <a class="kt-item"
         href="${waUrl}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Chat WhatsApp dengan ${person.name}">
        <div class="kt-avatar"
             style="background:${color.bg};color:${color.text}">
          ${person.initials}
        </div>
        <div class="kt-info">
          <div class="kt-name">${person.name}</div>
        </div>
        <div class="kt-wa-icon">${KT_WA_SVG}</div>
      </a>`;
  }).join("");
}

/* ── Buka popup ── */
function openKontakPopup() {
  renderKontakList();
  document.getElementById("kt-overlay")?.classList.add("kt-open");
}

/* ── Tutup popup ── */
function closeKontakPopup() {
  document.getElementById("kt-overlay")?.classList.remove("kt-open");
}

/* ── Event listeners ── */
document.addEventListener("DOMContentLoaded", () => {
  /* Tombol X */
  document.getElementById("kt-close-btn")
    ?.addEventListener("click", closeKontakPopup);

  /* Klik overlay (luar modal) → tutup */
  document.getElementById("kt-overlay")
    ?.addEventListener("click", e => {
      if (e.target.id === "kt-overlay") closeKontakPopup();
    });

  /* Escape → tutup */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeKontakPopup();
  });
});
