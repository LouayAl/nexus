import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { EntreprisesService } from './entreprises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('entreprises')
export class EntreprisesController {
  constructor(private entreprises: EntreprisesService) {}

  @Get()
  findAll() {
    return this.entreprises.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.entreprises.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.entreprises.updateProfile(req.user.id, body);
  }
}