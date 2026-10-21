import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeWhatsapp } from '../common/whatsapp.js';
import { isAdminEmail } from './admin.js';
import {
  deleteBusinessStorageObjects,
  deleteSupabaseAuthUser,
  storagePathFromUrl,
} from './account-deletion.js';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  is_admin: boolean;
}

export interface UpdateAccountInput {
  name?: unknown;
  whatsapp?: unknown;
}

export interface DeleteAccountInput {
  confirmation?: unknown;
}

export interface AccountDeletionImpact {
  businesses: Array<{ id: string; name: string; slug: string }>;
  totals: {
    businesses: number;
    services: number;
    images: number;
    leads: number;
    bookings: number;
    feedback: number;
  };
}

const PROFILE_SELECT = { id: true, name: true, email: true, whatsapp: true } as const;

interface SupabaseClaims extends JWTPayload {
  email?: string;
  role?: string;
  user_metadata?: { full_name?: string; name?: string };
}

// Autentikasi ditangani Supabase Auth (daftar, login, verifikasi email, reset password, OAuth Google).
// Backend hanya memverifikasi access token (JWT ES256) lewat JWKS publik Supabase,
// lalu memastikan profil user ada di tabel `users`.
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private issuer?: string;

  constructor(private readonly prisma: PrismaService) {}

  private getVerifier() {
    if (!this.jwks) {
      const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL belum di-set di apps/backend/.env');
      }
      this.issuer = `${supabaseUrl}/auth/v1`;
      this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
    }
    return { jwks: this.jwks, issuer: this.issuer! };
  }

  // Verifikasi access token Supabase → profil user (dibuat otomatis saat pertama kali login)
  async validateToken(token: string): Promise<UserSession | null> {
    if (!token) return null;

    let claims: SupabaseClaims;
    try {
      const { jwks, issuer } = this.getVerifier();
      const { payload } = await jwtVerify<SupabaseClaims>(token, jwks, {
        issuer,
        audience: 'authenticated',
      });
      claims = payload;
    } catch (err) {
      if (err instanceof Error && err.message.includes('SUPABASE_URL')) throw err;
      return null; // token tidak valid / kedaluwarsa / bukan dari project ini
    }

    if (!claims.sub || !claims.email || claims.role !== 'authenticated') return null;

    return this.ensureProfile(claims.sub, claims.email, claims.user_metadata);
  }

  private async ensureProfile(
    id: string,
    email: string,
    meta: SupabaseClaims['user_metadata'],
  ): Promise<UserSession> {
    const select = PROFILE_SELECT;
    const cleanEmail = email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { id }, select });
    if (existing) {
      // sinkronkan email kalau user menggantinya di Supabase Auth
      if (existing.email !== cleanEmail) {
        const updated = await this.prisma.user.update({
          where: { id },
          data: { email: cleanEmail },
          select,
        });
        return { ...updated, is_admin: isAdminEmail(updated.email) };
      }
      return { ...existing, is_admin: isAdminEmail(existing.email) };
    }

    const name = (meta?.full_name || meta?.name || cleanEmail.split('@')[0]).trim().slice(0, 120);
    const created = await this.prisma.user.upsert({
      where: { id },
      create: { id, email: cleanEmail, name },
      update: {},
      select,
    });
    this.logger.log(`Profil user baru: ${cleanEmail} (${id})`);
    return { ...created, is_admin: isAdminEmail(created.email) };
  }

  // Update data pemilik akun. Email tidak diubah di sini karena perubahan email
  // harus lewat konfirmasi Supabase Auth agar tidak mengunci user dari akunnya.
  async updateProfile(userId: string, data: UpdateAccountInput): Promise<UserSession> {
    const name = String(data.name ?? '').trim();
    if (!name) throw new BadRequestException('Nama wajib diisi.');
    if (name.length > 120) throw new BadRequestException('Nama maksimal 120 karakter.');

    let whatsapp: string | null | undefined;
    if (data.whatsapp !== undefined) {
      const raw = String(data.whatsapp ?? '').trim();
      whatsapp = raw ? normalizeWhatsapp(raw) : null;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { name, ...(whatsapp !== undefined ? { whatsapp } : {}) },
      select: PROFILE_SELECT,
    });

    return { ...updated, is_admin: isAdminEmail(updated.email) };
  }

  // Ringkasan dampak sebelum user mengetik konfirmasi hapus akun. Angka ini
  // membantu mencegah penghapusan tidak sengaja dan tidak menampilkan data sensitif.
  async getDeletionImpact(userId: string): Promise<AccountDeletionImpact> {
    const [businesses, feedback] = await Promise.all([
      this.prisma.business.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { services: true, images: true, leads: true, bookings: true } },
        },
      }),
      this.prisma.feedback.count({ where: { userId } }),
    ]);

    const totals: AccountDeletionImpact['totals'] = {
      businesses: businesses.length,
      services: 0,
      images: 0,
      leads: 0,
      bookings: 0,
      feedback,
    };

    for (const business of businesses) {
      totals.services += business._count.services;
      totals.images += business._count.images;
      totals.leads += business._count.leads;
      totals.bookings += business._count.bookings;
    }

    return {
      businesses: businesses.map(({ id, name, slug }) => ({ id, name, slug })),
      totals,
    };
  }

  // Hapus akun secara permanen. Auth user dicabut lebih dulu supaya kalau
  // pembersihan database gagal, ensureProfile tidak membuat profil kosong lagi.
  async deleteAccount(user: UserSession, data: DeleteAccountInput): Promise<{ success: true }> {
    const confirmation = String(data.confirmation ?? '').trim().toUpperCase();
    if (confirmation !== 'HAPUS') {
      throw new BadRequestException('Ketik HAPUS untuk mengonfirmasi penghapusan akun.');
    }
    if (isAdminEmail(user.email)) {
      throw new ForbiddenException('Akun admin tidak dapat dihapus dari dashboard.');
    }

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !serviceRole) {
      throw new ServiceUnavailableException(
        'Fitur hapus akun belum dikonfigurasi. Hubungi tim Pajangin.',
      );
    }

    const businesses = await this.prisma.business.findMany({
      where: { userId: user.id },
      select: {
        heroImageUrl: true,
        logoUrl: true,
        images: { select: { url: true } },
        services: { select: { imageUrl: true } },
      },
    });

    const storagePaths = Array.from(
      new Set(
        businesses
          .flatMap((business) => [
            storagePathFromUrl(business.heroImageUrl),
            storagePathFromUrl(business.logoUrl),
            ...business.images.map((image) => storagePathFromUrl(image.url)),
            ...business.services.map((service) => storagePathFromUrl(service.imageUrl)),
          ])
          .filter((path): path is string => Boolean(path)),
      ),
    );

    await deleteSupabaseAuthUser(supabaseUrl, serviceRole, user.id);

    try {
      await this.prisma.$transaction([
        // Arsip masukan produk tetap disimpan untuk perbaikan layanan, tetapi
        // identitas pemilik dan bisnisnya dilepas agar tidak menjadi data pribadi yatim.
        this.prisma.feedback.updateMany({
          where: { userId: user.id },
          data: {
            userId: null,
            userName: null,
            userEmail: null,
            userWhatsapp: null,
            businessId: null,
            businessName: null,
          },
        }),
        this.prisma.user.delete({ where: { id: user.id } }),
      ]);
    } catch (err) {
      this.logger.error(
        `Auth user ${user.id} sudah dihapus, tetapi data database gagal dibersihkan.`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'Akun sudah tidak bisa diakses, tetapi pembersihan data gagal. Hubungi tim Pajangin.',
      );
    }

    try {
      await deleteBusinessStorageObjects(supabaseUrl, serviceRole, storagePaths);
    } catch (err) {
      // Akun sudah terhapus; file yatim dicatat untuk pembersihan manual.
      this.logger.warn(
        `File storage akun ${user.id} gagal dibersihkan: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    return { success: true };
  }

  // dipakai guard: lempar 401 kalau token tidak valid
  async requireUser(authHeader: string | undefined): Promise<UserSession> {
    const token = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Silakan masuk terlebih dahulu.');
    }
    const user = await this.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Sesi Anda telah berakhir. Silakan masuk kembali.');
    }
    return user;
  }
}
