# Game Zone Konsumen Aman

Klien layar sentuh untuk Sesi Game Portal Konsumen Aman. Satu deployment menyediakan Stop or Go dan Act Fast. Link dari admin menentukan sesi dengan query `?boothId=...`.

## Alur booth

1. Klien membaca `boothId` dan mengambil status sesi dari backend.
2. Pemain memilih game dan mengisi nama panggilan.
3. Backend membuat ID peserta dan ID permainan.
4. Setiap jawaban dikirim berurutan. Backend menghitung skor akhir.
5. Main lagi mempertahankan peserta. Pemain berikutnya, reset manual, dan reset otomatis menghapus peserta dari layar.

Link tanpa `boothId`, sesi yang belum mulai, sesi ditutup, dan sesi selesai tidak membuka permainan. Nama panggilan dan hasil disimpan di backend. Jangan gunakan data pribadi lain pada kolom nama.

## Menjalankan lokal

Buat `public/config.mjs` untuk menunjuk API lokal:

```js
export const GAME_API_BASE_URL = "http://localhost:8000";
```

Lalu jalankan server statis dari root repo:

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory public
```

Buka `http://localhost:4176/?boothId=ID_DARI_ADMIN`. Backend harus mengizinkan origin `http://localhost:4176` saat pengujian lokal.

## Deploy ke Vercel

Atur environment variable berikut sebelum build:

```text
GAME_API_BASE_URL=https://alamat-api-produksi
```

`npm run build` menulis nilai tersebut ke `public/config.mjs` lalu menjalankan test. Vercel melayani folder `public` sesuai `vercel.json`. Domain deployment resmi harus tercantum dalam `CORS_ORIGINS` backend.

## Pemeriksaan

```sh
npm test
GAME_API_BASE_URL=https://api.example.test npm run build
```

Test memeriksa konten dan skor game yang sudah ada, serta request booth untuk bootstrap, peserta, permainan, aksi, complete, dan abandon. Uji perangkat asli tetap diperlukan untuk layar sentuh, audio, layar penuh, portrait, dan landscape.

## File utama

- `public/app.mjs`: alur layar, retry, pergantian pemain, timer, dan reset.
- `public/booth-api.mjs`: seluruh request publik ke backend Sesi Game.
- `public/content.mjs`: skenario dan aturan konten.
- `public/engine.mjs`: pengacakan dan skor tampilan.
- `public/style.css`: layout booth adaptif.
- `scripts/write-config.mjs`: konfigurasi base URL saat build.

Skor akhir yang disimpan selalu berasal dari backend. Skor di browser hanya memberi respons langsung kepada pemain. Jika penyimpanan gagal, layar menahan hasil dan menyediakan Kirim ulang dengan ID permainan yang sama.
