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
  @Roles(Role.ENTREPRISE)
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
  @Roles(Role.ADMIN)
  @Patch(':id/statut')
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: 'OUVERTE' | 'FERMEE',
  ) {
    return this.offres.updateStatut(id, statut);
  }
}