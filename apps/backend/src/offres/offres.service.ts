import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOffreDto, UpdateOffreDto, FilterOffreDto } from './dto/offre.dto';

@Injectable()
export class OffresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOffreDto) {
    const entreprise = await this.prisma.entreprise.findUnique({
      where: { utilisateurId: userId },
    });
    if (!entreprise) throw new ForbiddenException('Entreprise introuvable');

    const { competences, ...data } = dto;

    return this.prisma.offre.create({
      data: {
        ...data,
        entrepriseId: entreprise.id,
        statut: 'EN_ATTENTE',
        ...(competences && {
          competences: {
            create: await this.resolveCompetences(competences),
          },
        }),
      },
      include: this.includeFields(),
    });
  }

  async findAll(filters: FilterOffreDto) {
    const page  = Number(filters.page)  || 1;
    const limit = Number(filters.limit) || 10;
    const skip  = (page - 1) * limit;

    const where: any = { statut: 'OUVERTE' };

    if (filters.keyword) {
      where.OR = [
        { titre:       { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { competences: { some: { competence: { nom: { contains: filters.keyword, mode: 'insensitive' } } } } },
      ];
    }
    if (filters.localisation)       where.localisation      = { contains: filters.localisation,      mode: 'insensitive' };
    if (filters.type_contrat)       where.type_contrat      = filters.type_contrat;
    if (filters.niveau_experience)  where.niveau_experience = filters.niveau_experience;

    const [offres, total] = await Promise.all([
      this.prisma.offre.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: this.includeFields() }),
      this.prisma.offre.count({ where }),
    ]);

    return { data: offres, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const offre = await this.prisma.offre.findUnique({
      where: { id },
      include: this.includeFields(),
    });
    if (!offre) throw new NotFoundException('Offre introuvable');
    return offre;
  }

  async update(id: number, userId: number, dto: UpdateOffreDto) {
    const offre = await this.findOne(id);
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });

    if (!entreprise || offre.entrepriseId !== entreprise.id) {
      throw new ForbiddenException('Non autorisé');
    }

    const { competences, ...data } = dto;

    if (competences) {
      await this.prisma.competenceOffre.deleteMany({ where: { offreId: id } });
    }

    return this.prisma.offre.update({
      where: { id },
      data: {
        ...data,
        ...(competences && {
          competences: {
            create: await this.resolveCompetences(competences),
          },
        }),
      },
      include: this.includeFields(),
    });
  }

  async remove(id: number, userId: number) {
    const offre = await this.findOne(id);
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });

    if (!entreprise || offre.entrepriseId !== entreprise.id) {
      throw new ForbiddenException('Non autorisé');
    }

    await this.prisma.offre.delete({ where: { id } });
    return { message: 'Offre supprimée' };
  }

  // Admin only — approve or reject
  async updateStatut(id: number, statut: 'OUVERTE' | 'FERMEE') {
    await this.findOne(id);
    return this.prisma.offre.update({
      where: { id },
      data: { statut },
      include: this.includeFields(),
    });
  }

  async findByEntreprise(userId: number) {
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise) throw new ForbiddenException('Entreprise introuvable');

    return this.prisma.offre.findMany({
      where: { entrepriseId: entreprise.id },
      orderBy: { createdAt: 'desc' },
      include: this.includeFields(),
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private async resolveCompetences(noms: string[]) {
    return Promise.all(
      noms.map(async (nom) => {
        const comp = await this.prisma.competence.upsert({
          where: { nom },
          update: {},
          create: { nom },
        });
        return { competenceId: comp.id };
      }),
    );
  }

  private includeFields() {
    return {
      entreprise:  { select: { id: true, nom: true, logoUrl: true, localisation: true } },
      competences: { include: { competence: true } },
      _count:      { select: { candidatures: true } },
    };
  }
}