/**
 * chatbot.js  —  Asmanita AI
 * ─────────────────────────────────────────────
 * Versi AMAN: API key TIDAK ada di file ini.
 * Request dikirim ke /api/chat (serverless function)
 * yang menyimpan API key di server Vercel.
 * ─────────────────────────────────────────────
 * Kalau mau ubah kepribadian bot →
 *   edit SYSTEM_PROMPT di api/chat.js
 */

let chatHistory = [];
let chatOpen    = false;

function initChat() {
  const fab      = document.getElementById('chatFab');
  const win      = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatCloseBtn');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  if (!fab) return;

  fab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    win.classList.toggle('open', chatOpen);
    if (chatOpen) {
      const badge = document.querySelector('.chat-badge');
      if (badge) badge.style.display = 'none';
      setTimeout(() => input?.focus(), 300);
    }
  });

  closeBtn?.addEventListener('click', () => {
    chatOpen = false;
    win.classList.remove('open');
  });

  sendBtn?.addEventListener('click', sendChat);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });

  addChatMsg('bot',
    'Halo! Saya <strong>Asmanisa AI</strong> 👋<br>' +
    'Asisten virtual Portal Akademik & Kemahasiswaan FMIPA UNTAN.<br><br>' +
    'Tanyakan apa saja seputar layanan akademik, ijazah, surat, atau info kampus ya!'
  );
}

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

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typingDot';
  div.innerHTML = `
    <div class="msg-avatar">🦸‍♀️</div>
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

function removeTyping() {
  document.getElementById('typingDot')?.remove();
}

async function sendChat() {
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const text    = input?.value.trim();
  if (!text) return;

  addChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  if (input)   input.value      = '';
  if (sendBtn) sendBtn.disabled = true;
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ messages: chatHistory.slice(-10) })
    });
    const data  = await res.json();
    const reply = data.reply || 'Maaf, terjadi kesalahan. Silakan coba lagi ya 😊';
    removeTyping();
    chatHistory.push({ role: 'assistant', content: reply });
    addChatMsg('bot', reply);
  } catch (err) {
    console.error('Chat error:', err);
    removeTyping();
    addChatMsg('bot', '⚠️ Koneksi bermasalah. Pastikan kamu terhubung ke internet dan coba lagi.');
  }

  if (sendBtn) sendBtn.disabled = false;
  input?.focus();
}

document.addEventListener('DOMContentLoaded', initChat);
