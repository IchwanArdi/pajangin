import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';

@Controller('api/v1')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // GET /api/v1/businesses/:id/notifications - Daftar notifikasi real-time terbaru di dashboard
  @Get('businesses/:id/notifications')
  @UseGuards(AuthGuard)
  getNotifications(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notifications.getRecentNotifications(id, user.id);
  }

  // POST /api/v1/businesses/:id/notifications/test - Uji coba kirim WhatsApp ke nomor pemilik bisnis
  @Post('businesses/:id/notifications/test')
  @UseGuards(AuthGuard)
  testNotification(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notifications.testNotification(id, user.id);
  }
}
