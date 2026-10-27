import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from './auth.guard.js';
import type { AuthenticatedUser } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import type { DeleteAccountInput, UpdateAccountInput } from './auth.service.js';

// Login Google ditangani langsung oleh Supabase Auth di frontend.
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // GET /api/v1/auth/me - profil pemilik akun yang sedang login
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  // PATCH /api/v1/auth/me - ubah nama dan WhatsApp pemilik akun
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateAccountInput,
  ) {
    return { user: await this.auth.updateProfile(user.id, body ?? {}) };
  }

  // GET /api/v1/auth/me/deletion-impact - ringkasan data yang akan ikut terhapus
  @Get('me/deletion-impact')
  @UseGuards(AuthGuard)
  getDeletionImpact(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getDeletionImpact(user.id);
  }

  // DELETE /api/v1/auth/me - hapus akun, bisnis, dan file storage secara permanen
  @Delete('me')
  @UseGuards(AuthGuard)
  deleteMe(@CurrentUser() user: AuthenticatedUser, @Body() body: DeleteAccountInput) {
    return this.auth.deleteAccount(user, body ?? {});
  }
}
