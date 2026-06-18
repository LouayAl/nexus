// src/offres/offres.service.ts
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

  async findAllByFilter(filters: FilterOffreDto) {
    const page  = Number(filters.page)  || 1;
    const limit = Number(filters.limit) || 10;
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (filters.statut) {
      where.statut = filters.statut;
    } else {
      where.statut = 'OUVERTE';
    }

    if (filters.keyword) {
      where.OR = [
        { titre: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { competences: { some: { competence: { nom: { contains: filters.keyword, mode: 'insensitive' } } } } },
      ];
    }
    if (filters.localisation)       where.localisation      = { contains: filters.localisation, mode: 'insensitive' };
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

  const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new ForbiddenException('Utilisateur introuvable');

  if (user.role !== 'ADMIN') {
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise || offre.entrepriseId !== entreprise.id) {
      throw new ForbiddenException('Non autorisé');
    }
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

  async updateStatut(
    id: number,
    userId: number,
    statut: 'OUVERTE' | 'EN_ATTENTE' | 'FERMEE',
  ) {
    const offre = await this.findOne(id);

    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Utilisateur introuvable');

    const isOwner = async () => {
      const entreprise = await this.prisma.entreprise.findUnique({
        where: { utilisateurId: userId },
      });
      if (!entreprise || offre.entrepriseId !== entreprise.id) {
        throw new ForbiddenException('Non autorisé à modifier cette offre');
      }
    };

    if (user.role !== 'ADMIN') await isOwner();

    // ── When opening: notify the entreprise owner ──
    if (statut === 'OUVERTE' && offre.statut === 'EN_ATTENTE') {
      const entrepriseOwner = await this.prisma.utilisateur.findFirst({
        where: { entreprise: { id: offre.entrepriseId } },
      });
      if (entrepriseOwner) {
        await this.prisma.notification.create({
          data: {
            utilisateurId: entrepriseOwner.id,
            titre:         'Offre approuvée',
            message:       `Votre offre "${offre.titre}" a été approuvée et est maintenant visible par les candidats.`,
            metadata:      { type: 'offre', offreId: offre.id },
          },
        });
      }
    }

    // ── When closing: refuse all pending candidatures + notify candidates ──
    if (statut === 'FERMEE') {
      const affectedCandidatures = await this.prisma.candidature.findMany({
        where: {
          offreId: id,
          statut: { notIn: ['ACCEPTE', 'REFUSE'] },
        },
        include: {
          candidat: {
            include: { utilisateur: { select: { id: true } } },
          },
        },
      });

      if (affectedCandidatures.length > 0) {
        await this.prisma.candidature.updateMany({
          where: {
            offreId: id,
            statut: { notIn: ['ACCEPTE', 'REFUSE'] },
          },
          data: { statut: 'REFUSE' },
        });

        await this.prisma.notification.createMany({
          data: affectedCandidatures.map((c) => ({
            utilisateurId: c.candidat.utilisateur.id,
            titre:         'Offre clôturée',
            message:       `L'offre "${offre.titre}" a été clôturée. Votre candidature a été automatiquement refusée.`,
            // metadata with createMany requires Prisma 5+; use individual creates if on Prisma 4
            metadata:      { type: 'offre', offreId: offre.id },
          })),
        });
      }
    }

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

  async getAllPending() {
    return this.prisma.offre.findMany({
      where:   { statut: 'EN_ATTENTE' },
      orderBy: { createdAt: 'desc' },
      include: this.includeFields(),
    });
  }

  async createForEntreprise(data: any) {
    const { entrepriseId, competences, ...rest } = data;
    return this.prisma.offre.create({
      data: {
        ...rest,
        statut: 'EN_ATTENTE',
        entrepriseId,
        ...(competences?.length && {
          competences: {
            create: await this.resolveCompetences(competences),
          },
        }),
      },
      include: this.includeFields(),
    });
  }

  async findByEntrepriseId(entrepriseId: number) {
    return this.prisma.offre.findMany({
      where: { entrepriseId },
      orderBy: { createdAt: 'desc' },
      include: this.includeFields(),
    });
  }

  async adminRemove(id: number) {
    await this.prisma.offre.delete({ where: { id } });
    return { message: 'Offre supprimée' };
  }
}