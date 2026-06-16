// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET') || 'nexus_secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers:   [AuthService, JwtStrategy, JwtAuthGuard, GoogleStrategy, LinkedInStrategy],
  controllers: [AuthController],
  exports:     [JwtAuthGuard, JwtModule],
})
export class AuthModule {}