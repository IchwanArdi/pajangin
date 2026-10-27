// Konten landing page Pajangin — data terpusat, tanpa JSX.
//
// PRINSIP (anti-slop): hanya menuliskan fakta produk yang benar-benar ada di aplikasi.
// Setiap angka, testimoni, atau harga yang belum final WAJIB ditandai placeholder.

// 11 kategori usaha yang memang didukung produk (selaras lib/categories.ts)
export const CATEGORY_MARQUEE = [
  'Bengkel & Otomotif',
  'Kedai Kopi & Cafe',
  'Restoran & Kuliner',
  'Laundry',
  'Salon & Barbershop',
  'Kecantikan & Spa',
  'Kesehatan & Klinik',
  'Pendidikan & Kursus',
  'Jasa Rumah Tangga',
  'Toko & Retail',
] as const;

// Masalah nyata pemilik usaha → bagaimana Pajangin menjawabnya
export const PAIN_POINTS = [
  {
    problem: 'Tidak punya website, hanya link Instagram.',
    detail: 'Calon pelanggan tidak menemukan harga, jam buka, atau lokasi dalam satu tempat.',
    solution: 'Halaman publik sendiri',
    answer:
      'Satu halaman berisi layanan, harga, lokasi, jam buka, dan tombol WhatsApp — bisa dibagikan sebagai satu link.',
  },
  {
    problem: 'Sudah punya website, tapi tidak ada yang menghubungi.',
    detail: 'Situs statis tanpa jalur kontak jelas dan tanpa data siapa yang datang.',
    solution: 'WhatsApp-first + pelacakan',
    answer:
      'Setiap tombol kontak tercatat sebagai event. Anda tahu layanan mana yang benar-benar menghasilkan chat.',
  },
  {
    problem: 'Tidak tahu bagian mana yang perlu diperbaiki.',
    detail: 'Punya angka kunjungan, tapi tidak tahu langkah berikutnya.',
    solution: 'Insight yang bisa dieksekusi',
    answer:
      'Sistem menandai layanan yang ramai diklik tapi sepi chat, lalu memberi rekomendasi konkret.',
  },
] as const;

// Fitur pendukung (kartu kecil) — semua nyata di dashboard
export const MINI_FEATURES = [
  {
    key: 'ai',
    title: 'AI Konten',
    desc: 'Bantu tulis deskripsi bisnis, layanan, tagline, meta SEO, hingga balasan WhatsApp.',
  },
  {
    key: 'qr',
    title: 'QR & Link in Bio',
    desc: 'QR untuk stiker/banner toko dan halaman link-in-bio siap tempel di Instagram.',
  },
  {
    key: 'booking',
    title: 'Booking & Reservasi',
    desc: 'Pelanggan memilih layanan, tanggal, dan jam; Anda mengelola statusnya dari dashboard.',
  },
  {
    key: 'galeri',
    title: 'Galeri Foto',
    desc: 'Unggah foto menu, hasil kerja, atau interior — bukan cuma satu gambar utama.',
  },
] as const;

// Perbandingan jujur: cara lama vs Pajangin (tanpa klaim angka kompetitor)
export const COMPARISON_ROWS = [
  {
    aspect: 'Satu link untuk dibagikan',
    old: 'Link Instagram + chat pribadi terpisah',
    now: 'Halaman publik beralamat sendiri',
  },
  {
    aspect: 'Harga & layanan',
    old: 'Diketik ulang di setiap balasan chat',
    now: 'Tercantum rapi, bisa diubah kapan saja',
  },
  {
    aspect: 'Ditemukan di Google',
    old: 'Bergantung pada bio sosial media',
    now: 'Metadata SEO + Schema.org bawaan',
  },
  {
    aspect: 'Tahu hasilnya',
    old: 'Tidak ada catatan',
    now: 'Pengunjung, sumber trafik, dan klik kontak',
  },
  {
    aspect: 'Tampilan',
    old: 'Sama untuk semua jenis usaha',
    now: 'Template sesuai kategori bisnis',
  },
  {
    aspect: 'Pesan masuk',
    old: 'Tercecer di banyak aplikasi',
    now: 'Satu jalur WhatsApp + notifikasi',
  },
] as const;

// FAQ diperluas
export const FAQS = [
  {
    q: 'Apakah saya perlu hosting atau domain sendiri?',
    a: 'Tidak. Pajangin menyiapkan halaman publik dan dashboard; Anda cukup masuk dengan akun Google dan mengisi profil bisnis.',
  },
  {
    q: 'Apakah link halaman bisa dibagikan?',
    a: 'Bisa. Setiap bisnis punya link publik yang dapat dibagikan ke WhatsApp, Instagram, status, atau dicetak sebagai QR.',
  },
  {
    q: 'Apakah saya bisa mengganti foto dan layanan nanti?',
    a: 'Bisa. Logo, foto utama, galeri, layanan, harga, dan deskripsi dapat diubah kapan saja dari dashboard.',
  },
  {
    q: 'Apakah halaman saya bisa muncul di Google?',
    a: 'Halaman dilengkapi metadata judul/deskripsi dan struktur Schema.org LocalBusiness agar lebih mudah dikenali mesin pencari.',
  },
  {
    q: 'Bagaimana saya tahu ada pelanggan yang menghubungi?',
    a: 'Setiap klik WhatsApp, telepon, form kontak, atau pengajuan booking tercatat di dashboard. Pesan dari form kontak juga muncul di menu Pesan beserta nomor WhatsApp-nya.',
  },
  {
    q: 'Apakah Pajangin benar-benar gratis?',
    a: 'Ya. Semua fitur inti terbuka tanpa langganan: halaman publik, layanan, galeri, booking, QR & Link in Bio, analitik, dan AI Konten. Ada batas wajar untuk AI, foto galeri, dan notifikasi WhatsApp agar biaya layanan tetap terkendali.',
  },
  {
    q: 'Bisakah satu akun mengelola lebih dari satu bisnis?',
    a: 'Bisa. Anda dapat memiliki beberapa bisnis dan berpindah di antaranya lewat pemilih bisnis di dashboard.',
  },
  {
    q: 'Apakah saya harus bisa menulis konten?',
    a: 'Tidak. Ada AI Konten untuk membantu menyusun deskripsi bisnis, layanan, tagline, dan meta SEO dalam bahasa Indonesia.',
  },
  {
    q: 'Apakah cocok untuk usaha saya?',
    a: 'Pajangin dibuat untuk usaha lokal seperti bengkel, kafe, laundry, salon, klinik, toko retail, dan kursus — dengan template yang menyesuaikan kategori.',
  },
] as const;

// Model produk: 100% gratis, tanpa langganan. Batas wajar menjaga biaya AI,
// storage, dan gateway WhatsApp tetap terkendali.
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  placeholder: boolean;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    price: 'Rp 0',
    period: 'selamanya',
    placeholder: false,
    tagline: 'Semua fitur inti terbuka untuk usaha lokal. Tanpa langganan, tanpa paywall.',
    features: [
      'Halaman publik + tombol WhatsApp & telepon',
      'Layanan, harga, galeri foto, dan FAQ',
      'Analitik pengunjung, sumber trafik, dan klik kontak',
      'Form kontak + menu Pesan di dashboard',
      'Booking, QR & Link in Bio, dan AI Konten',
      'Beberapa bisnis dalam satu akun',
    ],
    cta: 'Buat halaman gratis',
    featured: true,
  },
];

// Navigasi footer
export const FOOTER_GROUPS = [
  {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '/#fitur' },
      { label: 'Cara kerja', href: '/#cara-kerja' },
      { label: 'Template', href: '/#template' },
      { label: 'Contoh tampilan', href: '/contoh' },
    ],
  },
  {
    title: 'Mulai',
    links: [
      { label: 'Masuk dengan Google', href: '/login' },
      { label: 'Harga', href: '/pricing' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Untuk usaha',
    links: [
      { label: 'Bengkel & otomotif', href: '/contoh' },
      { label: 'Kafe & kuliner', href: '/contoh' },
      { label: 'Salon & kecantikan', href: '/contoh' },
      { label: 'Klinik & kesehatan', href: '/contoh' },
    ],
  },
] as const;
