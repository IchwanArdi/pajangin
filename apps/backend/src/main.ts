import { config as loadEnv } from 'dotenv';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Di serverless Vercel, env vars sudah disediakan di process.env.
// dotenv hanya dimuat saat local development agar tidak crash jika file .env tidak ada.
if (process.env.NODE_ENV !== 'production') {
  try {
    const envDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd();
    loadEnv({ path: path.resolve(envDir, '../.env') });
    loadEnv();
  } catch {
    // Abaikan jika dotenv gagal di environment serverless
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Auth memakai header Bearer (bukan cookie), jadi credentials tidak diperlukan
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Pajangin Backend API running on http://localhost:${port}`);
}

await bootstrap();
