// src/candidats/candidats.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCandidatsQueryDto } from './dto/admin-candidats-query.dto';

@Injectable()
export class CandidatsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const candidat = await this.prisma.candidat.findUnique({
      where:   { utilisateurId: userId },
      include: {
        competences: { include: { competence: true } },
        experiences: { orderBy: { createdAt: 'desc' } },
        formations:  { orderBy: { createdAt: 'desc' } },
        langues:     { orderBy: { createdAt: 'desc' } },
        utilisateur: { select: { email: true, createdAt: true } },
      },
    });
    if (!candidat) throw new NotFoundException('Profil introuvable');
    return candidat;
  }

  async updateProfile(userId: number, data: any) {
    const candidat = await this.prisma.candidat.findUnique({ where: { utilisateurId: userId } });
    if (!candidat) throw new ForbiddenException('Profil introuvable');
    const { competences, ...rest } = data;
    if (competences) {
      await this.prisma.competenceCandidat.deleteMany({ where: { candidatId: candidat.id } });
    }
    return this.prisma.candidat.update({
      where: { utilisateurId: userId },
      data: {
        ...rest,
        ...(competences && {
          competences: {
            create: await Promise.all(
              competences.map(async ({ nom, niveau }: { nom: string; niveau: number }) => {
                const comp = await this.prisma.competence.upsert({
                  where: { nom }, update: {}, create: { nom },
                });
                return { competenceId: comp.id, niveau };
              }),
            ),
          },
        }),
      },
      include: {
        competences: { include: { competence: true }, take: 5 },
        experiences: true,
        formations:  true,
        langues:     true,
        utilisateur: { select: { email: true } },
      },
    });
  }

  async addCompetence(userId: number, data: { nom: string; niveau: number }) {
    const candidat = await this.getCandidatOrFail(userId);
    const comp = await this.prisma.competence.upsert({
      where: { nom: data.nom }, update: {}, create: { nom: data.nom },
    });
    const existing = await this.prisma.competenceCandidat.findUnique({
      where: { candidatId_competenceId: { candidatId: candidat.id, competenceId: comp.id } },
    });
    if (existing) {
      return this.prisma.competenceCandidat.update({
        where: { candidatId_competenceId: { candidatId: candidat.id, competenceId: comp.id } },
        data:  { niveau: data.niveau },
        include: { competence: true },
      });
    }
    return this.prisma.competenceCandidat.create({
      data: { candidatId: candidat.id, competenceId: comp.id, niveau: data.niveau },
      include: { competence: true },
    });
  }

  async deleteCompetence(userId: number, competenceId: number) {
    const candidat = await this.getCandidatOrFail(userId);
    await this.prisma.competenceCandidat.delete({
      where: { candidatId_competenceId: { candidatId: candidat.id, competenceId } },
    });
    return { message: 'Supprimé' };
  }

  // ── Experiences ────────────────────────────────────────────────────────────
  async addExperience(userId: number, data: any) {
    const candidat = await this.getCandidatOrFail(userId);
    return this.prisma.experience.create({ data: { ...data, candidatId: candidat.id } });
  }

  async updateExperience(userId: number, id: number, data: any) {
    await this.assertOwnsExperience(userId, id);
    return this.prisma.experience.update({ where: { id }, data });
  }

  async deleteExperience(userId: number, id: number) {
    await this.assertOwnsExperience(userId, id);
    await this.prisma.experience.delete({ where: { id } });
    return { message: 'Supprimé' };
  }

  // ── Formations ─────────────────────────────────────────────────────────────
  async addFormation(userId: number, data: any) {
    const candidat = await this.getCandidatOrFail(userId);
    return this.prisma.formation.create({ data: { ...data, candidatId: candidat.id } });
  }

  async updateFormation(userId: number, id: number, data: any) {
    await this.assertOwnsFormation(userId, id);
    return this.prisma.formation.update({ where: { id }, data });
  }

  async deleteFormation(userId: number, id: number) {
    await this.assertOwnsFormation(userId, id);
    await this.prisma.formation.delete({ where: { id } });
    return { message: 'Supprimé' };
  }

  // ── Langues ────────────────────────────────────────────────────────────────
  async addLangue(userId: number, data: any) {
    const candidat = await this.getCandidatOrFail(userId);
    return this.prisma.langue.create({ data: { ...data, candidatId: candidat.id } });
  }

  async updateLangue(userId: number, id: number, data: any) {
    await this.assertOwnsLangue(userId, id);
    return this.prisma.langue.update({ where: { id }, data });
  }

  async deleteLangue(userId: number, id: number) {
    await this.assertOwnsLangue(userId, id);
    await this.prisma.langue.delete({ where: { id } });
    return { message: 'Supprimé' };
  }

  // ── CV Upload ──────────────────────────────────────────────────────────────
  async updateCvUrl(userId: number, cvUrl: string) {
    return this.prisma.candidat.update({
      where: { utilisateurId: userId },
      data:  { cvUrl },
    });
  }

  async updateAvatarUrl(userId: number, avatarUrl: string) {
    return this.prisma.candidat.update({
      where: { utilisateurId: userId },
      data:  { avatarUrl },
    });
  }

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  /** List all candidats with lightweight counts for the admin grid */
  async getAllCandidats(query: {
    page?: number;
    limit?: number;
    search?: string;
    localisation?: string;
    competence?: string;
    qualifie?: string;
  }) {
    const t0 = Date.now();  
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 24;
    const skip  = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { prenom:      { contains: query.search, mode: 'insensitive' } },
        { nom:         { contains: query.search, mode: 'insensitive' } },
        { titre:       { contains: query.search, mode: 'insensitive' } },
        { localisation:{ contains: query.search, mode: 'insensitive' } },
        { utilisateur: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.localisation) {
      where.localisation = { contains: query.localisation, mode: 'insensitive' };
    }

    if (query.competence) {
      where.competences = {
        some: {
          competence: { nom: { contains: query.competence, mode: 'insensitive' } },
        },
      };
    }

    if (query.qualifie === 'true') {
      where.adminNote = { qualifie: true };
    } else if (query.qualifie === 'false') {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { adminNote: { is: null } },
            { adminNote: { qualifie: false } },
          ],
        },
      ];
    }

    const [candidats, total] = await Promise.all([
      this.prisma.candidat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { email: true, createdAt: true } },
          competences: { include: { competence: true } },
          adminNote:   { select: { qualifie: true } },
          _count: {
            select: { candidatures: true, competences: true },
          },
        },
      }),
      this.prisma.candidat.count({ where }),
    ]);
  
    console.log(`getAllCandidats took ${Date.now() - t0}ms`);

    return {
      data: candidats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

  }

  /** Full candidat profile including all candidatures + offer details */
  async getCandidatByIdForAdmin(candidatId: number) {
    const candidat = await this.prisma.candidat.findUnique({
      where: { id: candidatId },
      include: {
        utilisateur: { select: { email: true, createdAt: true } },
        competences: { include: { competence: true } },
        experiences: { orderBy: { dateDebut: 'desc' } },
        formations:  { orderBy: { annee: 'desc' } },
        langues:     true,
        adminNote: true,

        candidatures: {
          orderBy: { createdAt: 'desc' },
          include: {
            offre: {
              include: {
                entreprise: {
                  select: { id: true, nom: true, logoUrl: true, localisation: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            candidatures: true,
            competences:  true,
            experiences:  true,
            formations:   true,
          },
        },
      },
    });

    if (!candidat) throw new NotFoundException('Candidat introuvable');
    return candidat;
  }

  /** GET all competences for the admin picker */
  async getAllCompetences() {
    return this.prisma.competence.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  /** POST — upsert a competence (returns existing if already there) */
  async upsertCompetence(nom: string) {
    const trimmed = nom.trim();
    return this.prisma.competence.upsert({
      where:  { nom: trimmed },
      update: {},
      create: { nom: trimmed },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private async getCandidatOrFail(userId: number) {
    const candidat = await this.prisma.candidat.findUnique({ where: { utilisateurId: userId } });
    if (!candidat) throw new ForbiddenException('Profil introuvable');
    return candidat;
  }

  private async assertOwnsExperience(userId: number, id: number) {
    const candidat = await this.getCandidatOrFail(userId);
    const exp = await this.prisma.experience.findUnique({ where: { id } });
    if (!exp || exp.candidatId !== candidat.id) throw new ForbiddenException('Non autorisé');
  }

  private async assertOwnsFormation(userId: number, id: number) {
    const candidat = await this.getCandidatOrFail(userId);
    const f = await this.prisma.formation.findUnique({ where: { id } });
    if (!f || f.candidatId !== candidat.id) throw new ForbiddenException('Non autorisé');
  }

  private async assertOwnsLangue(userId: number, id: number) {
    const candidat = await this.getCandidatOrFail(userId);
    const l = await this.prisma.langue.findUnique({ where: { id } });
    if (!l || l.candidatId !== candidat.id) throw new ForbiddenException('Non autorisé');
  }

  // ── Rémunération (candidat self-service) ──────────────────────────────────
  async updateRemuneration(userId: number, data: {
    salaireActuel?:         string;
    primes?:                boolean;
    vehiculeFonction?:      boolean;
    vehiculeService?:       boolean;
    avantagesSociaux?:      string[];
    pretentionsSalariales?: string;
  }) {
    const candidat = await this.getCandidatOrFail(userId);
    return this.prisma.candidat.update({
      where: { id: candidat.id },
      data,
    });
  }

  // ── Admin note (upsert) ───────────────────────────────────────────────────
async upsertAdminNote(candidatId: number, data: {
  qualifie?:       boolean;
  compteRendu?:    string;
  pieceJointeUrl?: string;
}) {
  return this.prisma.adminCandidatNote.upsert({
    where:  { candidatId },
    update: { ...data, updatedAt: new Date() },
    create: { candidatId, ...data },
  });
}

async getAdminNote(candidatId: number) {
  return this.prisma.adminCandidatNote.findUnique({
    where: { candidatId },
  });
}
}