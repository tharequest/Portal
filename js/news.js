/**
 * news.js
 * ─────────────────────────────────────────────
 * Berisi: buildNews(news) — render list berita
 *         ke dalam elemen #newsList di HTML
 * ─────────────────────────────────────────────
 * Kalau mau ubah tampilan item berita →
 *   edit template HTML di dalam fungsi buildNews
 * Kalau mau tambah fitur klik berita →
 *   tambahkan event listener di sini
 */

/**
 * Render daftar berita ke DOM
 * @param {Array} news - array item berita dari portal-data.json
 */
function buildNews(news) {
  const list = document.getElementById('newsList');
  if (!list) return;

  if (!news || news.length === 0) {
    list.innerHTML = `
      <li style="color:var(--text-muted);font-size:13px;padding:8px 0;">
        Belum ada berita.
      </li>`;
    return;
  }

  list.innerHTML = news.map(item => `
    <li>
      <div class="news-date">${item.date}</div>
      <div class="news-text">${item.text}</div>
    </li>
  `).join('');
}
