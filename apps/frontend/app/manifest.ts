import type { MetadataRoute } from 'next';

// Manifest PWA memakai aset brand di public/icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Pajangin — Halaman Bisnis & Analitik Gratis untuk UMKM',
    short_name: 'Pajangin',
    description:
      'Halaman bisnis lokal gratis: layanan, harga, WhatsApp, booking, QR & Link Bio, plus analitik pengunjung.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FEFCFB',
    theme_color: '#1A1511',
    lang: 'id',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
