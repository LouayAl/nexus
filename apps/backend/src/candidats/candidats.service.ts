// src/candidats/candidats.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        competences: { include: { competence: true } },
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

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  /** List all candidats with lightweight counts for the admin grid */
  async getAllCandidats() {
    return this.prisma.candidat.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { email: true, createdAt: true } },
        competences: { include: { competence: true } },
        _count: {
          select: {
            candidatures: true,
            competences:  true,
          },
        },
      },
    });
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
}