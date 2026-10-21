'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { updateBusiness } from '../../lib/api';
import { createClient } from '../../lib/supabase/client';
import { primaryButtonClass, secondaryButtonClass } from '../auth/AuthShell';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/* Upload foto utama di layar sukses: bisnis sudah punya ID, jadi foto bisa
 * langsung disimpan sebagai hero tanpa memaksa user membuka dashboard. */
export default function SuccessPhotoUpload({
  businessId,
  currentUrl,
  galleryHref,
  onUploaded,
}: {
  businessId: string;
  currentUrl?: string | null;
  galleryHref: string;
  onUploaded: (url: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Object URL pratinjau harus dilepas saat file diganti atau komponen ditutup.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const chooseFile = (file: File) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Gunakan foto JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran foto maksimal 5 MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const save = async () => {
    if (!selectedFile) return;

    setError('');
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = (selectedFile.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${businessId}/hero-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('business-assets').upload(path, selectedFile, {
        contentType: selectedFile.type,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
      const updated = await updateBusiness(businessId, { hero_image_url: data.publicUrl });
      onUploaded(updated.hero_image_url || data.publicUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Gagal mengupload foto utama:', err);
      setError('Gagal mengupload foto. Coba lagi atau atur dari dashboard.');
    } finally {
      setUploading(false);
    }
  };

  const shownUrl = previewUrl || currentUrl;
  const helperText = selectedFile
    ? 'Pratinjau foto baru. Simpan untuk memasangnya di halaman publik.'
    : currentUrl
      ? 'Foto utama sudah tampil paling atas di halaman publik. Ganti kapan saja di sini.'
      : 'Halaman sudah aktif. Tambahkan satu foto agar halaman lebih siap diindeks Google. Foto ini tampil paling atas di halaman publik.';

  return (
    <div className="rounded-3xl border border-rule bg-white p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-accent-soft p-2 text-accent">
          <ImageIcon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-[-0.015em]">Foto utama</h2>
            {currentUrl && !selectedFile && (
              <span className="inline-flex items-center gap-1 rounded-full bg-positive-soft px-2 py-0.5 text-[11px] font-semibold text-positive">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                Aktif
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{helperText}</p>

          <div
            className={`mt-4 aspect-[16/10] w-full overflow-hidden rounded-2xl border sm:max-w-sm ${
              shownUrl ? 'border-rule bg-paper' : 'border-dashed border-rule bg-paper-2'
            }`}
          >
            {shownUrl ? (
              <div
                role="img"
                aria-label={previewUrl ? 'Pratinjau foto yang dipilih' : 'Foto utama saat ini'}
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${shownUrl}")` }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1.5 text-ink-2">
                <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-xs font-medium">Belum ada foto</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {selectedFile ? (
              <>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={uploading}
                  className={`${primaryButtonClass} w-full sm:w-auto`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {uploading ? 'Menyimpan…' : 'Simpan foto'}
                </button>

                <label
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline focus-within:underline ${
                    uploading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Ganti
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) chooseFile(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={cancelSelection}
                  disabled={uploading}
                  className="inline-flex min-h-11 items-center text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <label
                  className={`${secondaryButtonClass} w-full cursor-pointer sm:w-auto ${
                    uploading ? 'pointer-events-none opacity-60' : ''
                  } focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2`}
                >
                  {currentUrl ? (
                    <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Upload className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {currentUrl ? 'Ganti foto' : 'Pilih foto'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) chooseFile(file);
                    }}
                  />
                </label>

                <Link
                  href={galleryHref}
                  className="inline-flex w-full items-center justify-center gap-1 text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline sm:w-auto sm:justify-start"
                >
                  {currentUrl ? 'Kelola di dashboard' : 'Atur nanti di dashboard'}
                </Link>
              </>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-ink-2">
            JPG, PNG, atau WebP · maks. 5 MB{currentUrl ? '.' : ' · bisa dilewati dulu.'}
          </p>

          {error && (
            <p role="alert" className="mt-2 text-xs leading-relaxed text-negative">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
