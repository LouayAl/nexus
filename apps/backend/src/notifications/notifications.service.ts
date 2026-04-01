import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.notification.findMany({
      where:   { utilisateurId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, utilisateurId: userId },
      data:  { lu: true },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { utilisateurId: userId, lu: false },
      data:  { lu: true },
    });
  }

  async unreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { utilisateurId: userId, lu: false },
    });
    return { count };
  }
}