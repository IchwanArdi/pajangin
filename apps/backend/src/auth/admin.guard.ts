import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from './auth.guard.js';
import { isAdminEmail } from './admin.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    // Allowlist kosong = fail closed. Jangan pernah membuka admin untuk semua user.
    if (!user || !isAdminEmail(user.email)) {
      throw new ForbiddenException('Akses khusus admin.');
    }
    return true;
  }
}
