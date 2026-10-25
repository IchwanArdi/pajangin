export type PageHelpKey =
  | 'ringkasan'
  | 'pesan'
  | 'layanan'
  | 'galeri'
  | 'booking'
  | 'ai'
  | 'qr-bio'
  | 'profil'
  | 'akun';

export type PageHelpContent = {
  title: string;
  intro: string;
  items: Array<{ label: string; text: string }>;
};

/*
 * Satu sumber copy panduan dashboard. Dipakai oleh tombol bantuan di PageHeader
 * dan bisa dipakai ulang oleh panduan cepat di halaman Bantuan.
 * Definisi angka harus mengikuti perhitungan backend: pengunjung = session unik,
 * klik kontak = klik WhatsApp/telepon, bukan chat yang benar-benar terkirim.
 */
export const PAGE_HELP: Record<PageHelpKey, PageHelpContent> = {
  ringkasan: {
    title: 'Panduan Ringkasan',
    intro: 'Halaman ini merangkum aktivitas halaman bisnis Anda. Angka mulai terisi setelah link dibagikan.',
    items: [
      {
        label: 'Klik kontak',
        text: 'Berapa kali tombol WhatsApp atau telepon ditekan. Ini belum berarti chat atau panggilan sudah terkirim.',
      },
      {
        label: 'Pesan form',
        text: 'Jumlah orang yang mengisi form kontak di halaman publik.',
      },
      {
        label: 'Rasio klik kontak',
        text: 'Dari 100 pengunjung, berapa yang menekan tombol WhatsApp atau telepon.',
      },
      {
        label: 'Halaman dilihat',
        text: 'Total halaman yang dibuka. Satu pengunjung bisa membuka halaman lebih dari sekali.',
      },
      {
        label: 'Sumber pengunjung',
        text: 'Dari mana orang menemukan halaman Anda. “Langsung / link” berarti dari link yang dibagikan atau alamat yang diketik.',
      },
      {
        label: 'Layanan paling dilirik',
        text: '“Buka layanan” menghitung detail layanan yang dibuka. “Klik WA” menghitung tombol WhatsApp yang ditekan dari layanan itu.',
      },
    ],
  },
  pesan: {
    title: 'Panduan Pesan masuk',
    intro: 'Halaman ini hanya mencatat pesan dari form kontak di halaman publik.',
    items: [
      {
        label: 'Bukan chat WhatsApp',
        text: 'Chat yang masuk langsung ke HP Anda tidak otomatis muncul di dashboard. Halaman ini hanya untuk pesan yang dikirim lewat form.',
      },
      {
        label: 'Balas via WhatsApp',
        text: 'Membuka chat baru ke nomor pelanggan. Pesan tidak terkirim otomatis; Anda tetap perlu menekan kirim di WhatsApp.',
      },
      {
        label: 'Pesan dengan detail',
        text: 'Pesan yang menyertakan kebutuhan, pertanyaan, atau layanan yang diminati.',
      },
    ],
  },
  layanan: {
    title: 'Panduan Layanan',
    intro: 'Layanan dan harga yang jelas membantu pelanggan memutuskan lebih cepat.',
    items: [
      {
        label: 'Urutan',
        text: 'Urutan di dashboard sama dengan urutan di halaman publik. Gunakan panah untuk menggeser.',
      },
      {
        label: 'Andalan',
        text: 'Layanan bertanda bintang tampil lebih menonjol dengan badge “Populer” di halaman publik.',
      },
      {
        label: 'Harga',
        text: 'Kosongkan harga jika perlu konsultasi. Pelanggan tetap bisa menghubungi Anda.',
      },
      {
        label: 'Foto dan keterangan',
        text: 'Foto tampil di kartu layanan. Keterangan membantu pelanggan tahu apa yang termasuk.',
      },
    ],
  },
  galeri: {
    title: 'Panduan Galeri',
    intro: 'Galeri menampilkan foto tambahan di halaman publik.',
    items: [
      {
        label: 'Beda dengan foto utama',
        text: 'Foto utama diatur di Profil bisnis dan tampil besar di bagian atas halaman. Galeri untuk foto lain seperti menu, hasil kerja, dan suasana.',
      },
      {
        label: 'Kategori',
        text: 'Membantu pengunjung menyaring foto. Kategori tidak wajib diisi.',
      },
      {
        label: 'Urutan',
        text: 'Gunakan panah pada foto untuk mengatur urutan tampil di halaman publik.',
      },
    ],
  },
  booking: {
    title: 'Panduan Booking',
    intro: 'Booking online membuat pelanggan bisa memilih tanggal dan jam sendiri.',
    items: [
      {
        label: 'Menunggu',
        text: 'Pelanggan sudah memesan, tetapi belum Anda konfirmasi.',
      },
      {
        label: 'Dikonfirmasi',
        text: 'Anda sudah menyetujui jadwalnya. Gunakan tombol “Konfirmasi & Chat WA” untuk memberi tahu pelanggan.',
      },
      {
        label: 'Selesai',
        text: 'Pelanggan sudah datang atau layanan sudah diberikan.',
      },
      {
        label: 'Dibatalkan',
        text: 'Jadwal tidak jadi. Data tetap tersimpan sampai Anda menghapusnya.',
      },
      {
        label: 'Booking online vs chat',
        text: 'Booking mengisi tanggal dan jam. Chat WhatsApp tetap bisa dipakai untuk pertanyaan lain.',
      },
    ],
  },
  ai: {
    title: 'Panduan AI Konten',
    intro: 'AI membantu membuat draft. Hasilnya belum tentu benar dan tetap perlu Anda periksa.',
    items: [
      {
        label: 'Draft, bukan fakta',
        text: 'Periksa harga, alamat, janji, dan klaim sebelum dipakai. AI bisa membuat detail yang tidak sesuai.',
      },
      {
        label: 'Terapkan ke profil',
        text: 'Mengganti isi profil yang terkait. Pastikan hasilnya sudah sesuai sebelum menerapkan.',
      },
      {
        label: 'Kuota',
        text: 'Ada batas generate per akun per hari. Kuota direset setiap hari (WIB).',
      },
    ],
  },
  'qr-bio': {
    title: 'Panduan QR & Bio',
    intro: 'Tiga tujuan QR memiliki fungsi yang berbeda.',
    items: [
      {
        label: 'Link bio',
        text: 'Halaman ringkas untuk bio Instagram, TikTok, atau status WhatsApp.',
      },
      {
        label: 'Website utama',
        text: 'Halaman bisnis lengkap dengan layanan, galeri, dan booking.',
      },
      {
        label: 'Chat WhatsApp',
        text: 'Langsung membuka chat dengan pesan yang sudah disiapkan.',
      },
    ],
  },
  profil: {
    title: 'Panduan Profil bisnis',
    intro: 'Data di sini tampil di halaman publik dan membantu orang menemukan Anda di Google.',
    items: [
      {
        label: 'Slogan',
        text: 'Kalimat pendek di bawah nama bisnis. Contoh: “Servis cepat, harga jujur”.',
      },
      {
        label: 'Judul di Google',
        text: 'Judul biru di hasil pencarian. Kosongkan jika ingin dibuat otomatis.',
      },
      {
        label: 'Deskripsi di Google',
        text: 'Ringkasan 1–2 kalimat di bawah judul hasil pencarian.',
      },
      {
        label: 'Booking online',
        text: 'Menampilkan form booking di halaman publik. Pelanggan memilih tanggal dan jam sendiri.',
      },
      {
        label: 'Testimoni',
        text: 'Tambahkan hanya ulasan asli yang sudah Anda terima. Jangan membuat ulasan palsu.',
      },
    ],
  },
  akun: {
    title: 'Panduan Akun',
    intro: 'Akun digunakan untuk masuk. Profil bisnis adalah halaman yang dilihat pelanggan.',
    items: [
      {
        label: 'Akun vs profil bisnis',
        text: 'Mengubah akun tidak mengubah halaman publik. Untuk halaman publik, buka Profil bisnis.',
      },
      {
        label: 'Hapus akun',
        text: 'Menghapus akun juga menghapus bisnis, foto, dan data terkait secara permanen.',
      },
    ],
  },
};
