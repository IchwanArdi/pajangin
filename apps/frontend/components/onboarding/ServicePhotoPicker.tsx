'use client';

import { useId, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export interface PendingServicePhoto {
  file: File;
  preview: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  value: PendingServicePhoto | null;
  onChange: (next: PendingServicePhoto | null) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Pemilih foto untuk satu layanan di onboarding.
 *
 * File belum diupload di sini karena bisnis belum punya ID. Pemanggil menahan
 * File + object URL sampai bisnis dibuat, lalu menguploadnya ke storage.
 */
export default function ServicePhotoPicker({
  value,
  onChange,
  label = 'Foto layanan (opsional)',
  disabled = false,
}: Props) {
  const inputId = useId();
  const [error, setError] = useState('');

  const handleFile = (file: File | undefined) => {
    setError('');
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Gunakan foto JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran foto maksimal 5 MB.');
      return;
    }

    onChange({ file, preview: URL.createObjectURL(file) });
  };

  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-ink">
        {label}
      </label>

      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.preview}
            alt="Pratinjau foto layanan"
            className="h-16 w-16 shrink-0 rounded-xl border border-rule object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-rule bg-paper-2 text-ink-2">
            <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className={[
              'inline-flex cursor-pointer items-center justify-center rounded-full border border-rule bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-paper-2 focus-within:ring-2 focus-within:ring-focus',
              disabled ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
          >
            {value ? 'Ganti foto' : 'Pilih foto'}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                handleFile(file);
              }}
            />
          </label>

          {value && (
            <button
              type="button"
              onClick={() => {
                setError('');
                onChange(null);
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-full px-2 py-2 text-xs font-medium text-ink-2 transition hover:text-negative disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              Hapus
            </button>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-2">
        JPG, PNG, atau WebP. Maks. 5 MB. Foto diupload saat halaman diterbitkan.
      </p>
      {error && <p className="mt-1 text-[11px] leading-relaxed text-negative">{error}</p>}
    </div>
  );
}
