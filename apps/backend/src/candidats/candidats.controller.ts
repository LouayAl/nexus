import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request, ParseIntPipe,
  UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readFile, unlink } from 'fs/promises';
import * as FileType from 'file-type';
import { CandidatsService } from './candidats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

import { Query } from '@nestjs/common';
import { AdminCandidatsQueryDto } from './dto/admin-candidats-query.dto';

const CV_MIME_WHITELIST = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const IMAGE_MIME_WHITELIST = ['image/jpeg', 'image/png', 'image/webp'];

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
  deleteCompetence(
    @Request() req: any,
    @Param('competenceId', ParseIntPipe) competenceId: number,
  ) {
    return this.candidats.deleteCompetence(req.user.id, competenceId);
  }

  @Get('competences/all')
  getAllCompetences() {
    return this.candidats.getAllCompetences();
  }

  // ── CV Upload ──────────────────────────────────────────────────────────────
  @Post('cv')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', '..', 'uploads', 'cv'),
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cv-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['.pdf', '.doc', '.docx'];
      if (!allowed.includes(extname(file.originalname).toLowerCase())) {
        return cb(new BadRequestException('Type de fichier non autorisé'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadCv(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    // Verify actual file content matches an allowed type (magic-byte check)
    const buffer = await readFile(file.path);
    const detected = await FileType.fromBuffer(buffer);
    if (!detected || !CV_MIME_WHITELIST.includes(detected.mime)) {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Le contenu du fichier ne correspond pas à un CV valide');
    }

    const cvUrl = `/uploads/cv/${file.filename}`;
    return this.candidats.updateCvUrl(req.user.id, cvUrl);
  }

  // ── Avatar Upload ──────────────────────────────────────────────────────────
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(__dirname, '..', '..', '..', 'uploads', 'avatars');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException(`Type de fichier invalide: ${file.mimetype}`), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const buffer = await readFile(file.path);
    const detected = await FileType.fromBuffer(buffer);
    if (!detected || !IMAGE_MIME_WHITELIST.includes(detected.mime)) {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Le contenu du fichier ne correspond pas à une image valide');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.candidats.updateAvatarUrl(req.user.id, avatarUrl);
  }

  // ── Experiences / Formations / Langues / Remuneration unchanged ────────────
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

  @Patch('remuneration')
  updateRemuneration(@Request() req: any, @Body() body: any) {
    return this.candidats.updateRemuneration(req.user.id, body);
  }
}

// ── Admin routes (role: ADMIN) ────────────────────────────────────────────────
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('candidats/admin')
export class CandidatsAdminController {
  constructor(private candidats: CandidatsService) {}

  @Get('all')
  getAllCandidats(@Query() query: any) {
    return this.candidats.getAllCandidats(query);
  }

  @Get(':id')
  getCandidatById(@Param('id', ParseIntPipe) id: number) {
    return this.candidats.getCandidatByIdForAdmin(id);
  }

  @Get('competences/all')
  getAllCompetences() {
    return this.candidats.getAllCompetences();
  }

  @Post('competences')
  upsertCompetence(@Body('nom') nom: string) {
    return this.candidats.upsertCompetence(nom);
  }

  @Patch(':id/note')
  upsertNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { qualifie?: boolean; accompagnement?: boolean | null; compteRendu?: string; pieceJointeUrl?: string },
  ) {
    return this.candidats.upsertAdminNote(id, body);
  }

  // ── Note attachment upload — now with type whitelist + magic-byte check ───
  @Post(':id/note/piece-jointe')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(__dirname, '..', '..', '..', 'uploads', 'notes');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `note-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      if (!allowed.includes(extname(file.originalname).toLowerCase())) {
        return cb(new BadRequestException('Type de fichier non autorisé'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadNoteFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const buffer = await readFile(file.path);
    const detected = await FileType.fromBuffer(buffer);
    const allowedMimes = [...CV_MIME_WHITELIST, ...IMAGE_MIME_WHITELIST];
    if (!detected || !allowedMimes.includes(detected.mime)) {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Le contenu du fichier ne correspond pas à un type autorisé');
    }

    const pieceJointeUrl = `/uploads/notes/${file.filename}`;
    return this.candidats.upsertAdminNote(id, { pieceJointeUrl });
  }
}