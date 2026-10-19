import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUuid } from '../common/uuid.js';

export interface LeadResponse {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  message: string | null;
  service_id: string | null;
  service_name: string | null;
  created_at: string;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkOwnership(businessId: string, userId: string) {
    if (!isUuid(businessId)) throw new NotFoundException('Bisnis tidak ditemukan');
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });
    if (!business) throw new NotFoundException('Bisnis tidak ditemukan');
    if (business.userId !== userId) {
      throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk melihat pesan bisnis ini.');
    }
  }

  async getLeads(businessId: string, userId: string, limit = 100): Promise<LeadResponse[]> {
    await this.checkOwnership(businessId, userId);

    const take = Math.min(Math.max(Math.trunc(limit) || 100, 1), 200);
    const leads = await this.prisma.lead.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return leads.map((lead) => ({
      id: lead.id,
      business_id: lead.businessId,
      name: lead.name,
      phone: lead.phone,
      message: lead.message,
      service_id: lead.serviceId,
      service_name: lead.serviceName,
      created_at: lead.createdAt.toISOString(),
    }));
  }
}
