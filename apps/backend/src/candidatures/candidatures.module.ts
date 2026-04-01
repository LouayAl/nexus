import { Module } from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { CandidaturesController } from './candidatures.controller';

@Module({
  controllers: [CandidaturesController],
  providers:   [CandidaturesService],
})
export class CandidaturesModule {}