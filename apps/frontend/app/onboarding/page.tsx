'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Business, createNewBusiness, getMyBusinesses } from '../../lib/api';
import { createClient } from '../../lib/supabase/client';
import { BUSINESS_CATEGORIES } from '../../lib/categories';
import { formatWaDisplay, isValidWhatsapp } from '../../lib/whatsapp';
import { FormAlert, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../components/auth/AuthShell';

type Step = 1 | 2;

// Wizard pembuatan bisnis — dipakai untuk bisnis pertama (setelah daftar) dan "+ Bisnis Baru"
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [hasBusinesses, setHasBusinesses] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Business | null>(null);
  const [copied, setCopied] = useState(false);

  // langkah 1 — profil bisnis
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<string>(BUSINESS_CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tagline, setTagline] = useState('');

  // langkah 2 — layanan pertama
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  useEffect(() => {
    getMyBusinesses()
      .then((list) => setHasBusinesses(list.length > 0))
      .catch(() => setHasBusinesses(false));
  }, []);

  const whatsappValid = isValidWhatsapp(whatsapp);
  const step1Valid = businessName.trim() && city.trim() && address.trim() && whatsappValid;

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!whatsappValid) {
      setErrorMessage('Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.');
      return;
    }
    if (step1Valid) setStep(2);
  };

  const submit = async (withService: boolean) => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      const biz = await createNewBusiness({
        name: businessName.trim(),
        category,
        city: city.trim(),
        address: address.trim(),
        whatsapp,
        tagline: tagline.trim() || undefined,
        services:
          withService && serviceName.trim()
            ? [
                {
                  name: serviceName.trim(),
                  price: servicePrice ? parseInt(servicePrice, 10) : undefined,
                  description: serviceDesc.trim() || undefined,
                },
              ]
            : [],
      });
      setCreated(biz);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membuat bisnis. Coba lagi.');
      // kalau error di data profil (mis. WA), kembalikan ke langkah 1
      if (err instanceof Error && /whatsapp|nama|kota|alamat|kategori/i.test(err.message)) setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  // ===== Sukses =====
  if (created) {
    const url = `${window.location.origin}/${created.slug}`;
    return (
      <Shell>
        <div className="space-y-6 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Halaman tayang</p>
            <h1 className="text-2xl font-bold tracking-[-0.025em]">{created.name} sudah online</h1>
            <p className="text-sm leading-relaxed text-ink-2">Bagikan link di bawah ke pelanggan, bio Instagram, atau status WhatsApp. Setiap kunjungan dan klik WhatsApp akan tercatat di dashboard.</p>
          </div>

          <div className="space-y-2 rounded-2xl border border-rule bg-paper p-4">
            <div className="text-xs font-medium text-ink-2">Link halaman bisnis Anda</div>
            <div className="break-all font-mono text-sm font-semibold text-ink">{url}</div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {copied ? 'Tersalin ✓' : 'Salin link'}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a href={`/${created.slug}`} target="_blank" rel="noopener noreferrer" className={`${secondaryButtonClass} text-center`}>
              Lihat halaman
            </a>
            <button type="button" onClick={() => router.push(`/dashboard?biz=${created.id}`)} className={primaryButtonClass}>
              Buka dashboard
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      topRight={
        hasBusinesses ? (
          <Link href="/dashboard" className="text-sm font-semibold text-ink-2 hover:text-ink">
            ← Kembali ke dashboard
          </Link>
        ) : hasBusinesses === false ? (
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-ink-2 hover:text-ink">
            Keluar
          </button>
        ) : null
      }
    >
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Langkah {step} dari 2</p>
        <h1 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">{step === 1 ? (hasBusinesses ? 'Tambah bisnis baru' : 'Buat halaman bisnis Anda') : 'Tambahkan layanan pertama'}</h1>
        <p className="text-sm leading-relaxed text-ink-2">
          {step === 1 ? 'Informasi ini tampil di halaman publik dan membantu pelanggan menemukan Anda di Google.' : 'Agar katalog tidak kosong saat pelanggan membuka halaman Anda. Bisa ditambah atau diubah nanti.'}
        </p>
      </div>

      {/* progress */}
      <div className="flex gap-2" aria-hidden="true">
        <span className="h-1 flex-1 rounded-full bg-accent" />
        <span className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-accent' : 'bg-rule'}`} />
      </div>

      {errorMessage && <FormAlert>{errorMessage}</FormAlert>}

      {step === 1 && (
        <form onSubmit={goToStep2} className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="businessName" className={labelClass}>
              Nama bisnis
            </label>
            <input id="businessName" required placeholder="Contoh: Bengkel Maju Jaya" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClass}>
                Kategori
              </label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>
                Kota
              </label>
              <input id="city" required autoComplete="address-level2" placeholder="Contoh: Purwokerto" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>
              Alamat lengkap
            </label>
            <input id="address" required autoComplete="street-address" placeholder="Contoh: Jl. Gerilya No. 45" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              Nomor WhatsApp untuk pesanan
            </label>
            <input id="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
            <p className="mt-1.5 text-xs text-ink-2">
              {whatsapp && whatsappValid ? `Tombol "Chat WhatsApp" akan mengarah ke ${formatWaDisplay(whatsapp)}` : whatsapp ? 'Format belum valid. Contoh: 081234567890' : 'Pelanggan akan menghubungi Anda lewat nomor ini.'}
            </p>
          </div>

          <div>
            <label htmlFor="tagline" className={labelClass}>
              Slogan singkat (opsional)
            </label>
            <input id="tagline" placeholder="Contoh: Servis cepat, harga jujur" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
          </div>

          <button type="submit" disabled={!step1Valid} className={primaryButtonClass}>
            Lanjut
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(true);
          }}
          className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8"
        >
          <div>
            <label htmlFor="serviceName" className={labelClass}>
              Nama layanan / produk utama
            </label>
            <input id="serviceName" required placeholder="Contoh: Servis AC Mobil" value={serviceName} onChange={(e) => setServiceName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="servicePrice" className={labelClass}>
              Harga mulai dari (Rp, opsional)
            </label>
            <input id="servicePrice" type="number" min={0} inputMode="numeric" placeholder="Contoh: 150000" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="serviceDesc" className={labelClass}>
              Keterangan singkat (opsional)
            </label>
            <textarea id="serviceDesc" rows={2} placeholder="Contoh: Termasuk cek kebocoran dan isi freon." value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} className={inputClass} />
          </div>

          <button type="submit" disabled={submitting || !serviceName.trim()} className={primaryButtonClass}>
            {submitting ? 'Menayangkan halaman…' : 'Tayangkan halaman bisnis'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep(1)} disabled={submitting} className="font-semibold text-ink-2 hover:text-ink">
              ← Kembali
            </button>
            <button type="button" onClick={() => submit(false)} disabled={submitting} className="font-semibold text-ink-2 hover:text-ink">
              Lewati, tambah nanti
            </button>
          </div>
        </form>
      )}
    </Shell>
  );
}

function Shell({ children, topRight }: { children: React.ReactNode; topRight?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Pajang<span className="text-accent">in</span>
          </Link>
          {topRight}
        </div>
      </header>
      <main className="mx-auto max-w-xl space-y-6 px-5 py-10">{children}</main>
    </div>
  );
}
