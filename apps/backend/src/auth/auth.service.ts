import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
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
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.utilisateur.create({
      data: {
        email:    dto.email,
        password: hash,
        role:     dto.role,
        ...(dto.role === 'CANDIDAT' && {
          candidat: {
            create: {
              prenom: dto.prenom || '',
              nom:    dto.nom    || '',
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
        id:        true,
        email:     true,
        role:      true,
        createdAt: true,
        candidat:  true,
        entreprise:true,
      },
    });
  }

  private signToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: userId, email, role },
    };
  }

  async findOrCreateOAuthUser(data: {
    email:    string;
    prenom:   string;
    nom:      string;
    provider: string;
  }) {
    let user = await this.prisma.utilisateur.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await this.prisma.utilisateur.create({
        data: {
          email:    data.email,
          password: '',           // no password for OAuth users
          role:     'CANDIDAT',   // default role, can be changed later
          candidat: {
            create: {
              prenom: data.prenom,
              nom:    data.nom,
            },
          },
        },
      });
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async sendCredentials(data: { email: string; password: string; nom: string; role: 'CANDIDAT' | 'ENTREPRISE' }) {
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
    await this.mailService.sendCredentials(data.email, { ...data, loginUrl });
    return { message: 'Email envoyé' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // OAuth users (empty password) can set a new password directly
    if (user.password) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.utilisateur.update({ where: { id: userId }, data: { password: hash } });
    return { message: 'Mot de passe mis à jour' };
  }

}

