import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventType, FeedbackStatus } from '../generated/prisma/client.js';
import { toFeedbackResponse } from '../feedback/feedback.types.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const TZ = 'Asia/Jakarta';

function clampDays(days: number): number {
  return Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
}

// Perubahan persen vs periode sebelumnya. null = belum ada pembanding.
function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function jakartaDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(days = 30) {
    const period = clampDays(days);
    const now = new Date();
    const since = new Date(now.getTime() - period * DAY_MS);
    const prevSince = new Date(since.getTime() - period * DAY_MS);

    // Grafik dimulai dari awal hari WIB supaya bucket pertama utuh.
    const seriesStartDay = jakartaDate(new Date(now.getTime() - (period - 1) * DAY_MS));
    const seriesFrom = new Date(`${seriesStartDay}T00:00:00+07:00`);

    const [
      usersTotal,
      usersNew,
      usersPrev,
      usersWithBusiness,
      businessesTotal,
      businessesNew,
      businessesPrev,
      businessesWithHero,
      bookingEnabled,
      servicesDistinct,
      feedbackTotal,
      feedbackUnread,
      feedbackAvg,
      feedbackByCategory,
      feedbackNew,
      leadsNew,
      leadsPrev,
      bookingsNew,
      bookingsPrev,
      pageViewsNew,
      pageViewsPrev,
      waClicksNew,
      waClicksPrev,
      trafficBusinesses,
      recentUsers,
      recentBusinesses,
      recentFeedback,
      cities,
      categories,
      userSeriesRows,
      businessSeriesRows,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
      this.prisma.user.count({ where: { businesses: { some: {} } } }),
      this.prisma.business.count(),
      this.prisma.business.count({ where: { createdAt: { gte: since } } }),
      this.prisma.business.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
      this.prisma.business.count({ where: { heroImageUrl: { not: null } } }),
      this.prisma.business.count({ where: { bookingEnabled: true } }),
      this.prisma.service.findMany({ distinct: ['businessId'], select: { businessId: true } }),
      this.prisma.feedback.count(),
      this.prisma.feedback.count({ where: { status: FeedbackStatus.baru } }),
      this.prisma.feedback.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
      this.prisma.feedback.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.feedback.count({ where: { createdAt: { gte: since } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: since } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: since } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
      this.prisma.analyticsEvent.count({
        where: { eventType: EventType.page_view, createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { eventType: EventType.page_view, createdAt: { gte: prevSince, lt: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { eventType: EventType.whatsapp_click, createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { eventType: EventType.whatsapp_click, createdAt: { gte: prevSince, lt: since } },
      }),
      this.prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: since } },
        distinct: ['businessId'],
        select: { businessId: true },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: { select: { businesses: true } },
        },
      }),
      this.prisma.business.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          category: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.business.groupBy({
        by: ['city'],
        _count: { _all: true },
      }),
      this.prisma.business.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: seriesFrom } },
        select: { createdAt: true },
      }),
      this.prisma.business.findMany({
        where: { createdAt: { gte: seriesFrom } },
        select: { createdAt: true },
      }),
    ]);

    const userByDay = new Map<string, number>();
    for (const row of userSeriesRows) {
      const day = jakartaDate(row.createdAt);
      userByDay.set(day, (userByDay.get(day) ?? 0) + 1);
    }

    const businessByDay = new Map<string, number>();
    for (const row of businessSeriesRows) {
      const day = jakartaDate(row.createdAt);
      businessByDay.set(day, (businessByDay.get(day) ?? 0) + 1);
    }

    const series: Array<{ date: string; users: number; businesses: number }> = [];
    for (let i = 0; i < period; i++) {
      // +12 jam supaya aman dari pergeseran DST/timezone saat membentuk tanggal.
      const date = jakartaDate(new Date(seriesFrom.getTime() + i * DAY_MS + 12 * 60 * 60 * 1000));
      series.push({
        date,
        users: userByDay.get(date) ?? 0,
        businesses: businessByDay.get(date) ?? 0,
      });
    }

    const topCities = cities
      .map((row) => ({ city: row.city, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
      .slice(0, 6);

    const topCategories = categories
      .map((row) => ({ category: row.category, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
      .slice(0, 6);

    const feedbackCategories = feedbackByCategory
      .map((row) => ({ category: row.category, count: row._count._all }))
      .sort((a, b) => b.count - a.count);

    return {
      period_days: period,
      users: {
        total: usersTotal,
        new: usersNew,
        previous: usersPrev,
        delta: delta(usersNew, usersPrev),
        with_business: usersWithBusiness,
      },
      businesses: {
        total: businessesTotal,
        new: businessesNew,
        previous: businessesPrev,
        delta: delta(businessesNew, businessesPrev),
        with_services: servicesDistinct.length,
        with_hero: businessesWithHero,
        booking_enabled: bookingEnabled,
        with_traffic: trafficBusinesses.length,
      },
      feedback: {
        total: feedbackTotal,
        new: feedbackNew,
        unread: feedbackUnread,
        average_rating:
          feedbackAvg._avg.rating === null
            ? null
            : Number(feedbackAvg._avg.rating.toFixed(2)),
        by_category: feedbackCategories,
      },
      activity: {
        page_views: pageViewsNew,
        page_views_delta: delta(pageViewsNew, pageViewsPrev),
        whatsapp_clicks: waClicksNew,
        whatsapp_clicks_delta: delta(waClicksNew, waClicksPrev),
        leads: leadsNew,
        leads_delta: delta(leadsNew, leadsPrev),
        bookings: bookingsNew,
        bookings_delta: delta(bookingsNew, bookingsPrev),
      },
      series,
      top_cities: topCities,
      top_categories: topCategories,
      recent_users: recentUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt.toISOString(),
        business_count: user._count.businesses,
      })),
      recent_businesses: recentBusinesses.map((business) => ({
        id: business.id,
        slug: business.slug,
        name: business.name,
        city: business.city,
        category: business.category,
        created_at: business.createdAt.toISOString(),
        owner_name: business.user.name,
        owner_email: business.user.email,
      })),
      recent_feedback: recentFeedback.map(toFeedbackResponse),
    };
  }
}
