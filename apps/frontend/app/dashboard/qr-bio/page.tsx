'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import {
  Card,
  CardHeader,
  PageHeader,
  Badge,
  Skeleton,
  btn,
  field,
} from '../../../components/dashboard/ui';

type TargetType = 'bio' | 'website' | 'whatsapp';

export default function QrBioPage() {
  const { business, status } = useBusiness();
  const [targetType, setTargetType] = useState<TargetType>('bio');
  const [customColor, setCustomColor] = useState<string | null>(null);
  const qrColor = customColor ?? business?.theme_color ?? '#1c1917';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Bangun target URL berdasarkan tipe yang dipilih
  const getTargetUrl = useCallback((type: TargetType): string => {
    if (!business) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    if (type === 'bio') {
      return `${origin}/${business.slug}/bio?utm_source=qr_bio`;
    }
    if (type === 'website') {
      return `${origin}/${business.slug}?utm_source=qr_standee`;
    }
    // whatsapp
    const cleanWa = business.whatsapp.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(
      `Halo ${business.name}, saya scan QR Code dan ingin menanyakan info layanan.`,
    )}`;
  }, [business]);

  const bioUrl = business
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${business.slug}/bio`
    : '';

  // Generate QR Code setiap kali target URL atau warna berubah
  useEffect(() => {
    if (!business) return;
    const url = getTargetUrl(targetType);

    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: {
        dark: qrColor,
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Gagal generate QR code:', err);
      });
  }, [business, targetType, qrColor, getTargetUrl]);

  // Handler Download QR Code
  const handleDownload = () => {
    if (!qrDataUrl || !business) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${business.slug}-${targetType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handler Print Standee Meja Kasir
  const handlePrint = () => {
    window.print();
  };

  // Handler Copy Link Target
  const handleCopyTarget = () => {
    const url = getTargetUrl(targetType);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handler Copy Bio Link
  const handleCopyBio = () => {
    navigator.clipboard.writeText(bioUrl);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="QR Code & Link in Bio"
        description="Buat stiker QR Code cetak untuk toko fisik Anda dan kelola halaman Link in Bio untuk Instagram & TikTok."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className={`${btn.secondary} ${btn.sm}`}
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Standee
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className={`${btn.primary} ${btn.sm}`}
            >
              <Download className="h-3.5 w-3.5" />
              Unduh QR PNG
            </button>
          </div>
        }
      />

      {/* Grid Utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Konfigurasi QR Code & Bio Link */}
        <div className="space-y-6 lg:col-span-6">
          {/* Card Link in Bio Quick Share */}
          <Card className="border-accent/40 bg-linear-to-br from-surface to-accent-soft/10">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-accent" />
                  <span>Halaman Link in Bio Anda</span>
                  <Badge tone="accent">Aktif</Badge>
                </div>
              }
              description="Tautan khusus yang dirancang ringan & estetik untuk dipasang di bio media sosial."
            />
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 rounded-xl border border-rule bg-paper p-2.5">
                <input
                  type="text"
                  readOnly
                  value={bioUrl}
                  className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyBio}
                  className={`${btn.primary} ${btn.sm} shrink-0`}
                >
                  {copiedBio ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Salin Link
                    </>
                  )}
                </button>
                <a
                  href={`/${business.slug}/bio`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn.secondary} ${btn.sm} shrink-0`}
                  title="Buka Tautan di Tab Baru"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-xs text-ink-2">
                Pasang link ini di profil <strong>Instagram</strong>, <strong>TikTok</strong>, dan status WhatsApp agar pelanggan bisa langsung memesan atau booking.
              </p>
            </div>
          </Card>

          {/* Konfigurasi QR Code */}
          <Card>
            <CardHeader
              title="Kustomisasi QR Code"
              description="Atur tujuan scan dan warna QR Code sesuai identitas visual bisnis."
            />
            <div className="space-y-4 p-5">
              {/* Pilihan Tujuan URL */}
              <div>
                <label className={field.label}>Arahkan Pengunjung Saat Scan QR ke:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bio', label: 'Link in Bio', desc: 'Ringkas & Cepat', icon: Smartphone },
                    { id: 'website', label: 'Website Utama', desc: 'Halaman Penuh', icon: Globe },
                    { id: 'whatsapp', label: 'Chat WhatsApp', desc: 'Direct Message', icon: MessageCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = targetType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTargetType(item.id as TargetType)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? 'border-accent bg-accent-soft/30 text-ink shadow-xs'
                            : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-accent' : ''}`} />
                        <span className={`mt-1.5 text-xs font-semibold ${isSelected ? 'text-accent' : 'text-ink'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-ink-2">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Warna QR */}
              <div>
                <label className={field.label}>Pilihan Warna QR Code</label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {[
                    { label: 'Tema Bisnis', value: business.theme_color || '#e85d3a' },
                    { label: 'Hitam Klasik', value: '#1c1917' },
                    { label: 'Navy Blue', value: '#1e3a8a' },
                    { label: 'Forest Green', value: '#065f46' },
                    { label: 'Deep Burgundy', value: '#831843' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCustomColor(color.value)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        qrColor === color.value
                          ? 'border-ink bg-paper-2 text-ink shadow-xs'
                          : 'border-rule bg-surface text-ink-2 hover:text-ink'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tautan yang sedang aktif */}
              <div className="rounded-xl border border-rule bg-paper-2/50 p-3 text-xs text-ink-2">
                <span className="font-semibold text-ink">Target URL Aktif:</span>
                <p className="mt-0.5 truncate font-mono text-[11px] text-accent">
                  {getTargetUrl(targetType)}
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className={`${btn.primary} flex-1`}
                >
                  <Download className="h-4 w-4" />
                  Unduh File QR (PNG)
                </button>
                <button
                  type="button"
                  onClick={handleCopyTarget}
                  className={btn.secondary}
                  title="Salin Tautan Target"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Tips Pemasangan QR */}
          <Card>
            <CardHeader
              title="Tips Praktis Menaruh QR Code"
              description="Cara efektif menarik pelanggan toko fisik untuk scan QR Anda."
            />
            <div className="space-y-2.5 p-5 text-xs text-ink-2">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent">
                  1
                </span>
                <p>
                  <strong>Meja Kasir & Meja Makan:</strong> Cetak ukuran A6 atau A5 tent-card agar pelanggan bisa langsung melihat menu dan booking reservasi berikutnya.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent">
                  2
                </span>
                <p>
                  <strong>Kemasan & Stiker Produk:</strong> Tempelkan QR di kantong belanja atau stiker cup makanan/minuman agar pelanggan mudah repeat order via WhatsApp.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent">
                  3
                </span>
                <p>
                  <strong>Spanduk / Banner Depan Toko:</strong> Pasang QR berukuran besar agar pengendara atau pejalan kaki yang lewat di luar jam operasional tetap bisa menghubungi toko Anda.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Live Standee Preview (Print-Ready) */}
        <div className="space-y-6 lg:col-span-6">
          <Card>
            <CardHeader
              title="Pratinjau Standee Meja Kasir"
              description="Format kartu meja yang siap dicetak untuk dipajang di kasir atau toko Anda."
              action={
                <button
                  type="button"
                  onClick={handlePrint}
                  className={`${btn.primary} ${btn.sm}`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Sekarang
                </button>
              }
            />

            {/* Container Standee Meja (Print Area) */}
            <div className="flex justify-center p-6 bg-paper-2/40">
              <div
                ref={printRef}
                id="printable-standee"
                className="w-full max-w-85 rounded-2xl border-2 border-rule bg-white p-6 text-center text-stone-900 shadow-xl transition-all"
                style={{ borderColor: qrColor }}
              >
                {/* Logo & Nama Bisnis */}
                <div className="flex flex-col items-center">
                  {business.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="h-14 w-14 rounded-full border border-stone-200 object-cover shadow-xs"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-white shadow-xs"
                      style={{ backgroundColor: qrColor }}
                    >
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <h3 className="mt-2 text-base font-extrabold tracking-tight text-stone-900">
                    {business.name}
                  </h3>
                  <p className="text-[11px] font-medium text-stone-500">
                    {business.category} • {business.city}
                  </p>
                </div>

                {/* Banner Call-To-Action */}
                <div
                  className="mt-3.5 rounded-xl py-1.5 px-3 text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: qrColor }}
                >
                  SCAN DI SINI
                </div>
                <p className="mt-1 text-[11px] font-semibold text-stone-600">
                  {targetType === 'bio'
                    ? 'Untuk Menu, Reservasi & Info Kontak'
                    : targetType === 'website'
                      ? 'Untuk Melihat Website & Layanan Lengkap'
                      : 'Untuk Chat Langsung via WhatsApp'}
                </p>

                {/* QR Code Gambar */}
                <div className="my-3 flex justify-center">
                  <div className="rounded-xl border border-stone-100 bg-white p-2 shadow-xs">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt={`QR Code ${business.name}`}
                        className="h-44 w-44 object-contain"
                      />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center bg-stone-100 text-stone-400">
                        <QrCode className="h-12 w-12 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp & Alamat Singkat */}
                <div className="border-t border-stone-100 pt-3 text-[11px] text-stone-600">
                  <p className="flex items-center justify-center gap-1 font-semibold text-stone-800">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp: {business.whatsapp}</span>
                  </p>
                  {business.address && (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-stone-400">
                      {business.address}
                    </p>
                  )}
                </div>

                {/* Footer Brand Watermark */}
                <div className="mt-2 text-[9px] font-medium text-stone-400">
                  Ditenagai oleh Pajangin
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CSS Khusus Print (Cetak Standee Bersih Tanpa UI Dashboard) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-standee,
          #printable-standee * {
            visibility: visible;
          }
          #printable-standee {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 400px;
            box-shadow: none;
            border: 2px solid ${qrColor} !important;
            padding: 30px !important;
          }
        }
      `}</style>
    </div>
  );
}
