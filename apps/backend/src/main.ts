import { config as loadEnv } from 'dotenv';
import * as path from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
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

let appPromise: Promise<INestApplication> | undefined;

async function createApp(): Promise<INestApplication> {
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

  await app.init();
  return app;
}

function getApp(): Promise<INestApplication> {
  appPromise ??= createApp();
  return appPromise;
}

async function bootstrap() {
  const app = await getApp();
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Pajangin Backend API running on http://localhost:${port}`);
}

// Vercel Functions memanggil default export handler. Di luar Vercel (dev lokal),
// jalankan server HTTP biasa lewat app.listen().
if (!process.env.VERCEL) {
  await bootstrap();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const app = await getApp();
  app.getHttpAdapter().getInstance()(req, res);
}
