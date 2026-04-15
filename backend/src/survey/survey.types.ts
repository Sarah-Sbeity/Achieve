/**
 * Typed models for survey analytics, scope, and API contracts.
 * Used by aggregation, anonymity guardrails, and API endpoints.
 */

/** Layer (section) in the survey structure. */
export interface Layer {
  id: string;
  title: string;
  titleAr?: string | null;
  layerLabel: string | null;
  order: number;
}

/** Dimension groups questions within a layer. */
export interface Dimension {
  id: string;
  name: string;
  nameAr?: string | null;
  order: number;
  layerLabel?: string | null;
  sectionTitle?: string | null;
}

/** Scale question with optional dimension and reverse-scoring flag. */
export interface Question {
  id: string;
  label: string;
  labelAr?: string | null;
  type: string;
  order: number;
  sectionId: string | null;
  dimensionId: string | null;
  isReversed: boolean;
}

/** API view of a survey response (no raw answers or identifiers for anonymity). */
export interface SurveyResponsePublic {
  id: string;
  createdAt: string;
  /** No answers or userId exposed. */
}

/** Raw response for internal aggregation only (not exposed). */
export interface SurveyResponseRaw {
  id: string;
  answers: string;
  createdAt: Date;
}

/** Benchmark cohort reference (placeholder until cohort data exists). */
export interface Benchmarks {
  cohortId: string | null;
  cohortName: string | null;
  /** Gap = current mean − cohort mean; null if no cohort. */
  gap: number | null;
}

/** Time period for trend comparison. */
export interface Periods {
  previous: string;
  current: string;
  previousValue: number;
  currentValue: number;
  change: number;
}

/** Scope selector: layer → dimension → question. */
export interface Scope {
  layerTitle?: string | null;
  dimensionId?: string | null;
  questionId?: string | null;
}

/** Demographic filters applied to analytics (key = questionId, value = option value). */
export interface DemographicFilters {
  [questionId: string]: string;
}

/** Option in demographic breakdown (count hidden when n < MIN_GROUP_SIZE). */
export interface DemographicOption {
  value: string;
  count: number | null;
}

/** Anonymity: minimum group size for breakdowns (groups below are masked). */
export const MIN_GROUP_SIZE = 7;

/** Score row with metrics for aggregation (layer/dimension/question). */
export interface ScoreRow {
  averageScore: number;
  medianScore: number | null;
  responseCount: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  pctFavorable: number | null;
  pctNeutral: number | null;
  pctUnfavorable: number | null;
  trend: Periods | null;
  benchmarkGap: number | null;
}

/** Results payload for GET /api/results (scoped analytics). */
export interface ResultsResponse {
  scope: Scope;
  overallIndex: number;
  totalResponses: number;
  insufficientSample: boolean;
  byLayer: Array<LayerResult>;
  byDimension: Array<DimensionResult>;
  byQuestion: Array<QuestionResult>;
  demographics: Array<{ questionId: string; label: string; labelAr?: string; options: DemographicOption[]; allOptions: string[] }>;
  correlations?: Array<{ questionIdA: string; questionIdB: string; labelA: string; labelB: string; correlation: number; n: number }>;
}

export interface LayerResult extends ScoreRow {
  layerTitle: string;
  layerTitleAr?: string | null;
  layerLabel: string | null;
}

export interface DimensionResult extends ScoreRow {
  dimensionId: string;
  dimensionName: string;
  dimensionNameAr?: string | null;
  layerLabel: string | null;
  sectionTitle: string | null;
}

export interface QuestionResult extends ScoreRow {
  questionId: string;
  label: string;
  labelAr?: string | null;
  layerLabel: string | null;
  sectionTitle: string;
  dimensionId: string | null;
  dimensionName: string | null;
  isReversed: boolean;
}

/** Insights payload for POST /api/insights. */
export interface InsightsRequest {
  filters?: DemographicFilters;
  scope?: Scope;
  /** Optional precomputed scope data (if client already has results). */
  computedScopeData?: Partial<ResultsResponse>;
}

export interface InsightsResponse {
  headline: string;
  what_we_see: string[];
  why_it_matters: string;
  segments_to_watch: Array<{ segment: string; n: number }>;
  confidence: 'low' | 'med' | 'high';
}

/** Recommendations payload for POST /api/recommendations. */
export interface RecommendationsRequest {
  filters?: DemographicFilters;
  scope?: Scope;
  /** Optional precomputed scope data. */
  computedScopeData?: Partial<ResultsResponse>;
  /** Optional insights from POST /api/insights (otherwise server computes). */
  insights?: InsightsResponse;
}

export interface RecommendationAction {
  title: string;
  rationale: string;
  scope_link: { layer_id: string | null; dimension_id: string | null; question_id: string | null };
  owner_suggestion: 'HR' | 'Leadership' | 'Function Head';
  effort: 'S' | 'M' | 'L';
  impact: 'S' | 'M' | 'L';
  success_metrics: string;
  timeframe: 30 | 60 | 90;
}

export interface RecommendationsResponse {
  recommended_actions: RecommendationAction[];
  quick_wins: RecommendationAction[];
  strategic_initiatives: RecommendationAction[];
}
