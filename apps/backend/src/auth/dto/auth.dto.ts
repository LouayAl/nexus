import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  nomEntreprise?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}