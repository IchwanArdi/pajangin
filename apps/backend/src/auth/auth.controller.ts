import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from './auth.guard.js';
import type { AuthenticatedUser } from './auth.guard.js';

// Daftar / login / reset password ditangani langsung oleh Supabase Auth di frontend.
@Controller('api/v1/auth')
export class AuthController {
  // GET /api/v1/auth/me - profil pemilik akun yang sedang login
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
