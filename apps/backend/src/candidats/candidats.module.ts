// src/candidats/candidats.module.ts
import { Module } from '@nestjs/common';
import { CandidatsService } from './candidats.service';
import { CandidatsController } from './candidats.controller';

@Module({
  controllers: [CandidatsController],
  providers:   [CandidatsService],
})
export class CandidatsModule {}