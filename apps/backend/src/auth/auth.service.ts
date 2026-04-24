import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.utilisateur.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email deja utilise');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.utilisateur.create({
      data: {
        email: dto.email,
        password: hash,
        role: dto.role,
        ...(dto.role === 'CANDIDAT' && {
          candidat: {
            create: {
              prenom: dto.prenom || '',
              nom: dto.nom || '',
            },
          },
        }),
        ...(dto.role === 'ENTREPRISE' && {
          entreprise: {
            create: {
              nom: dto.nomEntreprise || '',
            },
          },
        }),
      },
    });

    await this.sendWelcomeEmail(user.email, dto.prenom || dto.nom || 'candidat', dto.role);
    return this.signToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.signToken(user.id, user.email, user.role);
  }

  async me(userId: number) {
    return this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        candidat: true,
        entreprise: true,
      },
    });
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    prenom: string;
    nom: string;
    provider: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.utilisateur.findUnique({
      where: { email: data.email },
      include: { candidat: true },
    });

    if (!user) {
      user = await this.prisma.utilisateur.create({
        data: {
          email: data.email,
          password: '',
          role: 'CANDIDAT',
          candidat: {
            create: {
              prenom: data.prenom,
              nom: data.nom,
              avatarUrl: data.avatarUrl,
            },
          },
        },
        include: { candidat: true },
      });

      await this.sendWelcomeEmail(data.email, `${data.prenom} ${data.nom}`.trim() || 'candidat', 'CANDIDAT');
    } else if (user.candidat && data.avatarUrl && !user.candidat.avatarUrl) {
      user = await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: {
          candidat: {
            update: {
              avatarUrl: data.avatarUrl,
            },
          },
        },
        include: { candidat: true },
      });
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async sendCredentials(data: { email: string; password: string; nom: string; role: 'CANDIDAT' | 'ENTREPRISE' }) {
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
    await this.mailService.sendCredentials(data.email, { ...data, loginUrl });
    return { message: 'Email envoye' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.password) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.utilisateur.update({ where: { id: userId }, data: { password: hash } });
    return { message: 'Mot de passe mis a jour' };
  }

  private signToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: userId, email, role },
    };
  }

  private async sendWelcomeEmail(email: string, nom: string, role: string) {
    try {
      if (role === 'ENTREPRISE') {
        const dashboardUrl = `${process.env.FRONTEND_URL}/company/dashboard`;
        await this.mailService.sendEntrepriseWelcome(email, nom, dashboardUrl);
      } else {
        const profileUrl = `${process.env.FRONTEND_URL}/profile`;
        await this.mailService.sendCandidateWelcome(email, nom, profileUrl);
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}
