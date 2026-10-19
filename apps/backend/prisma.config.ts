import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// CLI (migrate, studio) pakai koneksi session/direct; runtime app pakai pooler lewat PrismaService
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
