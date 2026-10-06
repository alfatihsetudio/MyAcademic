# Layanan WhatsApp Bot MyAcademic (Arsip Belajar AI)

Layanan ini mengintegrasikan WhatsApp siswa dengan sistem Arsip Belajar AI di MyAcademic menggunakan Baileys (WhatsApp Web API).

## Fitur Utama
1. **Aktivasi Akun Otomatis**: Siswa mengirim kode `MYACAD-XXXX` untuk menautkan nomor WhatsApp dengan akun MyAcademic mereka.
2. **Multimodal Upload via WA**: Siswa memotret papan tulis atau merekam suara guru via WhatsApp dan mengirimkannya ke bot. Bot otomatis mengekstrak teks, menstrukturkan materi dengan AI Gemini, dan menyimpannya ke database catatan siswa.
3. **Contextual Q&A (RAG)**: Siswa dapat mengajukan pertanyaan teks kapan saja melalui WhatsApp, dan bot akan menjawab secara kontekstual berdasarkan arsip catatan belajar mereka.

## Cara Menjalankan Bot
1. Buka terminal di direktori ini:
   ```bash
   cd c:\laragon\www\myacademic\backend\wa-bot
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Siapkan file `.env`:
   Salin `.env.example` ke `.env` dan masukkan `GEMINI_API_KEY` serta pastikan `BACKEND_API_URL` mengarah ke Laravel backend (default: `http://127.0.0.1:8000/api/v1`).
4. Jalankan bot:
   ```bash
   node index.js
   ```
5. Scan QR code yang muncul di terminal menggunakan aplikasi WhatsApp di HP (Menu: Perangkat Tertaut / Linked Devices).
6. Bot siap melayani pesan masuk dari siswa!
