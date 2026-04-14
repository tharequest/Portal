/**
 * Portal Informasi v3 – Frontend JS (Fixed PDF Viewer)
 */

const sliderState = { 1:{current:0,total:0}, 2:{current:0,total:0} };
let autoTimers = [];

/* ══ BUILD SLIDERS ══════════════════════════════════ */
function buildSliders(slides) {
  [1,2].forEach(num => {
    const group = slides.filter(s => s.slider === num);
    sliderState[num].total = group.length;
    const track = document.getElementById('track'+num);
    const dots  = document.getElementById('dots'+num);
    if (!track || !dots) return;
    track.innerHTML = '';
    dots.innerHTML  = '';

    if (!group.length) {
      track.innerHTML = `<div class="slide"><div class="slide-bg" style="background:#e8f0fd"></div>
        <div class="slide-overlay"></div>
        <div class="slide-content" style="text-align:center;width:100%;">
          <p style="color:rgba(255,255,255,.7);font-size:13px;">Belum ada slide</p>
        </div></div>`;
      return;
    }

    group.forEach((slide, i) => {
      const hint = slide.popupType === 'pdf' ? '📄 Lihat PDF' : '🔍 Lihat Gambar';
      const el = document.createElement('div');
      el.className = 'slide';
      el.style.cssText = 'min-width:100%;flex-shrink:0;';
      el.innerHTML = `
        <div class="slide-bg" style="background-image:url('${slide.imageUrl}')"></div>
        <div class="slide-overlay"></div>
        <div class="slide-hint">${hint}</div>
        <div class="slide-content">
          <span class="slide-tag">${slide.tag}</span>
          <h2>${slide.title}</h2>
          <p>${slide.desc}</p>
        </div>`;
      el.addEventListener('click', () => openPopup(slide));
      track.appendChild(el);

      const dot = document.createElement('button');
      dot.className = 'dot'+(i===0?' active':'');
      dot.addEventListener('click', e => { e.stopPropagation(); goTo(num,i); });
      dots.appendChild(dot);
    });
    goTo(num, 0);
  });
}

function goTo(num, idx) {
  const s = sliderState[num];
  if (!s.total) return;
  s.current = ((idx % s.total) + s.total) % s.total;
  const track = document.getElementById('track'+num);
  if (track) track.style.transform = `translateX(-${s.current*100}%)`;
  document.querySelectorAll(`#dots${num} .dot`).forEach((d,i) =>
    d.classList.toggle('active', i===s.current));
}

function startAuto() {
  autoTimers.forEach(t => clearInterval(t));
  autoTimers = [
    setInterval(() => goTo(1, sliderState[1].current+1), 5500),
    setInterval(() => goTo(2, sliderState[2].current+1), 7000)
  ];
}

/* ══ NEWS ═══════════════════════════════════════════ */
function buildNews(news) {
  const list = document.getElementById('newsList');
  if (!list) return;
  if (!news?.length) {
    list.innerHTML = '<li style="color:#5a6e82;font-size:13px;padding:8px 0;">Belum ada berita.</li>';
    return;
  }
  list.innerHTML = news.map(n => `
    <li>
      <div class="news-date">${n.date}</div>
      <div class="news-text">${n.text}</div>
    </li>`).join('');
}

/* ══ POPUP ══════════════════════════════════════════ */
function openPopup(slide) {
  const overlay = document.getElementById('popupOverlay');
  const inner   = document.getElementById('popupInner');
  const isMobile = window.innerWidth <= 768;

  if (slide.popupType === 'pdf' && slide.popupUrl) {

    if (slide.popupUrl.startsWith('data:')) {
      // PDF lama disimpan base64 — tampilkan tombol download saja
      inner.innerHTML = buildPdfFallback(slide, slide.popupUrl);

    } else {
      // PDF raw URL — gunakan Google Docs viewer (bypass X-Frame-Options)
      // Google Docs viewer bisa render PDF dari URL publik manapun
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(slide.popupUrl)}&embedded=true`;

      if (isMobile) {
        // Mobile: Google Docs viewer di iframe (lebih ringan)
        inner.innerHTML = `
          <div class="popup-pdf-wrap">
            <div class="popup-pdf-header">📄 ${slide.popupLabel || slide.title}</div>
            <div class="popup-pdf-body">
              <iframe
                src="${googleViewerUrl}"
                frameborder="0"
                allowfullscreen
                style="width:100%;height:100%;border:none;"
              ></iframe>
            </div>
          </div>`;
      } else {
        // Desktop: Google Docs viewer via iframe
        inner.innerHTML = `
          <div class="popup-pdf-wrap">
            <div class="popup-pdf-header">
              📄 ${slide.popupLabel || slide.title}
              <a href="${slide.popupUrl}" target="_blank" rel="noopener"
                style="margin-left:auto;font-size:11px;color:rgba(255,255,255,.7);text-decoration:none;padding:3px 10px;background:rgba(255,255,255,.15);border-radius:6px;">
                ⬇️ Download
              </a>
            </div>
            <div class="popup-pdf-body">
              <iframe
                src="${googleViewerUrl}"
                frameborder="0"
                allowfullscreen
                style="width:100%;height:100%;border:none;"
              ></iframe>
            </div>
          </div>`;
      }
    }

  } else if (slide.popupType === 'pdf') {
    inner.innerHTML = `
      <div style="width:min(380px,88vw);background:#fff;border-radius:16px;padding:36px 28px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">📄</div>
        <div style="font-size:14px;font-weight:700;color:#1a4f8a;margin-bottom:8px;">${slide.popupLabel||slide.title}</div>
        <div style="font-size:13px;color:#5a6e82;">File PDF belum diunggah.<br>Upload melalui <strong>Admin Panel</strong>.</div>
      </div>`;

  } else {
    // Image popup
    const src = slide.popupUrl || slide.imageUrl;
    inner.innerHTML = `
      <div class="popup-img">
        <img src="${src}" alt="${slide.title}"
          style="display:block;max-width:min(900px,90vw);max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 16px 60px rgba(0,0,0,.5);"
        />
      </div>`;
  }

  overlay.classList.add('open');
}

function buildPdfFallback(slide, url) {
  return `
    <div style="width:min(360px,88vw);background:#fff;border-radius:16px;padding:28px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📄</div>
      <div style="font-size:15px;font-weight:700;color:#1a4f8a;margin-bottom:8px;">${slide.popupLabel||slide.title}</div>
      <div style="font-size:13px;color:#5a6e82;margin-bottom:20px;line-height:1.6;">
        Klik tombol di bawah untuk membuka atau mendownload PDF.
      </div>
      <a href="${url}" ${url.startsWith('data:') ? 'download="dokumen.pdf"' : 'target="_blank" rel="noopener"'}
        style="display:flex;align-items:center;justify-content:center;gap:8px;
        background:#1a4f8a;color:#fff;font-size:14px;font-weight:700;
        padding:12px 24px;border-radius:10px;text-decoration:none;width:100%;">
        📖 Buka / Download PDF
      </a>
    </div>`;
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.remove('open');
  setTimeout(() => {
    const inner = document.getElementById('popupInner');
    if (inner) inner.innerHTML = '';
  }, 250);
}

/* ══ HAMBURGER ══════════════════════════════════════ */
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!ham||!nav) return;
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    nav.classList.remove('open');
  }));
}

/* ══ SLIDER BUTTONS ════════════════════════════════ */
function initSliderBtns() {
  document.querySelectorAll('.slider-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      goTo(+btn.dataset.slider, sliderState[+btn.dataset.slider].current + +btn.dataset.dir);
    });
  });
}

/* ══ AI CHATBOT ════════════════════════════════════ */
const SYSTEM_PROMPT = `Kamu adalah Asisten Portal Informasi Fakultas MIPA Universitas Tanjungpura (UNTAN). Namamu "Portal Bot".
Bantu mahasiswa, dosen, dan masyarakat mendapatkan informasi layanan portal FMIPA UNTAN.
Topik: Bio Ijazah, Jenis Layanan, Satu UNTAN, Cek Surat, informasi akademik FMIPA.
Gaya: ramah, profesional, bahasa Indonesia natural, singkat dan to the point.
Jika ditanya di luar UNTAN/FMIPA, sampaikan sopan bahwa kamu hanya membantu seputar Portal FMIPA UNTAN.`;

let chatHistory = [];
let chatOpen = false;

function initChat() {
  const fab=document.getElementById('chatFab'),win=document.getElementById('chatWindow');
  const closeBtn=document.getElementById('chatCloseBtn'),input=document.getElementById('chatInput');
  const sendBtn=document.getElementById('chatSend');
  if (!fab) return;
  fab.addEventListener('click',()=>{
    chatOpen=!chatOpen;win.classList.toggle('open',chatOpen);
    if(chatOpen){document.querySelector('.chat-badge').style.display='none';setTimeout(()=>input?.focus(),300);}
  });
  closeBtn?.addEventListener('click',()=>{chatOpen=false;win.classList.remove('open');});
  sendBtn?.addEventListener('click',sendChat);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}});
  addChatMsg('bot','Halo! Saya <strong>Portal Bot</strong> 👋<br>Siap membantu informasi layanan Portal FMIPA UNTAN.');
}

function addChatMsg(role,text){
  const msgs=document.getElementById('chatMessages');if(!msgs)return;
  const div=document.createElement('div');div.className='msg '+role;
  div.innerHTML=`${role==='bot'?'<div class="msg-avatar">🏛️</div>':''}
    <div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>
    ${role==='user'?'<div class="msg-avatar" style="background:var(--accent);font-size:10px;font-weight:700;">Anda</div>':''}`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  const msgs=document.getElementById('chatMessages');if(!msgs)return;
  const div=document.createElement('div');div.className='msg bot';div.id='typingDot';
  div.innerHTML=`<div class="msg-avatar">🏛️</div><div class="msg-bubble"><div class="typing-indicator">
    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
  </div></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){document.getElementById('typingDot')?.remove();}

async function sendChat(){
  const input=document.getElementById('chatInput'),sendBtn=document.getElementById('chatSend');
  const text=input?.value.trim();if(!text)return;
  addChatMsg('user',text);chatHistory.push({role:'user',content:text});
  if(input)input.value='';if(sendBtn)sendBtn.disabled=true;showTyping();
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:512,system:SYSTEM_PROMPT,messages:chatHistory.slice(-12)})
    });
    const data=await res.json();
    const reply=data.content?.[0]?.text||'Maaf, terjadi kesalahan.';
    removeTyping();chatHistory.push({role:'assistant',content:reply});addChatMsg('bot',reply);
  }catch{removeTyping();addChatMsg('bot','Maaf, koneksi bermasalah. Silakan coba lagi.');}
  if(sendBtn)sendBtn.disabled=false;input?.focus();
}

/* ══ INIT ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initSliderBtns();
  initHamburger();
  initChat();

  [1,2].forEach(n=>{
    const t=document.getElementById('track'+n);
    if(t) t.innerHTML=`<div class="slide"><div class="slide-bg" style="background:#e8f0fd"></div>
      <div class="slide-overlay"></div>
      <div class="slide-content" style="text-align:center;width:100%;">
        <p style="color:rgba(255,255,255,.8);font-size:13px;">⏳ Memuat...</p>
      </div></div>`;
  });

  try {
    const data = await fetchPortalData();
    buildSliders(data.slides||[]);
    buildNews(data.news||[]);
    startAuto();
  } catch(err) {
    console.error('Gagal memuat:', err);
    try {
      const cached=localStorage.getItem('portal_v3_cache');
      if(cached){const {data}=JSON.parse(cached);buildSliders(data.slides||[]);buildNews(data.news||[]);startAuto();}
    } catch(_){}
  }

  document.getElementById('popupClose')?.addEventListener('click', closePopup);
  document.getElementById('popupOverlay')?.addEventListener('click', e=>{
    if(e.target.id==='popupOverlay') closePopup();
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closePopup(); });
});
