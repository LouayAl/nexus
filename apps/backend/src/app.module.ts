import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OffresModule } from './offres/offres.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CandidatsModule } from './candidats/candidats.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { join } from 'path';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}