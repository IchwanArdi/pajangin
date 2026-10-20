/**
 * Seeder data contoh halaman bisnis (DEV ONLY — bukan data produksi).
 *
 * - Membuat 6 bisnis contoh (satu per template kategori) milik satu user demo.
 * - Foto memakai URL eksternal picsum.photos → kebutuhan review desain, bukan produksi.
 * - Idempoten: aman dijalankan berulang. Layanan & galeri lama dihapus lalu ditulis ulang.
 *
 * Jalankan (dari root repo):
 *   pnpm --filter backend build
 *   node apps/backend/dist/scripts/seed-demo.js
 */
import { config as loadEnv } from 'dotenv';
import * as path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

loadEnv({ path: path.resolve(import.meta.dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL belum di-set. Pastikan apps/backend/.env ada.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_EMAIL = 'demo@pajangin.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/** Foto placeholder deterministik dari picsum (seed sama → gambar sama). */
const pic = (seed: string, width: number, height: number) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

interface DemoService {
  name: string;
  price: number | null;
  pricePrefix?: string | null;
  description?: string;
  category?: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
}

interface DemoImage {
  url: string;
  caption?: string;
  category?: string;
}

interface DemoBusiness {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string | null;
  whatsapp: string;
  openingHours: string;
  serviceArea: string | null;
  rating: number;
  reviewCount: number;
  priceRange: string | null;
  googleMapsUrl: string;
  instagramUrl: string | null;
  bookingEnabled: boolean;
  template: string;
  themeColor: string;
  heroImageUrl: string | null;
  faq: Array<{ question: string; answer: string }>;
  testimonials: Array<{ name: string; rating: number; message: string }>;
  services: DemoService[];
  images: DemoImage[];
}

const DEMO_BUSINESSES: DemoBusiness[] = [
  /* ---------------- BENGKEL (workshop) ---------------- */
  {
    slug: 'bengkel-maju-jaya',
    name: 'Bengkel Maju Jaya',
    tagline: 'Servis mobil & AC, estimasi biaya jelas sebelum dikerjakan.',
    category: 'Bengkel Mobil',
    description:
      'Bengkel umum untuk servis rutin, AC, kelistrikan, dan perbaikan mesin. Mekanik berpengalaman, suku cadang bergaransi, dan estimasi biaya disampaikan di muka.',
    address: 'Jl. Gerilya No. 12, Karangklesem',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: '0281-635123',
    whatsapp: '6281234567890',
    openingHours: 'Senin–Sabtu 08.00–17.00',
    serviceArea: 'Purwokerto & sekitarnya',
    rating: 4.8,
    reviewCount: 127,
    priceRange: 'Rp 75.000 – Rp 1.500.000',
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+Gerilya+No.+12+Purwokerto',
    instagramUrl: 'https://instagram.com/bengkelmajujayapwt',
    bookingEnabled: true,
    template: 'workshop',
    themeColor: '#0284c7',
    heroImageUrl: pic('bengkel-hero', 1600, 1000),
    faq: [
      {
        question: 'Apakah harus booking dulu sebelum servis?',
        answer:
          'Tidak wajib, tapi disarankan booking via WhatsApp supaya tidak menunggu lama — terutama akhir pekan.',
      },
      {
        question: 'Berapa lama servis AC mobil?',
        answer: 'Umumnya 1–2 jam untuk cuci dan isi freon, tergantung kondisi AC dan antrean.',
      },
      {
        question: 'Apakah suku cadang bergaransi?',
        answer: 'Ya, suku cadang resmi bergaransi sesuai merek. Garansi jasa servis 7 hari untuk keluhan yang sama.',
      },
      {
        question: 'Bisa panggilan ke rumah?',
        answer: 'Untuk kasus darurat seperti aki tekor atau ban, kami bisa datang sesuai jarak. Tanyakan dulu via WhatsApp.',
      },
    ],
    testimonials: [
      {
        name: 'Hendra S.',
        rating: 5,
        message: 'AC mobil saya sudah lama tidak dingin. Dicek detail, dikasih estimasi dulu, baru dikerjakan. Sekarang dingin lagi.',
      },
      {
        name: 'Rina W.',
        rating: 5,
        message: 'Servis rem dan ganti oli selesai lebih cepat dari perkiraan. Harga sesuai estimasi awal, tidak ada biaya kejutan.',
      },
    ],
    services: [
      {
        name: 'Servis AC Mobil',
        price: 150000,
        description: 'Cuci evaporator, isi freon, dan cek kebocoran. Termasuk pengecekan kelistrikan AC.',
        category: 'AC & Kelistrikan',
        imageUrl: pic('bengkel-ac', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'Tune Up Ringan',
        price: 250000,
        description: 'Ganti oli, filter udara, busi, dan pemeriksaan 20 titik.',
        category: 'Servis Rutin',
        imageUrl: pic('bengkel-tuneup', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'Ganti Oli & Filter',
        price: 85000,
        description: 'Oli mesin sesuai spesifikasi mobil, plus filter oli baru.',
        category: 'Servis Rutin',
      },
      {
        name: 'Servis Rem Depan & Belakang',
        price: 120000,
        description: 'Pengecekan kampas, cakram, dan sistem rem hidrolik.',
        category: 'Servis Rutin',
      },
      {
        name: 'Kelistrikan & Aki',
        price: 95000,
        description: 'Diagnosa kelistrikan, cek aki, dan perbaikan kabel.',
        category: 'AC & Kelistrikan',
      },
      {
        name: 'Servis Berkala Besar',
        price: 450000,
        description: 'Servis lengkap sesuai rekomendasi pabrikan, termasuk cek mesin dan kaki-kaki.',
        category: 'Servis Rutin',
      },
      {
        name: 'Panggilan Darurat',
        price: null,
        pricePrefix: 'Biaya cek',
        description: 'Konsultasi dulu via WhatsApp; biaya menyesuaikan kasus dan jarak.',
        category: 'Darurat',
      },
    ],
    images: [
      { url: pic('bengkel-g1', 1200, 900), caption: 'Hasil servis AC — sebelum & sesudah', category: 'before-after' },
      { url: pic('bengkel-g2', 1200, 900), caption: 'Area servis dan lift hidrolik', category: 'fasilitas' },
      { url: pic('bengkel-g3', 1200, 900), caption: 'Ruang tunggu pelanggan', category: 'interior' },
      { url: pic('bengkel-g4', 1200, 900), caption: 'Pengecekan rem depan', category: 'portfolio' },
      { url: pic('bengkel-g5', 1200, 900), caption: 'Ganti oli dan filter', category: 'portfolio' },
      { url: pic('bengkel-g6', 1200, 900), caption: 'Tune up mesin 1500cc', category: 'portfolio' },
    ],
  },

  /* ---------------- KULINER (restaurant) ---------------- */
  {
    slug: 'kopi-pagi',
    name: 'Kopi Pagi',
    tagline: 'Kopi manual brew, sarapan, dan tempat kerja santai di pusat kota.',
    category: 'Kedai Kopi & Cafe',
    description:
      'Kedai kopi dengan biji lokal, menu sarapan, dan wifi cepat. Cocok untuk kerja santai atau ngobrol sore.',
    address: 'Jl. Jenderal Sudirman No. 24',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: null,
    whatsapp: '6281234567891',
    openingHours: 'Setiap hari 07.00–22.00',
    serviceArea: null,
    rating: 4.7,
    reviewCount: 219,
    priceRange: 'Rp 12.000 – Rp 45.000',
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+Jenderal+Sudirman+No.+24+Purwokerto',
    instagramUrl: 'https://instagram.com/kopipagi.pwt',
    bookingEnabled: true,
    template: 'restaurant',
    themeColor: '#854d0e',
    heroImageUrl: pic('kopi-hero', 1920, 1200),
    faq: [
      { question: 'Apakah ada colokan dan wifi?', answer: 'Ada. Semua meja dekat colokan dan wifi gratis untuk pelanggan.' },
      {
        question: 'Bisa reservasi untuk acara kecil?',
        answer: 'Bisa, untuk 10–20 orang. Hubungi kami via WhatsApp untuk cek ketersediaan.',
      },
      { question: 'Buka setiap hari?', answer: 'Buka setiap hari 07.00–22.00, termasuk hari libur nasional.' },
    ],
    testimonials: [
      { name: 'Dian P.', rating: 5, message: 'Kopi susu gula arennya konsisten enak, tempatnya nyaman buat kerja pagi.' },
      {
        name: 'Yoga',
        rating: 4,
        message: 'Nasi goreng kampungnya porsi pas dan cepat datangnya. Sering mampir sebelum kantor.',
      },
    ],
    services: [
      {
        name: 'Es Kopi Susu Gula Aren',
        price: 22000,
        pricePrefix: null,
        description: 'Signature kami: espresso, susu segar, dan gula aren asli.',
        category: 'Kopi',
        imageUrl: pic('kopi-es', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'Nasi Goreng Kampung',
        price: 28000,
        pricePrefix: null,
        description: 'Nasi goreng dengan telur mata sapi, kerupuk, dan acar.',
        category: 'Makanan',
        imageUrl: pic('kopi-nasgor', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'V60 Single Origin',
        price: 28000,
        pricePrefix: null,
        description: 'Biji lokal rotating, diseduh manual per gelas.',
        category: 'Kopi',
      },
      {
        name: 'Cappuccino',
        price: 25000,
        pricePrefix: null,
        description: 'Espresso dengan microfoam lembut.',
        category: 'Kopi',
      },
      {
        name: 'Matcha Latte',
        price: 27000,
        pricePrefix: null,
        description: 'Matcha grade upacara dengan susu segar.',
        category: 'Non-Kopi',
      },
      {
        name: 'Es Teh Lemon Sereh',
        price: 15000,
        pricePrefix: null,
        description: 'Teh tubruk, lemon, dan sereh segar.',
        category: 'Non-Kopi',
      },
      {
        name: 'Roti Bakar Srikaya',
        price: 16000,
        pricePrefix: null,
        description: 'Roti sourdough bakar dengan srikaya buatan sendiri.',
        category: 'Makanan',
      },
      {
        name: 'Pisang Goreng Madu',
        price: 14000,
        pricePrefix: null,
        description: 'Pisang goreng renyah dengan kucuran madu.',
        category: 'Makanan',
      },
    ],
    images: [
      { url: pic('kopi-g1', 1200, 900), caption: 'Es kopi susu gula aren', category: 'menu' },
      { url: pic('kopi-g2', 1200, 900), caption: 'Meja kerja dekat jendela', category: 'interior' },
      { url: pic('kopi-g3', 1200, 900), caption: 'Seduhan V60', category: 'menu' },
      { url: pic('kopi-g4', 1200, 900), caption: 'Sarapan roti bakar srikaya', category: 'menu' },
      { url: pic('kopi-g5', 1200, 900), caption: 'Suasana sore di kedai', category: 'interior' },
      { url: pic('kopi-g6', 1200, 900), caption: 'Barista menyeduh pesanan', category: 'fasilitas' },
    ],
  },

  /* ---------------- SALON (salon) ---------------- */
  {
    slug: 'salon-ayu',
    name: 'Salon Ayu Beauty Bar',
    tagline: 'Perawatan rambut & kulit, konsultasi dulu sebelum mulai.',
    category: 'Salon Kecantikan',
    description:
      'Salon dan beauty bar untuk potong, perawatan rambut, dan make-up acara. Konsultasi gratis sebelum treatment, hasil natural dan sesuai karakter.',
    address: 'Jl. HR Bunyamin No. 8, Berkoh',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: '0281-777888',
    whatsapp: '6281234567892',
    openingHours: 'Selasa–Minggu 09.00–20.00',
    serviceArea: 'Purwokerto',
    rating: 4.9,
    reviewCount: 88,
    priceRange: 'Rp 35.000 – Rp 350.000',
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+HR+Bunyamin+No.+8+Purwokerto',
    instagramUrl: 'https://instagram.com/salonayu.beautybar',
    bookingEnabled: true,
    template: 'salon',
    themeColor: '#be185d',
    heroImageUrl: pic('salon-hero', 1600, 1100),
    faq: [
      {
        question: 'Perlu reservasi dulu?',
        answer: 'Sangat disarankan, terutama akhir pekan. Reservasi via WhatsApp atau form booking di halaman ini.',
      },
      {
        question: 'Smoothing bisa untuk rambut yang sudah diwarnai?',
        answer: 'Bisa, tapi kami konsultasi dulu kondisi rambut sebelum menentukan treatment yang aman.',
      },
      { question: 'Berapa lama hair spa?', answer: 'Sekitar 60–75 menit termasuk cuci dan blow dry.' },
    ],
    testimonials: [
      {
        name: 'Ayu L.',
        rating: 5,
        message: 'Hair spa-nya bikin rambut lembut dan wanginya tahan lama. Konsultasinya jujur, tidak dipaksa treatment mahal.',
      },
      { name: 'Melati', rating: 5, message: 'Make-up wisuda anak saya natural dan tahan seharian. Terima kasih!' },
    ],
    services: [
      {
        name: 'Hair Spa',
        price: 95000,
        description: 'Masker intensif, steam, dan pijat kulit kepala ringan.',
        category: 'Perawatan',
        imageUrl: pic('salon-spa', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'Smoothing & Keratin',
        price: 350000,
        description: 'Hasil lurus natural, aman untuk rambut sehat. Durasi 2–3 jam.',
        category: 'Perawatan',
        imageUrl: pic('salon-smooth', 1200, 900),
        isFeatured: true,
      },
      {
        name: 'Potong & Styling',
        price: 45000,
        description: 'Termasuk cuci dan blow dry.',
        category: 'Potong & Styling',
      },
      {
        name: 'Cuci & Blow Kering',
        price: 35000,
        description: 'Cuci dengan produk sesuai jenis rambut, lalu dikeringkan rapi.',
        category: 'Potong & Styling',
      },
      {
        name: 'Creambath',
        price: 65000,
        description: 'Perawatan klasik untuk rambut lemas dan kulit kepala sehat.',
        category: 'Perawatan',
      },
      {
        name: 'Make-up Wisuda & Acara',
        price: 250000,
        description: 'Make-up natural atau glam sesuai permintaan, sudah termasuk semi-permanent.',
        category: 'Make-up',
      },
    ],
    images: [
      { url: pic('salon-g1', 1200, 900), caption: 'Hasil blow dry natural', category: 'portfolio' },
      { url: pic('salon-g2', 1200, 900), caption: 'Ruang perawatan', category: 'interior' },
      { url: pic('salon-g3', 1200, 900), caption: 'Hair spa lengkap', category: 'portfolio' },
      { url: pic('salon-g4', 1200, 900), caption: 'Hasil smoothing kiloan', category: 'before-after' },
      { url: pic('salon-g5', 1200, 900), caption: 'Make-up wisuda klien', category: 'portfolio' },
      { url: pic('salon-g6', 1200, 900), caption: 'Sudut tunggu & display produk', category: 'interior' },
    ],
  },

  /* ---------------- KLINIK (clinic) ---------------- */
  {
    slug: 'klinik-senyum-sehat',
    name: 'Klinik Gigi Senyum Sehat',
    tagline: 'Perawatan gigi keluarga dengan jadwal praktik yang pasti.',
    category: 'Klinik Gigi',
    description:
      'Klinik gigi umum dan spesialis anak. Pemeriksaan teliti, penanganan nyaman, dan jadwal praktik sesuai booking.',
    address: 'Jl. Pahlawan No. 56, Sokanegara',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: '0281-888999',
    whatsapp: '6281234567893',
    openingHours: 'Senin–Jumat 09.00–20.00 · Sabtu 09.00–13.00',
    serviceArea: null,
    rating: 4.9,
    reviewCount: 64,
    priceRange: null,
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+Pahlawan+No.+56+Purwokerto',
    instagramUrl: null,
    bookingEnabled: true,
    template: 'clinic',
    themeColor: '#0d9488',
    heroImageUrl: pic('klinik-hero', 1600, 1100),
    faq: [
      { question: 'Apakah menerima pasien anak?', answer: 'Ya, kami melayani pasien anak mulai usia 3 tahun dengan pendekatan yang ramah anak.' },
      {
        question: 'Apakah bisa booking supaya tidak antre?',
        answer: 'Bisa. Booking via halaman ini atau WhatsApp, lalu datang sesuai jadwal.',
      },
      { question: 'Berapa lama pembersihan karang gigi?', answer: 'Sekitar 30–45 menit termasuk pemeriksaan awal.' },
    ],
    testimonials: [
      { name: 'Bapak Suto', rating: 5, message: 'Scaling-nya tidak sakit dan dijelaskan step by step. Antrean sesuai jadwal booking.' },
      {
        name: 'Nadia',
        rating: 5,
        message: 'Anak saya takut ke dokter gigi, tapi di sini ditangani sabar. Sekarang mau datang sendiri.',
      },
    ],
    services: [
      {
        name: 'Pembersihan Karang Gigi (Scaling)',
        price: 250000,
        description: 'Pembersihan menyeluruh dengan ultrasonic scaler, diakhiri polishing.',
        category: 'Perawatan',
        isFeatured: true,
      },
      {
        name: 'Pemutihan Gigi (Bleaching)',
        price: 1200000,
        description: 'Pemutihan in-office dengan hasil terlihat sejak sesi pertama.',
        category: 'Estetika',
        isFeatured: true,
      },
      {
        name: 'Tambal Gigi Komposit',
        price: 180000,
        description: 'Tambalan sewarna gigi untuk gigi berlubang ringan–sedang.',
        category: 'Perawatan',
      },
      {
        name: 'Cabut Gigi Tanpa Sakit',
        price: 150000,
        description: 'Dengan anestesi lokal dan instruksi perawatan pasca cabut.',
        category: 'Tindakan',
      },
      {
        name: 'Konsultasi & Rontgen',
        price: null,
        pricePrefix: 'Mulai dari',
        description: 'Rontgen periapikal/panoramik sesuai kebutuhan diagnosa.',
        category: 'Pemeriksaan',
      },
    ],
    images: [
      { url: pic('klinik-g1', 1200, 900), caption: 'Ruang tunggu pasien', category: 'interior' },
      { url: pic('klinik-g2', 1200, 900), caption: 'Ruang perawatan utama', category: 'fasilitas' },
      { url: pic('klinik-g3', 1200, 900), caption: 'Peralatan steril', category: 'fasilitas' },
      { url: pic('klinik-g4', 1200, 900), caption: 'Senyum setelah perawatan', category: 'portfolio' },
    ],
  },

  /* ---------------- TOKO / RETAIL (catalog) — sengaja tanpa foto hero ---------------- */
  {
    slug: 'griya-oleh-oleh',
    name: 'Griya Oleh-Oleh Khas Purwokerto',
    tagline: 'Oleh-oleh khas Banyumas, dikemas rapi dan siap kirim.',
    category: 'Toko Oleh-Oleh',
    description:
      'Pusat oleh-oleh khas Banyumas: getuk goreng, nopia, keripik, sampai merchandise. Pesan via WhatsApp, kirim ke seluruh Indonesia.',
    address: 'Jl. Overste Isdiman No. 33',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: null,
    whatsapp: '6281234567894',
    openingHours: 'Setiap hari 08.00–21.00',
    serviceArea: 'Kirim ke seluruh Indonesia',
    rating: 4.7,
    reviewCount: 312,
    priceRange: 'Rp 10.000 – Rp 150.000',
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+Overste+Isdiman+No.+33+Purwokerto',
    instagramUrl: 'https://instagram.com/griyagolek',
    bookingEnabled: false,
    template: 'retail',
    themeColor: '#16a34a',
    heroImageUrl: null,
    faq: [
      {
        question: 'Bisa kirim luar kota?',
        answer: 'Bisa. Kirim via ekspedisi rekanan; dikemas rapi dan tahan perjalanan. Tanyakan ongkir via WhatsApp.',
      },
      {
        question: 'Getuk gorengnya tahan berapa lama?',
        answer: 'Sekitar 3–5 hari di suhu ruang, lebih lama jika disimpan di kulkas dan dihangatkan lagi.',
      },
      {
        question: 'Bisa pesan jumlah banyak untuk acara?',
        answer: 'Bisa. Untuk pesanan di atas 50 kotak, hubungi kami minimal 3 hari sebelumnya.',
      },
    ],
    testimonials: [
      { name: 'Wulan', rating: 5, message: 'Dikirim ke Jakarta, sampai dengan rapi. Nopia-nya masih fresh dan tidak hancur.' },
      { name: 'Andi K.', rating: 4, message: 'Harga wajar untuk oleh-oleh sekelasnya. Getuk goreng favorit keluarga.' },
    ],
    services: [
      {
        name: 'Getuk Goreng Original',
        price: 25000,
        pricePrefix: 'Per kotak',
        description: 'Manis legit, digoreng dadakan sesuai pesanan.',
        category: 'Makanan',
        imageUrl: pic('toko-getuk', 900, 900),
        isFeatured: true,
      },
      {
        name: 'Nopia Klasik',
        price: 18000,
        pricePrefix: 'Per kotak',
        description: 'Kulit renyah dengan isian gula merah khas Banyumas.',
        category: 'Makanan',
        imageUrl: pic('toko-nopia', 900, 900),
        isFeatured: true,
      },
      {
        name: 'Ceriping Singkong Pedas',
        price: 15000,
        pricePrefix: 'Per bungkus',
        description: 'Keripik singkong tipis dengan bumbu pedas manis.',
        category: 'Makanan',
        imageUrl: pic('toko-ceriping', 900, 900),
      },
      {
        name: 'Antap Kue Kering',
        price: 35000,
        pricePrefix: 'Per toples',
        description: 'Kue kering gula merah, cocok untuk suguhan tamu.',
        category: 'Makanan',
        imageUrl: pic('toko-antap', 900, 900),
      },
      {
        name: 'Kopi Banyumas Robusta',
        price: 45000,
        pricePrefix: 'Per bungkus 200g',
        description: 'Robusta lokal dengan profil cokelat dan gula aren.',
        category: 'Minuman',
        imageUrl: pic('toko-kopi', 900, 900),
      },
      {
        name: 'Teh Melati Lokal',
        price: 20000,
        pricePrefix: 'Per bungkus',
        description: 'Teh wangi melati dari kebun lokal.',
        category: 'Minuman',
        imageUrl: pic('toko-teh', 900, 900),
      },
      {
        name: 'Kaos Purwokerto',
        price: 75000,
        pricePrefix: 'Per kaos',
        description: 'Kaos katun 30s sablon logo Purwokerto.',
        category: 'Merchandise',
        imageUrl: pic('toko-kaos', 900, 900),
      },
      {
        name: 'Totebag Banyumas',
        price: 50000,
        pricePrefix: 'Per totebag',
        description: 'Totebag kanvas tebal, motif batik Banyumas.',
        category: 'Merchandise',
        imageUrl: pic('toko-totebag', 900, 900),
      },
    ],
    images: [
      { url: pic('toko-g1', 1200, 900), caption: 'Getuk goreng baru matang', category: 'menu' },
      { url: pic('toko-g2', 1200, 900), caption: 'Nopia dikemas rapi', category: 'menu' },
      { url: pic('toko-g3', 1200, 900), caption: 'Rak oleh-oleh', category: 'interior' },
      { url: pic('toko-g4', 1200, 900), caption: 'Proses packing pesanan', category: 'fasilitas' },
      { url: pic('toko-g5', 1200, 900), caption: 'Ceriping singkong pedas', category: 'menu' },
      { url: pic('toko-g6', 1200, 900), caption: 'Antap kue kering', category: 'menu' },
      { url: pic('toko-g7', 1200, 900), caption: 'Kopi & teh lokal', category: 'menu' },
      { url: pic('toko-g8', 1200, 900), caption: 'Merchandise Banyumas', category: 'menu' },
    ],
  },

  /* ---------------- EDUKASI (education) ---------------- */
  {
    slug: 'bimbel-cerdas',
    name: 'Bimbel Cerdas Purwokerto',
    tagline: 'Kelas kecil, tutor berpengalaman, laporan belajar tiap bulan.',
    category: 'Bimbingan Belajar',
    description:
      'Bimbingan belajar untuk SD, SMP, dan persiapan UTBK. Maksimal 8 murid per kelas, dengan laporan perkembangan bulanan untuk orang tua.',
    address: 'Jl. Kranji No. 21',
    city: 'Purwokerto',
    province: 'Jawa Tengah',
    phone: '0281-555666',
    whatsapp: '6281234567895',
    openingHours: 'Senin–Sabtu 14.00–20.00',
    serviceArea: 'Purwokerto & Banyumas',
    rating: 4.8,
    reviewCount: 56,
    priceRange: null,
    googleMapsUrl: 'https://maps.google.com/?q=Jl.+Kranji+No.+21+Purwokerto',
    instagramUrl: 'https://instagram.com/bimbelcerdaspwt',
    bookingEnabled: false,
    template: 'education',
    themeColor: '#4f46e5',
    heroImageUrl: null,
    faq: [
      {
        question: 'Kelas berapa murid per kelas?',
        answer: 'Maksimal 8 murid per kelas agar tutor bisa memantau perkembangan tiap anak.',
      },
      {
        question: 'Ada laporan belajar?',
        answer: 'Ada, laporan bulanan berisi perkembangan nilai, kehadiran, dan catatan tutor.',
      },
      {
        question: 'Bisa ikut kelas percobaan?',
        answer: 'Bisa, satu sesi percobaan gratis untuk kelas reguler. Hubungi kami untuk menjadwalkan.',
      },
    ],
    testimonials: [
      { name: 'Ibu Ratna', rating: 5, message: 'Nilai matematika anak saya naik dan yang penting: dia jadi mau belajar tanpa disuruh.' },
      {
        name: 'Fajar',
        rating: 5,
        message: 'Alhamdulillah lulus UTBK sesuai target. Tutor mata pelajarannya enak diajari dan bank soalnya banyak.',
      },
    ],
    services: [
      {
        name: 'Intensif UTBK',
        price: 750000,
        pricePrefix: 'Per paket',
        description: '12 sesi tatap muka + try out mingguan + pembahasan soal.',
        category: 'Persiapan UTBK',
        isFeatured: true,
      },
      {
        name: 'Matematika SD–SMP',
        price: 350000,
        pricePrefix: 'Per bulan',
        description: '8 sesi per bulan, fokus pemahaman konsep dan latihan soal.',
        category: 'Akademik',
        isFeatured: true,
      },
      {
        name: 'Bahasa Inggris Percakapan',
        price: 300000,
        pricePrefix: 'Per bulan',
        description: 'Latihan speaking dengan tutor bersertifikat.',
        category: 'Bahasa',
      },
      {
        name: 'IPA Terpadu SMP',
        price: 350000,
        pricePrefix: 'Per bulan',
        description: 'Fisika, biologi, kimia dasar dengan pendekatan praktik.',
        category: 'Akademik',
      },
      {
        name: 'Try Out UTBK Akbar',
        price: 50000,
        pricePrefix: 'Per sesi',
        description: 'Simulasi UTBK dengan penilaian dan ranking nasional.',
        category: 'Persiapan UTBK',
      },
      {
        name: 'Konsultasi & Tes Minat Bakat',
        price: 0,
        pricePrefix: null,
        description: 'Sesi 45 menit bersama konselor untuk menentukan jurusan.',
        category: 'Akademik',
      },
    ],
    images: [
      { url: pic('bimbel-g1', 1200, 900), caption: 'Kelas kecil maksimal 8 murid', category: 'fasilitas' },
      { url: pic('bimbel-g2', 1200, 900), caption: 'Sesi try out mingguan', category: 'fasilitas' },
      { url: pic('bimbel-g3', 1200, 900), caption: 'Diskusi kelompok', category: 'portfolio' },
      { url: pic('bimbel-g4', 1200, 900), caption: 'Konsultasi orang tua', category: 'fasilitas' },
    ],
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Demo Pajangin',
      email: DEMO_EMAIL,
      whatsapp: '6281234567890',
    },
  });

  const urls: string[] = [];

  for (const demo of DEMO_BUSINESSES) {
    const fields = {
      name: demo.name,
      tagline: demo.tagline,
      category: demo.category,
      description: demo.description,
      address: demo.address,
      city: demo.city,
      province: demo.province,
      phone: demo.phone,
      whatsapp: demo.whatsapp,
      openingHours: demo.openingHours,
      serviceArea: demo.serviceArea,
      rating: demo.rating,
      reviewCount: demo.reviewCount,
      priceRange: demo.priceRange,
      googleMapsUrl: demo.googleMapsUrl,
      instagramUrl: demo.instagramUrl,
      bookingEnabled: demo.bookingEnabled,
      template: demo.template,
      themeColor: demo.themeColor,
      heroImageUrl: demo.heroImageUrl,
      faq: JSON.stringify(demo.faq),
      testimonials: JSON.stringify(demo.testimonials),
    };

    const business = await prisma.business.upsert({
      where: { slug: demo.slug },
      update: fields,
      create: { ...fields, slug: demo.slug, userId: user.id },
    });

    // tulis ulang anak-anaknya supaya seeder idempoten
    await prisma.service.deleteMany({ where: { businessId: business.id } });
    await prisma.businessImage.deleteMany({ where: { businessId: business.id } });

    for (const [index, service] of demo.services.entries()) {
      await prisma.service.create({
        data: {
          id: crypto.randomUUID(),
          businessId: business.id,
          name: service.name,
          price: service.price,
          pricePrefix: service.pricePrefix === undefined ? 'Mulai dari' : service.pricePrefix,
          description: service.description ?? null,
          category: service.category ?? null,
          imageUrl: service.imageUrl ?? null,
          isFeatured: service.isFeatured ?? false,
          orderIndex: index,
        },
      });
    }

    for (const [index, image] of demo.images.entries()) {
      await prisma.businessImage.create({
        data: {
          id: crypto.randomUUID(),
          businessId: business.id,
          url: image.url,
          caption: image.caption ?? null,
          category: image.category ?? null,
          orderIndex: index,
        },
      });
    }

    urls.push(`${FRONTEND_URL}/${demo.slug}`);
    console.log(
      `✓ ${demo.name} (${demo.template}) — ${demo.services.length} layanan, ${demo.images.length} foto galeri`,
    );
  }

  console.log('\nHalaman contoh siap direview:');
  for (const url of urls) console.log(`  ${url}`);
  console.log('\nCatatan: foto memakai placeholder picsum.photos (hanya untuk review desain).');
}

main()
  .catch((error) => {
    console.error('Seeder gagal:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
