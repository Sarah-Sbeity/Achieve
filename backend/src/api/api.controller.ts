import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SurveyService } from '../survey/survey.service';
import { AchieveInsightsService, AchieveScores } from './achieve-insights.service';
import type { AchieveChatRequest } from './achieve-insights.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';
import type {
  Scope,
  DemographicFilters,
  InsightsRequest,
  InsightsResponse,
  RecommendationsRequest,
  RecommendationsResponse,
} from '../survey/survey.types';

@Controller('api')
export class ApiController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly achieveInsightsService: AchieveInsightsService,
  ) {}

  /**
   * GET /api/results?layer_title=&dimension_id=&question_id=&filters=...
   * Returns full analytics (aggregation per scope + reverse-scoring applied).
   * Anonymity: demographic breakdowns respect MIN_GROUP_SIZE.
   */
  @Get('results')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getResults(
    @Query('filters') filtersStr?: string,
    @Query('layer_title') layerTitle?: string,
    @Query('dimension_id') dimensionId?: string,
    @Query('question_id') questionId?: string,
  ) {
    const filters = this.parseFilters(filtersStr);
    const data = await this.surveyService.getAnalytics(filters);
    return data;
  }

  /**
   * POST /api/insights
   * Body: { filters?, scope?, computedScopeData? } → insights JSON.
   * Uses computed scope data from analytics (server computes if not provided).
   */
  @Post('insights')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async postInsights(@Body() body: InsightsRequest): Promise<InsightsResponse> {
    const filters = body.filters ?? undefined;
    const scope = body.scope ?? undefined;
    const scopeNorm = scope ? { layerTitle: scope.layerTitle ?? undefined, dimensionId: scope.dimensionId ?? undefined, questionId: scope.questionId ?? undefined } : undefined;
    return this.surveyService.getInsights(filters, scopeNorm);
  }

  /**
   * POST /api/recommendations
   * Body: { filters?, scope?, insights?, computedScopeData? } → recommendations JSON.
   * Uses scope + insights (server computes insights if not provided).
   */
  @Post('recommendations')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async postRecommendations(@Body() body: RecommendationsRequest): Promise<RecommendationsResponse> {
    const filters = body.filters ?? undefined;
    const scope = body.scope ?? undefined;
    const scopeNorm = scope ? { layerTitle: scope.layerTitle ?? undefined, dimensionId: scope.dimensionId ?? undefined, questionId: scope.questionId ?? undefined } : undefined;
    return this.surveyService.getRecommendations(filters, scopeNorm);
  }

  /**
   * POST /api/achieve-insights
   * Body: { overall, l1, l2, l3, l4 } (OSR scores 0–100). Returns AI execution diagnostics report.
   */
  @Post('achieve-insights')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async postAchieveInsights(
    @Body() body: { overall?: number; l1?: number; l2?: number; l3?: number; l4?: number },
  ): Promise<{ report: string }> {
    const scores: AchieveScores = {
      overall: typeof body.overall === 'number' ? body.overall : 0,
      l1: typeof body.l1 === 'number' ? body.l1 : 0,
      l2: typeof body.l2 === 'number' ? body.l2 : 0,
      l3: typeof body.l3 === 'number' ? body.l3 : 0,
      l4: typeof body.l4 === 'number' ? body.l4 : 0,
    };
    const report = await this.achieveInsightsService.generateReport(scores);
    return { report };
  }

  /**
   * POST /api/achieve-chat
   * Body: { question, page?, filters?, snapshot? }.
   * Returns an internal answer grounded in current analytics data snapshot.
   */
  @Post('achieve-chat')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async postAchieveChat(
    @Body()
    body: AchieveChatRequest,
  ): Promise<{ answer: string }> {
    const answer = await this.achieveInsightsService.answerQuestion(body || { question: '' });
    return { answer };
  }

  private parseFilters(filtersStr?: string): DemographicFilters | undefined {
    if (!filtersStr || typeof filtersStr !== 'string') return undefined;
    try {
      const parsed = JSON.parse(filtersStr) as Record<string, string>;
      return parsed && typeof parsed === 'object' ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
}
