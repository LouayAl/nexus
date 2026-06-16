// src/candidatures/candidatures.service.ts
import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidatureDto, UpdateCandidatureDto } from './dto/candidature.dto';

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  VUE:        'Vue',
  ENTRETIEN:  'Entretien',
  ACCEPTE:    'Acceptée',
  REFUSE:     'Refusée',
};

@Injectable()
export class CandidaturesService {
  constructor(private prisma: PrismaService) {}

  // Candidat — apply to an offer
  async create(userId: number, dto: CreateCandidatureDto) {
    const candidat = await this.prisma.candidat.findUnique({
      where:   { utilisateurId: userId },
      include: { utilisateur: { select: { email: true } } },
    });
    if (!candidat) throw new ForbiddenException('Profil candidat introuvable');

    const offre = await this.prisma.offre.findUnique({
      where:   { id: dto.offreId },
      include: { entreprise: true },
    });
    if (!offre) throw new NotFoundException('Offre introuvable');
    if (offre.statut !== 'OUVERTE') throw new ForbiddenException('Cette offre n\'est plus disponible');

    const existing = await this.prisma.candidature.findUnique({
      where: { candidatId_offreId: { candidatId: candidat.id, offreId: dto.offreId } },
    });
    if (existing) throw new ConflictException('Vous avez déjà postulé à cette offre');

    const candidature = await this.prisma.candidature.create({
      data: {
        candidatId: candidat.id,
        offreId:    dto.offreId,
        lettre:     dto.lettre,
      },
      include: this.includeFields(),
    });

    // Notify entreprise: new candidat applied
    const candidatName = `${candidat.prenom} ${candidat.nom}`.trim() || candidat.utilisateur.email;
    await this.prisma.notification.create({
      data: {
        utilisateurId: offre.entreprise.utilisateurId,
        titre:         'Nouvelle candidature',
        message:       `${candidatName} a postulé à votre offre "${offre.titre}"`,
        metadata:      { type: 'candidature', candidatureId: candidature.id, offreId: offre.id },
      },
    });

    return candidature;
  }

  // Candidat — get own applications
  async findMyCandidatures(userId: number) {
    const candidat = await this.prisma.candidat.findUnique({ where: { utilisateurId: userId } });
    if (!candidat) throw new ForbiddenException('Profil candidat introuvable');

    return this.prisma.candidature.findMany({
      where:   { candidatId: candidat.id },
      orderBy: { createdAt: 'desc' },
      include: this.includeFields(),
    });
  }

  // Entreprise — get all applications for their offers
  async findByEntreprise(userId: number) {
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise) throw new ForbiddenException('Entreprise introuvable');

    return this.prisma.candidature.findMany({
      where:   { offre: { entrepriseId: entreprise.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        ...this.includeFields(),
        candidat: {
          include: {
            utilisateur:  { select: { email: true } },
            competences:  { include: { competence: true } },
            experiences:  true,
            formations:   true,
            langues:      true,
          },
        },
      },
    });
  }

  // Entreprise — get applications for a specific offer
  async findByOffre(offreId: number, userId: number) {
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise) throw new ForbiddenException('Entreprise introuvable');

    const offre = await this.prisma.offre.findUnique({ where: { id: offreId } });
    if (!offre || offre.entrepriseId !== entreprise.id) throw new ForbiddenException('Non autorisé');

    return this.prisma.candidature.findMany({
      where:   { offreId },
      orderBy: { createdAt: 'desc' },
      include: {
        candidat: {
          include: {
            utilisateur: { select: { email: true } },
            competences: { include: { competence: true } },
            experiences: true,
            formations:  true,
            langues:     true,
          },
        },
        offre: { select: { id: true, titre: true } },
      },
    });
  }

  // Entreprise / Admin — update application status
  async updateStatut(id: number, userId: number, dto: UpdateCandidatureDto) {
    const candidature = await this.prisma.candidature.findUnique({
      where:   { id },
      include: {
        offre:    { include: { entreprise: true } },
        candidat: { include: { utilisateur: { select: { email: true } } } },
      },
    });
    if (!candidature) throw new NotFoundException('Candidature introuvable');

    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Utilisateur introuvable');

    // ADMIN can update any candidature
    if (user.role === 'ADMIN') {
      const updated = await this.prisma.candidature.update({
        where:   { id },
        data:    { statut: dto.statut },
        include: this.includeFields(),
      });
      // Notify candidat
      await this.notifyCandidatStatut(candidature, dto.statut);
      return updated;
    }

    // ENTREPRISE can update only their offers
    const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
    if (!entreprise || candidature.offre.entrepriseId !== entreprise.id) {
      throw new ForbiddenException('Non autorisé');
    }

    const updated = await this.prisma.candidature.update({
      where:   { id },
      data:    { statut: dto.statut },
      include: this.includeFields(),
    });

    // Notify candidat of status change
    await this.notifyCandidatStatut(candidature, dto.statut);

    return updated;
  }

  // Candidat — withdraw application
  async remove(id: number, userId: number) {
    const candidature = await this.prisma.candidature.findUnique({
      where:   { id },
      include: { candidat: true },
    });
    if (!candidature) throw new NotFoundException('Candidature introuvable');

    const candidat = await this.prisma.candidat.findUnique({ where: { utilisateurId: userId } });
    if (!candidat || candidature.candidatId !== candidat.id) {
      throw new ForbiddenException('Non autorisé');
    }

    await this.prisma.candidature.delete({ where: { id } });
    return { message: 'Candidature retirée' };
  }

  async getOneById(id: number, userId: number) {
    const candidature = await this.prisma.candidature.findUnique({
      where: { id },
      include: {
        candidat: {
          include: {
            utilisateur: { select: { email: true } },
            competences: { include: { competence: true } },
            experiences: true,
            formations:  true,
            langues:     true,
          },
        },
        offre: {
          include: {
            entreprise:  { select: { id: true, nom: true, logoUrl: true } },
            competences: { include: { competence: true } },
          },
        },
      },
    });
    if (!candidature) throw new NotFoundException('Candidature introuvable');

    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Utilisateur introuvable');

    if (user.role === 'ENTREPRISE') {
      const entreprise = await this.prisma.entreprise.findUnique({ where: { utilisateurId: userId } });
      if (!entreprise || candidature.offre.entrepriseId !== entreprise.id) {
        throw new ForbiddenException('Non autorisé');
      }
    }

    return candidature;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async notifyCandidatStatut(
    candidature: { id: number; candidat: { utilisateurId: number }; offre: { id: number; titre: string } },
    statut: string,
  ) {
    const label = STATUT_LABELS[statut] ?? statut;
    await this.prisma.notification.create({
      data: {
        utilisateurId: candidature.candidat.utilisateurId,
        titre:         'Statut de candidature mis à jour',
        message:       `Votre candidature pour "${candidature.offre.titre}" est maintenant : ${label}`,
        metadata:      { type: 'candidature', candidatureId: candidature.id, offreId: candidature.offre.id },
      },
    });
  }

  private includeFields() {
    return {
      offre: {
        include: {
          entreprise:  { select: { id: true, nom: true, logoUrl: true } },
          competences: { include: { competence: true } },
        },
      },
    };
  }
}