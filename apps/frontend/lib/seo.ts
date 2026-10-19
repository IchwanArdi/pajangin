// Helper SEO bersama — dipakai layout, halaman statis, dan halaman bisnis.

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'Pajangin';

export const SITE_DESCRIPTION =
  'Buat halaman bisnis lokal gratis: layanan, harga, WhatsApp, booking, QR & Link in Bio, plus analitik pengunjung dan klik kontak.';

// OG image default (digenerate dari route sementara, tersimpan sebagai aset statis).
// URL relatif — diresolusi otomatis oleh metadataBase.
export const DEFAULT_OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Pajangin — halaman bisnis gratis untuk UMKM lokal',
};
