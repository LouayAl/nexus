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
      data:  {
        ...rest,
        ...(competences && {
          competences: {
            create: await Promise.all(
              competences.map(async (nom: string) => {
                const comp = await this.prisma.competence.upsert({
                  where: { nom }, update: {}, create: { nom },
                });
                return { competenceId: comp.id };
              }),
            ),
          },
        }),
      },
      include: {
        competences: { include: { competence: true } },
        utilisateur: { select: { email: true } },
      },
    });
  }
}