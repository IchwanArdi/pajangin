import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';

@Controller('api/v1')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // GET /api/v1/businesses/:id/leads - Pesan dari form kontak halaman publik
  @Get('businesses/:id/leads')
  @UseGuards(AuthGuard)
  getLeads(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    return this.leads.getLeads(id, user.id, limit ? parseInt(limit, 10) : 100);
  }
}
