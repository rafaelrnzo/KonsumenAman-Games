// Adapted from the supplied FEKDI developer brief, revision 2.
export const stopScenarios = [
  { id: 'STOP-01', title: 'Telepon dari “CS bank”', icon: 'Phone', channel: 'Panggilan masuk', sender: 'Mengaku layanan bank', message: 'Ada transaksi mencurigakan. Tolong sebutkan kode OTP yang baru masuk agar kami bisa membatalkannya.', question: 'Berikan kode OTP kepada penelepon?', answer: 'stop', reason: 'OTP adalah rahasia. Permintaan kode OTP menjadi tanda bahaya, meskipun penelepon mengaku petugas bank.', checkpoint: 'Identitas penelepon belum terverifikasi dan ia meminta PIN, password, atau OTP.', action: 'Tutup telepon. Hubungi bank melalui nomor atau aplikasi resminya.' },
  { id: 'STOP-02', title: 'Bayar kopi dengan QRIS', icon: 'QrCode', channel: 'Konfirmasi pembayaran', sender: 'Kafe tempat kamu memesan', message: 'Nama merchant pada aplikasi sesuai nama kafe. Nominalnya sama dengan tagihan pesananmu.', question: 'Lanjutkan pembayaran ini?', answer: 'go', reason: 'Nama penerima, nominal, dan konteks pembayaran sesuai dengan transaksi yang kamu lakukan.', checkpoint: 'Periksa nama merchant dan total tagihan sebelum konfirmasi.', action: 'Lanjutkan melalui aplikasi pembayaran resmi dan simpan bukti transaksi.' },
  { id: 'STOP-03', title: 'Pesan mendadak dari atasan', icon: 'ChatCircleText', channel: 'Pesan dari nomor baru', sender: 'Mengaku atasanmu', message: 'Ini nomor baru saya. Transfer sekarang ke rekening ini, mendesak. Jangan telepon, saya sedang rapat.', question: 'Segera transfer sesuai permintaan?', answer: 'stop', reason: 'Jabatan dan tekanan waktu bukan bukti identitas. Larangan verifikasi membuat permintaan makin mencurigakan.', checkpoint: 'Nomor baru, rekening yang belum diperiksa, dan desakan untuk segera transfer.', action: 'Konfirmasi langsung kepada atasan melalui kontak yang sudah kamu kenal.' },
  { id: 'STOP-04', title: 'Checkout di marketplace', icon: 'CreditCard', channel: 'Ringkasan pesanan', sender: 'Aplikasi marketplace resmi', message: 'Barang, alamat, dan total pembayaran sesuai. Proses checkout tetap berada di aplikasi resmi.', question: 'Lanjutkan ke pembayaran?', answer: 'go', reason: 'Detail pesanan sesuai dan transaksi tetap dilakukan melalui kanal resmi.', checkpoint: 'Tidak ada permintaan transfer di luar aplikasi.', action: 'Periksa detail terakhir, lalu bayar di aplikasi resmi.' },
  { id: 'STOP-05', title: 'Keluarga minta bantuan', icon: 'Phone', channel: 'Panggilan nomor asing', sender: 'Mengaku anggota keluarga', message: 'Aku sedang darurat. Transfer sekarang! Jangan hubungi siapa-siapa dulu.', question: 'Transfer tanpa konfirmasi lagi?', answer: 'stop', reason: 'Rasa panik dapat dipakai untuk membuatmu bertindak sebelum memeriksa identitas.', checkpoint: 'Nomor asing, tekanan emosional, dan larangan menghubungi orang lain.', action: 'Hubungi keluarga lewat nomor yang tersimpan atau orang terdekatnya.' },
  { id: 'STOP-06', title: 'QRIS di toko langganan', icon: 'QrCode', channel: 'Periksa sebelum bayar', sender: 'Toko tempat kamu berbelanja', message: 'Kamu telah mencocokkan nama merchant dengan kasir. Nominal dan tujuan pembayaran juga sesuai.', question: 'Konfirmasi pembayaran sekarang?', answer: 'go', reason: 'Penerima, nominal, dan tujuan pembayaran sudah diperiksa.', checkpoint: 'Pastikan detail yang tampil adalah detail transaksi saat ini.', action: 'Konfirmasi pembayaran dan cek status berhasil di aplikasi.' },
  { id: 'STOP-07', title: 'Nama penerima berbeda', icon: 'QrCode', channel: 'Hasil pemindaian QR', sender: 'Kode QR yang tertempel di meja', message: 'Setelah dipindai, nama penerima tidak sesuai dengan merchant tempat kamu bertransaksi.', question: 'Tetap lanjutkan pembayaran?', answer: 'stop', reason: 'Kode QR yang terlihat wajar belum tentu mengarah ke penerima yang benar.', checkpoint: 'Nama merchant pada aplikasi berbeda dari tempat pembayaran.', action: 'Batalkan dahulu. Minta kasir memverifikasi kode QR dan penerimanya.' },
  { id: 'STOP-08', title: 'SMS paket tertahan', icon: 'EnvelopeSimple', channel: 'SMS masuk', sender: 'Nomor tidak dikenal', message: 'Paket Anda tertahan. Klik tautan pendek ini dan bayar biaya tambahan agar segera dikirim.', question: 'Buka tautan dan bayar biayanya?', answer: 'stop', reason: 'Tautan tak dikenal dan tagihan mendadak perlu diverifikasi sebelum dibuka atau dibayar.', checkpoint: 'Pesan mengarahkanmu ke tautan pendek, bukan aplikasi resmi.', action: 'Cek status paket langsung dari aplikasi atau situs resmi jasa pengiriman.' },
  { id: 'STOP-09', title: 'Memeriksa notifikasi', icon: 'ShieldCheck', channel: 'Aplikasi resmi', sender: 'Kamu membuka aplikasi sendiri', message: 'Ada pesan tentang aktivitas akun. Kamu tidak menekan tautannya dan memilih membuka aplikasi resmi secara mandiri.', question: 'Lanjutkan pemeriksaan di aplikasi?', answer: 'go', reason: 'Verifikasi mandiri lewat aplikasi resmi membantu menghindari tautan palsu.', checkpoint: 'Aplikasi dibuka sendiri, bukan dari tautan dalam pesan.', action: 'Periksa notifikasi dan aktivitas akun dari aplikasi tersebut.' },
  { id: 'STOP-10', title: 'Untung 10% setiap minggu', icon: 'Money', channel: 'Penawaran investasi', sender: 'Pesan promosi', message: 'Untung tetap 10% per minggu! Slot terbatas, transfer sekarang ke rekening pribadi ini.', question: 'Transfer untuk mengambil kesempatan?', answer: 'stop', reason: 'Janji keuntungan sangat tinggi, tekanan waktu, dan rekening pribadi adalah kombinasi tanda bahaya.', checkpoint: 'Keuntungan dijanjikan tetap tanpa penjelasan risiko yang masuk akal.', action: 'Jangan transfer. Periksa legalitas dan kewajaran penawaran lewat sumber resmi.' },
  { id: 'STOP-11', title: 'Transfer untuk keluarga', icon: 'PhoneCall', channel: 'Konfirmasi sudah dilakukan', sender: 'Keluarga yang kamu hubungi', message: 'Kamu sudah berbicara lewat nomor yang dikenal. Identitas, rekening penerima, nominal, dan tujuan transfer telah dikonfirmasi.', question: 'Lanjutkan transfer ini?', answer: 'go', reason: 'Permintaan sudah diverifikasi secara mandiri melalui kontak yang kamu kenal.', checkpoint: 'Identitas, penerima, nominal, dan tujuan semuanya sesuai.', action: 'Lakukan pemeriksaan akhir di aplikasi sebelum konfirmasi transfer.' },
  { id: 'STOP-12', title: 'Suaranya terdengar familiar', icon: 'ChatCircleText', channel: 'Pesan suara', sender: 'Mengaku teman dekat', message: 'Pesan suara terdengar seperti temanmu. Ia meminta transfer ke rekening baru, tetapi kamu belum mengonfirmasi langsung.', question: 'Percaya pada suara dan transfer?', answer: 'stop', reason: 'Suara bisa ditiru. Kemiripan suara saja belum membuktikan identitas pengirim.', checkpoint: 'Rekening baru dan identitas belum diverifikasi.', action: 'Hubungi teman melalui nomor yang sudah dikenal dan periksa detail permintaannya.' },
  { id: 'STOP-13', title: 'Menghubungi CS resmi', icon: 'Headset', channel: 'Bantuan di aplikasi resmi', sender: 'Layanan yang kamu hubungi sendiri', message: 'Kamu menghubungi CS melalui aplikasi resmi. Petugas membantu tanpa meminta PIN, password, atau OTP.', question: 'Lanjutkan konsultasi ini?', answer: 'go', reason: 'Kamu memulai komunikasi dari kanal resmi dan tidak ada permintaan PIN, password, atau OTP.', checkpoint: 'Kanal resmi sudah diperiksa; PIN, password, dan OTP tetap rahasia.', action: 'Lanjutkan konsultasi, tetap jaga informasi rahasiamu.' },
  { id: 'STOP-14', title: 'Kerja mudah, bayar deposit', icon: 'Money', channel: 'Tawaran pekerjaan', sender: 'Perekrut lewat pesan', message: 'Dapat penghasilan besar dari tugas sederhana. Untuk mulai, kamu harus membayar deposit atau top-up dahulu.', question: 'Bayar deposit untuk mulai bekerja?', answer: 'stop', reason: 'Permintaan membayar agar dapat bekerja, disertai janji uang mudah, adalah tanda bahaya.', checkpoint: 'Ada pembayaran di muka sebelum pekerjaan yang jelas.', action: 'Jangan bayar. Verifikasi perusahaan dan lowongan melalui kanal resminya.' },
  { id: 'STOP-15', title: 'Tagihan sudah diverifikasi', icon: 'CreditCard', channel: 'Tagihan dalam aplikasi', sender: 'Penyedia layanan resmi', message: 'Kamu membuka aplikasi resmi sendiri. Invoice, penerima, nominal, dan layanan yang ditagihkan sudah sesuai.', question: 'Lanjutkan pembayaran tagihan?', answer: 'go', reason: 'Tagihan diperiksa secara mandiri dan detailnya sesuai dengan layanan yang digunakan.', checkpoint: 'Invoice berasal dari aplikasi resmi dan tidak ada detail yang berbeda.', action: 'Bayar melalui kanal resmi dan simpan bukti pembayaran.' },
];

export const responses = [
  { id: 'R1', label: 'Amankan akun / perangkat', icon: 'LockKey', detail: 'Hentikan akses berisiko dan amankan password atau PIN sesuai insiden.' },
  { id: 'R2', label: 'Hubungi penyedia jasa', icon: 'Headset', detail: 'Hubungi bank atau penyedia layanan melalui kanal resminya.' },
  { id: 'R3', label: 'Simpan bukti', icon: 'FolderOpen', detail: 'Simpan transaksi, percakapan, dan informasi terkait.' },
  { id: 'R4', label: 'Laporkan melalui kanal resmi', icon: 'Flag', detail: 'Sampaikan laporan atau pengaduan melalui kanal resmi yang relevan.' },
  { id: 'R5', label: 'Hapus chat / bukti', icon: 'Trash' },
  { id: 'R6', label: 'Hubungi penipu kembali', icon: 'PhoneCall' },
  { id: 'R7', label: 'Kirim uang / data lagi', icon: 'Money' },
  { id: 'R8', label: 'Tunggu saja', icon: 'Hourglass' },
];

const all = ['R1', 'R2', 'R3', 'R4'];
const three = ['R2', 'R3', 'R4'];
export const actScenarios = [
  { id: 'ACT-01', title: 'OTP terlanjur dibagikan.', icon: 'Phone', text: 'Kamu baru sadar telah menyebutkan OTP kepada penelepon yang mengaku petugas layanan.', required: all, explanation: 'Amankan akses segera, hubungi penyedia jasa melalui kanal resmi, simpan bukti komunikasi, dan laporkan melalui kanal resmi yang relevan.' },
  { id: 'ACT-02', title: 'Ternyata bukan atasanmu.', icon: 'ChatCircleText', text: 'Kamu baru sadar telah mentransfer uang ke rekening yang dikirim oleh orang yang menyamar sebagai atasan.', required: three, explanation: 'Hubungi penyedia jasa secepatnya, simpan seluruh bukti, dan lakukan pelaporan melalui kanal resmi. Jangan transfer lagi.' },
  { id: 'ACT-03', title: 'File kurir sudah terpasang.', icon: 'EnvelopeSimple', text: 'Kamu menginstal file dari pesan yang mengaku jasa pengiriman. Setelah itu, kamu merasa perangkat tidak aman.', required: all, explanation: 'Amankan akun dan perangkat, hubungi penyedia jasa yang terkait, simpan bukti pesan atau file, dan laporkan melalui kanal resmi.' },
  { id: 'ACT-04', title: 'QRIS ke penerima yang salah.', icon: 'QrCode', text: 'Setelah membayar QRIS, kamu sadar nama penerima berbeda dari merchant tempat kamu bertransaksi.', required: three, explanation: 'Segera hubungi penyedia jasa, simpan detail transaksi dan bukti QR atau merchant, lalu lakukan pengaduan melalui kanal resmi.' },
  { id: 'ACT-05', title: 'Password masuk ke situs palsu.', icon: 'LockKey', text: 'Kamu baru sadar telah memasukkan user ID dan password pada halaman yang ternyata bukan situs resmi.', required: all, explanation: 'Amankan password dan akses akun, hubungi penyedia jasa melalui kanal resmi, simpan bukti tautan atau situs, dan laporkan.' },
  { id: 'ACT-06', title: 'Akunmu diambil alih.', icon: 'ShieldCheck', text: 'Kamu tiba-tiba tidak bisa mengakses akun setelah interaksi mencurigakan dan menduga akun telah diambil alih.', required: all, explanation: 'Lakukan pengamanan atau pemulihan akun, segera hubungi penyedia jasa, simpan bukti, dan laporkan melalui kanal resmi.' },
  { id: 'ACT-07', title: 'Deposit kerja sudah dibayar.', icon: 'Money', text: 'Kamu telah membayar deposit untuk pekerjaan paruh waktu dan baru menyadari pola penipuannya.', required: three, explanation: 'Hubungi penyedia jasa, simpan bukti transfer dan percakapan, lalu laporkan. Jangan membayar deposit tambahan.' },
  { id: 'ACT-08', title: 'Ada transaksi bukan milikmu.', icon: 'CreditCard', text: 'Kamu melihat transaksi kartu atau debit yang tidak kamu lakukan pada notifikasi atau mutasi rekening.', required: all, explanation: 'Amankan kartu atau akun sesuai fasilitas yang tersedia, hubungi penyedia jasa, simpan detail transaksi, dan ajukan pengaduan melalui kanal resmi.' },
  { id: 'ACT-09', title: 'Investasinya ternyata palsu.', icon: 'Money', text: 'Kamu telah mentransfer dana ke investasi yang ternyata menggunakan identitas dan janji keuntungan palsu.', required: three, explanation: 'Hubungi penyedia jasa terkait transaksi, simpan bukti penawaran dan transfer, lalu laporkan melalui kanal resmi. Jangan kirim dana tambahan.' },
  { id: 'ACT-10', title: 'Perangkatmu diakses orang lain.', icon: 'DeviceMobile', text: 'Kamu mengikuti instruksi orang tak dikenal untuk memasang aplikasi akses jarak jauh dan sempat membuka aplikasi pembayaran.', required: all, explanation: 'Hentikan akses jarak jauh dan amankan perangkat serta akun, hubungi penyedia jasa, simpan bukti, dan laporkan melalui kanal resmi.' },
].map(s => ({ ...s, targetTime: s.required.length === 3 ? 18 : 22 }));

export const settings = { stopCount: 5, abandonMs: 90_000, resultResetMs: 45_000, debriefMs: 5_000 };

// Inbox Phishing: binary decision per message. The backend keeps its own copy
// of `scam` and scores from the recorded choices, so a tampered client cannot
// inflate a score; this copy only drives the on-screen feedback.
export const inboxMessages = [
  { id: 'm1', sender: 'JNE-Info', channel: 'SMS', waktu: '09:12', isi: 'Paket Anda tertahan. Bea Rp 0 wajib konfirmasi data: http://jne-resi.xyz/cek', scam: true, alasan: 'Domain aneh (jne-resi.xyz, bukan jne.co.id) dan minta konfirmasi data lewat tautan. Kurir asli tidak begitu.' },
  { id: 'm2', sender: 'Mama', channel: 'WhatsApp', waktu: '10:03', isi: 'Nak, tolong belikan mama pulsa 50rb ya nanti mama ganti. Makasih sayang.', scam: false, alasan: 'Pesan wajar dari kontak tersimpan. Tetap konfirmasi lewat telepon kalau jumlahnya besar, tetapi ini bukan phishing.' },
  { id: 'm3', sender: '+62 838-xxxx', channel: 'WhatsApp', waktu: '11:20', isi: 'Selamat! Anda pemenang undian BRI Rp 175jt. Klaim hadiah, buka file: Undangan.apk', scam: true, alasan: 'File .apk adalah aplikasi pencuri data. Undian yang tidak pernah kamu ikuti plus permintaan memasang aplikasi berarti penipuan.' },
  { id: 'm4', sender: 'PLN', channel: 'SMS', waktu: '13:45', isi: 'Tagihan listrik Anda Rp 234.500 jatuh tempo hari ini. Bayar via aplikasi PLN Mobile resmi.', scam: false, alasan: 'Tidak ada tautan mencurigakan dan tidak minta data. Pesan mengarahkan ke aplikasi resmi.' },
  { id: 'm5', sender: 'Bank-BCA', channel: 'SMS', waktu: '15:30', isi: 'NASABAH YTH, m-Banking Anda akan NONAKTIF. Aktivasi ulang: bit.ly/bca-verif2024', scam: true, alasan: 'Tautan pemendek menyembunyikan alamat asli dan ada ancaman nonaktif. Bank tidak meminta verifikasi lewat tautan SMS.' },
  { id: 'm6', sender: 'Andi (Kantor)', channel: 'WhatsApp', waktu: '16:10', isi: 'Bro, notulen rapat tadi sudah aku share di Google Drive tim ya. Cek folder Q3.', scam: false, alasan: 'Kontak dikenal, konteks jelas, dan tidak meminta kredensial. Pesan kerja biasa.' },
];

export const callScenario = {
  caller: '+62 811-2000-xxxx',
  claim: 'Mengaku Divisi Keamanan Bank Indonesia',
  message: 'Rekening Anda terindikasi transaksi mencurigakan dan akan diblokir dalam 1x24 jam.',
  explanation: 'Bank Indonesia bukan bank umum dan tidak mengurus rekening pribadi nasabah. Tutup panggilan, jangan berikan OTP, PIN, kata sandi, atau data kartu, lalu verifikasi lewat kanal resmi yang Anda cari sendiri.',
};

export const redFlagRounds = [
  {
    id: 'raffi', profileName: 'Tim Apresiasi Pelanggan', number: '+62 813-2288-xxxx', channel: 'WhatsApp',
    tokens: [
      { text: 'Selamat malam, kami dari ' },
      { text: 'tim resmi program loyalitas bank Anda', flag: true, actionKey: 'raffi:0-1', why: 'Klaim identitas belum terbukti. Verifikasi program lewat aplikasi atau nomor resmi bank.' },
      { text: '. Kakak terpilih menang ' },
      { text: 'apresiasi pelanggan senilai Rp 2.500.000', flag: true, actionKey: 'raffi:1-1', why: 'Tawaran hadiah belum terverifikasi.' },
      { text: '. Buat cairin, transfer dulu ' },
      { text: 'biaya admin Rp 500rb', flag: true, actionKey: 'raffi:2-1', why: 'Hadiah asli tidak meminta pembayaran di depan.' },
      { text: '. ' },
      { text: 'Jangan bilang siapa-siapa', flag: true, actionKey: 'raffi:3-0', why: 'Larangan bertanya kepada orang lain adalah taktik agar modus tidak ketahuan.' },
      { text: '.' },
    ],
  },
  {
    id: 'bansos', profileName: 'Info Bansos', number: '+62 838-9910-xxxx', channel: 'SMS',
    tokens: [
      { text: 'Selamat! Anda terdaftar penerima ' },
      { text: 'bantuan periode ini sebesar Rp 600.000', flag: true, actionKey: 'bansos:0-1', why: 'Iming-iming uang tanpa pernah mendaftar perlu dicurigai.' },
      { text: '. Segera daftar dalam ' },
      { text: '30 menit', flag: true, actionKey: 'bansos:0-3', why: 'Tekanan waktu dipakai agar Anda panik.' },
      { text: ' di ' },
      { text: 'https://layanan-bantuan.example/verifikasi', flag: true, actionKey: 'bansos:0-5', why: 'Alamat ini bukan kanal pemerintah yang terverifikasi.' },
      { text: ' dan ' },
      { text: 'masukkan kode OTP', flag: true, actionKey: 'bansos:0-7', why: 'OTP tidak boleh diberikan kepada pengirim pesan.' },
      { text: '.' },
    ],
  },
  {
    id: 'lowongan', profileName: 'HRD PT Maju', number: '+62 812-7745-xxxx', channel: 'Pesan langsung',
    tokens: [
      { text: 'Halo, saya ' },
      { text: 'HRD PT Maju Jaya', flag: true, actionKey: 'lowongan:0-1', why: 'Pengirim mengaku perekrut padahal Anda tidak pernah melamar.' },
      { text: '. Anda lolos kerja ' },
      { text: 'tanpa wawancara atau pemeriksaan pengalaman', flag: true, actionKey: 'lowongan:0-3', why: 'Proses seleksi dilewati agar tawaran cepat diterima.' },
      { text: '. Cukup ' },
      { text: 'bayar biaya admin Rp 250rb', flag: true, actionKey: 'lowongan:0-5', why: 'Lowongan asli tidak meminta pembayaran di depan.' },
      { text: '. Balas cepat, ' },
      { text: 'kuota terbatas', flag: true, actionKey: 'lowongan:0-7', why: 'Desakan ini menciptakan rasa takut kehilangan kesempatan.' },
      { text: '!' },
    ],
  },
];

export const qrScenarios = [
  { id: 'warung', location: 'Warung Makan Pak Budi', detail: 'Satu porsi makan Rp25.000. QR berada pada dudukan akrilik di meja.', merchant: 'Warung Makan Pak Budi', amount: 25000, expected: 25000, safe: true, explanation: 'Kasir mengonfirmasi penerima dan nominal sesuai pesanan.' },
  { id: 'parkiran', location: 'Parkiran Mall Grand City', detail: 'Tarif parkir Rp5.000. Tepi stiker lama sedikit terlihat.', merchant: 'PT Digital Pay Nusantara', amount: 5000, expected: 5000, safe: false, explanation: 'Petugas tidak mengenali penerima. Pembayaran harus dihentikan.' },
  { id: 'apotek', location: 'Apotek Sehat Farma', detail: 'Kasir menunjukkan QR. Harga pada struk Rp147.500.', merchant: 'CV Sehat Sentosa', amount: 147500, expected: 147500, safe: true, explanation: 'Nama legal dapat berbeda dari nama toko. Kasir mengonfirmasi identitas usaha dan nominal.' },
  { id: 'kopi', location: 'Pedagang Kopi', detail: 'Pesanan kopimu Rp15.000.', merchant: 'Kopi Pak Agus', amount: 150000, expected: 15000, safe: false, explanation: 'Nama merchant benar tidak cukup. Nominal Rp150.000 berbeda dari harga Rp15.000.' },
  { id: 'poster', location: 'Poster Donasi', detail: 'Poster publik mengajak donasi Rp50.000. Identitas organisasi tidak jelas.', merchant: 'Top Up Akun Digital', amount: 50000, expected: 50000, safe: false, explanation: 'Penerima tidak terkait organisasi yang dapat diverifikasi.' },
];

export const reportScenarios = [
  { id: 'bi', sender: 'Tante Rina', fraudType: 'Mengatasnamakan BI', message: 'Orang yang mengaku dari BI meminta transfer biaya administrasi agar rekening tidak diblokir. Harus lapor ke mana?', choices: ['Lapor ke polisi langsung', 'Jangan transfer, simpan bukti, lalu verifikasi ke BI Bicara 131', 'Blokir saja nomornya'], correctIndex: 1, explanation: 'Hentikan interaksi dan simpan bukti. Gunakan BI Bicara 131 untuk informasi atau pengaduan terkait BI.' },
  { id: 'qris', sender: 'Abang Yusuf', fraudType: 'Penipuan QRIS', message: 'Uang parkir masuk ke rekening orang lain karena QR palsu. Apa yang harus dilakukan?', choices: ['Scan ulang QR yang sama', 'Hubungi Bank atau PJP, simpan bukti, lalu lapor ke IASC dan polisi', 'Lapor ke RT atau RW'], correctIndex: 1, explanation: 'Segera hubungi Bank atau PJP dan lapor ke IASC untuk jalur finansial. Buat Laporan Polisi bila perlu proses hukum.' },
  { id: 'akun-diretas', sender: 'Dinda', fraudType: 'Akun Medsos Diretas', message: 'Akun Instagram diretas dan pelaku meminta tebusan. Apa langkah yang tepat?', choices: ['Bayar agar cepat selesai', 'Buat akun baru saja', 'Pulihkan lewat platform, amankan email dan sesi, lalu laporkan pemerasan'], correctIndex: 2, explanation: 'Pulihkan akun lewat jalur resmi, amankan email, keluarkan sesi lain, aktifkan MFA, dan jangan bayar tebusan.' },
  { id: 'undian-palsu', sender: 'Om Hendra', fraudType: 'SMS Undian Palsu', message: 'SMS undian meminta biaya admin Rp150.000 agar hadiah cair. Apa yang harus dilakukan?', choices: ['Transfer untuk mengecek', 'Telepon nomor dalam SMS', 'Jangan transfer. Simpan SMS dan laporkan nomor ke AduanNomor'], correctIndex: 2, explanation: 'Undian yang meminta biaya admin adalah tanda penipuan. Jangan transfer atau menghubungi nomor tersebut.' },
];
