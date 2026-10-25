'use client';

/* Hallmark · page: Layanan · app workbench · edit inline (bukan halaman terpisah), urutan = urutan di halaman publik */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, Eye, MessageCircle, Package, Pencil, Plus, Star, Trash } from 'lucide-react';
import {
  addService,
  ApiError,
  deleteService,
  getDashboardOverview,
  getServices,
  Service,
  updateService,
  type DashboardOverview,
} from '../../../lib/api';
import { formatNumber, formatRupiah } from '../../../lib/format';
import { createClient } from '../../../lib/supabase/client';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { ImageUpload } from '../../../components/dashboard/ImageUpload';
import { Badge, Card, InfoNote, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

const PRICE_PREFIXES = ['Mulai dari', 'Harga', 'Per kg', 'Per jam', 'Per orang'];

interface Draft {
  name: string;
  price: string;
  price_prefix: string;
  description: string;
  category: string;
  image_url: string;
  is_featured: boolean;
}

const emptyDraft: Draft = { name: '', price: '', price_prefix: 'Mulai dari', description: '', category: '', image_url: '', is_featured: false };

function toDraft(s: Service): Draft {
  return {
    name: s.name,
    price: s.price ? String(s.price) : '',
    price_prefix: s.price_prefix || 'Mulai dari',
    description: s.description || '',
    category: s.category || '',
    image_url: s.image_url || '',
    is_featured: s.is_featured,
  };
}

function draftPayload(d: Draft) {
  return {
    name: d.name.trim(),
    price: d.price ? Math.max(0, parseInt(d.price, 10)) || null : null,
    price_prefix: d.price_prefix,
    description: d.description.trim(),
    category: d.category.trim(),
    image_url: d.image_url.trim(),
    is_featured: d.is_featured,
  };
}

export default function LayananPage() {
  const { business } = useBusiness();
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');

  const [loaded, setLoaded] = useState<{ businessId: string; services: Service[] } | null>(null);
  const [stats, setStats] = useState<DashboardOverview['topServices']>([]);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(editParam);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const businessId = business?.id;
  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    Promise.all([getServices(businessId), getDashboardOverview(businessId, 30).catch(() => null)])
      .then(([list, overview]) => {
        if (cancelled) return;
        setLoaded({ businessId, services: list });
        setStats(overview?.topServices ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled && !(err instanceof ApiError && err.status === 401)) {
          setError(err instanceof Error ? err.message : 'Gagal memuat layanan.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const services = useMemo(
    () => (loaded && loaded.businessId === businessId ? loaded.services : null),
    [loaded, businessId],
  );
  const setServices = (fn: (prev: Service[]) => Service[]) =>
    setLoaded((l) => (l ? { ...l, services: fn(l.services) } : l));
  const statFor = (id: string) => stats.find((s) => s.id === id);

  const run = async (id: string, task: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setBusyId(null);
    }
  };

  // simpan urutan baru: hanya kirim layanan yang index-nya berubah (optimistic)
  const move = (index: number, dir: -1 | 1) => {
    if (!services || !business) return;
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
    const reordered = [...services];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const withIndex = reordered.map((s, i) => ({ ...s, order_index: i }));
    const changed = withIndex.filter((s) => services.find((o) => o.id === s.id)?.order_index !== s.order_index);
    const previous = services;
    setServices(() => withIndex);
    run(reordered[target].id, async () => {
      try {
        await Promise.all(changed.map((s) => updateService(business.id, s.id, { order_index: s.order_index })));
      } catch (err) {
        setServices(() => previous);
        throw err;
      }
    });
  };

  const toggleFeatured = (s: Service) => {
    if (!business) return;
    run(s.id, async () => {
      const updated = await updateService(business.id, s.id, { is_featured: !s.is_featured });
      setServices((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
    });
  };

  const remove = (s: Service) => {
    if (!business) return;
    run(s.id, async () => {
      await deleteService(business.id, s.id);
      setServices((prev) => prev.filter((x) => x.id !== s.id));
      setConfirmDelete(null);
    });
  };

  if (!business || (!services && !error)) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-(--radius-card)" />
      </div>
    );
  }

  const list = services ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan"
        helpKey="layanan"
        description={`${list.length} layanan · tampil di halaman publik sesuai urutan di bawah`}
        actions={
          !adding && (
            <button type="button" onClick={() => setAdding(true)} className={btn.primary}>
              <Plus className="h-4 w-4" strokeWidth={2} /> Tambah layanan
            </button>
          )
        }
      />

      <InfoNote>
        Urutan di sini sama dengan urutan di halaman publik. Layanan bertanda <strong>Andalan</strong> tampil lebih menonjol dengan badge
        “Populer”.
      </InfoNote>

      {error && (
        <p role="alert" className="rounded-(--radius-input) bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}

      {adding && (
        <Card className="p-5">
          <h2 className="mb-4 text-[15px] font-semibold text-ink">Layanan baru</h2>
          <ServiceForm
            businessId={business.id}
            initial={emptyDraft}
            submitLabel="Tambah layanan"
            busy={busyId === 'new'}
            onCancel={() => setAdding(false)}
            onSubmit={(d) =>
              run('new', async () => {
                const created = await addService(business.id, draftPayload(d));
                setServices((prev) => [...prev, created]);
                setAdding(false);
              })
            }
          />
        </Card>
      )}

      {list.length === 0 && !adding ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper-2 text-ink-2">
            <Package className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 text-base font-semibold text-ink">Belum ada layanan</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-2">
            Pelanggan lebih sering menghubungi halaman yang menampilkan layanan dan harga yang jelas.
          </p>
          <button type="button" onClick={() => setAdding(true)} className={`${btn.primary} mt-5`}>
            <Plus className="h-4 w-4" strokeWidth={2} /> Tambah layanan pertama
          </button>
        </Card>
      ) : (
        list.length > 0 && (
          <Card>
            <ul className="divide-y divide-rule">
              {list.map((s, i) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  index={i}
                  total={list.length}
                  stat={statFor(s.id)}
                  editing={editingId === s.id}
                  confirming={confirmDelete === s.id}
                  busy={busyId === s.id}
                  autoFocus={editParam === s.id}
                  businessId={business.id}
                  onMove={move}
                  onToggleFeatured={() => toggleFeatured(s)}
                  onEdit={() => {
                    setEditingId(s.id);
                    setConfirmDelete(null);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(d) =>
                    run(s.id, async () => {
                      const updated = await updateService(business.id, s.id, draftPayload(d));
                      setServices((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
                      setEditingId(null);
                    })
                  }
                  onAskDelete={() => setConfirmDelete(s.id)}
                  onCancelDelete={() => setConfirmDelete(null)}
                  onDelete={() => remove(s)}
                />
              ))}
            </ul>
          </Card>
        )
      )}
    </div>
  );
}

function ServiceRow({
  service: s,
  index,
  total,
  stat,
  editing,
  confirming,
  busy,
  autoFocus,
  businessId,
  onMove,
  onToggleFeatured,
  onEdit,
  onCancelEdit,
  onSave,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  service: Service;
  index: number;
  total: number;
  stat?: DashboardOverview['topServices'][number];
  editing: boolean;
  confirming: boolean;
  busy: boolean;
  autoFocus: boolean;
  businessId: string;
  onMove: (index: number, dir: -1 | 1) => void;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (d: Draft) => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoFocus]);

  const friction = stat && stat.views >= 30 && stat.conversionRate < 3;

  if (editing) {
    return (
      <li ref={ref} className="bg-paper-2/50 p-5">
        <ServiceForm businessId={businessId} initial={toDraft(s)} submitLabel="Simpan" busy={busy} onCancel={onCancelEdit} onSubmit={onSave} />
      </li>
    );
  }

  return (
    <li ref={ref} className="group flex items-start gap-3 px-3 py-4 sm:items-center sm:px-5">
      <div className="flex shrink-0 flex-col" aria-label={`Urutan ${index + 1} dari ${total}`}>
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0 || busy}
          aria-label={`Naikkan ${s.name}`}
          className="rounded p-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-25 sm:p-0.5"
        >
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1 || busy}
          aria-label={`Turunkan ${s.name}`}
          className="rounded p-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-25 sm:p-0.5"
        >
          <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {s.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image_url} alt={s.name} className="h-14 w-14 shrink-0 rounded-xl border border-rule object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-rule bg-paper-2 text-ink-2">
          <Package className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink">{s.name}</h3>
          {s.is_featured && (
            <Badge tone="accent">
              <Star className="h-3 w-3 fill-current" /> Andalan
            </Badge>
          )}
          {friction && <Badge tone="warning">Klik rendah</Badge>}
        </div>
        <p className="mt-0.5 text-sm text-ink-2">
          {s.price ? (
            <>
              <span className="font-medium text-ink">{formatRupiah(s.price)}</span>
              <span className="text-ink-2"> · {s.price_prefix || 'Mulai dari'}</span>
            </>
          ) : (
            'Harga belum diisi'
          )}
          {s.description && <span className="hidden sm:inline"> · {s.description}</span>}
        </p>
        <p className="mt-1.5 flex items-center gap-3 text-xs text-ink-2 sm:hidden">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(stat?.views ?? 0)}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {formatNumber(stat?.clicks ?? 0)}</span>
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-4 text-xs tabular-nums text-ink-2 sm:flex" title="30 hari terakhir">
        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> {formatNumber(stat?.views ?? 0)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> {formatNumber(stat?.clicks ?? 0)}</span>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden text-sm text-ink sm:inline">Hapus?</span>
          <button type="button" onClick={onDelete} disabled={busy} className={`${btn.danger} ${btn.sm}`}>
            {busy ? 'Menghapus…' : 'Hapus'}
          </button>
          <button type="button" onClick={onCancelDelete} className={`${btn.ghost} ${btn.sm}`}>
            Batal
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onToggleFeatured}
            disabled={busy}
            aria-pressed={s.is_featured}
            aria-label={s.is_featured ? `Hapus ${s.name} dari andalan` : `Jadikan ${s.name} andalan`}
            title={s.is_featured ? 'Hapus dari andalan' : 'Jadikan andalan'}
            className={btn.icon}
          >
            <Star className={`h-4 w-4 ${s.is_featured ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={onEdit} aria-label={`Ubah ${s.name}`} title="Ubah" className={btn.icon}>
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button type="button" onClick={onAskDelete} aria-label={`Hapus ${s.name}`} title="Hapus" className={btn.icon}>
            <Trash className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </li>
  );
}

function ServiceForm({
  businessId,
  initial,
  submitLabel,
  busy,
  onCancel,
  onSubmit,
}: {
  businessId: string;
  initial: Draft;
  submitLabel: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (d: Draft) => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const uploadServicePhoto = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${businessId}/service-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('business-assets').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (d.name.trim()) onSubmit(d);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="svc-name" className={field.label}>Nama layanan</label>
        <input id="svc-name" autoFocus required value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Contoh: Servis AC mobil" className={field.input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        <div>
          <label htmlFor="svc-prefix" className={field.label}>Jenis harga</label>
          <select id="svc-prefix" value={d.price_prefix} onChange={(e) => set('price_prefix', e.target.value)} className={field.input}>
            {PRICE_PREFIXES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <p className={field.hint}>Cara harga ditampilkan, misalnya “Mulai dari” atau “Per jam”.</p>
        </div>
        <div>
          <label htmlFor="svc-price" className={field.label}>Harga (Rp)</label>
          <input
            id="svc-price"
            type="number"
            inputMode="numeric"
            min={0}
            value={d.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="150000"
            className={field.input}
          />
          <p className={field.hint}>{d.price ? `Tampil sebagai: ${d.price_prefix} ${formatRupiah(Number(d.price))}` : 'Kosongkan jika harga perlu konsultasi.'}</p>
        </div>
      </div>
      <div>
        <label htmlFor="svc-desc" className={field.label}>Keterangan singkat</label>
        <textarea id="svc-desc" rows={2} value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="Apa yang termasuk, berapa lama, garansi…" className={field.textarea} />
        <p className={field.hint}>Jelaskan apa yang termasuk, durasi, atau garansi.</p>
      </div>
      <div>
        <label htmlFor="svc-category" className={field.label}>Kategori layanan</label>
        <input id="svc-category" value={d.category} onChange={(e) => set('category', e.target.value)} placeholder="Contoh: Perawatan, Servis, Konsultasi" className={field.input} />
        <p className={field.hint}>Dipakai untuk memfilter layanan di halaman publik.</p>
      </div>
      <ImageUpload
        label="Foto layanan"
        hint="Foto ini tampil di kartu layanan publik."
        value={d.image_url}
        onChange={(url) => set('image_url', url)}
        onUpload={uploadServicePhoto}
      />
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
        <input type="checkbox" checked={d.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="h-4 w-4 rounded border-rule accent-accent" />
        Jadikan layanan andalan (ditandai &ldquo;Populer&rdquo; di halaman publik)
      </label>
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={busy || !d.name.trim()} className={btn.primary}>
          {busy ? 'Menyimpan…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={btn.ghost}>
          Batal
        </button>
      </div>
    </form>
  );
}
