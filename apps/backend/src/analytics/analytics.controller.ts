import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { BusinessesService } from '../businesses/businesses.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';
import { RateLimitGuard } from '../common/rate-limit.guard.js';
import type { IngestEventDto, IngestLeadDto } from './analytics.service.js';

@Controller('api/v1')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly businessesService: BusinessesService,
  ) {}

  // POST /api/v1/public/events - Ingest event pelacakan (page view, klik WhatsApp, telepon)
  @Post('public/events')
  @UseGuards(RateLimitGuard)
  recordEvent(@Body() dto: IngestEventDto) {
    return this.analyticsService.recordEvent(dto);
  }

  // POST /api/v1/public/leads - Ingest formulir konsultasi / pesanan
  @Post('public/leads')
  @UseGuards(RateLimitGuard)
  recordLead(@Body() dto: IngestLeadDto) {
    return this.analyticsService.recordLead(dto);
  }

  // GET /api/v1/dashboard/:businessId/overview - Ringkasan metrik analitik (hanya pemilik)
  @Get('dashboard/:businessId/overview')
  @UseGuards(AuthGuard)
  async getOverview(
    @Param('businessId') businessId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    await this.businessesService.checkOwnership(businessId, user.id);
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getOverview(businessId, daysNum);
  }

  // GET /api/v1/dashboard/:businessId/insights - Insight dan rekomendasi otomatis (hanya pemilik)
  @Get('dashboard/:businessId/insights')
  @UseGuards(AuthGuard)
  async getInsights(
    @Param('businessId') businessId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    await this.businessesService.checkOwnership(businessId, user.id);
    return this.analyticsService.getMarketingInsights(businessId, days ? parseInt(days, 10) : 30);
  }

  // GET /api/v1/dashboard/:businessId/timeseries - Data harian untuk grafik tren (hanya pemilik)
  @Get('dashboard/:businessId/timeseries')
  @UseGuards(AuthGuard)
  async getTimeseries(
    @Param('businessId') businessId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    await this.businessesService.checkOwnership(businessId, user.id);
    return this.analyticsService.getTimeseries(businessId, days ? parseInt(days, 10) : 30);
  }

  // GET /api/v1/dashboard/:businessId/activity - Aktivitas pengunjung terbaru (hanya pemilik)
  @Get('dashboard/:businessId/activity')
  @UseGuards(AuthGuard)
  async getActivity(
    @Param('businessId') businessId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    await this.businessesService.checkOwnership(businessId, user.id);
    return this.analyticsService.getActivity(businessId, limit ? parseInt(limit, 10) : 12);
  }
}
