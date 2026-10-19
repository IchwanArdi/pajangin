import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BusinessesModule } from './businesses/businesses.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { ImagesModule } from './images/images.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AiModule } from './ai/ai.module.js';
import { LeadsModule } from './leads/leads.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BusinessesModule,
    AnalyticsModule,
    ImagesModule,
    BookingsModule,
    NotificationsModule,
    AiModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
