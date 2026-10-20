import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Card, btn } from '../dashboard/ui';

export function AdminAccessDenied() {
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-negative-soft text-negative">
        <ShieldX className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-ink">Akses khusus admin</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Akun Anda tidak terdaftar di allowlist admin. Hubungi pemilik platform jika ini keliru.
      </p>
      <code className="mt-3 inline-block rounded-md bg-paper-2 px-2 py-1 text-xs text-ink-2">
        ADMIN_EMAILS
      </code>
      <div>
        <Link href="/dashboard" className={`${btn.secondary} mt-5`}>
          Kembali ke dashboard
        </Link>
      </div>
    </Card>
  );
}
