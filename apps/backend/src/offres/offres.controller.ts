// src/offres/offres.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { OffresService } from './offres.service';
import { CreateOffreDto, UpdateOffreDto, FilterOffreDto } from './dto/offre.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('offres')
export class OffresController {
  constructor(private offres: OffresService) {}

  // Public — browse all open offers
  @Get()
  findAll(@Query() filters: FilterOffreDto) {
    return this.offres.findAll(filters);
  }

  // Public — get one offer
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offres.findOne(id);
  }

  // Entreprise — create offer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Post()
  create(@Request() req: any, @Body() dto: CreateOffreDto) {
    return this.offres.create(req.user.id, dto);
  }

  // Entreprise — update own offer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdateOffreDto,
  ) {
    return this.offres.update(id, req.user.id, dto);
  }

  // Entreprise — delete own offer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.offres.remove(id, req.user.id);
  }

  // Entreprise — get own offers
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Get('mes-offres/list')
  mesOffres(@Request() req: any) {
    return this.offres.findByEntreprise(req.user.id);
  }

  // Admin — approve / reject offer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE, Role.ADMIN)
  @Patch(':id/statut')
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body('statut') statut: 'OUVERTE' | 'EN_ATTENTE' | 'FERMEE',
  ) {
    // If admin, allow any offer
    // If entreprise, only their own offers
    return this.offres.updateStatut(id, req.user.id, statut);
  }

  // Admin — get ALL pending offers with entreprise info
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/pending')
  getAllPending() {
    return this.offres.getAllPending();
  }

  // Admin — create offer for a specific entreprise
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/create')
  createForEntreprise(
    @Body() body: { entrepriseId: number } & CreateOffreDto,
  ) {
    return this.offres.createForEntreprise(body);
  }

  // Admin — get all offers for a specific entreprise
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/entreprise/:entrepriseId')
  getOffresByEntreprise(@Param('entrepriseId', ParseIntPipe) entrepriseId: number) {
    return this.offres.findByEntrepriseId(entrepriseId);
  }

  // Admin — delete any offer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  adminRemove(@Param('id', ParseIntPipe) id: number) {
    return this.offres.adminRemove(id);
  }

}