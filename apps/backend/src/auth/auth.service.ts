import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { PrismaService } from '../prisma/prisma.service.js';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
}

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
    const select = { id: true, name: true, email: true, whatsapp: true } as const;
    const cleanEmail = email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { id }, select });
    if (existing) {
      // sinkronkan email kalau user menggantinya di Supabase Auth
      if (existing.email !== cleanEmail) {
        return this.prisma.user.update({ where: { id }, data: { email: cleanEmail }, select });
      }
      return existing;
    }

    const name = (meta?.full_name || meta?.name || cleanEmail.split('@')[0]).trim().slice(0, 120);
    const created = await this.prisma.user.upsert({
      where: { id },
      create: { id, email: cleanEmail, name },
      update: {},
      select,
    });
    this.logger.log(`Profil user baru: ${cleanEmail} (${id})`);
    return created;
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
