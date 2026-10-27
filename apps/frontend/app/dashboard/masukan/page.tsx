'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Bug,
  CheckCircle2,
  ChevronDown,
  Inbox,
  Lightbulb,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Send,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { submitFeedback, type FeedbackCategory } from '../../../lib/api';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Card, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

const CATEGORIES: Array<{
  value: FeedbackCategory;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { value: 'masukan', label: 'Ide & masukan', description: 'Fitur atau perbaikan yang Anda butuhkan.', icon: Lightbulb },
  { value: 'kritik', label: 'Kritik', description: 'Bagian yang membingungkan atau kurang nyaman.', icon: MessageSquare },
  { value: 'bug', label: 'Bug / error', description: 'Ada yang rusak, gagal simpan, atau tampil aneh.', icon: Bug },
  { value: 'lainnya', label: 'Lainnya', description: 'Apa saja yang tidak masuk kategori di atas.', icon: MoreHorizontal },
];

const QUICK_GUIDE = [
  {
    question: 'Apa bedanya Pesan masuk dan chat WhatsApp?',
    answer:
      'Pesan masuk hanya mencatat form kontak di halaman publik. Chat WhatsApp yang langsung masuk ke HP Anda tidak otomatis muncul di dashboard.',
  },
  {
    question: 'Apa arti angka di Ringkasan?',
    answer:
      'Klik kontak menghitung tombol WhatsApp atau telepon yang ditekan. Pesan form menghitung form kontak yang dikirim. Rasio klik kontak membandingkan klik dengan jumlah pengunjung.',
  },
  {
    question: 'Bagaimana cara muncul di Google?',
    answer:
      'Lengkapi profil, deskripsi, layanan, dan bagikan link halaman. Pajangin menyiapkan judul dan deskripsi otomatis. Proses muncul di Google butuh waktu dan tidak bisa dijamin.',
  },
  {
    question: 'Apa bedanya foto utama dan galeri?',
    answer:
      'Foto utama diatur di Profil bisnis dan tampil besar di bagian atas halaman. Galeri untuk foto tambahan seperti menu, hasil kerja, dan suasana tempat.',
  },
  {
    question: 'Apa itu booking online?',
    answer:
      'Pelanggan memilih tanggal dan jam sendiri lewat halaman publik. Anda mengonfirmasi dari halaman Booking, lalu bisa memberi tahu pelanggan lewat WhatsApp.',
  },
];

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-5 h-24 w-full" />
          <Skeleton className="mt-6 h-5 w-28" />
          <Skeleton className="mt-3 h-32 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-4 h-28 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { business, businesses, status } = useBusiness();
  const [category, setCategory] = useState<FeedbackCategory>('masukan');
  const [rating, setRating] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const selectedBusinessId = businessId ?? business?.id ?? '';

  if (status === 'loading') return <FormSkeleton />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (text.length < 10) {
      setError('Tulis minimal 10 karakter supaya masukan Anda cukup jelas.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitFeedback({
        category,
        rating,
        message: text,
        business_id: selectedBusinessId || null,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim masukan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSent(false);
    setCategory('masukan');
    setRating(null);
    setMessage('');
    setError('');
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bantuan & Masukan"
          description="Masukan Anda membantu Pajangin menjadi lebih berguna untuk UMKM."
        />
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-positive-soft text-positive">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink">Terima kasih — masukan Anda sudah masuk.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            Saya membaca semua masukan. Kalau perlu klarifikasi, saya akan menghubungi lewat email atau WhatsApp yang terdaftar di akun ini.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={resetForm} className={btn.primary}>
              <Send className="h-4 w-4" /> Kirim masukan lain
            </button>
            <Link href="/dashboard" className={btn.secondary}>
              Kembali ke ringkasan
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bantuan & Masukan"
        description="Baca panduan singkat, lalu kirim kritik, bug, atau ide yang bisa membuat Pajangin lebih berguna."
      />

      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">Panduan cepat</h2>
            <p className="mt-0.5 text-sm text-ink-2">Pertanyaan yang paling sering muncul saat pertama kali memakai dashboard.</p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-rule border-y border-rule">
          {QUICK_GUIDE.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md py-3 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-ink-2 transition-transform group-open:rotate-180" strokeWidth={1.75} />
              </summary>
              <p className="pb-3 pr-6 text-sm leading-relaxed text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset>
              <legend className={field.label}>Jenis masukan</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CATEGORIES.map((item) => {
                  const Icon = item.icon;
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      aria-pressed={active}
                      className={`flex items-start gap-3 rounded-(--radius-input) border p-3 text-left transition-colors ${
                        active
                          ? 'border-accent bg-accent-soft'
                          : 'border-rule bg-surface hover:border-ink-2/30 hover:bg-paper-2'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-ink-2'
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{item.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={field.label}>Seberapa terbantu Anda dengan Pajangin? <span className="font-normal text-ink-2">(opsional)</span></span>
                {rating !== null && (
                  <button type="button" onClick={() => setRating(null)} className="text-xs text-ink-2 underline-offset-2 hover:underline">
                    Hapus rating
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1" role="group" aria-label="Rating 1 sampai 5">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = rating !== null && value <= rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating((current) => (current === value ? null : value))}
                      aria-label={`${value} dari 5`}
                      aria-pressed={rating === value}
                      className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <Star className={`h-6 w-6 ${active ? 'fill-warning text-warning' : 'text-ink-2/35'}`} strokeWidth={1.5} />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-ink-2">{rating ? `${rating}/5` : 'Belum dinilai'}</span>
              </div>
            </div>

            <div>
              <label htmlFor="feedback-business" className={field.label}>
                Terkait bisnis
              </label>
              <select
                id="feedback-business"
                value={selectedBusinessId}
                onChange={(event) => setBusinessId(event.target.value)}
                className={field.input}
              >
                <option value="">Umum — bukan tentang bisnis tertentu</option>
                {businesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <p className={field.hint}>Konteks bisnis membantu saya memahami masalahnya, tanpa perlu Anda menjelaskan ulang.</p>
            </div>

            <div>
              <label htmlFor="feedback-message" className={field.label}>
                Pesan
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={7}
                maxLength={2000}
                placeholder="Ceritakan apa yang terjadi, apa yang Anda harapkan, atau ide yang menurut Anda penting. Contoh: 'Saya bingung cara mengganti foto hero di halaman profil...'"
                className={field.textarea}
              />
              <div className="flex items-center justify-between gap-3">
                <p className={field.hint}>Minimal 10 karakter. Jangan tulis kata sandi atau data sensitif.</p>
                <p className={`${field.hint} shrink-0 tabular-nums`}>{message.length}/2000</p>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-(--radius-input) border border-negative/30 bg-negative-soft px-3 py-2.5 text-sm text-negative">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
              <button
                type="submit"
                disabled={submitting || message.trim().length < 10}
                className={btn.primary}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Mengirim…' : 'Kirim masukan'}
              </button>
              <span className="text-xs text-ink-2">Langsung masuk ke inbox admin. Tidak dipublikasikan.</span>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Inbox className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <h2 className="text-sm font-semibold text-ink">Apa yang terjadi setelah ini?</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-2">
              <li>Masukan masuk ke dashboard admin Pajangin, bukan ke notifikasi WhatsApp.</li>
              <li>Saya membaca semua masukan dan menandainya sudah dibaca atau selesai.</li>
              <li>Kalau perlu klarifikasi, saya menghubungi lewat email atau WhatsApp akun ini.</li>
              <li>Masukan tidak ditampilkan ke publik dan bukan ulasan bisnis Anda.</li>
            </ul>
          </Card>

          <Card className="bg-paper-2 p-5">
            <h2 className="text-sm font-semibold text-ink">Pajangin masih tahap awal</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Kritik yang jujur justru paling membantu. Kalau ada fitur yang terasa setengah jadi, bug, atau alur yang membingungkan, itu prioritas untuk saya perbaiki.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
