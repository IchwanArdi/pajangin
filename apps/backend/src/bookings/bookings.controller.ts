import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import type { CreateBookingInput, UpdateBookingInput } from './bookings.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';
import { RateLimitGuard } from '../common/rate-limit.guard.js';

@Controller('api/v1')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // GET /api/v1/businesses/:id/bookings - Daftar booking untuk pemilik bisnis
  @Get('businesses/:id/bookings')
  @UseGuards(AuthGuard)
  getBookings(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.bookings.getBookings(id, user.id, status, date);
  }

  // GET /api/v1/businesses/:id/bookings/stats - Statistik booking
  @Get('businesses/:id/bookings/stats')
  @UseGuards(AuthGuard)
  getBookingStats(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bookings.getBookingStats(id, user.id);
  }

  // POST /api/v1/public/bookings - Pelanggan membuat booking online dari halaman publik
  @Post('public/bookings')
  @UseGuards(RateLimitGuard)
  createPublicBooking(@Body() body: CreateBookingInput) {
    return this.bookings.createPublicBooking(body ?? ({} as CreateBookingInput));
  }

  // PATCH /api/v1/businesses/:id/bookings/:bookingId - Ubah status / catatan booking
  @Patch('businesses/:id/bookings/:bookingId')
  @UseGuards(AuthGuard)
  updateBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateBookingInput,
  ) {
    return this.bookings.updateBooking(id, bookingId, user.id, body ?? {});
  }

  // DELETE /api/v1/businesses/:id/bookings/:bookingId - Hapus booking
  @Delete('businesses/:id/bookings/:bookingId')
  @UseGuards(AuthGuard)
  deleteBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookings.deleteBooking(id, bookingId, user.id);
  }
}
