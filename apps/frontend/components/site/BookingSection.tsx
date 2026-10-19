'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, MessageCircle } from 'lucide-react';
import type { Business, Service } from '../../lib/api';
import { createPublicBooking } from '../../lib/api';
import { trackBusinessEvent } from '../Tracker';
import { formatPrice, type BookingDraft } from '../../lib/business-page';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection } from './site-ui';

interface Props {
  business: Business;
  services: Service[];
  heading: string;
  buildBookingLink: (draft: BookingDraft) => string;
  tone?: 'paper' | 'alt';
}

function todayJakartaIso() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default function BookingSection({ business, services, heading, buildBookingLink, tone = 'alt' }: Props) {
  const [minDate, setMinDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [lastBooking, setLastBooking] = useState<BookingDraft | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMinDate(todayJakartaIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <SiteSection id="booking" tone={tone}>
      <div className="mx-auto max-w-3xl">
        <SectionIntro
          icon={CalendarCheck}
          eyebrow="Reservasi Online"
          title={heading}
          sub="Pilih tanggal dan jam kedatangan Anda. Kami akan mengonfirmasi jadwal melalui WhatsApp."
        />

        {submitted && lastBooking ? (
          <ItemReveal className="mt-8">
            <div className="rounded-3xl border border-positive/30 bg-positive-soft/40 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-positive text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-ink">Permintaan Reservasi Berhasil Diajukan!</h3>
                  <p className="text-xs text-ink-2">Data Anda telah tercatat di sistem kami.</p>
                </div>
              </div>

              <div className="mt-5 space-y-1.5 rounded-2xl border border-rule bg-paper p-4 text-xs text-ink">
                <p>
                  <span className="text-ink-2">Nama:</span> <strong>{lastBooking.name}</strong>
                </p>
                <p>
                  <span className="text-ink-2">WhatsApp:</span> <strong>{lastBooking.phone}</strong>
                </p>
                <p>
                  <span className="text-ink-2">Layanan:</span> <strong>{lastBooking.serviceName}</strong>
                </p>
                <p>
                  <span className="text-ink-2">Jadwal:</span>{' '}
                  <strong>
                    {lastBooking.date} · {lastBooking.time} WIB
                  </strong>
                </p>
                {lastBooking.pax > 1 && (
                  <p>
                    <span className="text-ink-2">Jumlah Tamu:</span> <strong>{lastBooking.pax} orang</strong>
                  </p>
                )}
                {lastBooking.note && (
                  <p>
                    <span className="text-ink-2">Catatan:</span> {lastBooking.note}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={buildBookingLink(lastBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-bold text-accent-ink hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Kirim Bukti Booking ke WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setLastBooking(null);
                  }}
                  className="press rounded-full border border-rule bg-paper px-5 py-3 text-sm font-semibold text-ink hover:bg-paper-2"
                >
                  Buat Reservasi Baru
                </button>
              </div>
            </div>
          </ItemReveal>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (submitting) return;
              const form = event.currentTarget;
              const name = (form.elements.namedItem('booking_name') as HTMLInputElement).value.trim();
              const phone = (form.elements.namedItem('booking_phone') as HTMLInputElement).value.trim();
              const serviceId = (form.elements.namedItem('booking_service') as HTMLSelectElement).value;
              const serviceName = services.find((service) => service.id === serviceId)?.name || '';
              const date = (form.elements.namedItem('booking_date') as HTMLInputElement).value;
              const time = (form.elements.namedItem('booking_time') as HTMLInputElement).value;
              const pax = Number((form.elements.namedItem('booking_pax') as HTMLInputElement)?.value) || 1;
              const note = (form.elements.namedItem('booking_note') as HTMLInputElement).value.trim();
              if (!name || !phone || !serviceId || !serviceName || !date || !time) return;

              setError('');
              setSubmitting(true);
              try {
                await createPublicBooking({
                  business_id: business.id,
                  name,
                  phone,
                  service_id: serviceId,
                  service_name: serviceName,
                  date,
                  time_slot: time,
                  pax,
                  notes: note,
                });
                trackBusinessEvent(business.id, 'lead_submit', serviceId, `Booking: ${serviceName}`);
                setLastBooking({ name, phone, serviceName, date, time, pax, note });
                setSubmitted(true);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Gagal mengirim booking. Silakan coba lagi.');
              } finally {
                setSubmitting(false);
              }
            }}
            className="mt-8 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Nama lengkap *</span>
                <input
                  name="booking_name"
                  required
                  placeholder="Nama Anda"
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Nomor WhatsApp *</span>
                <input
                  name="booking_phone"
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">Layanan / Paket *</span>
                <select
                  name="booking_service"
                  required
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                >
                  <option value="">Pilih layanan...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} {service.price ? `(${formatPrice(service.price, service.price_prefix)})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Jumlah Tamu/Pax</span>
                <input
                  name="booking_pax"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Tanggal Kedatangan *</span>
                <input
                  name="booking_date"
                  type="date"
                  required
                  min={minDate || undefined}
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">Jam Kedatangan *</span>
                <input
                  name="booking_time"
                  type="time"
                  required
                  className="w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Catatan / Permintaan Khusus</span>
              <input
                name="booking_note"
                placeholder="Contoh: Meja dekat jendela / keluhan rem bunyi"
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
              {submitting ? 'Menyimpan Reservasi...' : 'Ajukan Reservasi Sekarang'}
            </button>
          </form>
        )}
      </div>
    </SiteSection>
  );
}
