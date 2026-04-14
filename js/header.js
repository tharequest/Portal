/**
 * header.js
 * ─────────────────────────────────────────────
 * Berisi: Logika hamburger menu (mobile)
 *         Toggle buka/tutup mobile nav
 *         Auto tutup saat klik link
 * ─────────────────────────────────────────────
 * Kalau mau tambah logika header → edit di sini
 */

function initHamburger() {
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!ham || !nav) return;

  // Toggle menu saat tombol hamburger diklik
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });

  // Auto tutup menu saat salah satu link diklik
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      ham.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', initHamburger);
