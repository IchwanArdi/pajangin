import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service.js';
import type { GenerateInput } from './ai.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';

@Controller('api/v1')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('businesses/:id/ai/providers')
  @UseGuards(AuthGuard)
  getProviders(@Param('id') _id: string, @CurrentUser() _user: AuthenticatedUser) {
    return this.ai.getAvailableProviders();
  }

  @Post('businesses/:id/ai/generate')
  @UseGuards(AuthGuard)
  generate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateInput,
  ) {
    return this.ai.generate(id, user.id, body ?? ({} as GenerateInput));
  }
}
