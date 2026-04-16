/**
 * chatbot.js
 * ─────────────────────────────────────────────
 * Berisi: Inisialisasi chat widget
 *         Toggle buka/tutup jendela chat
 *         addChatMsg() — tambah bubble pesan
 *         showTyping() / removeTyping() — animasi
 *         sendChat()   — kirim pesan ke Claude API
 * ─────────────────────────────────────────────
 * Kalau mau ubah kepribadian bot →
 *   edit SYSTEM_PROMPT di bawah
 * Kalau mau ubah model AI →
 *   ubah model di body JSON fetch
 */

// Instruksi kepribadian bot
const SYSTEM_PROMPT = `Kamu adalah Asisten Portal Informasi Fakultas MIPA Universitas Tanjungpura (UNTAN). Namamu "Asmanita AI".
Bantu mahasiswa, dosen, dan masyarakat mendapatkan informasi layanan portal FMIPA UNTAN.
Topik yang bisa dijawab: Bio Ijazah, Jenis Layanan, Satu UNTAN, Cek Surat, informasi akademik FMIPA.
Gaya bicara: ramah, profesional, bahasa Indonesia natural, singkat dan to the point.
Jika ditanya di luar topik UNTAN/FMIPA, sampaikan sopan bahwa kamu hanya membantu seputar Portal FMIPA UNTAN.`;

// Riwayat percakapan (dikirim ke API setiap pesan)
let chatHistory = [];
let chatOpen    = false;

/**
 * Inisialisasi semua event listener chat
 */
function initChat() {
  const fab     = document.getElementById('chatFab');
  const win     = document.getElementById('chatWindow');
  const closeBtn= document.getElementById('chatCloseBtn');
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  if (!fab) return;

  // Buka / tutup jendela chat
  fab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    win.classList.toggle('open', chatOpen);
    if (chatOpen) {
      // Sembunyikan badge notifikasi
      const badge = document.querySelector('.chat-badge');
      if (badge) badge.style.display = 'none';
      // Fokus ke input
      setTimeout(() => input?.focus(), 300);
    }
  });

  closeBtn?.addEventListener('click', () => {
    chatOpen = false;
    win.classList.remove('open');
  });

  // Kirim via tombol atau Enter
  sendBtn?.addEventListener('click', sendChat);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });

  // Pesan sambutan
  addChatMsg('bot',
    'Halo! Saya <strong>Asmanita AI</strong> 👋<br>' +
    'Siap membantu informasi layanan Portal FMIPA UNTAN.'
  );
}

/**
 * Tambahkan bubble pesan ke area chat
 * @param {'bot'|'user'} role
 * @param {string} text - boleh HTML
 */
function addChatMsg(role, text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = 'msg ' + role;

  const botAvatar  = '<div class="msg-avatar">🦸‍♀️</div>';
  const userAvatar = '<div class="msg-avatar" style="background:var(--accent);font-size:10px;font-weight:700;">Anda</div>';

  div.innerHTML = `
    ${role === 'bot' ? botAvatar : ''}
    <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>
    ${role === 'user' ? userAvatar : ''}`;

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/** Tampilkan animasi "sedang mengetik..." */
function showTyping() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typingDot';
  div.innerHTML = `
    <div class="msg-avatar">🏛️</div>
    <div class="msg-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/** Hapus animasi typing */
function removeTyping() {
  document.getElementById('typingDot')?.remove();
}

/**
 * Kirim pesan ke Claude API dan tampilkan respons
 */
async function sendChat() {
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const text    = input?.value.trim();
  if (!text) return;

  addChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });

  if (input)   input.value  = '';
  if (sendBtn) sendBtn.disabled = true;
  showTyping();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: chatHistory.slice(-12) // kirim 12 pesan terakhir saja
      })
    });

    const data  = await res.json();
    const reply = data.content?.[0]?.text || 'Maaf, Saya masih dalam tahap pengembangan jadi belum bisa menjawab pertanyaan Anda 😊. Silakan coba lagi nanti.';

    removeTyping();
    chatHistory.push({ role: 'assistant', content: reply });
    addChatMsg('bot', reply);

  } catch {
    removeTyping();
    addChatMsg('bot', 'Maaf, koneksi bermasalah. Silakan coba lagi.');
  }

  if (sendBtn) sendBtn.disabled = false;
  input?.focus();
}

document.addEventListener('DOMContentLoaded', initChat);
