'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { btn, field } from './ui';

export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="min-w-0">
      <label className={field.label}>{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt={label} className="h-16 w-16 rounded-xl border border-rule object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-rule bg-paper-2 text-ink-2">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${btn.secondary} cursor-pointer`}>
            {loading ? 'Mengupload…' : value ? 'Ganti foto' : 'Pilih foto'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="sr-only"
              disabled={loading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                  setError('File harus gambar.');
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  setError('Ukuran maksimal 5 MB.');
                  return;
                }
                setLoading(true);
                setError('');
                try {
                  const url = await onUpload(file);
                  onChange(url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Gagal mengupload foto.');
                } finally {
                  setLoading(false);
                }
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className={`${btn.ghost} ${btn.sm}`}>
              <X className="h-4 w-4" /> Hapus
            </button>
          )}
        </div>
      </div>
      {hint && <p className={field.hint}>{hint}</p>}
      {error && <p className={`${field.hint} text-negative`}>{error}</p>}
    </div>
  );
}
