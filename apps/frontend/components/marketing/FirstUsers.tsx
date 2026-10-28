import { HeartHandshake, MapPin, MessagesSquare } from 'lucide-react';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

// Section "Pengguna pertama" — pengganti slot testimoni kosong.
// Hanya berisi fakta yang benar-benar berlaku hari ini (tanpa klaim karangan).
const CARDS = [
  {
    icon: HeartHandshake,
    title: 'Onboarding dibantu langsung',
    desc: 'Kami bantu mengisi profil usaha Anda — layanan, harga, sampai foto — hingga halaman live. Tanpa biaya jasa.',
  },
  {
    icon: MessagesSquare,
    title: 'Masukan Anda menentukan fitur',
    desc: 'Pajangin masih muda. Setiap masukan pengguna awal dibahas dan diprioritaskan untuk rilis berikutnya.',
  },
  {
    icon: MapPin,
    title: 'Fokus Purwokerto dulu',
    desc: 'Kami mendampingi langsung usaha di Purwokerto dan sekitarnya sebagai kota pertama, sebelum melebar ke kota lain.',
  },
] as const;

export function FirstUsers() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <SectionHead
          eyebrow="Pengguna pertama"
          title="Baru mulai — Anda bisa jadi yang pertama."
          desc="Kami sedang mendampingi usaha-usaha pertama di Purwokerto. Ini yang Anda dapatkan sebagai pengguna awal:"
        />

        <Reveal className="border-t border-rule" stagger={0.08}>
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="grid gap-5 border-b border-rule py-8 sm:grid-cols-[auto_1fr] sm:gap-7 sm:py-10">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-2xl">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2 sm:text-base">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
