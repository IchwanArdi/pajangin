import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Koneksi ke Supabase Postgres lewat transaction pooler (DATABASE_URL, port 6543)
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL belum di-set. Salin apps/backend/.env.example ke apps/backend/.env.');
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit() {
    // Jangan blokir cold start terlalu lama. Di serverless, koneksi database bisa
    // lambat/tidak tersedia sementara; Prisma tetap akan mencoba lagi saat query.
    try {
      await Promise.race([
        this.$connect(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Koneksi database timeout setelah 5 detik')),
            5000,
          ),
        ),
      ]);
      this.logger.log('Terhubung ke database Postgres (Supabase).');
    } catch (error) {
      this.logger.error(
        'Gagal terhubung ke database saat startup; API tetap dijalankan.',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
