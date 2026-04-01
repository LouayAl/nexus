import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { CandidatsService } from './candidats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CANDIDAT)
@Controller('candidats')
export class CandidatsController {
  constructor(private candidats: CandidatsService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.candidats.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.candidats.updateProfile(req.user.id, body);
  }
}