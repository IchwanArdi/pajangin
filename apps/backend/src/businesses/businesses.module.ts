import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller.js';
import { BusinessesService } from './businesses.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule], // butuh AuthService buat validasi token di controller
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
