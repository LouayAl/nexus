import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { StatutCandidature } from '@prisma/client';

export class CreateCandidatureDto {
  @IsInt()
  offreId!: number;

  @IsString()
  @IsOptional()
  lettre?: string;
}

export class UpdateCandidatureDto {
  @IsEnum(StatutCandidature)
  statut!: StatutCandidature;
}