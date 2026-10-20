import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventType } from '../generated/prisma/client.js';
import type { Prisma } from '../generated/prisma/client.js';
import {
  daysAgo,
  parseEnum,
  parseLimit,
  parsePage,
  parseText,
  totalPages,
} from './admin.query.js';

const BUSINESS_SORTS = ['newest', 'oldest', 'name'] as const;
const COMPLETENESS_FILTERS = ['lengkap', 'perlu'] as const;

export interface AdminBusinessListQuery {
  q?: string;
  city?: string;
  category?: string;
  completeness?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// Definisi "lengkap" untuk follow-up: deskripsi, foto hero, dan minimal satu layanan.
// Booking dan logo tetap opsional agar bisnis sederhana tidak otomatis dianggap belum siap.
const COMPLETE_WHERE: Prisma.BusinessWhereInput = {
  AND: [
    { description: { not: null } },
    { NOT: { description: '' } },
    { heroImageUrl: { not: null } },
    { NOT: { heroImageUrl: '' } },
    { services: { some: {} } },
  ],
};

const INCOMPLETE_WHERE: Prisma.BusinessWhereInput = {
  OR: [
    { description: null },
    { description: '' },
    { heroImageUrl: null },
    { heroImageUrl: '' },
    { services: { none: {} } },
  ],
};

// Daftar bisnis untuk /admin/bisnis. Read-only + agregat traffic 30 hari per baris.
@Injectable()
export class AdminBusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: AdminBusinessListQuery) {
    const page = parsePage(params.page);
    const limit = parseLimit(params.limit);
    const q = parseText(params.q);
    const city = parseText(params.city, 80);
    const category = parseText(params.category, 80);
    const completeness = parseEnum(params.completeness, COMPLETENESS_FILTERS);
    const sort = parseEnum(params.sort, BUSINESS_SORTS) ?? 'newest';

    const baseWhere: Prisma.BusinessWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
              // Pemilik ikut dicari supaya founder bisa mulai dari email/WA yang dikenal.
              {
                user: {
                  is: {
                    OR: [
                      { name: { contains: q, mode: 'insensitive' } },
                      { email: { contains: q, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
      ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
    };

    const where: Prisma.BusinessWhereInput = {
      AND: [
        baseWhere,
        ...(completeness === 'lengkap' ? [COMPLETE_WHERE] : []),
        ...(completeness === 'perlu' ? [INCOMPLETE_WHERE] : []),
      ],
    };

    const orderBy: Prisma.BusinessOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' };

    // summary bersifat global; total mengikuti filter yang sedang aktif.
    const [total, summaryTotal, complete, cityRows, categoryRows] = await Promise.all([
      this.prisma.business.count({ where }),
      this.prisma.business.count(),
      this.prisma.business.count({ where: COMPLETE_WHERE }),
      this.prisma.business.groupBy({ by: ['city'], _count: { _all: true } }),
      this.prisma.business.groupBy({ by: ['category'], _count: { _all: true } }),
    ]);

    const pages = totalPages(total, limit);
    const safePage = Math.min(page, pages);

    const businesses = await this.prisma.business.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        category: true,
        description: true,
        heroImageUrl: true,
        bookingEnabled: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { name: true, email: true, whatsapp: true } },
        _count: { select: { services: true, images: true, leads: true, bookings: true } },
      },
    });

    // Traffic diambil hanya untuk ID di halaman ini agar query tetap ringan
    // saat jumlah bisnis bertambah.
    const trafficRows = businesses.length
      ? await this.prisma.analyticsEvent.groupBy({
          by: ['businessId', 'eventType'],
          where: {
            businessId: { in: businesses.map((business) => business.id) },
            createdAt: { gte: daysAgo(30) },
            eventType: { in: [EventType.page_view, EventType.whatsapp_click] },
          },
          _count: { _all: true },
          _max: { createdAt: true },
        })
      : [];

    const trafficByBusiness = new Map<
      string,
      { page_views: number; whatsapp_clicks: number; last_activity_at: string | null }
    >();
    for (const row of trafficRows) {
      const stats =
        trafficByBusiness.get(row.businessId) ?? {
          page_views: 0,
          whatsapp_clicks: 0,
          last_activity_at: null,
        };
      if (row.eventType === EventType.page_view) stats.page_views = row._count._all;
      if (row.eventType === EventType.whatsapp_click) stats.whatsapp_clicks = row._count._all;

      const lastActivity = row._max.createdAt?.toISOString() ?? null;
      if (lastActivity && (!stats.last_activity_at || lastActivity > stats.last_activity_at)) {
        stats.last_activity_at = lastActivity;
      }
      trafficByBusiness.set(row.businessId, stats);
    }

    return {
      items: businesses.map((business) => {
        const hasDescription = Boolean(business.description);
        const hasHero = Boolean(business.heroImageUrl);
        const serviceCount = business._count.services;
        const isComplete = hasDescription && hasHero && serviceCount > 0;
        const traffic = trafficByBusiness.get(business.id);

        return {
          id: business.id,
          slug: business.slug,
          name: business.name,
          city: business.city,
          category: business.category,
          created_at: business.createdAt.toISOString(),
          updated_at: business.updatedAt.toISOString(),
          owner: business.user,
          service_count: serviceCount,
          image_count: business._count.images,
          lead_count: business._count.leads,
          booking_count: business._count.bookings,
          has_description: hasDescription,
          has_hero: hasHero,
          booking_enabled: business.bookingEnabled,
          completeness: isComplete ? 'lengkap' : 'perlu',
          page_views_30d: traffic?.page_views ?? 0,
          whatsapp_clicks_30d: traffic?.whatsapp_clicks ?? 0,
          last_activity_at: traffic?.last_activity_at ?? null,
        };
      }),
      total,
      page: safePage,
      limit,
      total_pages: pages,
      summary: {
        total: summaryTotal,
        complete,
        incomplete: summaryTotal - complete,
        cities: cityRows.length,
      },
      filter_options: {
        cities: cityRows.map((row) => row.city).sort((a, b) => a.localeCompare(b, 'id')),
        categories: categoryRows
          .map((row) => row.category)
          .sort((a, b) => a.localeCompare(b, 'id')),
      },
    };
  }
}
