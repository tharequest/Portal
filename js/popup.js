/**
 * popup.js
 * ─────────────────────────────────────────────
 * Berisi: openPopup(slide) — buka popup
 *         closePopup()     — tutup popup
 *         Logika PDF: pakai Google Docs Viewer
 *           agar bisa tampil inline tanpa download
 *         Logika gambar: tampil langsung
 *         Fallback PDF mobile: tombol buka/download
 * ─────────────────────────────────────────────
 * Kenapa Google Docs Viewer?
 *   raw.githubusercontent.com mengirim header
 *   X-Frame-Options: deny → tidak bisa di-embed.
 *   Google Docs Viewer bertindak sebagai proxy.
 *
 * Kalau mau ganti ukuran popup → edit popup.css
 */

/**
 * Buka popup sesuai tipe slide (image/pdf)
 * @param {Object} slide - data slide dari portal-data.json
 */
function openPopup(slide) {
  const overlay = document.getElementById('popupOverlay');
  const inner   = document.getElementById('popupInner');
  const isMobile = window.innerWidth <= 768;

  if (slide.popupType === 'pdf' && slide.popupUrl) {

    if (slide.popupUrl.startsWith('data:')) {
      // PDF lama (base64) — tidak bisa di-embed, tampilkan tombol download
      inner.innerHTML = buildPdfFallback(slide, slide.popupUrl);

    } else {
      // PDF raw URL → tampilkan via Google Docs Viewer (bypass X-Frame-Options)
      const googleViewerUrl =
        `https://docs.google.com/viewer?url=${encodeURIComponent(slide.popupUrl)}&embedded=true`;

      const downloadBtn = `
        <a href="${slide.popupUrl}" target="_blank" rel="noopener"
          style="margin-left:auto;font-size:11px;color:rgba(255,255,255,.75);
          text-decoration:none;padding:3px 10px;
          background:rgba(255,255,255,.15);border-radius:6px;">
          ⬇️ Download
        </a>`;

      inner.innerHTML = `
        <div class="popup-pdf-wrap">
          <div class="popup-pdf-header">
            📄 ${slide.popupLabel || slide.title}
            ${downloadBtn}
          </div>
          <div class="popup-pdf-body">
            <iframe
              src="${googleViewerUrl}"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>`;
    }

  } else if (slide.popupType === 'pdf') {
    // PDF belum diupload
    inner.innerHTML = `
      <div style="width:min(380px,88vw);background:#fff;border-radius:16px;
                  padding:36px 28px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">📄</div>
        <div style="font-size:14px;font-weight:700;color:#1a4f8a;margin-bottom:8px;">
          ${slide.popupLabel || slide.title}
        </div>
        <div style="font-size:13px;color:#5a6e82;">
          File PDF belum diunggah.<br>
          Upload melalui <strong>Admin Panel</strong>.
        </div>
      </div>`;

  } else {
    // Popup gambar
    const src = slide.popupUrl || slide.imageUrl;
    inner.innerHTML = `
      <div class="popup-img">
        <img src="${src}" alt="${slide.title}" />
      </div>`;
  }

  overlay.classList.add('open');
}

/**
 * Fallback untuk PDF base64 atau mobile
 * Tampilkan tombol buka & download
 */
function buildPdfFallback(slide, url) {
  const isBase64 = url.startsWith('data:');
  return `
    <div style="width:min(360px,88vw);background:#fff;border-radius:16px;
                padding:28px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📄</div>
      <div style="font-size:15px;font-weight:700;color:#1a4f8a;margin-bottom:8px;">
        ${slide.popupLabel || slide.title}
      </div>
      <div style="font-size:13px;color:#5a6e82;margin-bottom:20px;line-height:1.6;">
        Klik tombol di bawah untuk membuka atau mendownload PDF.
      </div>
      <a href="${url}"
        ${isBase64 ? 'download="dokumen.pdf"' : 'target="_blank" rel="noopener"'}
        style="display:flex;align-items:center;justify-content:center;gap:8px;
               background:#1a4f8a;color:#fff;font-size:14px;font-weight:700;
               padding:12px 24px;border-radius:10px;text-decoration:none;width:100%;">
        📖 Buka / Download PDF
      </a>
    </div>`;
}

/**
 * Tutup popup dan bersihkan konten
 */
function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.remove('open');

  // Bersihkan setelah animasi tutup selesai (~250ms)
  // agar iframe PDF berhenti loading
  setTimeout(() => {
    const inner = document.getElementById('popupInner');
    if (inner) inner.innerHTML = '';
  }, 250);
}

// Event listeners popup
document.addEventListener('DOMContentLoaded', () => {
  // Tombol X
  document.getElementById('popupClose')?.addEventListener('click', closePopup);

  // Klik di luar popup (overlay)
  document.getElementById('popupOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'popupOverlay') closePopup();
  });

  // Tekan Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePopup();
  });
});
