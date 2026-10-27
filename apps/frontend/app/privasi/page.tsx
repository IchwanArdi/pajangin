import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageShell, { LegalSection, type LegalSectionLink } from '../../components/legal/LegalPageShell';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '../../lib/seo';
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_HREF } from '../../lib/legal';

const TITLE = 'Kebijakan Privasi — Pajangin';
const DESCRIPTION =
  'Bagaimana Pajangin mengumpulkan, memakai, dan melindungi data pemilik usaha, pelanggan, dan pengunjung halaman bisnis.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/privasi' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/privasi',
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
  { id: 'ringkasan', title: 'Ringkasan' },
  { id: 'data', title: 'Data yang kami kumpulkan' },
  { id: 'cara-memakai', title: 'Cara kami memakai data' },
  { id: 'dasar', title: 'Dasar pemrosesan' },
  { id: 'pihak-ketiga', title: 'Penyimpanan dan pihak ketiga' },
  { id: 'cookie', title: 'Cookie dan penyimpanan lokal' },
  { id: 'data-pelanggan', title: 'Data pelanggan bisnis' },
  { id: 'retensi', title: 'Berapa lama data disimpan' },
  { id: 'keamanan', title: 'Keamanan' },
  { id: 'hak', title: 'Hak Anda' },
  { id: 'anak', title: 'Anak-anak' },
  { id: 'perubahan', title: 'Perubahan kebijakan' },
  { id: 'kontak', title: 'Hubungi kami' },
];

const linkClass =
  'font-medium text-ink underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent';
const listClass = 'list-disc space-y-2 pl-5 marker:text-accent';

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Kebijakan Privasi"
      intro={
        <p>
          Kebijakan ini menjelaskan data yang kami kumpulkan saat Anda membuat halaman bisnis, menerima
          pesan atau booking, dan melihat statistik. Kami berupaya hanya memakai data yang diperlukan
          untuk menjalankan layanan.
        </p>
      }
      sections={SECTIONS}
    >
      <LegalSection id="ringkasan" title="Ringkasan">
        <ul className={listClass}>
          <li>Kami tidak menjual data pribadi Anda.</li>
          <li>Data utama dipakai untuk menampilkan halaman bisnis, mengirim notifikasi, dan menghitung statistik.</li>
          <li>Anda dapat mengubah profil dan menghapus akun dari halaman Akun &amp; keamanan.</li>
          <li>Beberapa penyedia teknologi memproses data atas nama kami agar layanan dapat berjalan.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data" title="Data yang kami kumpulkan">
        <p>
          <strong className="font-semibold text-ink">Data akun.</strong> Nama, alamat email, nomor WhatsApp
          jika Anda mengisinya, serta penyedia login (Google). Autentikasi diproses oleh Supabase Auth dan
          Google. Pajangin tidak menyimpan kata sandi.
        </p>
        <p>
          <strong className="font-semibold text-ink">Data bisnis.</strong> Nama usaha, kategori, deskripsi,
          alamat, kota, nomor WhatsApp, jam buka, layanan dan harga, foto, tautan, serta pengaturan halaman
          yang Anda buat. Sebagian data ini tampil publik di halaman bisnis.
        </p>
        <p>
          <strong className="font-semibold text-ink">Data pelanggan bisnis.</strong> Nama, nomor WhatsApp atau
          telepon, email jika diisi, layanan yang diminati, tanggal dan jam booking, serta pesan atau catatan
          yang dikirim melalui halaman bisnis. Data ini masuk ke dashboard pemilik usaha.
        </p>
        <p>
          <strong className="font-semibold text-ink">Data analitik.</strong> Peristiwa seperti kunjungan
          halaman, layanan yang dilihat, klik WhatsApp atau telepon, dan pengiriman pesan. Kami juga mencatat
          sumber atau referrer, parameter UTM, jenis perangkat, dan ID sesi acak. Tabel analitik tidak
          menyimpan nama pengunjung.
        </p>
        <p>
          <strong className="font-semibold text-ink">Masukan.</strong> Nama, email, WhatsApp, isi masukan,
          kategori, dan ringkasan bisnis yang Anda kirim ke tim Pajangin melalui dashboard atau halaman
          publik.
        </p>
        <p>
          <strong className="font-semibold text-ink">Data teknis.</strong> Penyedia hosting dan server dapat
          mencatat alamat IP, waktu akses, dan informasi perangkat dalam log untuk keamanan dan diagnostik.
        </p>
        <p>
          <strong className="font-semibold text-ink">Draft di perangkat.</strong> Isian onboarding disimpan
          sementara di localStorage browser agar tidak hilang saat berpindah langkah. Data ini tetap di
          perangkat Anda sampai dihapus atau diganti.
        </p>
      </LegalSection>

      <LegalSection id="cara-memakai" title="Cara kami memakai data">
        <ul className={listClass}>
          <li>membuat dan menampilkan halaman bisnis yang Anda publikasikan;</li>
          <li>mengirim notifikasi pesan, booking, dan aktivitas terkait ke WhatsApp atau dashboard;</li>
          <li>menyusun statistik kunjungan dan klik kontak untuk pemilik usaha;</li>
          <li>menjawab pertanyaan, masukan, dan permintaan dukungan;</li>
          <li>menjaga keamanan, mencegah penyalahgunaan, dan menegakkan ketentuan layanan;</li>
          <li>memahami penggunaan fitur agar layanan dapat diperbaiki;</li>
          <li>memenuhi kewajiban hukum yang berlaku.</li>
        </ul>
      </LegalSection>

      <LegalSection id="dasar" title="Dasar pemrosesan">
        <p>
          Kami memproses data berdasarkan pelaksanaan layanan yang Anda minta, persetujuan yang Anda berikan
          (misalnya saat mengirim masukan atau memakai fitur tertentu), kepentingan sah untuk menjaga
          keamanan dan meningkatkan layanan, serta kewajiban hukum. Pemrosesan mengacu pada hukum
          perlindungan data pribadi yang berlaku di Indonesia.
        </p>
      </LegalSection>

      <LegalSection id="pihak-ketiga" title="Penyimpanan dan pihak ketiga">
        <p>Kami memakai penyedia teknologi yang memproses data atas nama kami, antara lain:</p>
        <ul className={listClass}>
          <li>Supabase untuk autentikasi, database, dan penyimpanan foto;</li>
          <li>penyedia hosting frontend dan backend untuk menjalankan situs;</li>
          <li>Fonnte dan WhatsApp untuk mengirim notifikasi;</li>
          <li>Google untuk login OAuth dan, jika diaktifkan, pemrosesan konten AI;</li>
          <li>OpenAI jika diaktifkan untuk fitur AI Konten.</li>
        </ul>
        <p>
          Penyedia tersebut memiliki kebijakan privasi sendiri dan dapat memproses data di luar Indonesia.
          Kami memilih penyedia dengan pengamanan kontraktual dan organisasi yang wajar. Kami tidak menjual
          data pribadi. Data hanya dibagikan jika diperlukan untuk layanan, atas persetujuan Anda, atau
          untuk memenuhi kewajiban hukum.
        </p>
      </LegalSection>

      <LegalSection id="cookie" title="Cookie dan penyimpanan lokal">
        <ul className={listClass}>
          <li>
            Cookie autentikasi Supabase menyimpan sesi login agar Anda tetap masuk saat berpindah halaman.
          </li>
          <li>
            sessionStorage menyimpan atribusi kampanye dan ID sesi analitik acak selama sesi browser.
          </li>
          <li>
            localStorage menyimpan draft onboarding dan pilihan bisnis terakhir di perangkat Anda.
          </li>
          <li>Kami tidak memakai cookie iklan pihak ketiga untuk melacak Anda di situs lain.</li>
        </ul>
        <p>
          Anda dapat menghapus cookie dan data situs melalui pengaturan browser. Menghapus cookie login
          akan mengeluarkan Anda dari akun.
        </p>
      </LegalSection>

      <LegalSection id="data-pelanggan" title="Data pelanggan bisnis">
        <p>
          Saat pelanggan mengirim pesan atau booking melalui halaman bisnis Anda, data mereka diproses untuk
          meneruskan permintaan tersebut kepada Anda. Anda sebagai pemilik usaha bertanggung jawab
          memberikan informasi atau meminta izin yang diperlukan kepada pelanggan sebelum memakai data
          mereka untuk tujuan lain.
        </p>
        <p>
          Pajangin memproses data pelanggan atas arahan pemilik usaha untuk menampilkan dan mengelola
          pesan atau booking. Pelanggan yang ingin mengakses atau menghapus datanya dapat menghubungi
          pemilik usaha terlebih dahulu; kami akan membantu permintaan yang sah.
        </p>
      </LegalSection>

      <LegalSection id="retensi" title="Berapa lama data disimpan">
        <p>
          Data akun dan bisnis disimpan selama akun aktif atau sampai Anda meminta penghapusan. Data
          pelanggan, pesan, booking, dan analitik disimpan selama diperlukan untuk menjalankan layanan atau
          sampai dihapus oleh pemilik usaha atau melalui permintaan yang sah.
        </p>
        <p>
          Setelah permintaan penghapusan, data dihapus dari sistem aktif. Anda dapat menghapus akun
          langsung dari halaman Akun &amp; keamanan di dashboard. Salinan cadangan, log keamanan, dan
          arsip dapat bertahan untuk waktu terbatas sebelum terhapus sesuai siklus penyimpanan.
          Masukan produk yang pernah dikirim tetap disimpan sebagai arsip, tetapi nama, email, nomor
          WhatsApp, dan identitas bisnis Anda dilepas saat akun dihapus.
        </p>
      </LegalSection>

      <LegalSection id="keamanan" title="Keamanan">
        <p>
          Kami memakai koneksi HTTPS, autentikasi Supabase, pembatasan akses administratif, dan kontrol
          akses pada aplikasi untuk melindungi data. Namun, tidak ada sistem yang sepenuhnya bebas risiko.
          Jaga keamanan akun Google Anda dan segera hubungi kami jika mengetahui akses yang tidak sah.
        </p>
      </LegalSection>

      <LegalSection id="hak" title="Hak Anda">
        <p>Anda dapat meminta untuk:</p>
        <ul className={listClass}>
          <li>mengakses dan memperoleh salinan data pribadi yang kami simpan;</li>
          <li>memperbaiki data yang tidak akurat;</li>
          <li>menghapus data atau akun, dengan memperhatikan kewajiban hukum tertentu;</li>
          <li>membatasi atau menolak pemrosesan tertentu;</li>
          <li>menarik persetujuan yang pernah Anda berikan;</li>
          <li>mengajukan keluhan kepada otoritas perlindungan data pribadi yang berwenang di Indonesia.</li>
        </ul>
        <p>
          Untuk menghapus akun, buka <strong className="font-semibold text-ink">Akun &amp; keamanan</strong>{' '}
          di dashboard. Untuk permintaan akses, koreksi, atau salinan data, kirim permintaan ke{' '}
          <a href={LEGAL_CONTACT_HREF} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Kami dapat meminta verifikasi identitas sebelum memproses permintaan agar data tidak diberikan
          kepada pihak yang salah.
        </p>
      </LegalSection>

      <LegalSection id="anak" title="Anak-anak">
        <p>
          Pajangin ditujukan untuk pemilik atau pengelola usaha dan tidak dirancang untuk anak di bawah 18
          tahun. Kami tidak dengan sengaja mengumpulkan data anak. Jika mengetahui hal tersebut, hubungi
          kami agar data dapat dihapus.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="Perubahan kebijakan">
        <p>
          Kami dapat memperbarui kebijakan ini. Tanggal pembaruan tertera di bagian atas halaman. Untuk
          perubahan material, kami berupaya memberi tahu melalui email atau dashboard. Versi terbaru selalu
          tersedia di halaman ini.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="Hubungi kami">
        <p>
          Pertanyaan, permintaan akses, atau salinan data dapat dikirim ke{' '}
          <a href={LEGAL_CONTACT_HREF} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Sertakan alamat email akun agar kami dapat menemukan data yang dimaksud.
        </p>
        <p>
          Lihat juga{' '}
          <Link href="/syarat" className={linkClass}>
            Syarat &amp; Ketentuan
          </Link>{' '}
          untuk aturan penggunaan layanan.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
