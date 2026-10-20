import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUuid } from '../common/uuid.js';
import {
  FeedbackCategory,
  FeedbackSource,
  FeedbackStatus,
} from '../generated/prisma/client.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';
import { toFeedbackResponse, type FeedbackResponse } from './feedback.types.js';

const CATEGORIES = new Set<string>(Object.values(FeedbackCategory));
const STATUSES = new Set<string>(Object.values(FeedbackStatus));
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

export interface CreateFeedbackInput {
  category?: unknown;
  rating?: unknown;
  message?: unknown;
  business_id?: unknown;
}

interface ListFeedbackParams {
  status?: string;
  category?: string;
  page?: string;
  limit?: string;
}

export interface FeedbackListResponse {
  items: FeedbackResponse[];
  total: number;
  page: number;
  limit: number;
  counts: {
    semua: number;
    baru: number;
    dibaca: number;
    selesai: number;
  };
  average_rating: number | null;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value || '30', 10);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(Math.max(parsed, 1), 100);
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCategory(value: unknown): FeedbackCategory {
    const raw = String(value ?? 'masukan')
      .trim()
      .toLowerCase();
    if (!CATEGORIES.has(raw)) {
      throw new BadRequestException('Kategori masukan tidak valid.');
    }
    return raw as FeedbackCategory;
  }

  private normalizeRating(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;
    const rating = Number(value);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating harus berupa angka 1 sampai 5.');
    }
    return rating;
  }

  private normalizeStatus(value: unknown): FeedbackStatus {
    const raw = String(value ?? '')
      .trim()
      .toLowerCase();
    if (!STATUSES.has(raw)) {
      throw new BadRequestException('Status masukan tidak valid.');
    }
    return raw as FeedbackStatus;
  }

  private normalizeStatusFilter(value: string | undefined): FeedbackStatus | undefined {
    if (!value || value === 'semua') return undefined;
    return this.normalizeStatus(value);
  }

  private normalizeCategoryFilter(value: string | undefined): FeedbackCategory | undefined {
    if (!value || value === 'semua') return undefined;
    const raw = value.trim().toLowerCase();
    if (!CATEGORIES.has(raw)) {
      throw new BadRequestException('Kategori masukan tidak valid.');
    }
    return raw as FeedbackCategory;
  }

  private async resolveBusiness(
    userId: string,
    rawBusinessId: unknown,
  ): Promise<{ id: string; name: string } | null> {
    if (rawBusinessId === undefined || rawBusinessId === null || rawBusinessId === '') return null;
    if (typeof rawBusinessId !== 'string' || !isUuid(rawBusinessId)) {
      throw new BadRequestException('ID bisnis tidak valid.');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: rawBusinessId },
      select: { id: true, userId: true, name: true },
    });
    if (!business) throw new NotFoundException('Bisnis tidak ditemukan.');
    if (business.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke bisnis ini.');
    }
    return { id: business.id, name: business.name };
  }

  // Cegah spam dari akun yang login. Cukup untuk pilot satu instance.
  private async assertRateLimit(userId: string) {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recent = await this.prisma.feedback.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (recent >= RATE_LIMIT) {
      throw new HttpException(
        'Terlalu banyak masukan dalam waktu singkat. Coba lagi beberapa menit lagi.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async create(user: AuthenticatedUser, input: CreateFeedbackInput) {
    const message = String(input?.message ?? '').trim();
    if (message.length < MIN_MESSAGE) {
      throw new BadRequestException(`Pesan minimal ${MIN_MESSAGE} karakter.`);
    }
    if (message.length > MAX_MESSAGE) {
      throw new BadRequestException(`Pesan maksimal ${MAX_MESSAGE} karakter.`);
    }

    const category = this.normalizeCategory(input?.category);
    const rating = this.normalizeRating(input?.rating);
    const business = await this.resolveBusiness(user.id, input?.business_id);
    await this.assertRateLimit(user.id);

    const feedback = await this.prisma.feedback.create({
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userWhatsapp: user.whatsapp,
        businessId: business?.id ?? null,
        businessName: business?.name ?? null,
        source: FeedbackSource.dashboard,
        category,
        rating,
        message,
        status: FeedbackStatus.baru,
      },
    });

    return {
      success: true,
      feedback_id: feedback.id,
      created_at: feedback.createdAt.toISOString(),
    };
  }

  async listForAdmin(params: ListFeedbackParams): Promise<FeedbackListResponse> {
    const page = parsePage(params.page);
    const limit = parseLimit(params.limit);
    const status = this.normalizeStatusFilter(params.status);
    const category = this.normalizeCategoryFilter(params.category);

    const where = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    };

    const [items, total, statusCounts, rating] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.feedback.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
    ]);

    const counts = { semua: 0, baru: 0, dibaca: 0, selesai: 0 };
    for (const row of statusCounts) {
      counts[row.status] = row._count._all;
      counts.semua += row._count._all;
    }

    return {
      items: items.map(toFeedbackResponse),
      total,
      page,
      limit,
      counts,
      average_rating:
        rating._avg.rating === null ? null : Number(rating._avg.rating.toFixed(2)),
    };
  }

  async updateStatus(id: string, rawStatus: unknown): Promise<FeedbackResponse> {
    if (!isUuid(id)) throw new NotFoundException('Masukan tidak ditemukan.');
    const status = this.normalizeStatus(rawStatus);

    const existing = await this.prisma.feedback.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Masukan tidak ditemukan.');

    const updated = await this.prisma.feedback.update({
      where: { id },
      data: { status },
    });
    return toFeedbackResponse(updated);
  }
}
