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
    <Section id="cara-kerja" bordered>
      <SectionHead
        eyebrow="Cara kerja"
        title="Mulai, tampil, ukur, tingkatkan."
        desc="Tidak perlu desainer atau konfigurasi teknis. Masuk dengan Google, isi profil, lalu halaman bisnis Anda siap dibagikan."
      />
      <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="lift flex h-full flex-col rounded-2xl border border-rule bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-rule font-mono text-[11px] text-ink-2">
                  {s.n}
                </span>
                <Icon className="h-4.5 w-4.5 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 text-[15px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.text}</p>
            </div>
          );
        })}
      </Reveal>
    </Section>
  );
}
