'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Image as ImageIcon, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { addImage, deleteImage, getImages, updateImage, type BusinessImageItem } from '../../../lib/api';
import { createClient } from '../../../lib/supabase/client';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Card, InfoNote, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

const PRESET_CATEGORIES = ['Menu / Makanan', 'Hasil Kerja / Portfolio', 'Suasana / Tempat', 'Fasilitas', 'Before-After', 'Produk', 'Lainnya'];
const MAX_GALLERY_IMAGES = 24;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function GaleriPage() {
  const { business } = useBusiness();
  const [images, setImages] = useState<BusinessImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  // Form tambah foto
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState(PRESET_CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit inline caption
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const fetchImages = useCallback(async () => {
    if (!business) return;
    try {
      setLoading(true);
      setError('');
      const data = await getImages(business.id);
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat galeri foto.');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    if (!business) return;

    let ignore = false;

    const load = async () => {
      try {
        const data = await getImages(business.id);
        if (!ignore) {
          setImages(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Gagal memuat galeri foto.');
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [business]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(images.map((img) => img.category).filter(Boolean))) as string[];
    return ['Semua', ...list];
  }, [images]);

  const filteredImages = useMemo(() => {
    if (activeTab === 'Semua') return images;
    return images.filter((img) => img.category === activeTab);
  }, [images, activeTab]);

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    if (!business) throw new Error('Bisnis tidak ditemukan.');
    if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
    if (file.size > MAX_FILE_SIZE) throw new Error('Ukuran foto maksimal 5 MB.');
    if (images.length >= MAX_GALLERY_IMAGES) {
      throw new Error(`Batas galeri gratis adalah ${MAX_GALLERY_IMAGES} foto. Hapus foto lama terlebih dahulu.`);
    }

    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${business.id}/gallery-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('business-assets').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newUrl.trim()) return;
    if (images.length >= MAX_GALLERY_IMAGES) {
      setError(`Batas galeri gratis adalah ${MAX_GALLERY_IMAGES} foto. Hapus foto lama terlebih dahulu.`);
      return;
    }
    try {
      setSubmitting(true);
      const created = await addImage(business.id, {
        url: newUrl.trim(),
        caption: newCaption.trim() || undefined,
        category: newCategory || undefined,
      });
      setImages((prev) => [...prev, created]);
      setNewUrl('');
      setNewCaption('');
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan foto.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeStoredFile = async (url: string) => {
    const marker = '/storage/v1/object/public/business-assets/';
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return;

    const path = decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
    if (!path) return;
    const supabase = createClient();
    await supabase.storage.from('business-assets').remove([path]);
  };

  const handleDelete = async (id: string) => {
    if (!business) return;
    if (!confirm('Yakin ingin menghapus foto ini dari galeri?')) return;
    const image = images.find((item) => item.id === id);
    try {
      await deleteImage(business.id, id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (image) {
        // File storage ikut dihapus supaya kuota gratis tidak penuh oleh foto yatim.
        removeStoredFile(image.url).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus foto.');
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!business) return;
    try {
      const updated = await updateImage(business.id, id, {
        caption: editCaption.trim() || null,
        category: editCategory || null,
      });
      setImages((prev) => prev.map((img) => (img.id === id ? updated : img)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui foto.');
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    if (!business) return;

    // Gunakan urutan yang sedang terlihat (bisa terfilter kategori), lalu
    // tukar posisi dua item itu di array penuh. Index hasil filter tidak boleh
    // dipakai langsung ke array penuh.
    const visibleIndex = filteredImages.findIndex((image) => image.id === id);
    const targetVisibleIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;
    if (visibleIndex < 0 || targetVisibleIndex < 0 || targetVisibleIndex >= filteredImages.length) return;

    const currentId = filteredImages[visibleIndex].id;
    const targetId = filteredImages[targetVisibleIndex].id;
    const currentIndex = images.findIndex((image) => image.id === currentId);
    const targetIndex = images.findIndex((image) => image.id === targetId);
    if (currentIndex < 0 || targetIndex < 0) return;

    // Renumber semua item supaya urutan di database selalu rapat 0..n-1.
    const nextList = [...images];
    [nextList[currentIndex], nextList[targetIndex]] = [nextList[targetIndex], nextList[currentIndex]];
    const previousOrder = new Map(images.map((image) => [image.id, image.order_index]));
    const renumbered = nextList.map((image, index) => ({ ...image, order_index: index }));
    setImages(renumbered);

    try {
      await Promise.all(
        renumbered
          .filter((image) => previousOrder.get(image.id) !== image.order_index)
          .map((image) => updateImage(business.id, image.id, { order_index: image.order_index })),
      );
    } catch {
      fetchImages(); // Rollback jika gagal
    }
  };

  if (!business) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-(--radius-card)" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Galeri foto bisnis"
        helpKey="galeri"
        description="Foto menu, hasil kerja, suasana toko, dan sertifikat yang tampil langsung di halaman publik Anda."
        actions={
          <div className="flex items-center gap-2">
            <a href={`/${business.slug}#galeri`} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              Lihat di halaman
            </a>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              disabled={images.length >= MAX_GALLERY_IMAGES}
              className={btn.primary}
              title={images.length >= MAX_GALLERY_IMAGES ? `Batas ${MAX_GALLERY_IMAGES} foto tercapai` : undefined}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              {images.length >= MAX_GALLERY_IMAGES ? `Batas ${MAX_GALLERY_IMAGES} foto` : 'Tambah foto'}
            </button>
          </div>
        }
      />

      <InfoNote>
        <strong>Foto utama</strong> diatur di Profil bisnis dan tampil besar di bagian atas halaman. Galeri ini untuk foto tambahan seperti
        menu, hasil kerja, dan suasana tempat.
      </InfoNote>

      {error && (
        <p role="alert" className="rounded-(--radius-input) bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}

      {/* Filter Kategori */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-rule pb-4">
          {categories.map((cat) => {
            const count = cat === 'Semua' ? images.length : images.filter((img) => img.category === cat).length;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${isActive ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2 hover:bg-paper-3 hover:text-ink'}`}
              >
                {cat}
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-paper/20 text-paper' : 'bg-rule text-ink-2'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid Galeri */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-2 text-ink-2">
            <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-ink">{images.length === 0 ? 'Belum ada foto di galeri' : `Tidak ada foto di kategori "${activeTab}"`}</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-2">
            {images.length === 0
              ? 'Tambahkan foto menu, hasil kerja, atau suasana tempat agar calon pelanggan lebih yakin.'
              : 'Pilih kategori lain atau tambahkan foto baru ke kategori ini.'}
          </p>
          <button type="button" onClick={() => setShowAddModal(true)} className={`${btn.primary} mt-5`}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Upload foto sekarang
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image, idx) => {
            const isEditing = editingId === image.id;
            return (
              <Card key={image.id} className="group overflow-hidden rounded-2xl border border-rule transition hover:shadow-sm">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-paper-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.caption || 'Foto bisnis'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  {image.category && <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">{image.category}</span>}
                  {/* Action overlay */}
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(image.id, 'up')}
                      title="Geser ke kiri / atas"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-xs backdrop-blur-xs transition hover:bg-white disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filteredImages.length - 1}
                      onClick={() => handleMove(image.id, 'down')}
                      title="Geser ke kanan / bawah"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-xs backdrop-blur-xs transition hover:bg-white disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      title="Hapus foto"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-negative shadow-xs backdrop-blur-xs transition hover:bg-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5">
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Tulis caption foto..."
                        className="w-full rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent"
                        autoFocus
                      />
                      <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full rounded-lg border border-rule bg-paper px-2 py-1.5 text-xs outline-none focus:border-accent">
                        <option value="">Tanpa kategori</option>
                        {PRESET_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => setEditingId(null)} className={`${btn.ghost} ${btn.sm} text-xs`}>
                          Batal
                        </button>
                        <button type="button" onClick={() => handleSaveEdit(image.id)} className={`${btn.primary} ${btn.sm} text-xs`}>
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-xs leading-relaxed text-ink">{image.caption || <span className="italic text-ink-2">Tanpa caption</span>}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(image.id);
                          setEditCaption(image.caption || '');
                          setEditCategory(image.category || PRESET_CATEGORIES[0]);
                        }}
                        className="text-ink-2 hover:text-ink shrink-0 p-1"
                        title="Edit caption"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Foto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-rule bg-paper p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-rule">
              <div>
                <h3 className="text-base font-bold text-ink">Tambah Foto ke Galeri</h3>
                <p className="text-xs text-ink-2">Upload file atau masukkan URL gambar.</p>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-full p-1 text-ink-2 hover:bg-paper-2 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="mt-4 space-y-4">
              {/* File Uploader */}
              <div>
                <label className={field.label}>File Foto</label>
                <div className="mt-1 flex items-center gap-3">
                  {newUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={newUrl} alt="Preview" className="h-20 w-20 rounded-xl border border-rule object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-rule bg-paper-2 text-ink-2">
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className={`${btn.secondary} inline-block cursor-pointer text-xs`}>
                      {uploading ? 'Mengupload…' : newUrl ? 'Ganti file foto' : 'Pilih file dari perangkat'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploading(true);
                            setError('');
                            const url = await uploadFileToSupabase(file);
                            setNewUrl(url);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Gagal upload foto.');
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-ink-2">Format JPG, PNG, WebP (maks. 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Atau URL langsung */}
              <div className="space-y-1">
                <label className={field.label}>Atau URL Gambar</label>
                <input type="url" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className={field.input} required />
              </div>

              {/* Kategori Foto */}
              <div className="space-y-1">
                <label className={field.label}>Kategori Foto</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={field.input}>
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className={field.hint}>Membantu pengunjung menyaring foto. Tidak wajib.</p>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className={field.label}>
                  Caption / Keterangan <span className="font-normal text-ink-2">(opsional)</span>
                </label>
                <input type="text" placeholder="Contoh: Menu Nasi Goreng Spesial / Hasil poles bodi mobil" value={newCaption} onChange={(e) => setNewCaption(e.target.value)} className={field.input} maxLength={120} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className={btn.ghost}>
                  Batal
                </button>
                <button type="submit" disabled={submitting || !newUrl.trim()} className={btn.primary}>
                  {submitting ? 'Menyimpan…' : 'Tambahkan Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
