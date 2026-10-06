const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Fallback to Laravel root .env

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection:', reason);
});

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

console.log('=== MYACADEMIC WHATSAPP BOT SERVICE ===');
console.log('Backend URL:', BACKEND_URL);
console.log('Status Gemini Key:', GEMINI_API_KEY ? '✅ Terpasang' : '⚠️ Belum diisi di .env (Akan menggunakan fallback backend)');

let GoogleGenerativeAI = null;
let genAI = null;
if (GEMINI_API_KEY) {
  try {
    const geminiPkg = require('@google/generative-ai');
    GoogleGenerativeAI = geminiPkg.GoogleGenerativeAI;
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (e) {
    console.warn('GoogleGenerativeAI package tidak dapat dimuat, menggunakan backend gateway.');
  }
}

async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Menggunakan Baileys v${version.join('.')}, isLatest: ${isLatest}`);

  const authFolder = path.join(__dirname, 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['MyAcademic Bot', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
    emitOwnEvents: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n======================================================');
      console.log('📱 SCAN QR CODE DI BAWAH DENGAN WHATSAPP ANDA:');
      console.log('======================================================');
      qrcode.generate(qr, { small: true });
      console.log('Petunjuk: Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      console.log(`[WA] Koneksi terputus. Kode: ${statusCode}. Alasan: ${lastDisconnect?.error?.message}`);

      if (isLoggedOut) {
        console.log('❌ Sesi telah logout dari HP. Menghapus auth_info_baileys...');
        try {
          fs.rmSync(authFolder, { recursive: true, force: true });
        } catch (e) {}
      } else {
        console.log('🔄 Mencoba menghubungkan kembali dalam 5 detik...');
        setTimeout(() => connectToWhatsApp(), 5000);
      }
    } else if (connection === 'open') {
      console.log('\n======================================================');
      console.log('✅ BOT WHATSAPP MYACADEMIC BERHASIL TERHUBUNG & AKTIF!');
      console.log('======================================================\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg || !msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) return; // Abaikan pesan grup

    const textMessage =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      '';

    const getMedia = (m) => {
      if (!m) return null;
      if (m.imageMessage) return { type: 'image', msg: m.imageMessage };
      if (m.audioMessage) return { type: 'audio', msg: m.audioMessage };
      if (m.ephemeralMessage?.message) return getMedia(m.ephemeralMessage.message);
      if (m.viewOnceMessage?.message) return getMedia(m.viewOnceMessage.message);
      if (m.viewOnceMessageV2?.message) return getMedia(m.viewOnceMessageV2.message);
      return null;
    };

    const mediaData = getMedia(msg.message);
    if (!textMessage && !mediaData) return;

    // Bersihkan identifier sender (tangani multi-device :1, :2, dan @lid)
    const cleanJid = (msg.key.participant || remoteJid || '').split('@')[0].split(':')[0];
    const senderNumber = cleanJid.replace(/[^0-9]/g, '');

    // Status presence: membaca & sedang mengetik
    sock.readMessages([msg.key]).catch(() => {});
    sock.presenceSubscribe(remoteJid).catch(() => {});
    sock.sendPresenceUpdate('composing', remoteJid).catch(() => {});

    console.log(`[Pesan Masuk] dari ${senderNumber}: ${textMessage || `[Media: ${mediaData?.type}]`}`);

    // ==========================================================
    // 1. PENANGANAN AKTIVASI / PENAUTAN TOKEN
    // ==========================================================
    const tokenMatch = textMessage.match(/\b(MYACAD-[A-Z0-9]+)\b/i);
    if (tokenMatch && tokenMatch[1]) {
      const token = tokenMatch[1].toUpperCase().trim();
      try {
        const verifyRes = await axios.post(`${BACKEND_URL}/arsip-belajar/whatsapp/webhook`, {
          action: 'verify',
          sender: senderNumber,
          token: token,
        }, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 30000,
        });

        if (verifyRes.data.success) {
          const user = verifyRes.data.user || {};
          await sock.sendMessage(remoteJid, {
            text: `🎉 *VERIFIKASI BERHASIL!*\n\nHalo *${user.name || 'Siswa'}*, akun MyAcademic kamu kini telah terhubung ke bot ini.\n\n✨ *Fitur yang dapat kamu gunakan langsung lewat WA ini:*\n1. 📸 *Kirim Foto Papan Tulis*: Bot akan otomatis mengekstrak & menstrukturkan catatan materi ke Space Belajar kamu.\n2. 🎙️ *Kirim Voice Note*: Penjelasan suara guru akan dirangkum ke dalam catatan.\n3. 💬 *Tanya Jawab*: Ajukan pertanyaan teks kapan saja untuk dijawab berdasarkan arsip belajarmu.`,
          });
        } else {
          await sock.sendMessage(remoteJid, {
            text: `❌ *Verifikasi Gagal:* ${verifyRes.data.message || 'Token tidak valid atau sudah kadaluarsa.'}`,
          });
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        await sock.sendMessage(remoteJid, {
          text: `❌ *Verifikasi Gagal:* ${errMsg}`,
        });
      }
      sock.sendPresenceUpdate('paused', remoteJid).catch(() => {});
      return;
    }

    // ==========================================================
    // 2. PENANGANAN MEDIA MASUK (FOTO PAPAN TULIS / SUARA AUDIO)
    // ==========================================================
    if (mediaData) {
      await sock.sendMessage(remoteJid, {
        text: `⏳ *Sedang memproses media Anda dengan AI MyAcademic...*\nMohon tunggu sejenak, materi sedang disintesis dan dicatat ke Space Belajar.`,
      });

      try {
        const buffer = await downloadMediaMessage(
          msg,
          'buffer',
          {},
          { logger: pino({ level: 'silent' }) }
        );
        const base64Data = buffer.toString('base64');
        const rawMime = mediaData.msg.mimetype || (mediaData.type === 'image' ? 'image/jpeg' : 'audio/ogg');
        const mimeType = rawMime.split(';')[0];

        let structuredNotes = '';
        let noteTitle = 'Catatan Materi WhatsApp';

        // Sintesis via Gemini jika key ada
        if (genAI) {
          try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Analisis media pendidikan ini secara mendalam (${mediaData.type === 'image' ? 'papan tulis/gambar' : 'rekaman suara guru'}).
Ekstrak semua informasi penting, rumus, poin inti, dan strukturkan menjadi catatan materi yang rapi untuk siswa.
Konteks teks tambahan dari siswa: ${textMessage || 'Tidak ada'}

ATURAN:
- Tulis dalam PLAIN TEXT tanpa simbol markdown tebal seperti # atau **.
- Untuk judul dan sub-bab gunakan HURUF KAPITAL di baris tersendiri.
- Untuk poin gunakan tanda strip (- ).
- Baris pertama tulis: JUDUL: [Judul Singkat 1-4 Kata].`;

            const res = await model.generateContent([
              prompt,
              { inlineData: { data: base64Data, mimeType } },
            ]);
            let resText = res.response.text();
            const titleMatch = resText.match(/^JUDUL:\s*(.*)/im);
            if (titleMatch) {
              noteTitle = titleMatch[1].trim();
              resText = resText.replace(/^JUDUL:\s*.*\n*/i, '').trim();
            }
            structuredNotes = resText;
          } catch (gemErr) {
            console.error('Gemini processing error:', gemErr.message);
            structuredNotes = `Materi dari lampiran ${mediaData.type} WhatsApp.\n\nKonteks: ${textMessage || 'Tersimpan otomatis'}`;
          }
        } else {
          structuredNotes = `Materi dari lampiran ${mediaData.type} WhatsApp.\n\nKonteks: ${textMessage || 'Tersimpan otomatis dari bot WA'}`;
        }

        // Kirim ke backend untuk disimpan ke akun siswa (termasuk binary media base64)
        const saveRes = await axios.post(`${BACKEND_URL}/arsip-belajar/whatsapp/webhook`, {
          action: 'create_note',
          sender: senderNumber,
          title: noteTitle,
          text: structuredNotes,
          media_type: mediaData.type,
          media_base64: base64Data,
          media_mime: mimeType,
        }, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 60000,
        });

        if (saveRes.data.success) {
          await sock.sendMessage(remoteJid, {
            text: `✅ *Catatan Berhasil Disimpan ke Space Belajar!*\n\n📌 *Judul:* ${noteTitle}\n📚 *Status:* Tersimpan di Arsip Belajar AI\n\nKamu bisa membuka portal web MyAcademic untuk membuat *Flashcard 3D*, *Peta Pikiran*, dan *Simulator Kuis CBT* dari materi ini!`,
          });
        } else {
          await sock.sendMessage(remoteJid, {
            text: `⚠️ ${saveRes.data.message || 'Gagal menyimpan catatan.'}`,
          });
        }
      } catch (mediaErr) {
        console.error('Media handler error:', mediaErr);
        await sock.sendMessage(remoteJid, {
          text: `❌ Terjadi kesalahan saat memproses media: ${mediaErr.message}`,
        });
      }

      sock.sendPresenceUpdate('paused', remoteJid).catch(() => {});
      return;
    }

    // ==========================================================
    // 3. TANYA JAWAB TEKS MATERI BELAJAR (RAG CHAT)
    // ==========================================================
    try {
      const ragRes = await axios.post(`${BACKEND_URL}/arsip-belajar/whatsapp/webhook`, {
        action: 'rag_chat',
        sender: senderNumber,
        query: textMessage,
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 30000,
      });

      if (ragRes.data.success) {
        await sock.sendMessage(remoteJid, {
          text: ragRes.data.reply,
        });
      } else {
        await sock.sendMessage(remoteJid, {
          text: ragRes.data.message || 'Nomor belum terdaftar di MyAcademic.',
        });
      }
    } catch (chatErr) {
      const errMsg = chatErr.response?.data?.message || chatErr.message;
      await sock.sendMessage(remoteJid, {
        text: `⚠️ ${errMsg}`,
      });
    }

    sock.sendPresenceUpdate('paused', remoteJid).catch(() => {});
  });
}

connectToWhatsApp().catch((err) => {
  console.error('Fatal Bot Error:', err);
});
