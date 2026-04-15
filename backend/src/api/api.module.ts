import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SettingsController } from './settings.controller';
import { AchieveInsightsService } from './achieve-insights.service';
import { SurveyModule } from '../survey/survey.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SurveyModule, PrismaModule],
  controllers: [ApiController, SettingsController],
  providers: [AchieveInsightsService],
})
export class ApiModule {}
