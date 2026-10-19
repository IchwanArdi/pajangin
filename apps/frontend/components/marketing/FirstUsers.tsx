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
    <Section bordered>
      <SectionHead
        eyebrow="Pengguna pertama"
        title="Baru mulai — Anda bisa jadi yang pertama."
        desc="Kami sedang mendampingi usaha-usaha pertama di Purwokerto. Ini yang Anda dapatkan sebagai pengguna awal:"
      />
      <Reveal className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.08}>
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="lift flex h-full flex-col rounded-2xl border border-rule bg-surface p-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{c.desc}</p>
            </div>
          );
        })}
      </Reveal>
    </Section>
  );
}
