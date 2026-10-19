import { config as loadEnv } from 'dotenv';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// .env selalu dibaca dari apps/backend/.env, baik dijalankan dari root maupun dari folder backend
loadEnv({ path: path.resolve(import.meta.dirname, '../.env') });

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
