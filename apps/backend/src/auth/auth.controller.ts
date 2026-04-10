import { Controller, Post, Get, Body, UseGuards, Request, Res, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.auth.me(req.user.id);
  }

// Add these 4 routes to the existing AuthController:

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Request() req: any, @Res() res: any) {
    const { access_token, user } = req.user;
    const dest =
      user.role === 'ADMIN'      ? 'admin'             :
      user.role === 'ENTREPRISE' ? 'company/dashboard' :
      'discover';
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-callback?token=${access_token}&role=${user.role}&dest=${dest}`
    );
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinAuth() {}

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  linkedinCallback(@Request() req: any, @Res() res: any) {
    const { access_token, user } = req.user;
    const dest =
      user.role === 'ADMIN'      ? 'admin'             :
      user.role === 'ENTREPRISE' ? 'company/dashboard' :
      'discover';
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-callback?token=${access_token}&role=${user.role}&dest=${dest}`
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/create-candidat')
  createCandidat(@Body() dto: RegisterDto) {
    return this.auth.register({ ...dto, role: 'CANDIDAT' });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/create-entreprise')
  createEntreprise(@Body() dto: RegisterDto) {
    return this.auth.register({ ...dto, role: 'ENTREPRISE' });
  }


  // Admin — send credentials email
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/send-credentials')
  sendCredentials(@Body() body: { email: string; password: string; nom: string; role: 'CANDIDAT' | 'ENTREPRISE' }) {
    return this.auth.sendCredentials(body);
  }

  // Any logged-in user — change own password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.auth.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }
}