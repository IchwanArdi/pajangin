import { redirect } from 'next/navigation';

// Halaman lama — sekarang dipecah menjadi /dashboard/layanan dan /dashboard/profil
export default function KelolaRedirect() {
  redirect('/dashboard/layanan');
}
