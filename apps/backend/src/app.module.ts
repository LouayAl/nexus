import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OffresModule } from './offres/offres.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CandidatsModule } from './candidats/candidats.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { MailModule } from './mail/mail.module';
import { GeocodingController } from './geocoding/geocoding.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // 60 seconds
        limit: 100,  // default: 100 requests per 60s per IP, applies app-wide
      },
    ]),
    PrismaModule,
    AuthModule,
    OffresModule,
    CandidaturesModule,
    NotificationsModule,
    CandidatsModule,
    EntreprisesModule,
    MailModule,
  ],
  controllers: [GeocodingController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}