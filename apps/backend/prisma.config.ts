import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// CLI (migrate, studio) pakai koneksi session/direct; runtime app pakai pooler lewat PrismaService.
// Fallback connection string mencegah error 'Cannot resolve environment variable: DIRECT_URL' saat prisma generate di server CI.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
});
