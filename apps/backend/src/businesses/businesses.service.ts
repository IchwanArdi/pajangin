import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Business, Service } from '../generated/prisma/client.js';
import { isUuid } from '../common/uuid.js';
import { normalizeWhatsapp } from '../common/whatsapp.js';
import { normalizeHexColor, normalizeHttpUrl, normalizeRating, normalizeReviewCount } from '../common/validation.js';
import { toImageResponse } from '../images/images.service.js';

// ===== Bentuk respons API (snake_case, kontrak dengan frontend) =====

export interface BusinessResponse {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  whatsapp: string;
  opening_hours: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  service_area: string | null;
  rating: number | null;
  review_count: number | null;
  faq: string | null;
  province: string | null;
  price_range: string | null;
  meta_title: string | null;
  meta_description: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  booking_enabled: boolean;
  testimonials: string | null;
  template: string;
  theme_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse {
  id: string;
  business_id: string;
  name: string;
  price: number | null;
  price_prefix: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

export function toBusinessResponse(b: Business): BusinessResponse {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    category: b.category,
    description: b.description,
    address: b.address,
    city: b.city,
    phone: b.phone,
    whatsapp: b.whatsapp,
    opening_hours: b.openingHours,
    logo_url: b.logoUrl,
    hero_image_url: b.heroImageUrl,
    service_area: b.serviceArea,
    rating: b.rating,
    review_count: b.reviewCount,
    faq: b.faq,
    province: b.province,
    price_range: b.priceRange,
    meta_title: b.metaTitle,
    meta_description: b.metaDescription,
    google_maps_url: b.googleMapsUrl,
    instagram_url: b.instagramUrl,
    booking_enabled: b.bookingEnabled,
    testimonials: b.testimonials,
    template: b.template,
    theme_color: b.themeColor,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  };
}

export function toServiceResponse(s: Service): ServiceResponse {
  return {
    id: s.id,
    business_id: s.businessId,
    name: s.name,
    price: s.price,
    price_prefix: s.pricePrefix,
    description: s.description,
    category: s.category,
    image_url: s.imageUrl,
    is_featured: s.isFeatured,
    order_index: s.orderIndex,
    created_at: s.createdAt.toISOString(),
  };
}

// ===== Input dari controller (snake_case, sama dengan body request) =====

export interface ServiceInput {
  name?: string;
  price?: number | string | null;
  price_prefix?: string;
  description?: string;
  category?: string;
  image_url?: string;
  is_featured?: boolean;
  order_index?: number;
}

export interface CreateBusinessInput {
  name: string;
  category: string;
  description?: string;
  address: string;
  city: string;
  whatsapp: string;
  phone?: string;
  opening_hours?: string;
  tagline?: string;
  services?: ServiceInput[];
  hero_image_url?: string;
  service_area?: string;
  rating?: number;
  review_count?: number;
  faq?: string;
  province?: string;
  price_range?: string;
  booking_enabled?: boolean;
  testimonials?: string;
  template?: string;
  theme_color?: string;
}

export type UpdateBusinessInput = Partial<
  Pick<
    BusinessResponse,
    | 'name'
    | 'tagline'
    | 'category'
    | 'description'
    | 'address'
    | 'city'
    | 'phone'
    | 'whatsapp'
    | 'opening_hours'
    | 'google_maps_url'
    | 'instagram_url'
    | 'booking_enabled'
    | 'testimonials'
    | 'meta_title'
    | 'meta_description'
    | 'logo_url'
    | 'hero_image_url'
    | 'service_area'
    | 'rating'
    | 'review_count'
    | 'faq'
    | 'province'
    | 'price_range'
    | 'template'
    | 'theme_color'
  >
>;

// helper: string opsional → trimmed string / null / undefined (undefined = jangan diubah)
function optText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function toPrice(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  // Auto-pilih template berdasarkan kategori bisnis
  private categoryToTemplate(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes('bengkel') || cat.includes('otomotif')) return 'workshop';
    if (cat.includes('kopi') || cat.includes('cafe')) return 'restaurant';
    if (cat.includes('restoran') || cat.includes('kuliner')) return 'restaurant';
    if (cat.includes('salon') || cat.includes('barber') || cat.includes('kecantikan') || cat.includes('spa')) return 'salon';
    if (cat.includes('kesehatan') || cat.includes('klinik')) return 'clinic';
    if (cat.includes('pendidikan') || cat.includes('kursus')) return 'education';
    if (cat.includes('toko') || cat.includes('retail')) return 'retail';
    if (cat.includes('laundry')) return 'retail';
    if (cat.includes('jasa')) return 'workshop';
    return 'default';
  }

  // Verifikasi kepemilikan bisnis oleh user (Multi-Tenant Authorization Check)
  async checkOwnership(businessId: string, userId: string): Promise<Business> {
    const biz = await this.findEntityById(businessId);
    if (biz.userId !== userId) {
      throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk mengelola bisnis ini.');
    }
    return biz;
  }

  private async findEntityById(id: string): Promise<Business> {
    const biz = isUuid(id) ? await this.prisma.business.findUnique({ where: { id } }) : null;
    if (!biz) throw new NotFoundException(`Bisnis dengan ID '${id}' tidak ditemukan`);
    return biz;
  }

  // Ambil bisnis milik user tertentu (Dashboard milik user)
  async findByUserId(userId: string): Promise<BusinessResponse[]> {
    const list = await this.prisma.business.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(toBusinessResponse);
  }

  async findById(id: string): Promise<BusinessResponse> {
    return toBusinessResponse(await this.findEntityById(id));
  }

  // Halaman publik lokal: /nama-bisnis
  async findBySlug(slug: string) {
    const cleanSlug = (slug || '').trim().toLowerCase();
    const biz = await this.prisma.business.findUnique({
      where: { slug: cleanSlug },
      include: {
        services: { orderBy: { orderIndex: 'asc' } },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!biz) throw new NotFoundException(`Halaman bisnis '${slug}' tidak ditemukan`);

    const { services, images, ...business } = biz;
    return {
      business: toBusinessResponse(business),
      services: services.map(toServiceResponse),
      images: (images || []).map(toImageResponse),
      schemaJsonLd: this.buildSchemaOrg(business, services),
      // Halaman yang belum lengkap tetap bisa dibuka, tapi tidak diindeks Google.
      complete: this.isPageComplete(business, services.length, images.length),
    };
  }

  // Halaman dianggap layak diindeks jika punya deskripsi, WhatsApp, minimal 3 layanan,
  // dan minimal satu foto (hero/logo/galeri). Ini mencegah halaman kosong masuk Google.
  private isPageComplete(
    business: {
      description: string | null;
      whatsapp: string | null;
      heroImageUrl: string | null;
      logoUrl: string | null;
    },
    serviceCount: number,
    imageCount: number,
  ): boolean {
    return Boolean(
      business.description?.trim() &&
        business.whatsapp?.trim() &&
        serviceCount >= 3 &&
        (imageCount > 0 || business.heroImageUrl || business.logoUrl),
    );
  }

  // Daftar halaman lengkap untuk sitemap.xml (tanpa data sensitif).
  async findSitemapEntries(): Promise<Array<{ slug: string; updated_at: string }>> {
    const list = await this.prisma.business.findMany({
      where: { description: { not: null } },
      select: {
        slug: true,
        updatedAt: true,
        description: true,
        whatsapp: true,
        heroImageUrl: true,
        logoUrl: true,
        _count: { select: { services: true, images: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    });

    return list
      .filter((item) =>
        this.isPageComplete(
          {
            description: item.description,
            whatsapp: item.whatsapp,
            heroImageUrl: item.heroImageUrl,
            logoUrl: item.logoUrl,
          },
          item._count.services,
          item._count.images,
        ),
      )
      .map((item) => ({ slug: item.slug, updated_at: item.updatedAt.toISOString() }));
  }

  // Route statis Next.js tidak boleh tertutup slug bisnis (mis. /admin, /pricing).
  private static readonly RESERVED_SLUGS = new Set([
    'admin',
    'dashboard',
    'onboarding',
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'pricing',
    'contoh',
    'auth',
    'api',
    'sitemap.xml',
    'robots.txt',
    'manifest.webmanifest',
    'opengraph-image',
    'icon',
    'apple-icon',
  ]);

  // Generate slug unik yang aman dari collision route statis & bisnis lain
  private async generateUniqueSlug(baseName: string): Promise<string> {
    const slug =
      baseName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'bisnis';

    let candidate = slug;
    let counter = 1;
    while (
      BusinessesService.RESERVED_SLUGS.has(candidate) ||
      (await this.prisma.business.findUnique({ where: { slug: candidate }, select: { id: true } }))
    ) {
      counter++;
      candidate = `${slug}-${counter}`;
    }
    return candidate;
  }

  // Buat bisnis baru + layanan awal (Onboarding) dalam satu transaksi
  async createBusiness(userId: string, data: CreateBusinessInput): Promise<BusinessResponse> {
    const name = data.name?.trim();
    const category = data.category?.trim();
    const city = data.city?.trim();
    const address = data.address?.trim();
    const rawWhatsapp = data.whatsapp?.trim();

    if (!name || !category || !city || !address || !rawWhatsapp) {
      throw new BadRequestException('Nama, kategori, kota, alamat, dan nomor WhatsApp wajib diisi.');
    }
    const whatsapp = normalizeWhatsapp(rawWhatsapp);

    const description = optText(data.description) ?? null;
    const services = (Array.isArray(data.services) ? data.services : [])
      .filter((s) => s && typeof s.name === 'string' && s.name.trim())
      .map((s, i) => ({
        name: s.name!.trim(),
        price: toPrice(s.price),
        description: optText(s.description) ?? null,
        orderIndex: i,
      }));

    const biz = await this.prisma.business.create({
      data: {
        userId,
        slug: await this.generateUniqueSlug(name),
        name,
        category,
        city,
        address,
        whatsapp,
        tagline: optText(data.tagline) ?? null,
        description,
        phone: optText(data.phone) ?? null,
        openingHours: optText(data.opening_hours) ?? null,
        heroImageUrl: normalizeHttpUrl(data.hero_image_url, 'URL foto utama') ?? null,
        serviceArea: optText(data.service_area) ?? null,
        rating: normalizeRating(data.rating) ?? null,
        reviewCount: normalizeReviewCount(data.review_count) ?? null,
        faq: optText(data.faq) ?? null,
        province: optText(data.province) ?? null,
        priceRange: optText(data.price_range) ?? null,
        bookingEnabled: Boolean(data.booking_enabled),
        testimonials: optText(data.testimonials) ?? null,
        // Auto-pick template berdasarkan kategori jika tidak disediakan
        template: data.template || this.categoryToTemplate(category),
        themeColor: normalizeHexColor(data.theme_color) ?? null,
        // Auto-generate meta SEO
        metaTitle: `${name} - ${category} ${city}`,
        metaDescription:
          description || `${name} di ${city}. Hubungi via WhatsApp untuk reservasi dan informasi lebih lanjut.`,
        services: { create: services },
      },
    });

    return toBusinessResponse(biz);
  }

  // Ambil layanan milik bisnis (hanya pemilik)
  async getServices(businessId: string, userId: string): Promise<ServiceResponse[]> {
    await this.checkOwnership(businessId, userId);
    if (!isUuid(businessId)) return [];
    const list = await this.prisma.service.findMany({
      where: { businessId },
      orderBy: { orderIndex: 'asc' },
    });
    return list.map(toServiceResponse);
  }

  // Tambah layanan baru dengan pengecekan kepemilikan
  async createService(businessId: string, userId: string, data: ServiceInput): Promise<ServiceResponse> {
    await this.checkOwnership(businessId, userId);

    const name = data.name?.trim();
    if (!name) {
      throw new BadRequestException('Nama layanan wajib diisi.');
    }

    // default: taruh di urutan paling bawah
    let orderIndex = data.order_index;
    if (orderIndex === undefined) {
      const last = await this.prisma.service.aggregate({
        where: { businessId },
        _max: { orderIndex: true },
      });
      orderIndex = (last._max.orderIndex ?? -1) + 1;
    }

    const svc = await this.prisma.service.create({
      data: {
        businessId,
        name,
        price: toPrice(data.price),
        pricePrefix: optText(data.price_prefix) ?? 'Mulai dari',
        description: optText(data.description) ?? null,
        category: optText(data.category) ?? 'Umum',
        imageUrl: normalizeHttpUrl(data.image_url, 'URL gambar layanan') ?? null,
        isFeatured: Boolean(data.is_featured),
        orderIndex,
      },
    });

    return toServiceResponse(svc);
  }

  // Update layanan yang sudah ada
  async updateService(businessId: string, serviceId: string, userId: string, data: ServiceInput): Promise<ServiceResponse> {
    await this.checkOwnership(businessId, userId);

    const existing = isUuid(serviceId)
      ? await this.prisma.service.findFirst({ where: { id: serviceId, businessId } })
      : null;
    if (!existing) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new BadRequestException('Nama layanan tidak boleh kosong.');
    }

    const svc = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        name: data.name?.trim(),
        price: data.price !== undefined ? toPrice(data.price) : undefined,
        pricePrefix: optText(data.price_prefix),
        description: optText(data.description),
        category: optText(data.category),
        imageUrl: normalizeHttpUrl(data.image_url, 'URL gambar layanan'),
        isFeatured: data.is_featured !== undefined ? Boolean(data.is_featured) : undefined,
        orderIndex: data.order_index,
      },
    });

    return toServiceResponse(svc);
  }

  // Hapus layanan
  async deleteService(businessId: string, serviceId: string, userId: string): Promise<{ success: boolean }> {
    await this.checkOwnership(businessId, userId);

    const res = isUuid(serviceId)
      ? await this.prisma.service.deleteMany({ where: { id: serviceId, businessId } })
      : { count: 0 };

    if (res.count === 0) {
      throw new NotFoundException('Layanan tidak ditemukan untuk dihapus.');
    }

    return { success: true };
  }

  // Update profil bisnis dengan verifikasi kepemilikan (hanya field yang diizinkan)
  async updateProfile(id: string, userId: string, data: UpdateBusinessInput): Promise<BusinessResponse> {
    await this.checkOwnership(id, userId);

    // field wajib tidak boleh dikosongkan
    for (const key of ['name', 'category', 'address', 'city', 'whatsapp'] as const) {
      if (data[key] !== undefined && !String(data[key] ?? '').trim()) {
        throw new BadRequestException(`Field '${key}' tidak boleh kosong.`);
      }
    }

    const biz = await this.prisma.business.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        category: data.category?.trim(),
        address: data.address?.trim(),
        city: data.city?.trim(),
        whatsapp: data.whatsapp !== undefined ? normalizeWhatsapp(data.whatsapp) : undefined,
        tagline: optText(data.tagline),
        description: optText(data.description),
        phone: optText(data.phone),
        openingHours: optText(data.opening_hours),
        googleMapsUrl: normalizeHttpUrl(data.google_maps_url, 'Link Google Maps'),
        instagramUrl: normalizeHttpUrl(data.instagram_url, 'Link Instagram'),
        bookingEnabled: data.booking_enabled !== undefined ? Boolean(data.booking_enabled) : undefined,
        testimonials: optText(data.testimonials),
        metaTitle: optText(data.meta_title),
        metaDescription: optText(data.meta_description),
        logoUrl: normalizeHttpUrl(data.logo_url, 'URL logo'),
        heroImageUrl: normalizeHttpUrl(data.hero_image_url, 'URL foto utama'),
        serviceArea: optText(data.service_area),
        rating: normalizeRating(data.rating),
        reviewCount: normalizeReviewCount(data.review_count),
        faq: optText(data.faq),
        province: optText(data.province),
        priceRange: optText(data.price_range),
        template: data.template?.trim() || undefined,
        themeColor: normalizeHexColor(data.theme_color),
      },
    });

    return toBusinessResponse(biz);
  }

  // Generate Schema.org JSON-LD untuk SEO Google Local
  private buildSchemaOrg(biz: Business, services: Service[]) {
    let schemaType = 'LocalBusiness';
    const cat = (biz.category || '').toLowerCase();
    if (cat.includes('bengkel') || cat.includes('otomotif')) schemaType = 'AutoRepair';
    else if (cat.includes('kopi') || cat.includes('cafe')) schemaType = 'CafeOrCoffeeShop';
    else if (cat.includes('laundry')) schemaType = 'DryCleaningOrLaundry';
    else if (cat.includes('salon') || cat.includes('barber')) schemaType = 'HairSalon';

    return {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: biz.name,
      description: biz.description || biz.tagline,
      image: biz.heroImageUrl || biz.logoUrl || undefined,
      telephone: biz.phone || biz.whatsapp,
      address: {
        '@type': 'PostalAddress',
        streetAddress: biz.address,
        addressLocality: biz.city,
        addressRegion: biz.province || undefined,
        addressCountry: 'ID',
      },
      priceRange: biz.priceRange || undefined,
      openingHours: biz.openingHours || undefined,
      areaServed: biz.serviceArea || undefined,
      // aggregateRating sengaja tidak dipakai: rating diisi sendiri oleh pemilik,
      // bukan hasil verifikasi transaksi, sehingga bisa menyesatkan.
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Layanan ${biz.name}`,
        itemListElement: services.map((s, i) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.name, description: s.description },
          price: s.price || undefined,
          priceCurrency: 'IDR',
          position: i + 1,
        })),
      },
    };
  }
}
