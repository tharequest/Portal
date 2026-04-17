/**
 * api/chat.js  —  Vercel Serverless Function
 * Powered by: Google Gemini API (v1 - stable)
 * System prompt diinjeksi sebagai pesan pertama
 * agar kompatibel dengan akun organisasi Google.
 */

const GEMINI_MODEL   = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

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
3. Jika ada pertanyaan kasar atau tidak sopan, tolak dengan tegas namun tetap profesional.
4. Jika tidak tahu jawabannya, arahkan pengguna untuk menghubungi staf akademik via WhatsApp.
5. Gunakan bahasa Indonesia yang ramah, natural, dan mudah dipahami.
6. Jawaban singkat dan langsung ke inti.
7. Boleh gunakan emoji secukupnya.
8. Jangan berpura-pura bisa melakukan sesuatu yang tidak bisa kamu lakukan.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[chat] ERROR: GEMINI_API_KEY tidak ditemukan');
    return res.status(500).json({ error: 'API key belum dikonfigurasi.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Format request tidak valid.' });
  }

  // Injeksi system prompt sebagai turn pertama (user → model)
  // Ini menggantikan systemInstruction yang hanya ada di v1beta
  const systemTurns = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Baik, saya mengerti. Saya adalah Asmanita AI, siap membantu informasi Portal Akademik FMIPA UNTAN.' }] }
  ];

  const userContents = messages.map(msg => ({
    role : msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const contents = [...systemTurns, ...userContents];

  try {
    console.log('[chat] Model:', GEMINI_MODEL, '| Pesan:', userContents.length);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature    : 0.7
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      })
    });

    const data = await geminiRes.json();
    console.log('[chat] Status:', geminiRes.status);

    if (data.error) {
      console.error('[chat] Gemini error:', data.error.code, data.error.message);
      return res.status(200).json({
        reply: `Maaf, terjadi kendala (${data.error.code}). Silakan hubungi staf akademik via WhatsApp ya 😊`
      });
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.warn('[chat] Candidates kosong:', JSON.stringify(data.promptFeedback));
      return res.status(200).json({
        reply: 'Maaf, saya tidak bisa memproses pertanyaan tersebut. Coba dengan kalimat lain ya 😊'
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Maaf, saya belum bisa menjawab. Silakan hubungi staf akademik via WhatsApp ya 😊';

    console.log('[chat] Berhasil, panjang reply:', reply.length);
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chat] Fetch error:', err.message);
    return res.status(500).json({ error: 'Gagal menghubungi AI. Coba lagi nanti.' });
  }
}
