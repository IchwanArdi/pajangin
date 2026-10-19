import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

interface Rule {
  name: string;
  match: (path: string) => boolean;
  limit: number;
  windowMs: number;
}

// In-memory rate limit untuk endpoint publik. Cukup untuk pilot satu instance;
// kalau nanti deploy multi-instance, ganti dengan Redis/Upstash.
const RULES: Rule[] = [
  {
    name: 'public-events',
    match: (path) => path.endsWith('/public/events'),
    limit: 120,
    windowMs: 60_000,
  },
  {
    name: 'public-leads',
    match: (path) => path.endsWith('/public/leads'),
    limit: 8,
    windowMs: 60_000,
  },
  {
    name: 'public-bookings',
    match: (path) => path.endsWith('/public/bookings'),
    limit: 8,
    windowMs: 60_000,
  },
];

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private lastCleanup = Date.now();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path || request.url || '';
    const rule = RULES.find((item) => item.match(path));
    if (!rule) return true;

    const now = Date.now();
    this.cleanup(now);

    const forwarded = request.headers['x-forwarded-for'];
    const forwardedIp = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : '';
    const ip = forwardedIp || request.ip || request.socket.remoteAddress || 'unknown';
    const key = `${rule.name}:${ip}`;

    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
      return true;
    }

    current.count += 1;
    if (current.count > rule.limit) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      throw new HttpException(
        `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private cleanup(now: number) {
    if (now - this.lastCleanup < 60_000) return;
    this.lastCleanup = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
