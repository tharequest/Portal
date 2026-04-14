/**
 * slider.js
 * ─────────────────────────────────────────────
 * Berisi: Build slider dari data (slides array)
 *         Fungsi goTo(num, idx) — pindah slide
 *         Fungsi startAuto()   — auto play
 *         Event handler tombol prev/next
 *         Event handler dot navigasi
 * ─────────────────────────────────────────────
 * Kalau mau ubah kecepatan auto play →
 *   ubah angka 5500 dan 7000 di startAuto()
 * Kalau mau ubah durasi transisi slide →
 *   ubah di slider.css → .slider-track transition
 */

// State internal slider (current index dan total slide)
const sliderState = {
  1: { current: 0, total: 0 },
  2: { current: 0, total: 0 }
};

let autoTimers = [];

/**
 * Bangun DOM slider dari array data slides
 * @param {Array} slides - data dari portal-data.json
 */
function buildSliders(slides) {
  [1, 2].forEach(num => {
    const group = slides.filter(s => s.slider === num);
    sliderState[num].total = group.length;

    const track = document.getElementById('track' + num);
    const dots  = document.getElementById('dots' + num);
    if (!track || !dots) return;

    track.innerHTML = '';
    dots.innerHTML  = '';

    // Tampilkan placeholder jika belum ada slide
    if (!group.length) {
      track.innerHTML = `
        <div class="slide">
          <div class="slide-bg" style="background:#e8f0fd"></div>
          <div class="slide-overlay"></div>
          <div class="slide-content" style="text-align:center;width:100%;">
            <p style="color:rgba(255,255,255,.7);font-size:13px;">
              Belum ada slide. Tambahkan via Admin Panel.
            </p>
          </div>
        </div>`;
      return;
    }

    // Buat elemen slide + dot untuk setiap data
    group.forEach((slide, i) => {
      const hintText = slide.popupType === 'pdf' ? '📄 Lihat PDF' : '🔍 Lihat Gambar';

      // Buat elemen .slide
      const el = document.createElement('div');
      el.className = 'slide';
      el.innerHTML = `
        <div class="slide-bg" style="background-image:url('${slide.imageUrl}')"></div>
        <div class="slide-overlay"></div>
        <div class="slide-hint">${hintText}</div>
        <div class="slide-content">
          <span class="slide-tag">${slide.tag}</span>
          <h2>${slide.title}</h2>
          <p>${slide.desc}</p>
        </div>`;

      // Klik slide → buka popup (fungsi dari popup.js)
      el.addEventListener('click', () => openPopup(slide));
      track.appendChild(el);

      // Buat dot navigasi
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', e => {
        e.stopPropagation();
        goTo(num, i);
      });
      dots.appendChild(dot);
    });

    goTo(num, 0);
  });
}

/**
 * Pindah ke slide tertentu
 * @param {number} num - nomor slider (1 atau 2)
 * @param {number} idx - index slide tujuan
 */
function goTo(num, idx) {
  const s = sliderState[num];
  if (!s.total) return;

  // Wrap index (0 → last, last → 0)
  s.current = ((idx % s.total) + s.total) % s.total;

  // Geser track dengan CSS transform
  const track = document.getElementById('track' + num);
  if (track) {
    track.style.transform = `translateX(-${s.current * 100}%)`;
  }

  // Update dot aktif
  document.querySelectorAll(`#dots${num} .dot`).forEach((d, i) =>
    d.classList.toggle('active', i === s.current)
  );
}

/**
 * Mulai auto play — interval berbeda agar tidak bergerak bersamaan
 */
function startAuto() {
  // Hentikan timer lama jika ada
  autoTimers.forEach(t => clearInterval(t));

  autoTimers = [
    setInterval(() => goTo(1, sliderState[1].current + 1), 5500), // Slider 1: setiap 5.5 detik
    setInterval(() => goTo(2, sliderState[2].current + 1), 7000)  // Slider 2: setiap 7 detik
  ];
}

/**
 * Inisialisasi event tombol prev/next
 */
function initSliderBtns() {
  document.querySelectorAll('.slider-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const num = +btn.dataset.slider;
      const dir = +btn.dataset.dir;
      goTo(num, sliderState[num].current + dir);
    });
  });
}

document.addEventListener('DOMContentLoaded', initSliderBtns);
