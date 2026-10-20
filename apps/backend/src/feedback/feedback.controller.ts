import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service.js';
import type { CreateFeedbackInput } from './feedback.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('api/v1')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  // POST /api/v1/feedback - kirim masukan dari dashboard pemilik usaha
  @Post('feedback')
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateFeedbackInput) {
    return this.feedback.create(user, body);
  }

  // GET /api/v1/admin/feedback - inbox khusus admin
  @Get('admin/feedback')
  @UseGuards(AuthGuard, AdminGuard)
  @Header('Cache-Control', 'no-store')
  list(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedback.listForAdmin({ status, category, page, limit });
  }

  // PATCH /api/v1/admin/feedback/:id - tandai dibaca / selesai
  @Patch('admin/feedback/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @Header('Cache-Control', 'no-store')
  updateStatus(@Param('id') id: string, @Body() body: { status?: unknown }) {
    return this.feedback.updateStatus(id, body?.status);
  }
}
