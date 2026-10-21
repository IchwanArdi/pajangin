import { BadGatewayException, Logger } from '@nestjs/common';

const STORAGE_BUCKET = 'business-assets';
const STORAGE_PUBLIC_MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
const logger = new Logger('AccountDeletion');

function adminHeaders(serviceRole: string): HeadersInit {
  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
  };
}

function cleanSupabaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

// Ambil path object dari URL publik Supabase Storage. URL eksternal (mis. CDN lain)
// sengaja diabaikan agar penghapusan akun tidak menyentuh file di luar bucket kita.
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const markerIndex = parsed.pathname.indexOf(STORAGE_PUBLIC_MARKER);
    if (markerIndex === -1) return null;

    const path = decodeURIComponent(parsed.pathname.slice(markerIndex + STORAGE_PUBLIC_MARKER.length));
    return path || null;
  } catch {
    return null;
  }
}

// Hapus auth user lewat Supabase Admin API. Ini wajib memakai service role
// dan hanya boleh dipanggil dari backend. 404 dianggap sukses agar idempoten.
export async function deleteSupabaseAuthUser(
  supabaseUrl: string,
  serviceRole: string,
  userId: string,
): Promise<void> {
  let res: Response;

  try {
    res = await fetch(
      `${cleanSupabaseUrl(supabaseUrl)}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: adminHeaders(serviceRole),
      },
    );
  } catch (err) {
    logger.error(
      `Tidak bisa menghubungi Supabase Admin API: ${err instanceof Error ? err.message : String(err)}`,
    );
    throw new BadGatewayException('Gagal menghapus akun dari layanan autentikasi. Coba lagi.');
  }

  if (res.ok || res.status === 404) return;

  const detail = await res.text().catch(() => '');
  logger.error(`Supabase Admin API menolak hapus user ${userId}: ${res.status} ${detail}`);
  throw new BadGatewayException('Gagal menghapus akun dari layanan autentikasi. Coba lagi.');
}

// Hapus file bisnis dari bucket public. Kegagalan di sini tidak boleh membatalkan
// penghapusan akun; pemanggil mencatatnya sebagai peringatan agar bisa dibersihkan manual.
export async function deleteBusinessStorageObjects(
  supabaseUrl: string,
  serviceRole: string,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;

  let res: Response;

  try {
    res = await fetch(`${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/${STORAGE_BUCKET}`, {
      method: 'DELETE',
      headers: {
        ...adminHeaders(serviceRole),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: paths }),
    });
  } catch (err) {
    throw new Error(
      `Tidak bisa menghubungi Supabase Storage: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase Storage menolak hapus file: ${res.status} ${detail}`);
  }
}
