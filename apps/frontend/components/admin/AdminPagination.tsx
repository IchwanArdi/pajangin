'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../lib/format';
import { btn } from '../dashboard/ui';

export function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;

  // Rentang dihitung dari total hasil filter, bukan total seluruh platform.
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink-2">
        Menampilkan <span className="font-medium text-ink">{formatNumber(start)}–{formatNumber(end)}</span>{' '}
        dari <span className="font-medium text-ink">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={btn.secondary}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <span className="min-w-24 text-center text-xs tabular-nums text-ink-2">
          Halaman {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className={btn.secondary}
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
