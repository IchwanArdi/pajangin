'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Bot, Copy, Check, RefreshCw, FileText, Hash, Search, HelpCircle, MessageSquare, Star, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Card, CardHeader, PageHeader, Badge, Skeleton, btn, field } from '../../../components/dashboard/ui';
import { generateAiContent, getAiProviders, updateBusiness, getServices, type AiContentType, type Service, type AiProvidersResponse } from '../../../lib/api';

interface ContentTypeConfig {
  type: AiContentType;
  label: string;
  icon: typeof FileText;
  description: string;
  category: 'profil' | 'marketing' | 'komunikasi';
  canApplyToProfile?: boolean;
}

const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    type: 'deskripsi_bisnis',
    label: 'Deskripsi Profil Bisnis',
    icon: FileText,
    description: 'Deskripsi menarik 2-3 paragraf untuk halaman landing page Anda.',
    category: 'profil',
    canApplyToProfile: true,
  },
  {
    type: 'tagline',
    label: 'Tagline & Slogan',
    icon: Sparkles,
    description: '5 opsi slogan pendek, catchy, dan mudah diingat konsumen.',
    category: 'profil',
    canApplyToProfile: true,
  },
  {
    type: 'deskripsi_layanan',
    label: 'Deskripsi Layanan / Produk',
    icon: Layers,
    description: 'Deskripsi persuasif untuk menu atau katalog layanan bisnis Anda.',
    category: 'profil',
  },
  {
    type: 'post_sosmed',
    label: 'Ide Post Media Sosial',
    icon: Hash,
    description: '3 ide postingan Instagram/TikTok lengkap dengan caption & hashtag.',
    category: 'marketing',
  },
  {
    type: 'seo_meta',
    label: 'SEO Meta Tag Google',
    icon: Search,
    description: 'Meta Title & Description optimal agar mudah dicari di Google.',
    category: 'marketing',
    canApplyToProfile: true,
  },
  {
    type: 'faq',
    label: 'Tanya Jawab (FAQ)',
    icon: HelpCircle,
    description: '5 daftar pertanyaan umum calon pelanggan beserta jawabannya.',
    category: 'marketing',
    canApplyToProfile: true,
  },
  {
    type: 'ucapan_whatsapp',
    label: 'Template Pesan WhatsApp',
    icon: MessageSquare,
    description: 'Template pesan sambutan, follow-up, dan promo ramah WhatsApp.',
    category: 'komunikasi',
  },
  {
    type: 'testimonial_request',
    label: 'Template Minta Testimoni',
    icon: Star,
    description: 'Format pesan sopan meminta review/ulasan positif ke pelanggan.',
    category: 'komunikasi',
  },
];

export default function AiPage() {
  const { business, status: bizStatus, reload: reloadBiz } = useBusiness();
  const [providers, setProviders] = useState<AiProvidersResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedType, setSelectedType] = useState<AiContentType>('deskripsi_bisnis');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [tone, setTone] = useState<'profesional' | 'santai' | 'formal'>('profesional');
  const [preferredProvider, setPreferredProvider] = useState<'auto' | 'gemini' | 'openai'>('auto');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; provider: string; type: AiContentType } | null>(null);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load providers status & services
  useEffect(() => {
    if (!business?.id) return;
    getAiProviders(business.id)
      .then(setProviders)
      .catch(() => setProviders({ openai: true, gemini: true }));

    getServices(business.id)
      .then(setServices)
      .catch(() => setServices([]));
  }, [business?.id]);

  const providerStatus = providers ?? { openai: true, gemini: true };

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const handleGenerate = async () => {
    if (!business?.id) return;
    setLoading(true);
    setError(null);
    setApplySuccess(false);

    try {
      const res = await generateAiContent(business.id, {
        content_type: selectedType,
        context: context.trim() || undefined,
        service_id: selectedType === 'deskripsi_layanan' && selectedServiceId ? selectedServiceId : undefined,
        tone,
        provider: preferredProvider === 'auto' ? undefined : preferredProvider,
      });
      setResult({
        content: res.content,
        provider: res.provider,
        type: res.content_type,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal menghasilkan konten dengan AI.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToProfile = async () => {
    if (!business?.id || !result?.content) return;
    setApplying(true);
    setError(null);

    try {
      if (result.type === 'deskripsi_bisnis') {
        await updateBusiness(business.id, { description: result.content });
      } else if (result.type === 'tagline') {
        // Ambil baris pertama atau baris bersih
        const firstLine =
          result.content
            .split('\n')
            .map((s) =>
              s
                .replace(/^[0-9]+[.)\-]\s*/, '')
                .replace(/^"|"$/g, '')
                .trim(),
            )
            .filter(Boolean)[0] || result.content.slice(0, 80);
        await updateBusiness(business.id, { tagline: firstLine });
      } else if (result.type === 'seo_meta') {
        const titleMatch = result.content.match(/Meta Title:\s*(.*)/i);
        const descMatch = result.content.match(/Meta Description:\s*(.*)/i);
        await updateBusiness(business.id, {
          meta_title: titleMatch?.[1]?.trim() || undefined,
          meta_description: descMatch?.[1]?.trim() || undefined,
        });
      } else if (result.type === 'faq') {
        // Prompt meminta format "Q: ... A: ...". Ubah ke format yang dipakai
        // parseFaq(): pertanyaan di baris pertama, jawaban di baris berikutnya.
        const matches = [
          ...result.content.matchAll(
            /Q\s*:\s*([\s\S]*?)\s*A\s*:\s*([\s\S]*?)(?=\n\s*(?:\d+[.)]\s*)?Q\s*:|$)/gi,
          ),
        ];
        const faq = matches
          .map((match) => `${match[1].trim()}\n${match[2].trim()}`)
          .filter((item) => item.split('\n').every(Boolean))
          .join('\n\n');

        if (!faq) {
          throw new Error('Format FAQ dari AI belum dikenali. Salin jawabannya secara manual ke Profil.');
        }
        await updateBusiness(business.id, { faq });
      }
      setApplySuccess(true);
      await reloadBiz();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal menerapkan ke profil bisnis.'));
    } finally {
      setApplying(false);
    }
  };

  if (bizStatus === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!business) return null;

  const currentTypeConfig = CONTENT_TYPES.find((c) => c.type === selectedType) || CONTENT_TYPES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Content Generator"
        description="Buat copywriting profesional, konten media sosial, dan materi pemasaran instan dengan Gemini & OpenAI."
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-xs font-medium text-ink-2">
              <Bot className="h-3.5 w-3.5 text-accent" />
              {providerStatus.gemini ? 'Gemini' : 'Gemini tidak tersedia'} • {providerStatus.openai ? 'OpenAI' : 'OpenAI tidak tersedia'}
            </span>
          </div>
        }
      />

      {/* Grid Utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Pilihan Template / Jenis Konten */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader title="1. Pilih Jenis Konten" description="Pilih jenis materi yang ingin Anda buatkan oleh AI." />
            <div className="space-y-2 p-5">
              {CONTENT_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(item.type);
                      setApplySuccess(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected ? 'border-accent bg-accent-soft/20 text-ink shadow-xs' : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-ink-2'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-ink'}`}>{item.label}</span>
                        {item.canApplyToProfile && <span className="text-[10px] font-medium text-ink-2/80">Sync Profil</span>}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-2">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Pengaturan Model & Nada Bahasa */}
          <Card>
            <CardHeader title="2. Pengaturan Gaya & AI" description="Sesuaikan nada bicara dan AI provider yang diinginkan." />
            <div className="space-y-4 p-5">
              {/* Nada Bicara */}
              <div>
                <label className={field.label}>Gaya Bahasa (Tone)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'profesional', label: 'Profesional' },
                      { id: 'santai', label: 'Santai & Ramah' },
                      { id: 'formal', label: 'Formal / Resmi' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${tone === t.id ? 'border-accent bg-accent-soft/40 text-accent' : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider AI */}
              <div>
                <label className={field.label}>Model AI</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredProvider('auto')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      preferredProvider === 'auto' ? 'border-accent bg-accent-soft/40 text-accent' : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'
                    }`}
                  >
                    Otomatis
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredProvider('gemini')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      preferredProvider === 'gemini' ? 'border-accent bg-accent-soft/40 text-accent' : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'
                    }`}
                  >
                    Gemini 3.6
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredProvider('openai')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      preferredProvider === 'openai' ? 'border-accent bg-accent-soft/40 text-accent' : 'border-rule bg-surface text-ink-2 hover:border-paper-3 hover:text-ink'
                    }`}
                  >
                    GPT-4o Mini
                  </button>
                </div>
                <p className={field.hint}>Mode Otomatis memprioritaskan Gemini dan otomatis beralih ke OpenAI jika kuota habis.</p>
              </div>

              {/* Khusus untuk deskripsi_layanan */}
              {selectedType === 'deskripsi_layanan' && services.length > 0 && (
                <div>
                  <label className={field.label}>Pilih Layanan Spesifik (Opsional)</label>
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className={field.input}>
                    <option value="">Semua Layanan (Rangkuman)</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.price ? `(Rp ${s.price.toLocaleString('id-ID')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Instruksi Tambahan */}
              <div>
                <label className={field.label}>Catatan Tambahan (Opsional)</label>
                <textarea rows={2} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Misal: 'Sertakan diskon pembukaan 20%', 'Target ibu-ibu muda', dll." className={field.textarea} />
              </div>

              {/* Tombol Eksekusi */}
              <button type="button" onClick={handleGenerate} disabled={loading} className={`${btn.primary} w-full py-2.5 text-sm font-semibold`}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sedang Menulis Konten...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Hasilkan Konten dengan AI
                  </>
                )}
              </button>
              <p className={`${field.hint} text-center`}>
                Gratis 20 generate per akun per hari. Kuota direset setiap hari (WIB).
              </p>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Hasil & Preview */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="flex h-full min-h-115 flex-col">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <span>Hasil Konten AI</span>
                  {result && <Badge tone="positive">{result.provider.toUpperCase()}</Badge>}
                </div>
              }
              description="Review hasil copywriting dan salin atau terapkan langsung ke profil Anda."
              action={
                result && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleCopy} className={btn.secondary} title="Salin ke Clipboard">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-positive" />
                          <span className="text-xs">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-xs">Salin</span>
                        </>
                      )}
                    </button>
                    {currentTypeConfig.canApplyToProfile && (
                      <button type="button" onClick={handleApplyToProfile} disabled={applying} className={`${btn.primary} ${btn.sm}`}>
                        {applying ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : applySuccess ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Diterapkan!
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-3.5 w-3.5" />
                            Terapkan ke Profil
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              }
            />

            <div className="flex flex-1 flex-col p-5">
              {error && <div className="mb-4 rounded-xl border border-negative/30 bg-negative-soft p-3.5 text-xs text-negative">{error}</div>}

              {applySuccess && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-positive/30 bg-positive-soft p-3.5 text-xs text-positive">
                  <span>Konten berhasil disimpan ke Profil Bisnis Anda!</span>
                  <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline hover:text-positive">
                    Lihat Website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Sparkles className="h-6 w-6 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">AI sedang merancang copywriting...</p>
                    <p className="mt-1 text-xs text-ink-2">
                      Menganalisis kategori bisnis ({business.category}), lokasi ({business.city}), dan layanan Anda.
                    </p>
                  </div>
                </div>
              ) : result ? (
                <div className="flex-1 space-y-4">
                  <div className="rounded-xl border border-rule bg-paper-2/60 p-4 font-sans text-sm leading-relaxed text-ink whitespace-pre-wrap select-text">{result.content}</div>

                  <div className="flex items-center justify-between border-t border-rule pt-4 text-xs text-ink-2">
                    <span>
                      Dihasilkan khusus untuk <strong>{business.name}</strong>
                    </span>
                    <button type="button" onClick={handleGenerate} className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                      <RefreshCw className="h-3 w-3" />
                      Hasilkan Variasi Lain
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-16 text-center text-ink-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-2">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-ink">Belum ada konten dibuat</p>
                    <p className="mt-1 text-xs">Pilih jenis konten di sebelah kiri lalu klik tombol &quot;Hasilkan Konten dengan AI&quot;.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
