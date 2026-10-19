import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { Booking, BookingStatus } from '../generated/prisma/client.js';
import { isUuid } from '../common/uuid.js';
import { normalizeWhatsapp } from '../common/whatsapp.js';

// Tanggal booking disimpan sebagai date-only di Postgres. Gunakan UTC midnight
// supaya nilai yang dikirim dan dibaca konsisten, terlepas dari timezone server.
function parseDateOnly(value: unknown): Date {
  const raw = String(value ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new BadRequestException('Format tanggal tidak valid. Gunakan YYYY-MM-DD.');
  }
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
    throw new BadRequestException('Tanggal tidak valid.');
  }
  return date;
}

function jakartaToday(): Date {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return new Date(`${today}T00:00:00.000Z`);
}

function normalizeTimeSlot(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) {
    throw new BadRequestException('Format jam tidak valid. Gunakan HH:MM.');
  }
  return raw;
}

export interface BookingResponse {
  id: string;
  business_id: string;
  service_id: string | null;
  service_name: string | null;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time_slot: string;
  pax: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function toBookingResponse(b: Booking): BookingResponse {
  const dateStr = b.date instanceof Date ? b.date.toISOString().split('T')[0] : String(b.date).slice(0, 10);
  return {
    id: b.id,
    business_id: b.businessId,
    service_id: b.serviceId,
    service_name: b.serviceName,
    name: b.name,
    phone: b.phone,
    email: b.email,
    date: dateStr,
    time_slot: b.timeSlot,
    pax: b.pax ?? 1,
    status: b.status,
    notes: b.notes,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  };
}

export interface CreateBookingInput {
  business_id: string;
  service_id?: string;
  service_name?: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time_slot: string;
  pax?: number;
  notes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  notes?: string;
  time_slot?: string;
  date?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async checkOwnership(businessId: string, userId: string) {
    if (!isUuid(businessId)) throw new NotFoundException('Bisnis tidak ditemukan');
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { userId: true } });
    if (!biz) throw new NotFoundException('Bisnis tidak ditemukan');
    if (biz.userId !== userId) throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk mengelola booking bisnis ini.');
  }

  async getBookings(
    businessId: string,
    userId: string,
    status?: string,
    date?: string,
  ): Promise<BookingResponse[]> {
    await this.checkOwnership(businessId, userId);

    const where: any = { businessId };
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      where.status = status;
    }
    if (date) {
      where.date = parseDateOnly(date);
    }

    const list = await this.prisma.booking.findMany({
      where,
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    return list.map(toBookingResponse);
  }

  async getBookingStats(businessId: string, userId: string) {
    await this.checkOwnership(businessId, userId);

    // "Hari ini" mengikuti WIB, bukan timezone server (bisa UTC).
    const today = jakartaToday();

    const [total, pending, confirmed, completed, cancelled, todayCount] = await Promise.all([
      this.prisma.booking.count({ where: { businessId } }),
      this.prisma.booking.count({ where: { businessId, status: 'pending' } }),
      this.prisma.booking.count({ where: { businessId, status: 'confirmed' } }),
      this.prisma.booking.count({ where: { businessId, status: 'completed' } }),
      this.prisma.booking.count({ where: { businessId, status: 'cancelled' } }),
      this.prisma.booking.count({ where: { businessId, date: today } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      today: todayCount,
    };
  }

  // Pelanggan membuat booking online melalui halaman publik bisnis
  async createPublicBooking(data: CreateBookingInput): Promise<BookingResponse> {
    const name = data.name?.trim();
    const rawPhone = data.phone?.trim();
    if (!name) throw new BadRequestException('Nama lengkap wajib diisi');
    if (!rawPhone) throw new BadRequestException('Nomor WhatsApp wajib diisi');
    if (!data.date) throw new BadRequestException('Tanggal booking wajib dipilih');
    if (!data.time_slot?.trim()) throw new BadRequestException('Waktu/Jam booking wajib dipilih');
    if (!isUuid(data.business_id)) throw new BadRequestException('ID Bisnis tidak valid');

    const biz = await this.prisma.business.findUnique({
      where: { id: data.business_id },
      select: { id: true, name: true, bookingEnabled: true },
    });
    if (!biz) throw new NotFoundException('Bisnis tidak ditemukan');
    if (!biz.bookingEnabled) {
      throw new BadRequestException('Bisnis ini saat ini belum mengaktifkan booking online langsung.');
    }

    const bookingDate = parseDateOnly(data.date);
    if (bookingDate < jakartaToday()) {
      throw new BadRequestException('Tanggal booking sudah lewat. Pilih tanggal hari ini atau setelahnya.');
    }

    const timeSlot = normalizeTimeSlot(data.time_slot);
    const phone = normalizeWhatsapp(rawPhone);

    let serviceId: string | null = null;
    let serviceName = data.service_name?.trim() || null;
    if (data.service_id) {
      if (!isUuid(data.service_id)) throw new BadRequestException('ID layanan tidak valid');
      const service = await this.prisma.service.findFirst({
        where: { id: data.service_id, businessId: data.business_id },
        select: { id: true, name: true },
      });
      if (!service) throw new BadRequestException('Layanan tidak ditemukan untuk bisnis ini');
      serviceId = service.id;
      serviceName = service.name;
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        businessId: data.business_id,
        date: bookingDate,
        timeSlot,
        status: { not: 'cancelled' },
      },
      select: { id: true },
    });
    if (conflict) {
      throw new BadRequestException('Slot waktu tersebut sudah dibooking. Silakan pilih jam lain.');
    }

    const pax = Math.min(Math.max(Math.trunc(Number(data.pax) || 1), 1), 100);

    const booking = await this.prisma.booking.create({
      data: {
        businessId: data.business_id,
        serviceId,
        serviceName,
        name: name.slice(0, 120),
        phone,
        email: data.email?.trim().slice(0, 160) || null,
        date: bookingDate,
        timeSlot,
        pax,
        notes: data.notes?.trim().slice(0, 1000) || null,
        status: 'pending',
      },
    });

    // Kirim notifikasi real-time WhatsApp otomatis ke pemilik bisnis & pelanggan
    this.notifications.notifyNewBooking(booking.id).catch(() => {});

    return toBookingResponse(booking);
  }

  async updateBooking(
    businessId: string,
    bookingId: string,
    userId: string,
    data: UpdateBookingInput,
  ): Promise<BookingResponse> {
    await this.checkOwnership(businessId, userId);
    if (!isUuid(bookingId)) throw new NotFoundException('ID Booking tidak valid');

    const existing = await this.prisma.booking.findFirst({
      where: { id: bookingId, businessId },
    });
    if (!existing) throw new NotFoundException('Data booking tidak ditemukan');

    const updateData: any = {};
    if (data.status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(data.status)) {
      updateData.status = data.status;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim().slice(0, 1000) || null;
    }

    const nextDate = data.date !== undefined ? parseDateOnly(data.date) : existing.date;
    const nextSlot = data.time_slot !== undefined ? normalizeTimeSlot(data.time_slot) : existing.timeSlot;

    if (data.date !== undefined && nextDate < jakartaToday()) {
      throw new BadRequestException('Tanggal booking sudah lewat. Pilih tanggal hari ini atau setelahnya.');
    }

    const dateChanged = nextDate.getTime() !== existing.date.getTime();
    const slotChanged = nextSlot !== existing.timeSlot;
    if (dateChanged || slotChanged) {
      const conflict = await this.prisma.booking.findFirst({
        where: {
          businessId,
          date: nextDate,
          timeSlot: nextSlot,
          status: { not: 'cancelled' },
          id: { not: bookingId },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new BadRequestException('Slot waktu tersebut sudah dibooking. Silakan pilih jam lain.');
      }
      updateData.date = nextDate;
      updateData.timeSlot = nextSlot;
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return toBookingResponse(updated);
  }

  async deleteBooking(businessId: string, bookingId: string, userId: string): Promise<{ success: boolean }> {
    await this.checkOwnership(businessId, userId);
    if (!isUuid(bookingId)) throw new NotFoundException('ID Booking tidak valid');

    const res = await this.prisma.booking.deleteMany({
      where: { id: bookingId, businessId },
    });
    if (res.count === 0) throw new NotFoundException('Data booking tidak ditemukan');

    return { success: true };
  }
}
