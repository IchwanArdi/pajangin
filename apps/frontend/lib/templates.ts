export interface BusinessTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  defaultAccent: string;
  colorOptions: string[];
  features: string[];
  servicesLayout: 'cards' | 'menu-grid' | 'feature-list' | 'catalog';
  accentToken: string;
}

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  default: {
    id: 'default',
    name: 'Modern Minimal',
    tagline: 'Bersih, elegan, dan fokus pada konversi',
    description: 'Cocok untuk segala jenis usaha dengan tata letak serbaguna, navigasi intuitif, dan responsif sempurna.',
    badge: 'Serbaguna',
    defaultAccent: '#e85d3a',
    colorOptions: ['#e85d3a', '#2563eb', '#16a34a', '#7c3aed', '#0f172a'],
    features: ['Hero split-screen modern', 'Layanan dengan kartu interaktif', 'Badge status jam buka', 'Form lead WhatsApp terintegrasi'],
    servicesLayout: 'cards',
    accentToken: 'oklch(62% 0.19 28)',
  },
  restaurant: {
    id: 'restaurant',
    name: 'Bistro & Kuliner',
    tagline: 'Fokus ke selera, foto menu, dan reservasi',
    description: 'Didesain khusus untuk kedai kopi, kafe, restoran, dan katering dengan tampilan visual makanan yang menggugah selera.',
    badge: 'Kuliner & Cafe',
    defaultAccent: '#ea580c',
    colorOptions: ['#ea580c', '#d97706', '#dc2626', '#854d0e', '#1c1917'],
    features: ['Menu visual dengan kategori', 'Status buka/tutup menonjol', 'Tombol pesan meja & antar', 'Highlight menu andalan/chef recommend'],
    servicesLayout: 'menu-grid',
    accentToken: 'oklch(60% 0.21 40)',
  },
  workshop: {
    id: 'workshop',
    name: 'Industrial & Otomotif',
    tagline: 'Transparansi harga, garansi, & panggilan darurat',
    description: 'Cocok untuk bengkel motor/mobil, servis AC, instalasi teknis, dan perbaikan rumah tangga yang mengutamakan kepercayaan.',
    badge: 'Bengkel & Jasa',
    defaultAccent: '#0284c7',
    colorOptions: ['#0284c7', '#0369a1', '#2563eb', '#f59e0b', '#334155'],
    features: ['Nomor darurat langsung klik', 'Transparansi harga & pengerjaan', 'Jangkauan area servis jelas', 'Buka rute Google Maps instan'],
    servicesLayout: 'feature-list',
    accentToken: 'oklch(58% 0.18 235)',
  },
  salon: {
    id: 'salon',
    name: 'Elegance & Beauty',
    tagline: 'Sentuhan mewah untuk salon, spa, & treatment',
    description: 'Estetika anggun untuk salon kecantikan, barbershop premium, spa relaksasi, dan klinik kecantikan mandiri.',
    badge: 'Kecantikan & Spa',
    defaultAccent: '#db2777',
    colorOptions: ['#db2777', '#be185d', '#9d174d', '#7c3aed', '#475569'],
    features: ['Daftar paket treatment mewah', 'Booking waktu & slot stylist', 'Review & rating menonjol', 'Suasana rileks & premium'],
    servicesLayout: 'cards',
    accentToken: 'oklch(62% 0.22 355)',
  },
  clinic: {
    id: 'clinic',
    name: 'Care & Healthcare',
    tagline: 'Higienis, kredibel, dan mudah dihubungi',
    description: 'Nuansa profesional dan menenangkan untuk klinik pratama, dokter gigi, fisioterapi, dan konsultan kesehatan.',
    badge: 'Kesehatan & Medis',
    defaultAccent: '#0d9488',
    colorOptions: ['#0d9488', '#0f766e', '#0284c7', '#16a34a', '#334155'],
    features: ['Jadwal praktik teratur', 'Kontak konsultasi cepat', 'Sertifikasi & kredibilitas', 'Booking antrean pasien'],
    servicesLayout: 'cards',
    accentToken: 'oklch(60% 0.15 185)',
  },
  retail: {
    id: 'retail',
    name: 'Shop & Catalog',
    tagline: 'Katalog etalase produk & order WhatsApp mudah',
    description: 'Optimal untuk butik, toko perlengkapan, laundry kiloan, oleh-oleh, dan toko ritel lokal yang menjual produk langsung.',
    badge: 'Toko & Retail',
    defaultAccent: '#16a34a',
    colorOptions: ['#16a34a', '#15803d', '#059669', '#2563eb', '#ea580c'],
    features: ['Katalog etalase produk ringkas', 'Format harga per satuan / kg', 'Order langsung format chat WA', 'Promo diskon berjalan'],
    servicesLayout: 'catalog',
    accentToken: 'oklch(62% 0.18 145)',
  },
  education: {
    id: 'education',
    name: 'Academy & Course',
    tagline: 'Fokus kurikulum, mentor, & pendaftaran kelas',
    description: 'Sangat pas untuk bimbingan belajar, kursus musik/bahasa, kelas coding, dan pelatihan sertifikasi keahlian.',
    badge: 'Edukasi & Kursus',
    defaultAccent: '#6366f1',
    colorOptions: ['#6366f1', '#4f46e5', '#7c3aed', '#2563eb', '#0f172a'],
    features: ['Struktur program & jenjang kelas', 'Benefit & kurikulum materi', 'Konsultasi minat bakat gratis', 'Testimoni kelulusan'],
    servicesLayout: 'feature-list',
    accentToken: 'oklch(60% 0.20 275)',
  },
};

export function getTemplateConfig(templateId?: string | null): BusinessTemplate {
  if (!templateId || !BUSINESS_TEMPLATES[templateId]) {
    return BUSINESS_TEMPLATES.default;
  }
  return BUSINESS_TEMPLATES[templateId];
}
