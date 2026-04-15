import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SurveyService } from './survey.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

interface RequestWithUser extends Request {
  user?: { id: string; email: string; role: string };
}

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('questions')
  async getQuestions() {
    return this.surveyService.getQuestions();
  }

  @Get('sections')
  async getSections() {
    return this.surveyService.getSectionsWithQuestions();
  }

  @Get('response-status')
  @UseGuards(AuthGuard)
  async getResponseStatus() {
    return { alreadySubmitted: false };
  }

  @Post('responses')
  @UseGuards(AuthGuard)
  async submitResponse(
    @Req() req: RequestWithUser,
    @Body() body: { answers: Record<string, string> },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.surveyService.submitResponse(userId, body.answers || {});
  }

  @Get('responses')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getResponses() {
    return this.surveyService.getResponses();
  }

  @Get('analytics')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAnalytics(@Query('filters') filtersStr?: string) {
    let filters: Record<string, string> | undefined;
    if (filtersStr && typeof filtersStr === 'string') {
      try {
        filters = JSON.parse(filtersStr) as Record<string, string>;
        if (!filters || typeof filters !== 'object') filters = undefined;
      } catch {
        filters = undefined;
      }
    }
    return this.surveyService.getAnalytics(filters);
  }

  @Get('insights')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getInsights(
    @Query('filters') filtersStr?: string,
    @Query('layer_title') layerTitle?: string,
    @Query('dimension_id') dimensionId?: string,
    @Query('question_id') questionId?: string,
  ) {
    let filters: Record<string, string> | undefined;
    if (filtersStr && typeof filtersStr === 'string') {
      try {
        filters = JSON.parse(filtersStr) as Record<string, string>;
        if (!filters || typeof filters !== 'object') filters = undefined;
      } catch {
        filters = undefined;
      }
    }
    const scope =
      layerTitle || dimensionId || questionId
        ? { layerTitle: layerTitle || undefined, dimensionId: dimensionId || undefined, questionId: questionId || undefined }
        : undefined;
    return this.surveyService.getInsights(filters, scope);
  }

  @Get('recommendations')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getRecommendations(
    @Query('filters') filtersStr?: string,
    @Query('layer_title') layerTitle?: string,
    @Query('dimension_id') dimensionId?: string,
    @Query('question_id') questionId?: string,
  ) {
    let filters: Record<string, string> | undefined;
    if (filtersStr && typeof filtersStr === 'string') {
      try {
        filters = JSON.parse(filtersStr) as Record<string, string>;
        if (!filters || typeof filters !== 'object') filters = undefined;
      } catch {
        filters = undefined;
      }
    }
    const scope =
      layerTitle || dimensionId || questionId
        ? { layerTitle: layerTitle || undefined, dimensionId: dimensionId || undefined, questionId: questionId || undefined }
        : undefined;
    return this.surveyService.getRecommendations(filters, scope);
  }

  @Get('analytics/by-period')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAnalyticsByPeriod() {
    return this.surveyService.getAnalyticsByPeriod();
  }

  @Get('analytics/by-demographic')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAnalyticsByDemographicGroup(@Query('questionId') questionId?: string) {
    return this.surveyService.getAnalyticsByDemographicGroup(questionId || '');
  }

  @Get('analytics/joint')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAnalyticsJoint(
    @Query('questionIdA') questionIdA?: string,
    @Query('questionIdB') questionIdB?: string,
  ) {
    return this.surveyService.getAnalyticsJoint(
      questionIdA || '',
      questionIdB || '',
    );
  }

  @Get('analytics/scatter')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getScatter(
    @Query('questionIdA') questionIdA?: string,
    @Query('questionIdB') questionIdB?: string,
    @Query('filters') filtersStr?: string,
  ) {
    let filters: Record<string, string> | undefined;
    if (filtersStr && typeof filtersStr === 'string') {
      try {
        filters = JSON.parse(filtersStr) as Record<string, string>;
        if (!filters || typeof filters !== 'object') filters = undefined;
      } catch {
        filters = undefined;
      }
    }
    return this.surveyService.getScatterData(
      questionIdA || '',
      questionIdB || '',
      filters,
    );
  }
}
