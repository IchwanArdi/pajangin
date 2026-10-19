import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="text-6xl font-black text-rule">404</div>
        <h1 className="text-2xl font-black text-ink">Halaman tidak ditemukan</h1>
        <p className="text-sm text-ink-2">
          Bisnis atau halaman yang Anda cari belum tersedia. Mungkin link-nya salah ketik, atau bisnis tersebut belum terdaftar.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:opacity-90">
            Kembali ke Beranda
          </Link>
          <Link href="/register" className="rounded-xl border border-rule bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-800">
            Daftarkan Bisnis Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
