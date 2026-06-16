// backend/src/auth/auth.controller.ts
import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { clearAuthCookie, setAuthCookie } from './auth-cookie.util';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private linkedinStrategy: LinkedInStrategy,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.register({ ...dto, role: Role.CANDIDAT });
    setAuthCookie(res, session.access_token);
    return { user: session.user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.login(dto);
    setAuthCookie(res, session.access_token);
    return { user: session.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookie(res);
    return { message: 'Deconnexion reussie' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.auth.me(req.user.id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    setAuthCookie(res, req.user.access_token);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/oauth-callback`);
  }

  @Get('linkedin')
  async linkedinLogin(@Res() res: Response) {
    const url = await this.linkedinStrategy.getAuthUrl();
    return res.redirect(url);
  }

  @Get('linkedin/callback')
  async linkedinCallback(@Query('code') code: string | undefined, @Res({ passthrough: true }) res: Response) {
    if (!code) {
      throw new BadRequestException('Missing LinkedIn authorization code');
    }

    const session = await this.linkedinStrategy.handleCallback(code);
    setAuthCookie(res, session.access_token);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/oauth-callback`);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/create-candidat')
  async createCandidat(@Body() dto: RegisterDto) {
    const session = await this.auth.register({ ...dto, role: 'CANDIDAT' });
    return { user: session.user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/create-entreprise')
  async createEntreprise(@Body() dto: RegisterDto) {
    const session = await this.auth.register({ ...dto, role: 'ENTREPRISE' });
    return { user: session.user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/send-credentials')
  sendCredentials(@Body() body: { email: string; password: string; nom: string; role: 'CANDIDAT' | 'ENTREPRISE' }) {
    return this.auth.sendCredentials(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.auth.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }
}
