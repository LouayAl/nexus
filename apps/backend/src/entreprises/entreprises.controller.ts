import { Controller, Get, Patch, Post, Body, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readFile, unlink } from 'fs/promises';
import * as FileType from 'file-type';
import { EntreprisesService } from './entreprises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

const IMAGE_MIME_WHITELIST = ['image/jpeg', 'image/png', 'image/webp'];

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

  // ── Logo Upload ────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRISE)
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(__dirname, '..', '..', '..', 'uploads', 'logos');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `logo-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Image requise'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    const buffer = await readFile(file.path);
    const detected = await FileType.fromBuffer(buffer);
    if (!detected || !IMAGE_MIME_WHITELIST.includes(detected.mime)) {
      await unlink(file.path).catch(() => {});
      throw new BadRequestException('Format d\'image non valide');
    }

    const logoUrl = `/uploads/logos/${file.filename}`;
    return this.entreprises.updateLogoUrl(req.user.id, logoUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAllForAdmin() {
    return this.entreprises.getAllForAdmin();
  }
}