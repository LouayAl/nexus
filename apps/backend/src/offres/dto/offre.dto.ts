// src/offres/dto/offre.dto.ts
import {
  IsString, IsOptional, IsInt, IsEnum,
  IsBoolean, IsArray, Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StatutOffre } from '@prisma/client';

export class CreateOffreDto {
  @IsString()
  titre!: string;

  @IsString()
  description!: string;

  /** NEW — profile the recruiter is looking for */
  @IsString()
  @IsOptional()
  profil_recherche?: string;

  /** NEW — required languages e.g. ["Français", "Anglais"] */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  langues?: string[];

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

  /** NEW — false = salary hidden from candidates */
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  salaire_visible?: boolean;

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
  profil_recherche?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  langues?: string[];

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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  salaire_visible?: boolean;

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