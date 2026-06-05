// src/candidats/dto/admin-candidats-query.dto.ts

import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class AdminCandidatsQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsOptional()
  @IsString()
  competence?: string;

  @IsOptional()
  @IsString()
  qualifie?: string;
}