# Trial game FEKDI 2026

Trial party game untuk Rafael, mengikuti masukan Hervin dan referensi Jackbox Party Pack. Dua game mengikuti brief Rev2: Stop or Go Decision dan Act Fast Challenge. Ini trial desain dan interaksi, belum build kiosk produksi.

## Buka preview

Jalankan `python3 -m http.server 4176 --bind 127.0.0.1 --directory public`, lalu buka http://localhost:4176. Tautan game: `/#stop` dan `/#act`.

Folder ini juga dapat dilayani sendiri oleh server HTTP statis. Semua aset, font, ikon, dan konten tersedia dalam folder yang sama. Tidak perlu backend, akun, atau internet. Membuka HTML langsung melalui `file://` tidak didukung karena menggunakan modul JavaScript.

Mode Otomatis mengikuti lebar layar. Tombol Portrait mempersempit preview di desktop. Untuk meninjau ukuran booth, gunakan viewport 1920×1080 dan 1080×1920. Tombol layar penuh menyembunyikan toolbar preview. Suara aktif setelah interaksi pertama dan bisa dimatikan dari toolbar. Esc membuka konfirmasi reset.

## Konten dan aturan

- `content.mjs`: 15 situasi Stop or Go, 10 kasus Act Fast, delapan tindakan, penjelasan, dan pengaturan waktu.
- `audio.mjs`: BGM in-game sintetis dan efek suara benar, buzzer salah, serta kemenangan.
- `engine.mjs`: pengacakan, penghitungan pilihan unik, dan skor.
- `app.mjs`: alur layar, input, timer, dan reset.
- `style.css`: layout adaptif dan visual.

Stop or Go mengambil lima situasi unik per sesi. Act Fast menghabiskan satu kumpulan sepuluh kasus sebelum mengacak ulang, tanpa kasus berulang di perbatasan kumpulan. Timer dimulai setelah Saya siap. Setiap tindakan hanya dihitung sekali. Sesi aktif tidak memiliki batas waktu. Tanpa input selama 90 detik, sesi kembali ke awal. Layar hasil Act Fast membuka penjelasan otomatis setelah 45 detik jika belum dipilih. Tombol selesai pada penjelasan aktif setelah lima detik.

Skenario dan istilah berasal dari brief pengguna. Beberapa kalimat disingkat untuk layar. Nama Bank Indonesia memakai aset project. Tampilan memakai karakter kartun orisinal, kartu situasi dengan animasi masuk, dialog karakter yang merespons pilihan, indikator tindakan tepat, dan nada singkat. Gerakan dimatikan saat perangkat meminta reduced motion. Font Plus Jakarta Sans memakai aset lokal project, font Bungee berasal dari Google Fonts, dan ikon berasal dari Phosphor Icons. Lisensi tersedia di `assets/BUNGEE-OFL.txt` dan `assets/PHOSPHOR-LICENSE`.

## Pemeriksaan

Jalankan dari root repository:

```sh
npm test
```

Pemeriksaan mencakup jumlah dan mapping skenario, batas bonus waktu, badge, tap berulang, serta distribusi 200 sesi. Alur browser juga diuji untuk semua sepuluh kasus Act Fast, satu sesi penuh Stop or Go, waktu aktif di atas 90 detik, reset saat ditinggal, dan tiga ukuran layar.

## Sebelum digunakan di booth

Uji keterbacaan dan jangkauan sentuh di perangkat asli, konfirmasi copy dengan pemilik materi, lalu kalibrasi target waktu 18/22 detik. Pilihan respons yang tetap bisa dihafal; amati apakah pemain memahami alasannya. Operator console, ekspor log, installer, auto-launch, dan integrasi portal tidak termasuk trial ini. Preview tidak menyimpan data pengunjung dan tidak mengubah poin atau akun Portal PeKA.

## Deploy ke Vercel

Impor repository ini dari GitHub. Gunakan root repository, preset Other, build command `npm test`, dan output directory `public`. Pengaturan tersedia di `vercel.json`. Tidak perlu environment variable atau database.

## Musik dan animasi maskot

BGM lobby `assets/bgm-fekdi.mp3` diputar berulang pada volume 80% di layar utama, intro game, dan briefing Act Fast. Setelah permainan dimulai, musik berpindah ke aransemen sintetis yang lebih cepat agar suasana permainan berbeda dari lobby. Autoplay dicoba saat halaman dibuka; jika diblokir browser, interaksi pertama memulai musik. Musik dijeda saat tab tersembunyi; tombol suara mengatur BGM dan efek suara.

Tujuh animasi maskot tersedia: santai, menyapa, berpikir, benar, salah, semangat, dan selebrasi. Intro menyapa selama 0,4 detik, lalu menampilkan langkah 01-03 berselang 0,8 detik dengan perubahan ekspresi. Maskot kembali idle 1,2 detik setelah langkah 03. Komponen bersama ada di `mascot.mjs`. Stop or Go dan Act Fast menggunakan reaksi jawaban, dan hasil sesi menggunakan selebrasi atau semangat.
