'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, CalendarCheck, Check, Clock, MessageCircle, Phone, RefreshCw, Search, Trash2, Users, X } from 'lucide-react';
import { BookingItem, BookingStats, BookingStatus, deleteBooking, getBookings, getBookingStats, updateBooking, updateBusiness } from '../../../lib/api';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Badge, Card, InfoNote, PageHeader, Skeleton, btn } from '../../../components/dashboard/ui';
import { toWaNumber } from '../../../lib/whatsapp';

function formatDateIndo(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function BookingPage() {
  const { business, status: bizStatus, reload: reloadBiz } = useBusiness();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingBooking, setTogglingBooking] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refreshBookings = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const [list, statData] = await Promise.all([getBookings(business.id, filterStatus === 'all' ? undefined : filterStatus, dateFilter || undefined), getBookingStats(business.id)]);
      setBookings(list);
      setStats(statData);
    } catch (err: unknown) {
      console.error('Gagal memuat booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!business) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);

      try {
        const [list, statData] = await Promise.all([getBookings(business.id, filterStatus === 'all' ? undefined : filterStatus, dateFilter || undefined), getBookingStats(business.id)]);

        if (cancelled) return;
        setBookings(list);
        setStats(statData);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Gagal memuat booking:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [business, filterStatus, dateFilter]);

  const handleToggleBookingEnabled = async () => {
    if (!business || togglingBooking) return;
    setTogglingBooking(true);
    const newState = !business.booking_enabled;
    try {
      await updateBusiness(business.id, { booking_enabled: newState });
      await reloadBiz();
      setActionMessage(newState ? 'Sistem booking online AKTIF di halaman publik bisnis Anda.' : 'Sistem booking online DINONAKTIFKAN.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah pengaturan booking';
      alert(message);
    } finally {
      setTogglingBooking(false);
    }
  };

  const handleUpdateStatus = async (booking: BookingItem, newStatus: BookingStatus, openWa = false) => {
    if (!business || updatingId) return;
    setUpdatingId(booking.id);
    try {
      const updated = await updateBooking(business.id, booking.id, { status: newStatus });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
      const statData = await getBookingStats(business.id);
      setStats(statData);

      if (openWa && newStatus === 'confirmed') {
        const cleanPhone = toWaNumber(booking.phone);
        const text =
          `Halo ${booking.name}, kami dari *${business.name}* mengonfirmasi reservasi Anda:\n\n` +
          `• Layanan: ${booking.service_name || '-'}\n` +
          `• Tanggal: ${formatDateIndo(booking.date)}\n` +
          `• Jam: ${booking.time_slot} WIB\n` +
          `• Jumlah orang: ${booking.pax} orang\n\n` +
          `Reservasi Anda telah *DIKONFIRMASI*. Mohon hadir tepat waktu ya. Terima kasih!`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui status';
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!business || !confirm('Yakin ingin menghapus data booking ini?')) return;
    try {
      await deleteBooking(business.id, bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      const statData = await getBookingStats(business.id);
      setStats(statData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus booking';
      alert(message);
    }
  };

  const handleChatCustomer = (booking: BookingItem) => {
    if (!business) return;
    const cleanPhone = toWaNumber(booking.phone);
    const text = `Halo ${booking.name}, kami dari *${business.name}* terkait reservasi Anda pada tanggal ${formatDateIndo(booking.date)} jam ${booking.time_slot} WIB.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => b.name.toLowerCase().includes(q) || b.phone.includes(q) || (b.service_name && b.service_name.toLowerCase().includes(q)) || (b.notes && b.notes.toLowerCase().includes(q)));
  }, [bookings, searchQuery]);

  if (bizStatus === 'loading' || !business) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Booking & Reservasi"
          helpKey="booking"
          description="Kelola jadwal kunjungan, janji temu, dan reservasi pelanggan langsung dari dashboard."
        />

        {/* Toggle Booking Online Switch */}
        <div className="flex items-center gap-3 rounded-2xl border border-rule bg-surface p-3 sm:self-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink">Fitur Booking Online</p>
            <p className="text-[11px] text-ink-2">{business.booking_enabled ? 'Aktif di website publik' : 'Nonaktif'}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(business.booking_enabled)}
            aria-label={business.booking_enabled ? 'Nonaktifkan booking online' : 'Aktifkan booking online'}
            onClick={handleToggleBookingEnabled}
            disabled={togglingBooking}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${business.booking_enabled ? 'bg-positive' : 'bg-paper-3'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${business.booking_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <InfoNote>
        <strong>Booking online</strong> membuat pelanggan memilih tanggal dan jam sendiri. Status <strong>Menunggu</strong> berarti belum Anda
        konfirmasi. Setelah dikonfirmasi, gunakan tombol WhatsApp untuk memberi tahu pelanggan.
      </InfoNote>

      {actionMessage && <div className="rounded-xl border border-positive-soft bg-positive-soft/40 px-4 py-3 text-sm text-positive">{actionMessage}</div>}

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-2">Total Reservasi</span>
            <CalendarCheck className="h-4 w-4 text-ink-2" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{stats?.total ?? 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-warning">Menunggu</span>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-2 text-2xl font-bold text-warning">{stats?.pending ?? 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-positive">Dikonfirmasi</span>
            <Check className="h-4 w-4 text-positive" />
          </div>
          <p className="mt-2 text-2xl font-bold text-positive">{stats?.confirmed ?? 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-accent">Jadwal Hari Ini</span>
            <Calendar className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-2xl font-bold text-accent">{stats?.today ?? 0}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'confirmed', label: 'Dikonfirmasi' },
              { id: 'completed', label: 'Selesai' },
              { id: 'cancelled', label: 'Dibatalkan' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filterStatus === tab.id ? 'bg-ink text-paper' : 'border border-rule bg-surface text-ink-2 hover:border-ink hover:text-ink'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Date Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama/layanan..."
                className="h-8 w-full rounded-full border border-rule bg-surface pl-8 pr-3 text-xs text-ink placeholder:text-ink-2/60 focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 rounded-full border border-rule bg-surface px-2.5 text-xs text-ink focus:border-accent focus:outline-none" />
              {dateFilter && (
                <button type="button" onClick={() => setDateFilter('')} title="Reset filter tanggal" className="rounded-full p-1 text-ink-2 hover:bg-paper-2 hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button type="button" onClick={() => void refreshBookings()} title="Refresh" className="rounded-full border border-rule p-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper-2">
            <CalendarCheck className="h-7 w-7 text-ink-2" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-ink">Belum Ada Reservasi</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink-2">
            {!business.booking_enabled
              ? 'Fitur booking online saat ini nonaktif. Aktifkan saklar "Fitur Booking Online" di pojok kanan atas agar calon pelanggan dapat langsung melakukan reservasi di website Anda.'
              : 'Belum ada pelanggan yang melakukan booking. Setiap booking yang masuk melalui halaman website akan otomatis muncul di sini.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const isPending = b.status === 'pending';
            const isConfirmed = b.status === 'confirmed';
            const isCompleted = b.status === 'completed';

            const statusBadgeTone = isPending ? 'warning' : isConfirmed ? 'positive' : isCompleted ? 'neutral' : 'negative';

            const statusLabel = isPending ? 'Menunggu Konfirmasi' : isConfirmed ? 'Dikonfirmasi' : isCompleted ? 'Selesai' : 'Dibatalkan';

            return (
              <Card key={b.id} className="p-4 sm:p-5 transition hover:border-paper-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Customer & Booking Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-ink">{b.name}</h4>
                      <Badge tone={statusBadgeTone}>{statusLabel}</Badge>
                      <span className="text-xs text-ink-2">Dibuat {new Date(b.created_at).toLocaleDateString('id-ID')}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-2">
                      <div className="flex items-center gap-1 font-medium text-ink">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                        <span>{formatDateIndo(b.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-ink">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        <span>{b.time_slot} WIB</span>
                      </div>
                      {b.service_name && (
                        <div className="flex items-center gap-1 font-medium text-ink">
                          <span>
                            Layanan: <strong>{b.service_name}</strong>
                          </span>
                        </div>
                      )}
                      {b.pax > 1 && (
                        <div className="flex items-center gap-1 font-medium text-ink">
                          <Users className="h-3.5 w-3.5 text-ink-2" />
                          <span>{b.pax} orang</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <button type="button" onClick={() => handleChatCustomer(b)} className="inline-flex items-center gap-1 font-medium text-positive hover:underline">
                        <Phone className="h-3 w-3" />
                        <span>{b.phone}</span>
                        <span className="text-[10px] text-ink-2">(Chat WA)</span>
                      </button>
                      {b.email && <span className="text-ink-2">· {b.email}</span>}
                    </div>

                    {b.notes && (
                      <div className="rounded-lg bg-paper-2 p-2.5 text-xs text-ink-2">
                        <span className="font-semibold text-ink">Catatan: </span>
                        {b.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:flex-col sm:items-end">
                    {isPending && (
                      <button type="button" onClick={() => handleUpdateStatus(b, 'confirmed', true)} disabled={updatingId === b.id} className={`${btn.primary} ${btn.sm} bg-positive text-white hover:bg-positive/90`}>
                        <Check className="h-3.5 w-3.5" />
                        Konfirmasi & Chat WA
                      </button>
                    )}

                    {isConfirmed && (
                      <button type="button" onClick={() => handleUpdateStatus(b, 'completed')} disabled={updatingId === b.id} className={`${btn.secondary} ${btn.sm}`}>
                        <Check className="h-3.5 w-3.5 text-positive" />
                        Tandai Selesai
                      </button>
                    )}

                    {(isPending || isConfirmed) && (
                      <button type="button" onClick={() => handleUpdateStatus(b, 'cancelled')} disabled={updatingId === b.id} className="rounded-full px-2.5 py-1 text-xs font-semibold text-negative hover:bg-negative-soft">
                        Batalkan
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleChatCustomer(b)} className={`${btn.ghost} ${btn.sm}`} title="Chat Pelanggan di WhatsApp">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chat WA
                      </button>

                      <button type="button" onClick={() => handleDelete(b.id)} className="rounded-full p-1.5 text-ink-2 hover:bg-negative-soft hover:text-negative" title="Hapus data booking">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
