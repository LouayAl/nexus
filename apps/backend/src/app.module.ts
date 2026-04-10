// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OffresModule } from './offres/offres.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CandidatsModule } from './candidats/candidats.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OffresModule,
    CandidaturesModule,
    NotificationsModule,
    CandidatsModule,
    EntreprisesModule,
    MailModule,
  ],
})
export class AppModule {}