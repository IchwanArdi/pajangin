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
    await this.$connect();
    this.logger.log('Terhubung ke database Postgres (Supabase).');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
