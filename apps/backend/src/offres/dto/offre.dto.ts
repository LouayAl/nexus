// src/offres/dto/offre.dto.ts
import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutOffre } from '@prisma/client';

export class CreateOffreDto {
  @IsString()
  titre!: string;

  @IsString()
  description!: string;

  @IsString()
  type_contrat!: string;

  @IsString()
  @IsOptional()
  niveau_experience?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  salaire_min?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  salaire_max?: number;

  @IsOptional()
  competences?: string[];
}

export class UpdateOffreDto {
  @IsString()
  @IsOptional()
  titre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type_contrat?: string;

  @IsString()
  @IsOptional()
  niveau_experience?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  salaire_min?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  salaire_max?: number;

  @IsEnum(StatutOffre)
  @IsOptional()
  statut?: StatutOffre;

  @IsOptional()
  competences?: string[];
}

export class FilterOffreDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsString()
  @IsOptional()
  type_contrat?: string;

  @IsEnum(StatutOffre)
  @IsOptional()
  statut?: StatutOffre;

  @IsString()
  @IsOptional()
  niveau_experience?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;


}