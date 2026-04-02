import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, UseGuards, Request, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
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

  @Post('competences')
  addCompetence(@Request() req: any, @Body() body: { nom: string; niveau: number }) {
    return this.candidats.addCompetence(req.user.id, body);
  }

  @Delete('competences/:competenceId')
  deleteCompetence(@Request() req: any, @Param('competenceId', ParseIntPipe) competenceId: number) {
    return this.candidats.deleteCompetence(req.user.id, competenceId);
  }

  // ── CV Upload ──────────────────────────────────────────────────────────────
  @Post('cv')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: './uploads/cv',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cv-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['.pdf', '.doc', '.docx'];
      cb(null, allowed.includes(extname(file.originalname).toLowerCase()));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadCv(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const cvUrl = `/uploads/cv/${file.filename}`;
    return this.candidats.updateCvUrl(req.user.id, cvUrl);
  }

  // ── Experiences ────────────────────────────────────────────────────────────
  @Post('experiences')
  addExperience(@Request() req: any, @Body() body: any) {
    return this.candidats.addExperience(req.user.id, body);
  }

  @Patch('experiences/:id')
  updateExperience(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.candidats.updateExperience(req.user.id, id, body);
  }

  @Delete('experiences/:id')
  deleteExperience(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.candidats.deleteExperience(req.user.id, id);
  }

  // ── Formations ─────────────────────────────────────────────────────────────
  @Post('formations')
  addFormation(@Request() req: any, @Body() body: any) {
    return this.candidats.addFormation(req.user.id, body);
  }

  @Patch('formations/:id')
  updateFormation(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.candidats.updateFormation(req.user.id, id, body);
  }

  @Delete('formations/:id')
  deleteFormation(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.candidats.deleteFormation(req.user.id, id);
  }

  // ── Langues ────────────────────────────────────────────────────────────────
  @Post('langues')
  addLangue(@Request() req: any, @Body() body: any) {
    return this.candidats.addLangue(req.user.id, body);
  }

  @Patch('langues/:id')
  updateLangue(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.candidats.updateLangue(req.user.id, id, body);
  }

  @Delete('langues/:id')
  deleteLangue(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.candidats.deleteLangue(req.user.id, id);
  }
}