import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell, { LegalSection, type LegalSectionLink } from '../../components/legal/LegalPageShell';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '../../lib/seo';
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_HREF } from '../../lib/legal';

const TITLE = 'Syarat & Ketentuan — Pajangin';
const DESCRIPTION =
  'Ketentuan penggunaan Pajangin: akun, konten bisnis, batas wajar layanan gratis, notifikasi WhatsApp, dan hak pengguna.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/syarat' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/syarat',
    siteName: SITE_NAME,
    locale: 'id_ID',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

const SECTIONS: LegalSectionLink[] = [
  { id: 'tentang', title: 'Tentang Pajangin' },
  { id: 'akun', title: 'Akun dan tanggung jawab' },
  { id: 'konten', title: 'Konten bisnis Anda' },
  { id: 'aturan', title: 'Aturan penggunaan' },
  { id: 'gratis', title: 'Gratis dan batas wajar' },
  { id: 'whatsapp', title: 'WhatsApp dan pihak ketiga' },
  { id: 'ketersediaan', title: 'Ketersediaan layanan' },
  { id: 'penghapusan', title: 'Penghentian dan penghapusan akun' },
  { id: 'kekayaan', title: 'Hak kekayaan intelektual' },
  { id: 'tanggung-jawab', title: 'Batasan tanggung jawab' },
  { id: 'perubahan', title: 'Perubahan ketentuan' },
  { id: 'hukum', title: 'Hukum yang berlaku' },
  { id: 'kontak', title: 'Hubungi kami' },
];

const linkClass =
  'font-medium text-ink underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent';
const listClass = 'list-disc space-y-2 pl-5 marker:text-accent';

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Syarat & Ketentuan"
      intro={
        <p>
          Ketentuan ini mengatur penggunaan Pajangin, layanan gratis untuk membuat halaman bisnis lokal,
          menerima pesan atau booking, dan melihat statistik pengunjung. Dengan membuat akun atau memakai
          layanan, Anda menyetujui ketentuan ini.
        </p>
      }
      sections={SECTIONS}
    >
      <LegalSection id="tentang" title="Tentang Pajangin">
        <p>
          Pajangin membantu pemilik usaha lokal membuat satu halaman publik berisi profil, layanan, harga,
          jam buka, foto, tombol WhatsApp, booking, dan analitik. Pajangin dikelola secara independen di
          Purwokerto, Indonesia.
        </p>
        <p>
          Fitur dapat berubah, ditambah, atau dihentikan seiring pengembangan produk. Kami berupaya
          memberi informasi yang jelas sebelum perubahan besar yang memengaruhi penggunaan Anda.
        </p>
      </LegalSection>

      <LegalSection id="akun" title="Akun dan tanggung jawab">
        <ul className={listClass}>
          <li>Anda wajib memberikan informasi yang benar dan menjaga kerahasiaan akses akun.</li>
          <li>
            Anda bertanggung jawab atas aktivitas yang dilakukan melalui akun Anda. Beri tahu kami segera
            jika mengetahui akses yang tidak sah.
          </li>
          <li>
            Anda menyatakan berwenang mewakili usaha yang didaftarkan, serta berusia minimal 18 tahun atau
            mendapat izin orang tua/wali.
          </li>
          <li>Satu alamat email digunakan untuk satu akun. Satu akun dapat mengelola beberapa bisnis.</li>
        </ul>
      </LegalSection>

      <LegalSection id="konten" title="Konten bisnis Anda">
        <p>
          Konten yang Anda unggah—teks, foto, logo, harga, dan informasi bisnis—tetap milik Anda. Anda
          memberi Pajangin izin terbatas, non-eksklusif, dan dapat dicabut untuk menyimpan, menampilkan,
          memproses, dan membuat cadangan konten tersebut agar layanan dapat berjalan.
        </p>
        <p>
          Anda bertanggung jawab memastikan konten tidak melanggar hak cipta, merek, privasi, atau hak
          pihak lain. Jangan mengunggah foto atau data pribadi orang lain tanpa izin. Informasi yang Anda
          buat publik dapat dilihat dan dibagikan oleh siapa saja.
        </p>
      </LegalSection>

      <LegalSection id="aturan" title="Aturan penggunaan">
        <p>Anda tidak boleh memakai Pajangin untuk:</p>
        <ul className={listClass}>
          <li>kegiatan melanggar hukum, penipuan, penyesatan, atau penyamaran identitas;</li>
          <li>konten dewasa, perjudian ilegal, narkoba, senjata ilegal, atau produk yang dilarang di Indonesia;</li>
          <li>spam, phishing, malware, atau upaya mengakses akun dan sistem orang lain;</li>
          <li>mengambil data secara massal, membebani layanan secara tidak wajar, atau mengganggu pengguna lain;</li>
          <li>menyalahgunakan fitur WhatsApp atau melanggar ketentuan WhatsApp dan penyedia gateway.</li>
        </ul>
        <p>
          Kami dapat menolak, menghapus, atau menangguhkan konten dan akun yang melanggar aturan ini atau
          membahayakan layanan, tanpa mengurangi hak Anda untuk mengajukan keberatan.
        </p>
      </LegalSection>

      <LegalSection id="gratis" title="Gratis dan batas wajar">
        <p>
          Pajangin saat ini gratis dan tidak meminta pembayaran. Untuk menjaga layanan tetap tersedia, kami
          menerapkan batas wajar:
        </p>
        <ul className={listClass}>
          <li>AI Konten: maksimal 20 generate per akun per hari;</li>
          <li>galeri: maksimal 24 foto per bisnis;</li>
          <li>notifikasi WhatsApp: maksimal 20 pesan per bisnis per hari.</li>
        </ul>
        <p>
          Batas dapat disesuaikan untuk alasan keamanan, penyalahgunaan, atau biaya operasional. Perubahan
          material akan diinformasikan melalui dashboard atau email.
        </p>
      </LegalSection>

      <LegalSection id="whatsapp" title="WhatsApp dan pihak ketiga">
        <p>
          Notifikasi pesan dan booking dikirim melalui gateway pihak ketiga ke WhatsApp. Pengiriman tidak
          selalu berhasil dan dapat bergantung pada nomor, jaringan, kuota, serta kebijakan WhatsApp.
          Pajangin tidak menjamin setiap notifikasi diterima.
        </p>
        <p>
          Layanan ini memakai penyedia seperti Supabase, penyedia hosting, Google, dan gateway WhatsApp.
          Penggunaan layanan pihak ketiga juga tunduk pada ketentuan mereka. Pajangin bukan pihak dalam
          transaksi antara Anda dan pelanggan.
        </p>
      </LegalSection>

      <LegalSection id="ketersediaan" title="Ketersediaan layanan">
        <p>
          Kami berupaya menjaga layanan tetap berjalan, tetapi tidak menjamin layanan bebas gangguan atau
          selalu tersedia. Pemeliharaan, gangguan jaringan, atau kejadian di luar kendali dapat membuat
          layanan berhenti sementara.
        </p>
        <p>
          Kami dapat menangguhkan akun untuk mencegah penyalahgunaan, mematuhi hukum, atau melindungi
          pengguna dan layanan.
        </p>
      </LegalSection>

      <LegalSection id="penghapusan" title="Penghentian dan penghapusan akun">
        <p>
          Anda dapat berhenti menggunakan Pajangin kapan saja dan menghapus akun langsung dari halaman{' '}
          <strong className="font-semibold text-ink">Akun &amp; keamanan</strong> di dashboard. Jika tidak
          bisa masuk, kirim permintaan ke{' '}
          <a href={LEGAL_CONTACT_HREF} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Halaman publik yang terkait akan dihapus dari layanan aktif.
        </p>
        <p>
          Salinan cadangan, log keamanan, atau arsip dapat bertahan untuk waktu terbatas sebelum terhapus
          sesuai siklus penyimpanan. Data agregat yang tidak mengidentifikasi Anda dapat dipertahankan
          untuk statistik.
        </p>
      </LegalSection>

      <LegalSection id="kekayaan" title="Hak kekayaan intelektual">
        <p>
          Nama, logo, desain, kode, dan materi Pajangin dilindungi hukum. Anda tidak boleh menyalin,
          menjual, atau memakai materi tersebut untuk produk lain tanpa izin tertulis.
        </p>
        <p>
          Anda tetap memiliki hak atas konten bisnis Anda. Izin yang Anda berikan kepada Pajangin hanya
          untuk menjalankan dan menampilkan layanan, bukan untuk menjual konten Anda.
        </p>
      </LegalSection>

      <LegalSection id="tanggung-jawab" title="Batasan tanggung jawab">
        <p>
          Sejauh diizinkan hukum yang berlaku, Pajangin tidak bertanggung jawab atas kerugian tidak
          langsung, kehilangan keuntungan, kehilangan data, tindakan pelanggan, atau kegagalan layanan
          pihak ketiga. Anda bertanggung jawab atas informasi, produk, dan transaksi bisnis Anda.
        </p>
        <p>
          Tidak ada ketentuan dalam halaman ini yang menghapus hak konsumen yang tidak dapat dikecualikan
          menurut hukum Indonesia.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="Perubahan ketentuan">
        <p>
          Kami dapat memperbarui ketentuan ini. Tanggal pembaruan tertera di bagian atas halaman. Untuk
          perubahan material, kami berupaya memberi tahu melalui email atau dashboard. Jika Anda tetap
          memakai layanan setelah perubahan berlaku, Anda dianggap menyetujui versi terbaru.
        </p>
      </LegalSection>

      <LegalSection id="hukum" title="Hukum yang berlaku">
        <p>
          Ketentuan ini tunduk pada hukum Republik Indonesia. Jika terjadi perselisihan, kami akan
          berupaya menyelesaikannya secara musyawarah terlebih dahulu. Perselisihan yang tidak dapat
          diselesaikan akan diserahkan kepada pengadilan yang berwenang di Indonesia.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="Hubungi kami">
        <p>
          Pertanyaan tentang ketentuan ini dapat dikirim ke{' '}
          <a href={LEGAL_CONTACT_HREF} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Sertakan alamat email akun agar kami dapat membantu lebih cepat.
        </p>
        <p>
          Baca juga{' '}
          <Link href="/privasi" className={linkClass}>
            Kebijakan Privasi
          </Link>{' '}
          untuk memahami bagaimana data diproses.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
