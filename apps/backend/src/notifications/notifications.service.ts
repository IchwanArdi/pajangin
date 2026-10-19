import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUuid } from '../common/uuid.js';

export interface NotificationItem {
  id: string;
  type: 'booking' | 'lead';
  title: string;
  description: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  is_new: boolean;
  status?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly waUsage = new Map<string, { day: string; count: number }>();

  constructor(private readonly prisma: PrismaService) {}

  private frontendBaseUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')[0]
      .trim()
      .replace(/\/+$/, '');
  }

  // Batas wajar notifikasi WhatsApp per bisnis per hari (biaya Fonnte).
  // Notifikasi in-app tetap tersedia tanpa batas.
  private canSendWa(businessId: string): boolean {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
    const limit = Math.max(1, Number(process.env.WA_DAILY_LIMIT) || 20);
    const current = this.waUsage.get(businessId);

    if (!current || current.day !== day) {
      this.waUsage.set(businessId, { day, count: 1 });
      return true;
    }
    if (current.count >= limit) {
      this.logger.warn(`Batas WhatsApp harian ${limit} tercapai untuk bisnis ${businessId}.`);
      return false;
    }
    current.count += 1;
    return true;
  }

  private async checkOwnership(businessId: string, userId: string) {
    if (!isUuid(businessId)) throw new NotFoundException('Bisnis tidak ditemukan');
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { userId: true } });
    if (!biz) throw new NotFoundException('Bisnis tidak ditemukan');
    if (biz.userId !== userId) throw new ForbiddenException('Akses ditolak');
  }

  // Normalisasi nomor HP ke format yang ramah gateway WA (08... / 628...)
  private normalizePhone(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '628' + clean.slice(1);
    }
    return clean;
  }

  // Kirim pesan WhatsApp melalui Fonnte Gateway API
  async sendWhatsApp(targetPhone: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      this.logger.warn('FONNTE_TOKEN belum dikonfigurasi di environment variables.');
      return { success: false, error: 'FONNTE_TOKEN belum dikonfigurasi' };
    }

    const cleanTarget = this.normalizePhone(targetPhone);
    if (!cleanTarget) {
      return { success: false, error: 'Nomor telepon tujuan tidak valid' };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('target', cleanTarget);
      formData.append('message', message);

      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || json?.status === false) {
        this.logger.warn(`Fonnte send warning (${cleanTarget}): ${JSON.stringify(json)}`);
        return { success: false, data: json, error: json?.reason || 'Gagal mengirim pesan via Fonnte' };
      }

      this.logger.log(`WhatsApp berhasil terkirim ke ${cleanTarget}`);
      return { success: true, data: json };
    } catch (err: any) {
      this.logger.error(`Error saat mengirim WhatsApp ke ${cleanTarget}: ${err?.message}`);
      return { success: false, error: err?.message };
    }
  }

  // Notifikasi real-time saat ada Reservasi / Booking Baru
  async notifyNewBooking(bookingId: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { business: true },
      });

      if (!booking || !booking.business) return;

      const biz = booking.business;
      const dateStr = booking.date instanceof Date ? booking.date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) : String(booking.date);

      // 1. Notifikasi ke WhatsApp Pemilik Bisnis
      if (biz.whatsapp && this.canSendWa(biz.id)) {
        const ownerMessage =
          `🔔 *[Pajangin] RESERVASI BARU MASUK!*\n\n` +
          `Ada pesanan reservasi baru di *${biz.name}*:\n` +
          `• Nama: *${booking.name}*\n` +
          `• No. WA: *${booking.phone}*\n` +
          `• Layanan: *${booking.serviceName || '-'}*\n` +
          `• Jadwal: *${dateStr}* jam *${booking.timeSlot} WIB*\n` +
          `• Tamu: *${booking.pax ?? 1} orang*\n` +
          (booking.notes ? `• Catatan: _${booking.notes}_\n\n` : '\n') +
          `Buka dashboard untuk verifikasi/konfirmasi jadwal:\n` +
          `${this.frontendBaseUrl()}/dashboard/booking`;

        await this.sendWhatsApp(biz.whatsapp, ownerMessage);
      }

      // 2. Notifikasi konfirmasi tanda terima ke WhatsApp Pelanggan
      if (booking.phone && this.canSendWa(biz.id)) {
        const pax = booking.pax ?? 1;
        const customerMessage =
          `Halo *${booking.name}*,\n\n` +
          `Terima kasih telah mengajukan reservasi di *${biz.name}*.\n` +
          `Rincian jadwal Anda:\n` +
          `• Layanan: *${booking.serviceName || '-'}*\n` +
          `• Jadwal: *${dateStr}* jam *${booking.timeSlot} WIB*\n` +
          (pax > 1 ? `• Jumlah Tamu: *${pax} orang*\n` : '') +
          `\nStatus: *Menunggu Konfirmasi*\n` +
          `Tim kami akan segera memverifikasi ketersediaan jadwal Anda. Terima kasih!`;

        await this.sendWhatsApp(booking.phone, customerMessage);
      }
    } catch (err: any) {
      this.logger.error(`notifyNewBooking failed: ${err?.message}`);
    }
  }

  // Notifikasi real-time saat ada pesan masuk / lead baru
  async notifyNewLead(leadId: string) {
    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId },
        include: { business: true },
      });

      if (!lead || !lead.business) return;

      const biz = lead.business;

      if (biz.whatsapp && this.canSendWa(biz.id)) {
        const ownerMessage =
          `💬 *[Pajangin] PESAN / LEAD BARU!*\n\n` +
          `Ada calon pelanggan menghubungi *${biz.name}*:\n` +
          `• Nama: *${lead.name}*\n` +
          `• No. WA: *${lead.phone}*\n` +
          (lead.serviceName ? `• Tertarik pada: *${lead.serviceName}*\n` : '') +
          (lead.message ? `• Pesan: _${lead.message}_\n\n` : '\n') +
          `Segera hubungi calon pelanggan untuk closing:\n` +
          `https://wa.me/${this.normalizePhone(lead.phone)}`;

        await this.sendWhatsApp(biz.whatsapp, ownerMessage);
      }
    } catch (err: any) {
      this.logger.error(`notifyNewLead failed: ${err?.message}`);
    }
  }

  // Notifikasi real-time in-app dashboard
  async getRecentNotifications(businessId: string, userId: string): Promise<{
    items: NotificationItem[];
    unread_count: number;
  }> {
    await this.checkOwnership(businessId, userId);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentBookings, recentLeads] = await Promise.all([
      this.prisma.booking.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.lead.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const bookingItems: NotificationItem[] = recentBookings.map((b) => ({
      id: b.id,
      type: 'booking',
      title: `Booking Baru: ${b.name}`,
      description: `${b.serviceName || 'Layanan'} · ${b.date.toISOString().slice(0, 10)} jam ${b.timeSlot}`,
      customer_name: b.name,
      customer_phone: b.phone,
      created_at: b.createdAt.toISOString(),
      is_new: b.createdAt >= oneDayAgo,
      status: b.status,
    }));

    const leadItems: NotificationItem[] = recentLeads.map((l) => ({
      id: l.id,
      type: 'lead',
      title: `Pesan Masuk: ${l.name}`,
      description: l.message ? (l.message.length > 60 ? l.message.slice(0, 57) + '...' : l.message) : 'Tertarik dengan layanan Anda',
      customer_name: l.name,
      customer_phone: l.phone,
      created_at: l.createdAt.toISOString(),
      is_new: l.createdAt >= oneDayAgo,
    }));

    // Gabungkan dan urutkan berdasarkan waktu terbaru
    const combined = [...bookingItems, ...leadItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const unreadCount = combined.filter((i) => i.is_new).length;

    return {
      items: combined.slice(0, 15),
      unread_count: unreadCount,
    };
  }

  // Tes kirim notifikasi ke nomor WhatsApp pemilik
  async testNotification(businessId: string, userId: string): Promise<{ success: boolean; message: string }> {
    await this.checkOwnership(businessId, userId);
    const biz = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true, whatsapp: true },
    });
    if (!biz || !biz.whatsapp) {
      return { success: false, message: 'Nomor WhatsApp bisnis belum diisi di profil bisnis.' };
    }

    const testMessage =
      `🔔 *[Pajangin] Tes Notifikasi Real-time Berhasil!*\n\n` +
      `Halo *${biz.name}*, gateway WhatsApp Fonnte Anda telah terhubung dan aktif.\n` +
      `Setiap ada booking atau calon pembeli baru di website, Anda akan langsung menerima pesan instan seperti ini secara otomatis.`;

    const res = await this.sendWhatsApp(biz.whatsapp, testMessage);
    if (!res.success) {
      return {
        success: false,
        message: `Gagal mengirim WhatsApp: ${res.error || 'Periksa token Fonnte atau status koneksi device'}.`,
      };
    }

    return { success: true, message: `Pesan tes berhasil dikirim ke WhatsApp ${biz.whatsapp}!` };
  }
}
