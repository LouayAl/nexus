// src/candidats/candidats.module.ts
import { Module } from '@nestjs/common';
import { CandidatsController, CandidatsAdminController } from './candidats.controller';
import { CandidatsService } from './candidats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports:     [PrismaModule],
  controllers: [CandidatsController, CandidatsAdminController],
  providers:   [CandidatsService],
  exports:     [CandidatsService],
})
export class CandidatsModule {}