import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { EventType } from '../generated/prisma/client.js';
import { isUuid } from '../common/uuid.js';
import { normalizeWhatsapp } from '../common/whatsapp.js';

export interface IngestEventDto {
  business_id: string;
  event_type: EventType;
  target_id?: string;
  target_name?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device?: string;
  session_id?: string;
}

export interface IngestLeadDto {
  business_id: string;
  name: string;
  phone: string;
  message?: string;
  service_id?: string;
  service_name?: string;
  // Atribusi supaya lead tidak tercatat sebagai sesi "direct" yang anonim.
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device?: string;
  session_id?: string;
}

export interface MarketingInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'opportunity';
  title: string;
  metric?: string;
  description: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Low';
  // id layanan terkait (untuk tombol aksi di dashboard)
  targetId?: string;
}

const EVENT_TYPES = new Set<string>(Object.values(EventType));
const DEVICES = new Set(['mobile', 'desktop', 'tablet']);
const DAY_MS = 24 * 60 * 60 * 1000;
const TZ = 'Asia/Jakarta';

// potong string dari client supaya tidak ada payload raksasa masuk ke DB
function clip(value: unknown, max = 255): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}

// Normalisasi sumber traffic dari UTM / referrer
function resolveTrafficSource(referrer: string | null, utmSource: string | null): string {
  const utm = (utmSource || '').toLowerCase();
  if (utm) return utm.slice(0, 50);
  const ref = (referrer || '').toLowerCase();
  if (ref.includes('google.')) return 'google';
  if (ref.includes('instagram.')) return 'instagram';
  if (ref.includes('tiktok.')) return 'tiktok';
  if (ref.includes('facebook.') || ref.includes('fb.')) return 'facebook';
  if (ref.includes('whatsapp.') || ref.includes('wa.me')) return 'whatsapp';
  if (ref) return 'other';
  return 'direct';
}

function clampDays(days: number): number {
  return Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
}

// perubahan persen terhadap periode sebelumnya (null = tidak ada pembanding)
function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

// tanggal YYYY-MM-DD dalam zona WIB
function jakartaDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

interface PeriodTotals {
  visitors: number;
  pageViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  contacts: number;
  leads: number;
  serviceViewSessions: number;
  contactSessions: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertBusinessExists(businessId: unknown): Promise<string> {
    if (!isUuid(businessId)) {
      throw new BadRequestException('business_id tidak valid.');
    }
    const exists = await this.prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Bisnis tidak ditemukan.');
    }
    return businessId;
  }

  // ===================== INGEST =====================

  async recordEvent(dto: IngestEventDto) {
    if (!dto || !EVENT_TYPES.has(dto.event_type)) {
      throw new BadRequestException('event_type tidak valid.');
    }
    const businessId = await this.assertBusinessExists(dto.business_id);

    const referrer = clip(dto.referrer, 1000);
    const utmSource = clip(dto.utm_source, 100);
    const device = DEVICES.has(String(dto.device)) ? String(dto.device) : 'mobile';

    const event = await this.prisma.analyticsEvent.create({
      data: {
        businessId,
        eventType: dto.event_type,
        targetId: clip(dto.target_id),
        targetName: clip(dto.target_name),
        trafficSource: resolveTrafficSource(referrer, utmSource),
        referrer,
        utmSource,
        utmMedium: clip(dto.utm_medium, 100),
        utmCampaign: clip(dto.utm_campaign, 100),
        device,
        sessionId: clip(dto.session_id, 100) || `anon_${randomUUID()}`,
      },
      select: { id: true },
    });

    return { success: true, event_id: event.id };
  }

  async recordLead(dto: IngestLeadDto) {
    const businessId = await this.assertBusinessExists(dto?.business_id);
    const name = clip(dto?.name, 120);
    const rawPhone = clip(dto?.phone, 30);
    if (!name || !rawPhone) {
      throw new BadRequestException('Nama dan nomor telepon wajib diisi.');
    }
    if (name.length < 2) {
      throw new BadRequestException('Nama terlalu pendek.');
    }

    // Nomor disimpan dalam format internasional agar tombol WhatsApp di dashboard langsung bekerja.
    const phone = normalizeWhatsapp(rawPhone);

    const serviceId = dto?.service_id ? String(dto.service_id).trim() : null;
    if (serviceId && !isUuid(serviceId)) {
      throw new BadRequestException('ID layanan tidak valid.');
    }

    let serviceName = clip(dto?.service_name, 160);
    if (serviceId) {
      const service = await this.prisma.service.findFirst({
        where: { id: serviceId, businessId },
        select: { name: true },
      });
      if (!service) {
        throw new BadRequestException('Layanan tidak ditemukan untuk bisnis ini.');
      }
      serviceName = service.name;
    }

    const lead = await this.prisma.lead.create({
      data: {
        businessId,
        name,
        phone,
        message: clip(dto?.message, 2000),
        serviceId,
        serviceName,
      },
      select: { id: true },
    });

    // Event lead memakai session/UTM yang sama dengan page_view, bukan sesi anonim baru.
    await this.recordEvent({
      business_id: businessId,
      event_type: EventType.lead_submit,
      target_id: serviceId || undefined,
      target_name: serviceName || name,
      referrer: dto?.referrer,
      utm_source: dto?.utm_source,
      utm_medium: dto?.utm_medium,
      utm_campaign: dto?.utm_campaign,
      device: dto?.device,
      session_id: dto?.session_id,
    });

    // Notifikasi in-app selalu tersedia; WhatsApp dibatasi di NotificationsService.
    this.notifications.notifyNewLead(lead.id).catch(() => {});

    return { success: true, lead_id: lead.id };
  }

  // ===================== DASHBOARD =====================

  // Total satu periode [from, to) — dipakai untuk periode aktif & periode pembanding
  private async totals(businessId: string, from: Date, to: Date): Promise<PeriodTotals> {
    const [rows, leads] = await Promise.all([
      this.prisma.$queryRaw<
        Array<{
          visitors: bigint;
          page_views: bigint;
          wa: bigint;
          phone: bigint;
          service_sessions: bigint;
          contact_sessions: bigint;
        }>
      >`
        SELECT
          COUNT(DISTINCT session_id) AS visitors,
          COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS wa,
          COUNT(*) FILTER (WHERE event_type = 'phone_click') AS phone,
          COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'service_view') AS service_sessions,
          COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('whatsapp_click', 'phone_click')) AS contact_sessions
        FROM analytics_events
        WHERE business_id = ${businessId}::uuid AND created_at >= ${from} AND created_at < ${to}
      `,
      this.prisma.lead.count({ where: { businessId, createdAt: { gte: from, lt: to } } }),
    ]);

    const r = rows[0];
    const whatsappClicks = Number(r?.wa ?? 0);
    const phoneClicks = Number(r?.phone ?? 0);
    return {
      visitors: Number(r?.visitors ?? 0),
      pageViews: Number(r?.page_views ?? 0),
      whatsappClicks,
      phoneClicks,
      contacts: whatsappClicks + phoneClicks,
      leads,
      serviceViewSessions: Number(r?.service_sessions ?? 0),
      contactSessions: Number(r?.contact_sessions ?? 0),
    };
  }

  async getOverview(businessId: string, days = 30) {
    const period = clampDays(days);
    const now = new Date();
    const since = new Date(now.getTime() - period * DAY_MS);
    const prevSince = new Date(since.getTime() - period * DAY_MS);
    const inPeriod = { businessId, createdAt: { gte: since } };

    const [current, previous, sources, services] = await Promise.all([
      this.totals(businessId, since, now),
      this.totals(businessId, prevSince, since),
      this.prisma.analyticsEvent.groupBy({
        by: ['trafficSource'],
        where: { ...inPeriod, eventType: EventType.page_view },
        _count: { _all: true },
      }),
      this.prisma.service.findMany({
        where: { businessId },
        select: { id: true, name: true, isFeatured: true },
        orderBy: { orderIndex: 'asc' },
      }),
    ]);

    // Tingkat klik kontak per sesi pengunjung. Memakai sesi unik supaya tidak bisa >100%.
    const rate = (t: PeriodTotals) =>
      t.visitors > 0 ? Number(((t.contactSessions / t.visitors) * 100).toFixed(1)) : 0;
    const conversionRate = rate(current);
    const prevConversionRate = rate(previous);

    const totalSourceCount = sources.reduce((acc, s) => acc + s._count._all, 0) || 1;
    const trafficSources = sources
      .map((s) => ({
        source: s.trafficSource.charAt(0).toUpperCase() + s.trafficSource.slice(1),
        key: s.trafficSource,
        count: s._count._all,
        percentage: Math.round((s._count._all / totalSourceCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const perService = services.length
      ? await this.prisma.analyticsEvent.groupBy({
          by: ['targetId', 'eventType'],
          where: {
            ...inPeriod,
            eventType: { in: [EventType.service_view, EventType.whatsapp_click] },
            targetId: { in: services.map((s) => s.id) },
          },
          _count: { _all: true },
        })
      : [];

    const topServices = services
      .map((s) => {
        const views =
          perService.find((r) => r.targetId === s.id && r.eventType === EventType.service_view)?._count._all ?? 0;
        const clicks =
          perService.find((r) => r.targetId === s.id && r.eventType === EventType.whatsapp_click)?._count._all ?? 0;
        return {
          id: s.id,
          name: s.name,
          isFeatured: s.isFeatured,
          views,
          clicks,
          conversionRate: views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.views - a.views || b.clicks - a.clicks);

    return {
      overview: {
        visitors: current.visitors,
        pageViews: current.pageViews,
        whatsappClicks: current.whatsappClicks,
        phoneClicks: current.phoneClicks,
        contacts: current.contacts,
        leads: current.leads,
        conversionRate,
      },
      // perubahan % vs periode sebelumnya dengan panjang yang sama (null = sebelumnya 0)
      deltas: {
        visitors: delta(current.visitors, previous.visitors),
        pageViews: delta(current.pageViews, previous.pageViews),
        contacts: delta(current.contacts, previous.contacts),
        leads: delta(current.leads, previous.leads),
        conversionRate:
          previous.visitors > 0 ? Number((conversionRate - prevConversionRate).toFixed(1)) : null, // selisih poin %
      },
      // Perjalanan utama per sesi: kunjungan → klik kontak. Klik layanan disimpan
      // sebagai konteks terpisah karena bukan langkah wajib sebelum menghubungi.
      funnel: {
        visitors: current.visitors,
        viewedService: current.serviceViewSessions,
        contacted: current.contactSessions,
      },
      trafficSources,
      topServices,
      periodDays: period,
    };
  }

  // Data harian untuk grafik tren (zona waktu WIB, hari kosong diisi 0)
  async getTimeseries(businessId: string, days = 30) {
    const period = clampDays(days);
    const now = new Date();
    const since = new Date(now.getTime() - (period - 1) * DAY_MS);
    // mulai dari awal hari (WIB) supaya bucket pertama utuh
    const sinceDay = jakartaDate(since);
    const from = new Date(`${sinceDay}T00:00:00+07:00`);

    const rows = await this.prisma.$queryRaw<Array<{ day: string; visitors: bigint; contacts: bigint; views: bigint }>>`
      SELECT
        to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS day,
        COUNT(DISTINCT session_id) AS visitors,
        COUNT(*) FILTER (WHERE event_type IN ('whatsapp_click', 'phone_click')) AS contacts,
        COUNT(*) FILTER (WHERE event_type = 'page_view') AS views
      FROM analytics_events
      WHERE business_id = ${businessId}::uuid AND created_at >= ${from}
      GROUP BY 1
      ORDER BY 1
    `;

    const byDay = new Map(rows.map((r) => [r.day, r]));
    const points: Array<{ date: string; visitors: number; contacts: number; views: number }> = [];
    for (let i = 0; i < period; i++) {
      const date = jakartaDate(new Date(from.getTime() + i * DAY_MS + 12 * 60 * 60 * 1000));
      const r = byDay.get(date);
      points.push({
        date,
        visitors: Number(r?.visitors ?? 0),
        contacts: Number(r?.contacts ?? 0),
        views: Number(r?.views ?? 0),
      });
    }
    return { periodDays: period, points };
  }

  // Aktivitas terbaru (feed live di dashboard)
  async getActivity(businessId: string, limit = 12) {
    const take = Math.min(Math.max(Math.trunc(limit) || 12, 1), 50);
    const events = await this.prisma.analyticsEvent.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        eventType: true,
        targetId: true,
        targetName: true,
        trafficSource: true,
        device: true,
        createdAt: true,
      },
    });
    return events.map((e) => ({
      id: e.id,
      type: e.eventType,
      targetName: e.targetName,
      source: e.trafficSource,
      device: e.device,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async getMarketingInsights(businessId: string, days = 30): Promise<MarketingInsight[]> {
    const data = await this.getOverview(businessId, days);
    const period = data.periodDays;
    const insights: MarketingInsight[] = [];

    // Rule 0: belum ada data sama sekali → arahkan owner untuk menyebarkan link
    if (data.overview.visitors === 0) {
      insights.push({
        id: 'no_data_yet',
        type: 'opportunity',
        title: `Belum ada pengunjung dalam ${period} hari terakhir`,
        description: 'Rekomendasi otomatis muncul setelah halaman bisnis Anda mulai dikunjungi calon pelanggan.',
        recommendation:
          'Bagikan link halaman Anda di bio Instagram, status WhatsApp, dan Google Business Profile.',
        impact: 'High',
      });
      return insights;
    }

    // Rule 1: banyak diklik, sedikit yang chat (hambatan konversi)
    const friction = data.topServices.find((s) => s.views >= 10 && s.conversionRate < 3.0);
    if (friction) {
      insights.push({
        id: 'friction_detected',
        type: 'warning',
        title: `${friction.name} banyak diklik, tapi jarang di-chat`,
        metric: `${friction.views} klik layanan · ${friction.clicks} chat`,
        description: `Hanya ${friction.conversionRate}% yang lanjut menghubungi setelah membuka layanan ini.`,
        recommendation: 'Tampilkan kisaran harga dan jelaskan proses singkat agar pengunjung tidak ragu.',
        impact: 'High',
        targetId: friction.id,
      });
    }

    // Rule 2: layanan dengan konversi tinggi
    const star = data.topServices.find((s) => s.views >= 10 && s.conversionRate >= 8.0 && !s.isFeatured);
    if (star) {
      insights.push({
        id: 'star_performer',
        type: 'success',
        title: `${star.name} paling cepat menghasilkan chat`,
        metric: `${star.conversionRate}% lanjut chat`,
        description: `${star.clicks} chat WhatsApp dari ${star.views} klik layanan.`,
        recommendation: 'Jadikan layanan andalan dan taruh di urutan teratas.',
        impact: 'Medium',
        targetId: star.id,
      });
    }

    // Rule 3: ketergantungan sumber traffic
    const googlePct = data.trafficSources.find((s) => s.key === 'google')?.percentage ?? 0;
    if (googlePct >= 50) {
      insights.push({
        id: 'strong_seo',
        type: 'info',
        title: `${googlePct}% pengunjung datang dari Google`,
        metric: `${googlePct}% dari Google`,
        description: 'Halaman Anda mudah ditemukan di pencarian lokal.',
        recommendation: 'Hubungkan Google Maps di profil dan minta pelanggan puas memberi ulasan.',
        impact: 'Medium',
      });
    } else {
      insights.push({
        id: 'seo_opportunity',
        type: 'opportunity',
        title: 'Pengunjung dari Google masih sedikit',
        metric: `${googlePct}% dari Google`,
        description: 'Sebagian besar pengunjung datang dari link langsung atau media sosial.',
        recommendation: 'Lengkapi deskripsi dengan kata kunci lokal, misalnya "bengkel mobil Purwokerto".',
        impact: 'High',
      });
    }

    // Rule 4: pengunjung datang tapi tidak ada yang menghubungi
    if (data.overview.visitors >= 20 && data.overview.contacts === 0) {
      insights.push({
        id: 'no_contacts',
        type: 'warning',
        title: 'Ada pengunjung, tapi belum ada yang menghubungi',
        metric: `${data.overview.visitors} pengunjung · 0 kontak`,
        description: 'Pengunjung membuka halaman Anda lalu pergi tanpa chat atau telepon.',
        recommendation: 'Pastikan setiap layanan punya harga dan deskripsi yang jelas.',
        impact: 'High',
      });
    }

    return insights;
  }
}
