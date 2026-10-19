import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service.js';
import type { CreateBusinessInput, ServiceInput, UpdateBusinessInput } from './businesses.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';

@Controller('api/v1')
export class BusinessesController {
  constructor(private readonly biz: BusinessesService) {}

  // GET /api/v1/my/businesses - HANYA bisnis milik user yang sedang login (Multi-tenant isolation)
  @Get('my/businesses')
  @UseGuards(AuthGuard)
  getMyBusinesses(@CurrentUser() user: AuthenticatedUser) {
    return this.biz.findByUserId(user.id);
  }

  // POST /api/v1/my/businesses - Buat bisnis baru (+ layanan awal) untuk user yang login
  @Post('my/businesses')
  @UseGuards(AuthGuard)
  createBusiness(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateBusinessInput) {
    return this.biz.createBusiness(user.id, body ?? ({} as CreateBusinessInput));
  }

  // GET /api/v1/public/businesses/sitemap - Hanya halaman yang sudah lengkap
  @Get('public/businesses/sitemap')
  getPublicSitemap() {
    return this.biz.findSitemapEntries();
  }

  // GET /api/v1/public/business/:slug - Halaman publik lokal (SEO & SSR)
  @Get('public/business/:slug')
  getPublicBusiness(@Param('slug') slug: string) {
    return this.biz.findBySlug(slug);
  }

  // GET /api/v1/businesses/:id - Detail bisnis by ID (hanya pemilik)
  @Get('businesses/:id')
  @UseGuards(AuthGuard)
  async getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.biz.checkOwnership(id, user.id);
    return this.biz.findById(id);
  }

  // PATCH /api/v1/businesses/:id - Update profil bisnis (Protected with ownership check)
  @Patch('businesses/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateBusinessInput,
  ) {
    return this.biz.updateProfile(id, user.id, body ?? {});
  }

  // GET /api/v1/businesses/:id/services - Daftar layanan bisnis (hanya pemilik)
  @Get('businesses/:id/services')
  @UseGuards(AuthGuard)
  getServices(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.biz.getServices(id, user.id);
  }

  // POST /api/v1/businesses/:id/services - Tambah layanan baru (Protected with ownership check)
  @Post('businesses/:id/services')
  @UseGuards(AuthGuard)
  addService(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ServiceInput,
  ) {
    return this.biz.createService(id, user.id, body ?? {});
  }

  // PATCH /api/v1/businesses/:id/services/:serviceId - Update layanan (Protected with ownership check)
  @Patch('businesses/:id/services/:serviceId')
  @UseGuards(AuthGuard)
  updateService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ServiceInput,
  ) {
    return this.biz.updateService(id, serviceId, user.id, body ?? {});
  }

  // DELETE /api/v1/businesses/:id/services/:serviceId - Hapus layanan (Protected with ownership check)
  @Delete('businesses/:id/services/:serviceId')
  @UseGuards(AuthGuard)
  deleteService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.biz.deleteService(id, serviceId, user.id);
  }
}
