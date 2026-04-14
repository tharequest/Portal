/**
 * Portal Informasi – Auth
 * Password disimpan sebagai SHA-256 hash (aman di repo public)
 */

const AUTH_USERS = [
  {
    username: 'admin',
    passwordHash: 'b3c6dfcd26974d0f26ffbd66ecccc751812c896883bbb728347f59768ed61ed0',
    displayName: 'Administrator',
    role: 'Super Admin'
  }
];

const SESSION_KEY      = 'portal_auth_v3';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2,'0')).join('');
}

async function verifyLogin(username, password) {
  const hash = await hashPassword(password);
  return AUTH_USERS.find(u => u.username === username && u.passwordHash === hash) || null;
}

function saveSession(user) {
  const session = {
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    expiresAt: Date.now() + SESSION_DURATION
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch { return null; }
}

function destroySession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    sessionStorage.setItem('portal_redirect', window.location.pathname);
    window.location.replace('login.html');
    return null;
  }
  return session;
}
