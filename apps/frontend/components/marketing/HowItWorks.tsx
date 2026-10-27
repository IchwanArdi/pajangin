import { BarChart3, Globe, Store, UserPlus } from 'lucide-react';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

const STEPS = [
  { n: '01', title: 'Masuk dengan Google', text: 'Satu klik, tanpa kata sandi. Akun dibuat otomatis saat pertama masuk.', icon: UserPlus },
  { n: '02', title: 'Isi profil bisnis', text: 'Kategori, kota, alamat, nomor WhatsApp, dan layanan pertama.', icon: Store },
  { n: '03', title: 'Halaman langsung tayang', text: 'Profil publik live dengan metadata SEO dan tombol chat.', icon: Globe },
  { n: '04', title: 'Pantau & optimalkan', text: 'Dashboard menunjukkan dari mana lead datang dan layanan yang laku.', icon: BarChart3 },
] as const;

export function HowItWorks() {
  return (
    <Section id="cara-kerja" tone="warm">
      <SectionHead
        eyebrow="Cara kerja"
        title="Mulai, tampil, ukur, tingkatkan."
        desc="Tidak perlu desainer atau konfigurasi teknis. Masuk dengan Google, isi profil, lalu halaman bisnis Anda siap dibagikan."
      />

      <div className="relative mt-16">
        <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-rule md:block" />
        <Reveal className="grid gap-10 md:grid-cols-4 md:gap-6" stagger={0.1}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative flex flex-col">
                <div className="flex items-center justify-between gap-4">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-ink bg-surface font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                    {s.n}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2 sm:text-[15px]">{s.text}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
