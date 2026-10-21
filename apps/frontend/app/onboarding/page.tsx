'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ApiError, createNewBusiness, getMyBusinesses } from '../../lib/api';
import { createClient } from '../../lib/supabase/client';
import { BUSINESS_CATEGORIES } from '../../lib/categories';
import { formatWaDisplay, isValidWhatsapp, toWaNumber } from '../../lib/whatsapp';
import { useBrowserOrigin } from '../../lib/useBrowserOrigin';
import { FormAlert, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../components/auth/AuthShell';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import {
  clearOnboardingDraft,
  defaultDescription,
  draftStorageKey,
  emptyServiceDraft,
  hasDraftContent,
  MAX_ONBOARDING_SERVICES,
  readOnboardingDraft,
  serviceSuggestions,
  slugPreview,
  writeOnboardingDraft,
  type DraftService,
  type OnboardingDraft,
  type OnboardingStep,
} from '../../lib/onboarding';

type LoadState = 'loading' | 'ready' | 'error';

// Dipisah dari komponen supaya effect hanya memakai promise chain (bukan setState sinkron).
async function fetchAccountContext() {
  const businesses = await getMyBusinesses();

  // Draft hanya aktif kalau ID akun tersedia. Kegagalan membaca sesi tidak boleh
  // menghalangi pembuatan bisnis.
  let accountId: string | null = null;
  try {
    const { data } = await createClient().auth.getUser();
    accountId = data.user?.id ?? null;
  } catch {
    accountId = null;
  }

  return { businesses, accountId };
}

// Wizard 3 langkah: profil → isi halaman → pratinjau/terbit.
// Dipakai untuk bisnis pertama setelah verifikasi email maupun "+ Bisnis baru".
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [loadKey, setLoadKey] = useState(0);
  const [hasBusinesses, setHasBusinesses] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const origin = useBrowserOrigin();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // langkah 1 — profil bisnis
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<string>(BUSINESS_CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tagline, setTagline] = useState('');

  // langkah 2 — layanan + deskripsi
  const [services, setServices] = useState<DraftService[]>([emptyServiceDraft()]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchAccountContext()
      .then(({ businesses, accountId }) => {
        if (cancelled) return;

        const mode = businesses.length > 0 ? 'add' : 'first';
        const key = accountId ? draftStorageKey(accountId, mode) : null;
        const saved = readOnboardingDraft(key);

        setHasBusinesses(businesses.length > 0);
        setDraftKey(key);

        if (saved) {
          setBusinessName(saved.businessName);
          setCategory(
            (BUSINESS_CATEGORIES as readonly string[]).includes(saved.category)
              ? saved.category
              : BUSINESS_CATEGORIES[0],
          );
          setCity(saved.city);
          setAddress(saved.address);
          setWhatsapp(saved.whatsapp);
          setTagline(saved.tagline);
          setDescription(saved.description);
          setServices(saved.services.length > 0 ? saved.services : [emptyServiceDraft()]);
          setStep(saved.step);
          setDraftRestored(hasDraftContent(saved));
        }

        setDraftLoaded(true);
        setLoadError('');
        setLoadState('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 401 sudah ditangani helper API (sign out + redirect ke login).
        if (err instanceof ApiError && err.status === 401) return;
        setLoadError(err instanceof Error ? err.message : 'Gagal memuat data akun.');
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  const retryLoad = () => {
    setLoadState('loading');
    setLoadError('');
    setLoadKey((key) => key + 1);
  };

  // Simpan tiap perubahan setelah draft selesai dipulihkan. Draft kosong dihapus.
  useEffect(() => {
    if (!draftLoaded || !draftKey) return;

    const draft: OnboardingDraft = {
      version: 1,
      step,
      businessName,
      category,
      city,
      address,
      whatsapp,
      tagline,
      description,
      services,
    };

    if (!hasDraftContent(draft)) {
      clearOnboardingDraft(draftKey);
      return;
    }

    writeOnboardingDraft(draftKey, draft);
  }, [
    draftLoaded,
    draftKey,
    step,
    businessName,
    category,
    city,
    address,
    whatsapp,
    tagline,
    description,
    services,
  ]);

  const whatsappValid = isValidWhatsapp(whatsapp);
  const step1Valid = Boolean(businessName.trim() && city.trim() && address.trim() && whatsappValid);
  const filledServices = useMemo(() => services.filter((service) => service.name.trim()), [services]);
  const generatedDescription = useMemo(() => defaultDescription(businessName, city), [businessName, city]);
  const previewDescription = description.trim() || generatedDescription;
  const pagePath = `/${slugPreview(businessName)}`;
  const pageUrl = origin ? `${origin}${pagePath}` : pagePath;
  const testWhatsappHref = whatsappValid
    ? `https://wa.me/${toWaNumber(whatsapp)}?text=${encodeURIComponent(
        `Tes tombol WhatsApp untuk ${businessName.trim() || 'bisnis saya'} di Pajangin.`,
      )}`
    : null;

  const suggestions = useMemo(() => {
    const used = new Set(services.map((service) => service.name.trim().toLowerCase()).filter(Boolean));
    return serviceSuggestions(category).filter((suggestion) => !used.has(suggestion.toLowerCase()));
  }, [category, services]);

  const hasEmptyServiceSlot =
    services.some((service) => !service.name.trim()) || services.length < MAX_ONBOARDING_SERVICES;

  const goTo = (nextStep: OnboardingStep) => {
    setErrorMessage('');
    setStep(nextStep);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep2 = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!whatsappValid) {
      setErrorMessage('Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.');
      return;
    }
    if (!step1Valid) {
      setErrorMessage('Lengkapi nama bisnis, kota, dan alamat terlebih dahulu.');
      return;
    }

    goTo(2);
  };

  const addSuggestion = (name: string) => {
    setServices((previous) => {
      const next = previous.map((service) => ({ ...service }));
      const emptyIndex = next.findIndex((service) => !service.name.trim());

      if (emptyIndex >= 0) {
        next[emptyIndex].name = name;
        return next;
      }
      if (next.length >= MAX_ONBOARDING_SERVICES) return previous;
      return [...next, { ...emptyServiceDraft(), name }];
    });
  };

  const updateService = (index: number, field: keyof DraftService, value: string) => {
    setServices((previous) =>
      previous.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [field]: value } : service,
      ),
    );
  };

  const addServiceRow = () => {
    setServices((previous) =>
      previous.length >= MAX_ONBOARDING_SERVICES ? previous : [...previous, emptyServiceDraft()],
    );
  };

  const removeServiceRow = (index: number) => {
    setServices((previous) => {
      if (previous.length <= 1) return [emptyServiceDraft()];
      return previous.filter((_, serviceIndex) => serviceIndex !== index);
    });
  };

  const resetDraft = () => {
    clearOnboardingDraft(draftKey);
    setStep(1);
    setBusinessName('');
    setCategory(BUSINESS_CATEGORIES[0]);
    setCity('');
    setAddress('');
    setWhatsapp('');
    setTagline('');
    setDescription('');
    setServices([emptyServiceDraft()]);
    setDraftRestored(false);
    setErrorMessage('');
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  const publish = async () => {
    setErrorMessage('');

    if (!step1Valid) {
      setStep(1);
      setErrorMessage('Lengkapi nama bisnis, kota, alamat, dan nomor WhatsApp yang valid.');
      return;
    }

    setSubmitting(true);
    try {
      const payloadServices = services
        .filter((service) => service.name.trim())
        .map((service) => {
          const parsedPrice = Number.parseInt(service.price, 10);
          return {
            name: service.name.trim(),
            price: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : undefined,
            description: service.description.trim() || undefined,
          };
        });

      const business = await createNewBusiness({
        name: businessName.trim(),
        category,
        city: city.trim(),
        address: address.trim(),
        whatsapp,
        tagline: tagline.trim() || undefined,
        description: previewDescription,
        services: payloadServices,
      });

      // Hentikan autosave sebelum draft dihapus agar efek simpan tidak menulis ulang data lama.
      setDraftLoaded(false);
      clearOnboardingDraft(draftKey);
      router.replace(`/onboarding/selesai?biz=${encodeURIComponent(business.id)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat bisnis. Coba lagi.';
      setErrorMessage(message);
      if (/whatsapp|nama|kota|alamat|kategori/i.test(message)) setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <OnboardingShell>
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" strokeWidth={1.75} />
          <p className="text-sm font-semibold text-ink">Menyiapkan akun Anda…</p>
          <p className="max-w-xs text-xs leading-relaxed text-ink-2">
            Kami memeriksa apakah ini bisnis pertama atau bisnis tambahan.
          </p>
        </div>
      </OnboardingShell>
    );
  }

  if (loadState === 'error') {
    return (
      <OnboardingShell>
        <div className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-negative-soft p-2 text-negative">
              <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-[-0.02em]">Data akun belum bisa dimuat</h1>
              <p className="text-sm leading-relaxed text-ink-2">{loadError}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={retryLoad} className={primaryButtonClass}>
              Coba lagi
            </button>
            <button type="button" onClick={() => void handleLogout()} className={secondaryButtonClass}>
              Keluar
            </button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  const topRight = hasBusinesses ? (
    <Link href="/dashboard" className="text-sm font-semibold text-ink-2 hover:text-ink">
      ← Kembali ke dashboard
    </Link>
  ) : (
    <button type="button" onClick={() => void handleLogout()} className="text-sm font-semibold text-ink-2 hover:text-ink">
      Keluar
    </button>
  );

  return (
    <OnboardingShell topRight={topRight}>
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Langkah {step} dari 3</p>
        <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-4xl">
          {step === 1
            ? hasBusinesses
              ? 'Tambah bisnis baru'
              : 'Buat halaman bisnis Anda'
            : step === 2
              ? 'Lengkapi isi halaman'
              : 'Cek sebelum terbit'}
        </h1>
        <p className="text-sm leading-relaxed text-ink-2">
          {step === 1
            ? 'Informasi ini tampil di halaman publik. Bisa diubah kapan saja setelah halaman aktif.'
            : step === 2
              ? 'Tambahkan layanan dan deskripsi singkat. Tidak harus sempurna sekarang.'
              : 'Pastikan nama, layanan, dan tombol WhatsApp sudah sesuai.'}
        </p>
      </div>

      <StepProgress step={step} />

      {draftRestored && (
        <FormAlert tone="info">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Isian terakhir dipulihkan dari perangkat ini.</span>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-2 hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Mulai ulang
            </button>
          </div>
        </FormAlert>
      )}

      {errorMessage && <FormAlert>{errorMessage}</FormAlert>}

      {step === 1 && (
        <form onSubmit={goToStep2} className="space-y-5 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="businessName" className={labelClass}>
              Nama bisnis
            </label>
            <input
              id="businessName"
              required
              autoComplete="organization"
              placeholder="Contoh: Bengkel Maju Jaya"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClass}>
                Kategori
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                {BUSINESS_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>
                Kota
              </label>
              <input
                id="city"
                required
                autoComplete="address-level2"
                placeholder="Contoh: Purwokerto"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>
              Alamat lengkap
            </label>
            <input
              id="address"
              required
              autoComplete="street-address"
              placeholder="Contoh: Jl. Gerilya No. 45"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
              Alamat ini tampil di halaman publik agar pelanggan mudah menemukan Anda.
            </p>
          </div>

          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              Nomor WhatsApp untuk pesanan
            </label>
            <input
              id="whatsapp"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0812 3456 7890"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
              {whatsapp && whatsappValid
                ? `Tombol "Chat WhatsApp" akan mengarah ke ${formatWaDisplay(whatsapp)}`
                : whatsapp
                  ? 'Format belum valid. Contoh: 081234567890'
                  : 'Pelanggan akan menghubungi Anda lewat nomor ini.'}
            </p>
          </div>

          <div>
            <label htmlFor="tagline" className={labelClass}>
              Slogan singkat (opsional)
            </label>
            <input
              id="tagline"
              maxLength={80}
              placeholder="Contoh: Servis cepat, harga jujur"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="rounded-2xl border border-rule bg-paper p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
              <Globe className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
              Link halaman
            </div>
            <p className="mt-1 break-words font-mono text-sm font-semibold text-ink">{pageUrl}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-2">
              Dibuat otomatis dari nama bisnis. Link final bisa berubah sedikit jika sudah dipakai.
            </p>
          </div>

          <button type="submit" disabled={!step1Valid} className={primaryButtonClass}>
            Lanjut: isi halaman
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {!step1Valid && (
            <p className="text-center text-xs leading-relaxed text-ink-2">
              Lengkapi nama bisnis, kota, alamat, dan nomor WhatsApp yang valid untuk melanjutkan.
            </p>
          )}

          <p className="text-center text-xs text-ink-2">Draft tersimpan otomatis di perangkat ini.</p>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            goTo(3);
          }}
          className="space-y-5 rounded-3xl border border-rule bg-white p-6 sm:p-8"
        >
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-bold tracking-[-0.01em]">Layanan atau produk</h2>
              <span className="font-mono text-[11px] text-ink-2">
                {filledServices.length}/{MAX_ONBOARDING_SERVICES}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-2">
              Tambahkan 1–3 layanan utama. Saran di bawah bisa diklik untuk mengisi otomatis.
            </p>

            {hasEmptyServiceSlot && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink-3/40 hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Plus className="h-3 w-3 text-accent" strokeWidth={2} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-rule bg-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-ink-2">Layanan {index + 1}</p>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeServiceRow(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-2 transition hover:text-negative focus-visible:outline-none focus-visible:underline"
                      aria-label={`Hapus layanan ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Hapus
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor={`service-name-${index}`} className="mb-1 block text-xs font-medium text-ink">
                    Nama layanan
                  </label>
                  <input
                    id={`service-name-${index}`}
                    placeholder={index === 0 ? 'Contoh: Servis AC mobil' : 'Contoh: Ganti oli'}
                    value={service.name}
                    onChange={(event) => updateService(index, 'name', event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`service-price-${index}`} className="mb-1 block text-xs font-medium text-ink">
                      Harga mulai (Rp, opsional)
                    </label>
                    <input
                      id={`service-price-${index}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="150000"
                      value={service.price}
                      onChange={(event) => updateService(index, 'price', event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`service-desc-${index}`} className="mb-1 block text-xs font-medium text-ink">
                      Keterangan (opsional)
                    </label>
                    <input
                      id={`service-desc-${index}`}
                      placeholder="Termasuk cek kebocoran"
                      value={service.description}
                      onChange={(event) => updateService(index, 'description', event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {services.length < MAX_ONBOARDING_SERVICES && (
            <button
              type="button"
              onClick={addServiceRow}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-rule bg-paper px-4 py-3 text-sm font-semibold text-ink-2 transition hover:border-ink-3/40 hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Tambah layanan
            </button>
          )}

          {filledServices.length < MAX_ONBOARDING_SERVICES && (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
              Tiga layanan membuat halaman lebih lengkap dan lebih siap muncul di Google.
            </p>
          )}

          <div>
            <label htmlFor="description" className={labelClass}>
              Deskripsi singkat (opsional)
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              placeholder={generatedDescription}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
              Kosongkan jika ingin kami buatkan deskripsi awal dari nama dan kota bisnis.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={() => goTo(1)} className={`${secondaryButtonClass} sm:w-auto`}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Kembali
            </button>
            <button type="submit" className={`${primaryButtonClass} flex-1`}>
              Lanjut ke pratinjau
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <p className="text-center text-xs text-ink-2">Draft tersimpan otomatis di perangkat ini.</p>
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void publish();
          }}
          className="space-y-4"
        >
          <div className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">Pratinjau ringkas</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-medium text-ink-2">
                <Check className="h-3 w-3 text-positive" strokeWidth={2} />
                Aktif setelah terbit
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-rule">
              <div className="space-y-3 bg-ink p-5 text-paper">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">
                  {category} · {city}
                </p>
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.02em]">{businessName}</h2>
                  {tagline.trim() && <p className="mt-1 text-sm leading-relaxed text-paper/65">{tagline}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink">
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Chat WhatsApp
                  </span>
                  <span className="text-[10px] text-paper/45">{pagePath}</span>
                </div>
              </div>

              <div className="space-y-4 bg-white p-5">
                <p className="text-sm leading-relaxed text-ink-2">{previewDescription}</p>

                {filledServices.length > 0 ? (
                  <ul className="space-y-2 border-t border-rule pt-4">
                    {filledServices.map((service, index) => {
                      const price = Number.parseInt(service.price, 10);
                      const hasPrice = Number.isFinite(price) && price > 0;
                      return (
                        <li key={`${service.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{service.name}</p>
                            {service.description.trim() && (
                              <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{service.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 font-mono text-xs text-ink-2">
                            {hasPrice ? `Rp ${price.toLocaleString('id-ID')}` : price === 0 ? 'Gratis' : 'Tanya harga'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="border-t border-rule pt-4 text-xs leading-relaxed text-ink-2">
                    Belum ada layanan. Halaman tetap bisa dibuat, lalu layanan ditambahkan dari dashboard.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rule bg-paper p-4">
              <p className="flex items-center gap-2 text-xs font-medium text-ink-2">
                <Globe className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                Link halaman
              </p>
              <p className="mt-1 break-words font-mono text-sm font-semibold text-ink">{pageUrl}</p>
            </div>

            {testWhatsappHref && (
              <a
                href={testWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent underline-offset-2 hover:underline"
              >
                Tes tombol WhatsApp
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            )}
          </div>

          <FormAlert tone="info">
            Halaman akan langsung aktif dan bisa dibagikan. Setelah terbit, kami tunjukkan langkah agar halaman
            siap muncul di Google.
          </FormAlert>

          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                Menerbitkan halaman…
              </>
            ) : (
              <>
                Terbitkan halaman
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </>
            )}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => goTo(2)}
              disabled={submitting}
              className={`${secondaryButtonClass} sm:w-auto`}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Kembali
            </button>
            <p className="flex flex-1 items-center justify-center gap-1.5 text-center text-xs text-ink-2">
              <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
              Halaman bisa diubah kapan saja di dashboard.
            </p>
          </div>
        </form>
      )}
    </OnboardingShell>
  );
}

function StepProgress({ step }: { step: OnboardingStep }) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-hidden="true">
      {([1, 2, 3] as const).map((item) => (
        <span key={item} className={`h-1 rounded-full ${step >= item ? 'bg-accent' : 'bg-rule'}`} />
      ))}
    </div>
  );
}
