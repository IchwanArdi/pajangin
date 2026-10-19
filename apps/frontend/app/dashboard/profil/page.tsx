'use client';

/* Hallmark · page: Profil bisnis · app workbench · form berkelompok + save bar muncul saat ada perubahan
 * Pratinjau Google menunjukkan nilai SEO lokal secara nyata, bukan klaim. */

import { useState } from 'react';
import { Check, ExternalLink, Palette } from 'lucide-react';
import { Business, updateBusiness } from '../../../lib/api';
import { createClient } from '../../../lib/supabase/client';
import { BUSINESS_CATEGORIES } from '../../../lib/categories';
import { formatWaDisplay, isValidWhatsapp } from '../../../lib/whatsapp';
import { BUSINESS_TEMPLATES, getTemplateConfig } from '../../../lib/templates';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Card, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';
import { ImageUpload } from '../../../components/dashboard/ImageUpload';

type Form = {
  name: string;
  category: string;
  tagline: string;
  description: string;
  whatsapp: string;
  phone: string;
  address: string;
  city: string;
  opening_hours: string;
  google_maps_url: string;
  instagram_url: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
  hero_image_url: string;
  booking_enabled: boolean;
  testimonials: string;
  template: string;
  theme_color: string;
  faq: string;
  province: string;
  service_area: string;
  price_range: string;
};

type Testimonial = { name: string; rating: number | null; message: string };

function parseTestimonials(json: string | null | undefined): Testimonial[] {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.name === 'string' && typeof x.message === 'string') : [];
  } catch {
    return [];
  }
}

function stringifyTestimonials(list: Testimonial[]) {
  return JSON.stringify(list);
}

function fromBusiness(b: Business): Form {
  return {
    name: b.name,
    category: b.category,
    tagline: b.tagline ?? '',
    description: b.description ?? '',
    whatsapp: formatWaDisplay(b.whatsapp),
    phone: b.phone ?? '',
    address: b.address,
    city: b.city,
    opening_hours: b.opening_hours ?? '',
    google_maps_url: b.google_maps_url ?? '',
    instagram_url: b.instagram_url ?? '',
    meta_title: b.meta_title ?? '',
    meta_description: b.meta_description ?? '',
    logo_url: b.logo_url ?? '',
    hero_image_url: b.hero_image_url ?? '',
    booking_enabled: b.booking_enabled ?? false,
    testimonials: b.testimonials ?? '[]',
    template: b.template || 'default',
    theme_color: b.theme_color ?? '',
    faq: b.faq ?? '',
    province: b.province ?? '',
    service_area: b.service_area ?? '',
    price_range: b.price_range ?? '',
  };
}

export default function ProfilPage() {
  const { business } = useBusiness();
  if (!business) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-(--radius-card)" />
      </div>
    );
  }
  // key → form direset otomatis saat pindah bisnis
  return <ProfilForm key={business.id} business={business} />;
}

function ProfilForm({ business }: { business: Business }) {
  const { replaceBusiness } = useBusiness();
  const [saved, setSaved] = useState<Form>(() => fromBusiness(business));
  const [form, setForm] = useState<Form>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ name: '', rating: 5, message: '' });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setJustSaved(false);
  };
  const dirty = (Object.keys(form) as Array<keyof Form>).some((k) => form[k] !== saved[k]);
  const waValid = isValidWhatsapp(form.whatsapp);
  const requiredOk = form.name.trim() && form.category.trim() && form.address.trim() && form.city.trim() && waValid;
  const categories = BUSINESS_CATEGORIES.includes(form.category as (typeof BUSINESS_CATEGORIES)[number]) ? BUSINESS_CATEGORIES : [form.category, ...BUSINESS_CATEGORIES];

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!requiredOk) {
      setError(waValid ? 'Lengkapi nama, kategori, alamat, dan kota.' : 'Nomor WhatsApp tidak valid. Contoh: 081234567890');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateBusiness(business.id, {
        ...form,
        name: form.name.trim(),
        // kosong = hapus nilai di server
        tagline: form.tagline.trim(),
        description: form.description.trim(),
      });
      replaceBusiness(updated);
      const next = fromBusiness(updated);
      setSaved(next);
      setForm(next);
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.host}/${business.slug}` : `/${business.slug}`;

  const uploadBusinessPhoto = async (kind: 'logo' | 'hero', file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB.');

    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${business.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('business-assets').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
    return data.publicUrl;
  };
  const previewTitle = form.meta_title.trim() || `${form.name} - ${form.category} ${form.city}`;
  const previewDesc = form.meta_description.trim() || form.description.trim() || `${form.name} di ${form.city}. Hubungi via WhatsApp untuk reservasi dan informasi lebih lanjut.`;

  return (
    <form onSubmit={save} className="space-y-6 pb-20">
      <PageHeader
        title="Profil bisnis"
        description="Informasi ini tampil di halaman publik dan di hasil pencarian Google."
        actions={
          <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} /> Lihat halaman
          </a>
        }
      />

      {error && (
        <p role="alert" className="rounded-(--radius-input) bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <Section title="Informasi utama" description="Nama, kategori, dan cerita singkat bisnis Anda.">
            <Field label="Nama bisnis" htmlFor="name">
              <input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={field.input} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori" htmlFor="category">
                <select id="category" value={form.category} onChange={(e) => set('category', e.target.value)} className={field.input}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Slogan" htmlFor="tagline" optional>
                <input id="tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Servis cepat, harga jujur" className={field.input} />
              </Field>
            </div>
            <Field label="Deskripsi" htmlFor="description" optional hint={`${form.description.length}/300 · Sebutkan layanan dan kota Anda, misalnya "bengkel mobil di Purwokerto", agar mudah ditemukan di Google.`}>
              <textarea id="description" rows={4} maxLength={300} value={form.description} onChange={(e) => set('description', e.target.value)} className={field.textarea} />
            </Field>
          </Section>

          <Section title="Template & Desain Halaman" description="Pilih karakter visual yang paling mewakili identitas bisnis Anda di mata pelanggan.">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.values(BUSINESS_TEMPLATES).map((tmpl) => {
                  const isSelected = (form.template || 'default') === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        set('template', tmpl.id);
                        if (!form.theme_color) {
                          set('theme_color', tmpl.defaultAccent);
                        }
                      }}
                      className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected ? 'border-accent bg-accent-soft/20 shadow-sm ring-1 ring-accent' : 'border-rule bg-paper hover:border-ink-2/40 hover:bg-paper-2'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: tmpl.defaultAccent }} />
                          <h3 className="text-sm font-bold text-ink">{tmpl.name}</h3>
                        </div>
                        <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-ink-2">{tmpl.badge}</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-ink-2">{tmpl.tagline}</p>
                      <p className="mt-2 text-xs leading-relaxed text-ink-2/80">{tmpl.description}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent">
                          <Check className="h-3.5 w-3.5" /> Template Terpilih
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pilihan warna aksen */}
              <div className="rounded-2xl border border-rule bg-paper-2 p-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-accent" />
                  <label className="text-xs font-semibold text-ink">Warna Aksen Brand</label>
                </div>
                <p className="mt-1 text-xs text-ink-2">Digunakan untuk tombol utama, badge highlight, dan elemen penting di halaman publik.</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {getTemplateConfig(form.template).colorOptions.map((color) => {
                    const isColorActive = (form.theme_color || getTemplateConfig(form.template).defaultAccent) === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => set('theme_color', color)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${isColorActive ? 'border-ink scale-110 ring-2 ring-offset-2 ring-ink' : 'border-white/80'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Warna ${color}`}
                      />
                    );
                  })}

                  <div className="flex items-center gap-2 border-l border-rule pl-3">
                    <span className="text-xs text-ink-2 font-mono">Hex:</span>
                    <input
                      type="text"
                      placeholder="#e85d3a"
                      value={form.theme_color}
                      onChange={(e) => set('theme_color', e.target.value)}
                      className="h-8 w-24 rounded-lg border border-rule bg-paper px-2 text-xs font-mono uppercase text-ink outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Kontak" description="Cara pelanggan menghubungi Anda.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp" htmlFor="whatsapp" hint={form.whatsapp && !waValid ? 'Format belum valid. Contoh: 081234567890' : 'Tujuan tombol "Chat WhatsApp".'} invalid={Boolean(form.whatsapp) && !waValid}>
                <input id="whatsapp" type="tel" inputMode="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={field.input} />
              </Field>
              <Field label="Telepon" htmlFor="phone" optional hint="Tampilkan tombol telepon di halaman publik.">
                <input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0281 123456" className={field.input} />
              </Field>
            </div>
          </Section>

          <Section title="Foto bisnis" description="Foto ini membuat halaman publik lebih meyakinkan.">
            <ImageUpload label="Logo bisnis" hint="Tampil di header. Foto persegi/segi empat lebih rapi." value={form.logo_url} onChange={(url) => set('logo_url', url)} onUpload={(file) => uploadBusinessPhoto('logo', file)} />
            <ImageUpload
              label="Foto utama bisnis"
              hint="Tampil besar di atas halaman publik. Pilih foto tempat, produk, atau tim yang menarik."
              value={form.hero_image_url}
              onChange={(url) => set('hero_image_url', url)}
              onUpload={(file) => uploadBusinessPhoto('hero', file)}
            />
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input type="checkbox" checked={form.booking_enabled} onChange={(e) => set('booking_enabled', e.target.checked)} className="h-4 w-4 rounded border-rule accent-accent" />
              Tampilkan tombol Booking Cepat di halaman publik
            </label>
          </Section>

          <Section title="Testimoni" description="Bukti kepuasan pelanggan yang tampil di halaman publik.">
            <div className="space-y-3">
              {parseTestimonials(form.testimonials).map((t, i) => (
                <div key={i} className="rounded-xl border border-rule bg-paper-2 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {t.name} · {t.rating ? `${t.rating}/5` : '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const next = parseTestimonials(form.testimonials).filter((_, idx) => idx !== i);
                        set('testimonials', stringifyTestimonials(next));
                      }}
                      className={`${btn.ghost} ${btn.sm}`}
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-ink-2">{t.message}</p>
                </div>
              ))}
              {parseTestimonials(form.testimonials).length === 0 && <p className="text-sm text-ink-2">Belum ada testimoni. Tambahkan 1–3 ulasan pelanggan yang paling mewakili keunggulan bisnis Anda.</p>}
            </div>

            <div className="rounded-xl border border-dashed border-rule p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                <input value={newTestimonial.name} onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })} placeholder="Nama pelanggan" className={field.input} />
                <select value={newTestimonial.rating ?? 5} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })} className={field.input}>
                  <option value={5}>5 bintang</option>
                  <option value={4}>4 bintang</option>
                  <option value={3}>3 bintang</option>
                </select>
              </div>
              <textarea
                rows={2}
                value={newTestimonial.message}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                placeholder="Contoh: Pelayanannya cepat dan harga sesuai."
                className={`${field.textarea} mt-3`}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newTestimonial.name.trim() || !newTestimonial.message.trim()) return;
                  const next = [...parseTestimonials(form.testimonials), { ...newTestimonial, name: newTestimonial.name.trim(), message: newTestimonial.message.trim() }];
                  set('testimonials', stringifyTestimonials(next));
                  setNewTestimonial({ name: '', rating: 5, message: '' });
                }}
                className={`${btn.secondary} mt-3`}
              >
                Tambah testimoni
              </button>
            </div>

            <div className="rounded-xl border border-rule bg-paper-2 p-4">
              <p className="text-sm font-medium">Minta review via WhatsApp</p>
              <p className="mt-1 text-xs text-ink-2">Salin pesan berikut, kirim ke pelanggan yang sudah dilayani, lalu tambahkan jawabannya sebagai testimoni jika pelanggan mengizinkan.</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`Halo, terima kasih sudah menggunakan layanan ${form.name}. Bagaimana pengalaman Anda? Jika berkenan, boleh berikan ulasan singkat agar kami bisa melayani lebih baik.`)}
                className={`${btn.ghost} mt-2`}
              >
                Salin pesan minta review
              </button>
            </div>
          </Section>

          <Section title="Lokasi & jam buka" description="Membantu pelanggan datang ke tempat Anda.">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <Field label="Alamat" htmlFor="address">
                <input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} className={field.input} />
              </Field>
              <Field label="Kota" htmlFor="city">
                <input id="city" value={form.city} onChange={(e) => set('city', e.target.value)} className={field.input} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provinsi" htmlFor="province" optional>
                <input id="province" value={form.province} onChange={(e) => set('province', e.target.value)} placeholder="Jawa Tengah" className={field.input} />
              </Field>
              <Field label="Area layanan" htmlFor="service_area" optional hint="Contoh: Purwokerto, Banyumas, dan sekitarnya.">
                <input id="service_area" value={form.service_area} onChange={(e) => set('service_area', e.target.value)} className={field.input} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jam buka" htmlFor="opening_hours" optional>
                <input id="opening_hours" value={form.opening_hours} onChange={(e) => set('opening_hours', e.target.value)} placeholder="Senin–Sabtu 08.00–17.00" className={field.input} />
              </Field>
              <Field label="Kisaran harga" htmlFor="price_range" optional hint="Tampil sebagai informasi umum, bukan janji harga.">
                <input id="price_range" value={form.price_range} onChange={(e) => set('price_range', e.target.value)} placeholder="Rp50.000–Rp300.000" className={field.input} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Link Google Maps" htmlFor="google_maps_url" optional>
                <input id="google_maps_url" type="url" value={form.google_maps_url} onChange={(e) => set('google_maps_url', e.target.value)} placeholder="https://maps.app.goo.gl/…" className={field.input} />
              </Field>
              <Field label="Link Instagram" htmlFor="instagram_url" optional>
                <input id="instagram_url" type="url" value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://instagram.com/…" className={field.input} />
              </Field>
            </div>
          </Section>

          <Section title="FAQ halaman publik" description="Jawab pertanyaan yang paling sering ditanyakan pelanggan.">
            <Field
              label="Pertanyaan & jawaban"
              htmlFor="faq"
              optional
              hint="Satu pertanyaan di baris pertama, jawaban di baris berikutnya. Pisahkan setiap FAQ dengan satu baris kosong."
            >
              <textarea
                id="faq"
                rows={6}
                maxLength={4000}
                value={form.faq}
                onChange={(e) => set('faq', e.target.value)}
                placeholder={'Apakah harus reservasi?\nDisarankan reservasi via WhatsApp agar tidak menunggu.\n\nApakah bisa datang langsung?\nBisa, selama masih ada slot.'}
                className={field.textarea}
              />
            </Field>
          </Section>

          <Section title="Tampilan di Google" description="Opsional. Jika dikosongkan, dibuat otomatis dari nama, kategori, dan deskripsi.">
            <Field label="Judul" htmlFor="meta_title" optional hint={`${previewTitle.length}/60 karakter`}>
              <input id="meta_title" maxLength={70} value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} placeholder={`${form.name} - ${form.category} ${form.city}`} className={field.input} />
            </Field>
            <Field label="Deskripsi" htmlFor="meta_description" optional hint={`${previewDesc.length}/160 karakter`}>
              <textarea id="meta_description" rows={2} maxLength={170} value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} className={field.textarea} />
            </Field>
          </Section>
        </div>

        {/* Pratinjau (desktop: menempel di samping) */}
        <aside className="space-y-4 lg:sticky lg:top-8">
          {(() => {
            const currentTmpl = getTemplateConfig(form.template);
            const activeAccent = form.theme_color || currentTmpl.defaultAccent;
            return (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-2">Template Terpilih</p>
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-ink">{currentTmpl.badge}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: activeAccent }} />
                  <p className="text-sm font-bold text-ink">{currentTmpl.name}</p>
                </div>
                <p className="mt-1 text-xs text-ink-2">{currentTmpl.tagline}</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-paper-2 p-2.5">
                  <span className="text-[11px] text-ink-2">Aksen Brand</span>
                  <span className="font-mono text-[11px] font-bold text-ink uppercase">{activeAccent}</span>
                </div>
              </Card>
            );
          })()}

          <Card className="p-5">
            <p className="text-xs font-medium text-ink-2">Pratinjau di Google</p>
            <div className="mt-3 space-y-1">
              <p className="truncate text-xs text-ink-2">{publicUrl}</p>
              <p className="line-clamp-2 text-[17px] leading-snug" style={{ color: 'var(--color-serp-link)' }}>
                {previewTitle}
              </p>
              <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-2">{previewDesc}</p>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-medium text-ink-2">Link halaman Anda</p>
            <p className="mt-1.5 break-all font-mono text-sm text-ink">{publicUrl}</p>
            <p className="mt-2 text-xs text-ink-2">Link tidak berubah walau nama bisnis diganti, jadi aman dibagikan.</p>
          </Card>
        </aside>
      </div>

      {/* Save bar: hanya muncul saat ada perubahan (silent success sesudahnya) */}
      <div
        className={`fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 px-4 transition-[opacity,transform] duration-200 lg:bottom-6 lg:left-60 ${
          dirty || justSaved ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-rule bg-surface py-2 pl-5 pr-2 shadow-pop">
          {dirty ? (
            <>
              <span className="truncate text-sm text-ink">Ada perubahan yang belum disimpan</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setForm(saved);
                    setError('');
                  }}
                  className={`${btn.ghost} ${btn.sm}`}
                >
                  Batalkan
                </button>
                <button type="submit" disabled={saving} className={`${btn.primary} ${btn.sm}`}>
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </>
          ) : (
            <span className="inline-flex items-center gap-2 py-1.5 text-sm font-medium text-positive" role="status">
              <Check className="h-4 w-4" strokeWidth={2} /> Perubahan tersimpan
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-2">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Field({ label, htmlFor, optional, hint, invalid, children }: { label: string; htmlFor: string; optional?: boolean; hint?: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className={field.label}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-2">(opsional)</span>}
      </label>
      {children}
      {hint && <p className={`${field.hint} ${invalid ? 'text-negative' : ''}`}>{hint}</p>}
    </div>
  );
}
