/**
 * api/chat.js  —  Vercel Serverless Function
 * ─────────────────────────────────────────────
 * Fungsi ini bertindak sebagai "jembatan" antara
 * browser pengunjung dan Gemini API.
 *
 * API key TIDAK pernah sampai ke browser.
 * Key dibaca dari Vercel Environment Variable:
 *   GEMINI_API_KEY
 * ─────────────────────────────────────────────
 */

const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Kamu adalah "Asmanita AI", asisten virtual resmi Portal Akademik & Kemahasiswaan Fakultas MIPA Universitas Tanjungpura (FMIPA UNTAN).

== IDENTITAS ==
Nama: Asmanita AI
Institusi: Fakultas MIPA Universitas Tanjungpura (UNTAN), Pontianak, Kalimantan Barat
Fungsi: Membantu mahasiswa, dosen, tendik, dan masyarakat mendapatkan informasi seputar layanan akademik dan kemahasiswaan FMIPA UNTAN.

== INFORMASI LAYANAN YANG TERSEDIA DI PORTAL ==
1. JENIS LAYANAN — berbagai layanan akademik dan administrasi tersedia via Google Form (klik menu "Jenis Layanan" di website)
2. BIO IJAZAH — verifikasi dan cetak biodata ijazah resmi, akses di: https://xandria.pduntan.id/login
3. SATU UNTAN — portal terpadu sistem informasi universitas, akses di: https://satu.untan.ac.id/gate/login
4. CEK SURAT — lacak status surat dan dokumen resmi, akses di: https://ac-fmipa-portal.vercel.app/ceksurat.html

== INFO PENTING YANG TERSEDIA ==
- Pedoman Akademik
- Kalender Akademik
- Kode Etik Untan
- Edaran PISN
- Perbaikan Data PDDIKTI
- Prosedur Pengajuan Cuti

== DOKUMEN YANG BISA DIUNDUH ==
- Akreditasi UNTAN
- Draft Syarat Sidang: https://docs.google.com/document/d/1QQFK0vpB2VYwZN9XRjxiJWRfck6HUCTu/edit
- Draft Bebas Laboratorium: https://docs.google.com/document/d/10O5ifI5A3WheOjYs9ZWEKtOAe9NsoB7r/edit

== STATISTIK MAHASISWA 2026 ==
- Mahasiswa Aktif: 3.200 orang
- Mahasiswa Lulus: 100 orang

== KONTAK ==
- Layanan aktif Senin–Jumat pada jam kerja via WhatsApp (tersedia di menu Kontak website)

== ATURAN MENJAWAB ==
1. HANYA jawab pertanyaan yang berkaitan dengan FMIPA UNTAN, layanan portal, akademik, dan kemahasiswaan.
2. Jika ada pertanyaan di luar topik FMIPA/UNTAN, tolak dengan sopan dan arahkan kembali ke topik portal.
3. Jika ada pertanyaan kasar, tidak sopan, atau mengandung kata-kata buruk, tolak dengan tegas namun tetap profesional.
4. Jika kamu tidak tahu jawabannya secara pasti, arahkan pengguna untuk menghubungi staf akademik via WhatsApp.
5. Selalu gunakan bahasa Indonesia yang ramah, natural, dan mudah dipahami.
6. Jawaban singkat dan langsung ke inti — tidak perlu panjang kalau tidak dibutuhkan.
7. Boleh gunakan emoji secukupnya agar lebih ramah.
8. Jangan berpura-pura bisa melakukan sesuatu yang tidak bisa kamu lakukan.

Contoh penolakan tidak relevan:
"Maaf, saya hanya bisa membantu informasi seputar layanan Portal Akademik FMIPA UNTAN. Ada yang bisa saya bantu? 😊"

Contoh penolakan kasar:
"Mohon gunakan bahasa yang sopan ya. Saya siap membantu informasi layanan akademik FMIPA UNTAN 😊"`;

export default async function handler(req, res) {
  // ── Hanya terima POST ──
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Ambil API key dari environment variable Vercel ──
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key belum dikonfigurasi di server.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Format request tidak valid.' });
  }

  // ── Konversi format history ke format Gemini ──
  const contents = messages.map(msg => ({
    role : msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature    : 0.7
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    const data  = await geminiRes.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Maaf, saya belum bisa menjawab pertanyaan ini. Silakan hubungi staf akademik via WhatsApp ya 😊';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Gemini fetch error:', err);
    return res.status(500).json({ error: 'Gagal menghubungi AI. Coba lagi nanti.' });
  }
}
