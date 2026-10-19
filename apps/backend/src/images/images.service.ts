import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { BusinessImage } from '../generated/prisma/client.js';
import { isUuid } from '../common/uuid.js';
import { clipText, normalizeHttpUrl } from '../common/validation.js';

const MAX_GALLERY_IMAGES = 24;

export interface ImageResponse {
  id: string;
  business_id: string;
  url: string;
  caption: string | null;
  category: string | null;
  order_index: number;
  created_at: string;
}

export function toImageResponse(img: BusinessImage): ImageResponse {
  return {
    id: img.id,
    business_id: img.businessId,
    url: img.url,
    caption: img.caption,
    category: img.category,
    order_index: img.orderIndex,
    created_at: img.createdAt.toISOString(),
  };
}

export interface CreateImageInput {
  url: string;
  caption?: string;
  category?: string;
}

export interface UpdateImageInput {
  caption?: string | null;
  category?: string | null;
  order_index?: number;
}

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkOwnership(businessId: string, userId: string) {
    if (!isUuid(businessId)) throw new NotFoundException('Bisnis tidak ditemukan');
    const biz = await this.prisma.business.findUnique({ where: { id: businessId }, select: { userId: true } });
    if (!biz) throw new NotFoundException('Bisnis tidak ditemukan');
    if (biz.userId !== userId) throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk mengelola galeri bisnis ini.');
  }

  async getImages(businessId: string, userId: string): Promise<ImageResponse[]> {
    await this.checkOwnership(businessId, userId);
    const list = await this.prisma.businessImage.findMany({
      where: { businessId },
      orderBy: { orderIndex: 'asc' },
    });
    return list.map(toImageResponse);
  }

  async getPublicImages(businessId: string): Promise<ImageResponse[]> {
    if (!isUuid(businessId)) return [];
    const list = await this.prisma.businessImage.findMany({
      where: { businessId },
      orderBy: { orderIndex: 'asc' },
    });
    return list.map(toImageResponse);
  }

  async addImage(businessId: string, userId: string, data: CreateImageInput): Promise<ImageResponse> {
    await this.checkOwnership(businessId, userId);
    const url = normalizeHttpUrl(data.url, 'URL gambar');
    if (!url) {
      throw new BadRequestException('URL gambar wajib diisi.');
    }

    const count = await this.prisma.businessImage.count({ where: { businessId } });
    if (count >= MAX_GALLERY_IMAGES) {
      throw new BadRequestException(
        `Batas galeri gratis adalah ${MAX_GALLERY_IMAGES} foto. Hapus foto lama sebelum menambah foto baru.`,
      );
    }

    const last = await this.prisma.businessImage.aggregate({
      where: { businessId },
      _max: { orderIndex: true },
    });
    const orderIndex = (last._max.orderIndex ?? -1) + 1;

    const img = await this.prisma.businessImage.create({
      data: {
        businessId,
        url,
        caption: clipText(data.caption, 200),
        category: clipText(data.category, 50) || 'Umum',
        orderIndex,
      },
    });

    return toImageResponse(img);
  }

  async updateImage(businessId: string, imageId: string, userId: string, data: UpdateImageInput): Promise<ImageResponse> {
    await this.checkOwnership(businessId, userId);
    const existing = isUuid(imageId)
      ? await this.prisma.businessImage.findFirst({ where: { id: imageId, businessId } })
      : null;
    if (!existing) {
      throw new NotFoundException('Gambar tidak ditemukan.');
    }

    const img = await this.prisma.businessImage.update({
      where: { id: imageId },
      data: {
        caption: data.caption !== undefined ? clipText(data.caption, 200) : undefined,
        category: data.category !== undefined ? clipText(data.category, 50) : undefined,
        orderIndex: data.order_index,
      },
    });

    return toImageResponse(img);
  }

  async deleteImage(businessId: string, imageId: string, userId: string): Promise<{ success: boolean }> {
    await this.checkOwnership(businessId, userId);
    const res = isUuid(imageId)
      ? await this.prisma.businessImage.deleteMany({ where: { id: imageId, businessId } })
      : { count: 0 };

    if (res.count === 0) {
      throw new NotFoundException('Gambar tidak ditemukan.');
    }

    return { success: true };
  }
}
