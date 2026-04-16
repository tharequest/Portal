/**
 * layanan-popup.js
 * ─────────────────────────────────────────────
 * Popup daftar Google Form untuk kartu
 * "Jenis Layanan" di halaman utama
 *
 * CARA GANTI LINK GOOGLE FORM:
 *   Edit bagian LAYANAN_DATA di bawah
 *   Ganti url: "https://forms.gle/..." dengan link asli
 * ─────────────────────────────────────────────
 */

const LAYANAN_DATA = [
  {
    name: "Surat Aktif Kuliah",
    desc: "Permohonan surat keterangan aktif kuliah",
    url:  "https://forms.gle/GANTI_LINK_1"
  },
  {
    name: "Surat Keterangan Lulus",
    desc: "Permohonan SKL sebelum ijazah terbit",
    url:  "https://forms.gle/GANTI_LINK_2"
  },
  {
    name: "Surat Cuti Kuliah",
    desc: "Pengajuan cuti semester aktif",
    url:  "https://forms.gle/GANTI_LINK_3"
  },
  {
    name: "Surat Pengunduran Diri",
    desc: "Permohonan pengunduran diri mahasiswa",
    url:  "https://forms.gle/GANTI_LINK_4"
  },
  {
    name: "Surat Pindah Kuliah",
    desc: "Pengajuan pindah ke perguruan tinggi lain",
    url:  "https://forms.gle/GANTI_LINK_5"
  },
  {
    name: "Surat Rekomendasi",
    desc: "Permohonan surat rekomendasi dosen/dekan",
    url:  "https://forms.gle/GANTI_LINK_6"
  },
  {
    name: "Bebas Laboratorium",
    desc: "Permohonan surat bebas lab untuk yudisium",
    url:  "https://forms.gle/GANTI_LINK_7"
  },
  {
    name: "Verifikasi Ijazah",
    desc: "Permintaan legalisasi dan verifikasi ijazah",
    url:  "https://forms.gle/GANTI_LINK_8"
  }
];

/* Warna badge nomor — berulang sesuai jumlah item */
const BADGE_COLORS = [
  { bg: "#e8f0fd", text: "#1a4f8a" },
  { bg: "#e6f7f0", text: "#0f6e56" },
  { bg: "#fef3e2", text: "#854f0b" },
  { bg: "#fce8f3", text: "#993556" },
  { bg: "#eeedfe", text: "#3c3489" },
  { bg: "#fcebeb", text: "#791f1f" },
  { bg: "#eaf3de", text: "#27500a" },
  { bg: "#f1efe8", text: "#444441" }
];

/* ── Render list item ── */
function renderLayananList(list) {
  const container = document.getElementById("lp-list");
  if (!list.length) {
    container.innerHTML = `<div class="lp-empty">Layanan tidak ditemukan</div>`;
    document.getElementById("lp-count").textContent = "0 layanan";
    return;
  }
  document.getElementById("lp-count").textContent = list.length + " layanan tersedia";
  container.innerHTML = list.map((item, i) => {
    const color = BADGE_COLORS[i % BADGE_COLORS.length];
    return `
      <a class="lp-item" href="${item.url}" target="_blank" rel="noopener">
        <div class="lp-num" style="background:${color.bg};color:${color.text}">
          ${String(i + 1).padStart(2, "0")}
        </div>
        <div class="lp-info">
          <div class="lp-name">${item.name}</div>
          <div class="lp-desc">${item.desc}</div>
        </div>
        <svg class="lp-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>`;
  }).join("");
}

/* ── Filter pencarian ── */
function lpFilter(q) {
  const result = LAYANAN_DATA.filter(item =>
    item.name.toLowerCase().includes(q.toLowerCase()) ||
    item.desc.toLowerCase().includes(q.toLowerCase())
  );
  renderLayananList(result);
}

/* ── Buka modal ── */
function openLayananPopup() {
  renderLayananList(LAYANAN_DATA);
  document.getElementById("lp-search").value = "";
  document.getElementById("lp-overlay").classList.add("lp-open");
  setTimeout(() => document.getElementById("lp-search").focus(), 200);
}

/* ── Tutup modal ── */
function closeLayananPopup() {
  document.getElementById("lp-overlay").classList.remove("lp-open");
}

/* ── Event listeners ── */
document.addEventListener("DOMContentLoaded", () => {
  /* Klik kartu "Jenis Layanan" → buka popup */
  document.getElementById("btn-jenis-layanan")?.addEventListener("click", openLayananPopup);

  /* Klik overlay (luar modal) → tutup */
  document.getElementById("lp-overlay")?.addEventListener("click", e => {
    if (e.target.id === "lp-overlay") closeLayananPopup();
  });

  /* Escape → tutup */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLayananPopup();
  });
});
