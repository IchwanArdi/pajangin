'use client';

import { useState } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import type { Business } from '../../lib/api';
import { createLead } from '../../lib/api';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection, type SiteTone } from './site-ui';

interface Props {
  business: Business;
  buildConsultationLink: (name: string, phone: string, need: string) => string;
  tone?: SiteTone;
}

const FIELD_CLASS =
  'w-full rounded-xl border border-rule bg-paper-2/60 px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent/15';
const LABEL_CLASS = 'mb-1.5 block text-[13px] font-medium text-ink';

const POINTS = [
  { title: 'Tidak perlu akun', desc: 'Cukup isi nama dan nomor WhatsApp.' },
  { title: 'Dibalas langsung', desc: 'Percakapan berlanjut di WhatsApp bisnis.' },
  { title: 'Data aman', desc: 'Hanya dipakai untuk membalas pertanyaan Anda.' },
];

export default function ContactSection({ business, buildConsultationLink, tone = 'plain' }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentLink, setSentLink] = useState('');

  return (
    <SiteSection tone={tone}>
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <SectionIntro
            eyebrow="Kirim pertanyaan"
            title="Tanya apa saja, dibalas via WhatsApp"
            sub="Isi singkat, kami lanjutkan percakapan di WhatsApp Anda."
          />

          <ul className="mt-7 space-y-3.5">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Check className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{point.title}</p>
                  <p className="text-sm text-ink-2">{point.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ItemReveal>
          {submitted ? (
            <div className="flex items-start gap-3 rounded-3xl border border-positive/25 bg-positive-soft/50 p-6 md:p-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-positive text-white">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink">Pesan sudah tercatat</p>
                <p className="mt-1 text-sm text-ink-2">
                  Lanjutkan percakapan di WhatsApp agar bisnis bisa membalas Anda.
                </p>
                {sentLink && (
                  <a
                    href={sentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
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
              className="space-y-4 rounded-3xl border border-rule bg-paper p-6 shadow-xs md:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={LABEL_CLASS}>Nama lengkap</span>
                  <input name="name" required placeholder="Contoh: Andi Saputra" className={FIELD_CLASS} />
                </label>
                <label className="block">
                  <span className={LABEL_CLASS}>Nomor WhatsApp</span>
                  <input name="phone" type="tel" required placeholder="0812..." className={FIELD_CLASS} />
                </label>
              </div>

              <label className="block">
                <span className={LABEL_CLASS}>Kebutuhan</span>
                <input
                  name="need"
                  placeholder="Contoh: Cuci AC, booking potong rambut, servis motor"
                  className={FIELD_CLASS}
                />
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-negative/30 bg-negative-soft px-4 py-3 text-sm text-negative">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="press w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-ink hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan pesan...' : 'Kirim & Chat WhatsApp'}
              </button>
            </form>
          )}
        </ItemReveal>
      </div>
    </SiteSection>
  );
}
