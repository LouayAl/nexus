import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntreprisesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const entreprise = await this.prisma.entreprise.findUnique({
      where:   { utilisateurId: userId },
      include: {
        utilisateur: { select: { email: true } },
        offres: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { candidatures: true } } },
        },
      },
    });
    if (!entreprise) throw new NotFoundException('Entreprise introuvable');
    return entreprise;
  }

  async updateProfile(userId: number, data: any) {
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise) throw new ForbiddenException('Entreprise introuvable');

    return this.prisma.entreprise.update({
      where: { utilisateurId: userId },
      data,
    });
  }

  async findAll() {
    return this.prisma.entreprise.findMany({
      select: {
        id: true, nom: true, secteur: true,
        localisation: true, logoUrl: true,
        _count: { select: { offres: true } },
      },
    });
  }

  async getAllForAdmin() {
    return this.prisma.entreprise.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { email: true, createdAt: true } },
        offres: {
          select: { id: true, titre: true, statut: true, _count: { select: { candidatures: true } } },
        },
        _count: { select: { offres: true } },
      },
    });
  }
}