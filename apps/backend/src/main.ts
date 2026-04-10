// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // __dirname = dist/src at runtime → go up twice to reach apps/backend/
  const uploadsPath = join(__dirname, '..', '..', 'uploads');
  console.log('uploads path:', uploadsPath);
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Nexus API running on http://localhost:3001`);
}
bootstrap();