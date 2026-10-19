'use client';

import { useState } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import type { Business } from '../../lib/api';
import { createLead } from '../../lib/api';
import { SectionIntro, SiteSection } from './site-ui';

interface Props {
  business: Business;
  buildConsultationLink: (name: string, phone: string, need: string) => string;
  tone?: 'paper' | 'alt';
}

export default function ContactSection({ business, buildConsultationLink, tone = 'paper' }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentLink, setSentLink] = useState('');

  return (
    <SiteSection tone={tone}>
      <div className="mx-auto max-w-3xl">
        <SectionIntro
          eyebrow="Kirim pertanyaan"
          title="Tanya apa saja, dibalas via WhatsApp"
          sub="Isi singkat, kami lanjutkan percakapan di WhatsApp Anda."
        />

        {submitted ? (
          <div className="mt-8 flex items-start gap-3 rounded-3xl border border-positive/25 bg-positive-soft p-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-positive text-white">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-ink">Pesan sudah tercatat</p>
              <p className="mt-1 text-sm text-ink-2">Lanjutkan percakapan di WhatsApp agar bisnis bisa membalas Anda.</p>
              {sentLink && (
                <a
                  href={sentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" /> Buka WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (submitting) return;

              const form = event.currentTarget;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
              const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
              const need = (form.elements.namedItem('need') as HTMLInputElement).value.trim();
              if (!name || !phone) return;

              // Buka tab kosong sekarang supaya popup tidak diblokir setelah await.
              const waWindow = window.open('', '_blank');
              setSubmitting(true);
              setError('');

              try {
                await createLead({
                  business_id: business.id,
                  name,
                  phone,
                  message: need || undefined,
                });

                const link = buildConsultationLink(name, phone, need);
                setSentLink(link);
                setSubmitted(true);
                if (waWindow) {
                  waWindow.location.href = link;
                } else {
                  window.location.href = link;
                }
              } catch (err) {
                waWindow?.close();
                setError(err instanceof Error ? err.message : 'Gagal mengirim pesan. Coba lagi.');
              } finally {
                setSubmitting(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Nama lengkap</span>
                <input
                  name="name"
                  required
                  placeholder="Contoh: Andi Saputra"
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Nomor WhatsApp</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="0812..."
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Kebutuhan</span>
              <input
                name="need"
                placeholder="Contoh: Cuci AC, booking potong rambut, servis motor"
                className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-2xl border border-negative/30 bg-negative-soft px-4 py-3 text-sm text-negative">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="press w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-ink hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan pesan...' : 'Kirim & Chat WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </SiteSection>
  );
}
