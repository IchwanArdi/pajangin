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
import { ImagesService } from './images.service.js';
import type { CreateImageInput, UpdateImageInput } from './images.service.js';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import type { AuthenticatedUser } from '../auth/auth.guard.js';

@Controller('api/v1')
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  // GET /api/v1/businesses/:id/images - Daftar foto galeri bisnis (hanya pemilik)
  @Get('businesses/:id/images')
  @UseGuards(AuthGuard)
  getImages(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.images.getImages(id, user.id);
  }

  // GET /api/v1/public/business/:id/images - Galeri publik
  @Get('public/business/:id/images')
  getPublicImages(@Param('id') id: string) {
    return this.images.getPublicImages(id);
  }

  // POST /api/v1/businesses/:id/images - Tambah foto galeri
  @Post('businesses/:id/images')
  @UseGuards(AuthGuard)
  addImage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateImageInput,
  ) {
    return this.images.addImage(id, user.id, body ?? ({} as CreateImageInput));
  }

  // PATCH /api/v1/businesses/:id/images/:imageId - Update caption / kategori / urutan foto
  @Patch('businesses/:id/images/:imageId')
  @UseGuards(AuthGuard)
  updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateImageInput,
  ) {
    return this.images.updateImage(id, imageId, user.id, body ?? {});
  }

  // DELETE /api/v1/businesses/:id/images/:imageId - Hapus foto dari galeri
  @Delete('businesses/:id/images/:imageId')
  @UseGuards(AuthGuard)
  deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.images.deleteImage(id, imageId, user.id);
  }
}
