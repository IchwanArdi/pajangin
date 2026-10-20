import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isAdminEmail } from '../auth/admin.js';
import type { Prisma } from '../generated/prisma/client.js';
import { daysAgo, parseEnum, parseLimit, parsePage, parseText, totalPages } from './admin.query.js';

const USER_SORTS = ['newest', 'oldest', 'name'] as const;
const BUSINESS_FILTERS = ['ya', 'tidak'] as const;

export interface AdminUserListQuery {
  q?: string;
  has_business?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// Daftar akun untuk /admin/pengguna. Read-only: admin tidak bisa mengubah profil user.
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: AdminUserListQuery) {
    const page = parsePage(params.page);
    const limit = parseLimit(params.limit);
    const q = parseText(params.q);
    const sort = parseEnum(params.sort, USER_SORTS) ?? 'newest';
    const hasBusiness = parseEnum(params.has_business, BUSINESS_FILTERS);

    // Pencarian sengaja mencakup nama, email, dan WhatsApp karena founder sering
    // mencari akun dari kontak yang dikirim pemilik usaha.
    const where: Prisma.UserWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { whatsapp: { contains: q } },
            ],
          }
        : {}),
      ...(hasBusiness === 'ya' ? { businesses: { some: {} } } : {}),
      ...(hasBusiness === 'tidak' ? { businesses: { none: {} } } : {}),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' };

    // total = hasil filter; summary tetap global agar angka di atas halaman tidak
    // berubah-ubah saat founder sedang mencari satu akun.
    const [total, summaryTotal, summaryWithBusiness, summaryNew] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { businesses: { some: {} } } }),
      this.prisma.user.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    ]);

    const pages = totalPages(total, limit);
    const safePage = Math.min(page, pages);

    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        createdAt: true,
        businesses: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        },
        _count: { select: { businesses: true } },
      },
    });

    // Feedback tidak punya relasi FK (sengaja arsip historis), jadi hitung agregat
    // hanya untuk user yang muncul di halaman ini.
    const feedbackRows = users.length
      ? await this.prisma.feedback.groupBy({
          by: ['userId'],
          where: { userId: { in: users.map((user) => user.id) } },
          _count: { _all: true },
          _max: { createdAt: true },
        })
      : [];
    const feedbackByUser = new Map(feedbackRows.map((row) => [row.userId, row]));

    return {
      items: users.map((user) => {
        const feedback = feedbackByUser.get(user.id);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          created_at: user.createdAt.toISOString(),
          business_count: user._count.businesses,
          businesses: user.businesses,
          feedback_count: feedback?._count._all ?? 0,
          last_feedback_at: feedback?._max.createdAt?.toISOString() ?? null,
          is_admin: isAdminEmail(user.email),
        };
      }),
      total,
      page: safePage,
      limit,
      total_pages: pages,
      summary: {
        total: summaryTotal,
        with_business: summaryWithBusiness,
        new_30d: summaryNew,
      },
    };
  }
}
