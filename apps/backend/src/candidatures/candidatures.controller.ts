// src/candidatures/candidatures.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto, UpdateCandidatureDto } from './dto/candidature.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('candidatures')
export class CandidaturesController {
  constructor(private candidatures: CandidaturesService) {}

  // Candidat — apply
  @Roles(Role.CANDIDAT)
  @UseGuards(RolesGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateCandidatureDto) {
    return this.candidatures.create(req.user.id, dto);
  }

  // Candidat — my applications
  @Roles(Role.CANDIDAT)
  @UseGuards(RolesGuard)
  @Get('mes-candidatures')
  myCandidatures(@Request() req: any) {
    return this.candidatures.findMyCandidatures(req.user.id);
  }

  // Candidat — withdraw
  @Roles(Role.CANDIDAT)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.candidatures.remove(id, req.user.id);
  }

  // Entreprise — all applications for their offers
  @Roles(Role.ENTREPRISE)
  @UseGuards(RolesGuard)
  @Get('entreprise')
  byEntreprise(@Request() req: any) {
    return this.candidatures.findByEntreprise(req.user.id);
  }

  // Entreprise — applications for a specific offer
  @Roles(Role.ENTREPRISE)
  @UseGuards(RolesGuard)
  @Get('offre/:offreId')
  byOffre(@Param('offreId', ParseIntPipe) offreId: number, @Request() req: any) {
    return this.candidatures.findByOffre(offreId, req.user.id);
  }

  // Entreprise — update status
  @Roles(Role.ENTREPRISE, Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id/statut')
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdateCandidatureDto,
  ) {
    return this.candidatures.updateStatut(id, req.user.id, dto);
  }

  // Entreprise / Admin — get one candidature
  @Roles(Role.ENTREPRISE, Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.candidatures.getOneById(id, req.user.id);
  }
}