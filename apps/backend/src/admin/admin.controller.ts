import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminUsersService, type AdminUserListQuery } from './admin-users.service.js';
import {
  AdminBusinessesService,
  type AdminBusinessListQuery,
} from './admin-businesses.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('api/v1/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly users: AdminUsersService,
    private readonly businesses: AdminBusinessesService,
  ) {}

  // Metrik agregat untuk halaman Ringkasan.
  @Get('overview')
  @Header('Cache-Control', 'no-store')
  getOverview(@Query('days') days?: string) {
    const parsed = Number.parseInt(days || '30', 10);
    return this.admin.getOverview(Number.isFinite(parsed) ? parsed : 30);
  }

  // Daftar akun dengan pencarian, filter kepemilikan bisnis, dan pagination.
  @Get('users')
  @Header('Cache-Control', 'no-store')
  getUsers(@Query() query: AdminUserListQuery) {
    return this.users.list(query);
  }

  // Daftar bisnis dengan pencarian, filter kota/kategori/kelengkapan, dan traffic 30 hari.
  @Get('businesses')
  @Header('Cache-Control', 'no-store')
  getBusinesses(@Query() query: AdminBusinessListQuery) {
    return this.businesses.list(query);
  }
}
