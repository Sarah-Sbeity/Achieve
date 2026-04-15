import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Pearson correlation between two same-length arrays. */
  private static pearson(a: number[], b: number[]): number {
    const n = a.length;
    if (n !== b.length || n < 2) return NaN;
    let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
    for (let i = 0; i < n; i++) {
      sumA += a[i];
      sumB += b[i];
      sumAB += a[i] * b[i];
      sumA2 += a[i] * a[i];
      sumB2 += b[i] * b[i];
    }
    const num = n * sumAB - sumA * sumB;
    const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
    return den === 0 ? NaN : num / den;
  }

  /** Two-tailed p-value for Pearson r (normal approximation for t-statistic). */
  private static correlationPValue(r: number, n: number): number | null {
    if (n < 3 || !Number.isFinite(r) || r <= -1 || r >= 1) return null;
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const p = 2 * (1 - SurveyService.normalCDF(Math.abs(t)));
    return Math.min(1, Math.max(0, p));
  }

  /** Standard normal CDF (Abramowitz & Stegun approximation). */
  private static normalCDF(z: number): number {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.327591053;
    const t = 1.0 / (1.0 + p * Math.abs(z));
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp((-z * z) / 2);
    return z > 0 ? y : 1 - y;
  }

  private async getCompanyProfile(): Promise<{
    departments?: string[];
    tenureOptions?: string[];
    ageGroupOptions?: string[];
    genderOptions?: string[];
    nationalityOptions?: string[];
    numberOfEmployeesOptions?: string[];
    industryOptions?: string[];
  } | null> {
    const row = await this.prisma.appSettings.findUnique({
      where: { key: 'company_profile' },
    });
    if (!row?.value) return null;
    try {
      return JSON.parse(row.value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async getQuestions() {
    const questions = await this.prisma.surveyQuestion.findMany({
      orderBy: { order: 'asc' },
      include: { section: true },
    });
    return questions;
  }

  async getSectionsWithQuestions() {
    return this.prisma.surveySection.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });
  }

  async hasResponded(userId: string): Promise<boolean> {
    const existing = await this.prisma.surveyResponse.findFirst({
      where: { userId },
    });
    return !!existing;
  }

  async submitResponse(userId: string, answers: Record<string, string>) {
    return this.prisma.surveyResponse.create({
      data: {
        answers: JSON.stringify(answers),
        userId,
      },
    });
  }

  /** Returns only aggregate-safe data: total count and optional dates. No raw answers or identifiers (anonymity). */
  async getResponses() {
    const list = await this.prisma.surveyResponse.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      total: list.length,
      responseDates: list.map((r) => r.createdAt.toISOString()),
    };
  }

  /** Minimum group size for anonymity (breakdown groups with n < k are hidden). Use 1 so any responses show layer/dimension cards; increase for stricter anonymity. */
  private static readonly MIN_GROUP_SIZE = 1;

  /** Average scores over 100; (R) questions use reversed scoring (6 - raw). Optional demographic filters. ADMIN only. */
  async getAnalytics(demographicFilters?: Record<string, string>) {
    const empty = {
      totalRowsInDb: 0,
      overallIndex: 0,
      byLayer: [] as Array<{
        layerTitle: string;
        layerTitleAr?: string | null;
        layerLabel: string | null;
        averageScore: number;
        medianScore: number | null;
        responseCount: number;
        distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
        pctFavorable: number | null;
        pctNeutral: number | null;
        pctUnfavorable: number | null;
        trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
        benchmarkGap: number | null;
      }>,
      byDimension: [] as Array<{
        dimensionId: string;
        dimensionName: string;
        dimensionNameAr?: string | null;
        averageScore: number;
        medianScore: number | null;
        responseCount: number;
        layerLabel: string | null;
        sectionTitle: string | null;
        sectionTitleAr?: string | null;
        distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
        pctFavorable: number | null;
        pctNeutral: number | null;
        pctUnfavorable: number | null;
        trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
        benchmarkGap: number | null;
      }>,
      byQuestion: [] as Array<{
        questionId: string;
        label: string;
        labelAr?: string | null;
        layerLabel: string | null;
        sectionTitle: string;
        dimensionId: string | null;
        dimensionName: string | null;
        dimensionNameAr?: string | null;
        isReversed: boolean;
        averageScore: number;
        medianScore: number | null;
        responseCount: number;
        distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
        pctFavorable: number | null;
        pctNeutral: number | null;
        pctUnfavorable: number | null;
        trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
        benchmarkGap: number | null;
      }>,
      demographics: [] as Array<{
        questionId: string;
        label: string;
        labelAr?: string | null;
        options: Array<{ value: string; count: number | null }>;
        allOptions: string[];
      }>,
      totalResponses: 0,
      insufficientSample: false as boolean,
      correlations: [] as Array<{
        questionIdA: string;
        questionIdB: string;
        labelA: string;
        labelB: string;
        labelArA?: string | null;
        labelArB?: string | null;
        correlation: number;
        n: number;
        pValue: number | null;
      }>,
      responseActivity: { totalAllTime: 0, lastResponseAt: null as string | null, byWeek: [] as Array<{ week: string; count: number }> },
    };
    try {
    const allResponses = await this.prisma.surveyResponse.findMany({
      select: { id: true, answers: true, createdAt: true },
    });
    const sections = await this.prisma.surveySection.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { dimension: true },
        },
      },
    });
    const dimensions = await this.prisma.surveyDimension.findMany({
      orderBy: { order: 'asc' },
    });

    type QuestionMeta = {
      id: string;
      label: string;
      labelAr: string | null;
      sectionId: string;
      layerLabel: string | null;
      sectionTitle: string;
      sectionTitleAr: string | null;
      isReversed: boolean;
      dimensionId: string | null;
      dimensionName: string | null;
      dimensionNameAr: string | null;
    };
    const scaleQuestions = new Map<string, QuestionMeta>();
    const sectionById = new Map<string | null, { title: string; titleAr: string | null; layerLabel: string | null }>();

    for (const sec of sections) {
      sectionById.set(sec.id, { title: sec.title, titleAr: (sec as { titleAr?: string | null }).titleAr ?? null, layerLabel: sec.layerLabel });
      for (const q of sec.questions) {
        if ((q.type || '').toLowerCase() !== 'scale') continue;
        const label = q.label || '';
        const isReversed = label.endsWith(' (R)');
        const qExt = q as { labelAr?: string | null };
        const dim = q.dimension as { name?: string; nameAr?: string | null } | null;
        scaleQuestions.set(q.id, {
          id: q.id,
          label,
          labelAr: qExt.labelAr ?? null,
          sectionId: sec.id,
          layerLabel: sec.layerLabel,
          sectionTitle: sec.title,
          sectionTitleAr: (sec as { titleAr?: string | null }).titleAr ?? null,
          isReversed,
          dimensionId: q.dimensionId ?? null,
          dimensionName: dim?.name ?? null,
          dimensionNameAr: dim?.nameAr ?? null,
        });
      }
    }

    // Demographic section: first section titled "Demographic" or first section with non-scale questions
    const demographicSection = sections.find(
      (s) =>
        (s.title || '').toLowerCase() === 'demographic' ||
        (s.questions || []).some((q) => (q.type || '').toLowerCase() !== 'scale'),
    );
    const demographicQuestionsRaw = demographicSection
      ? (demographicSection.questions || [])
          .filter((q) => (q.type || '').toLowerCase() !== 'scale')
          .map((q) => ({
            id: q.id,
            label: q.label || q.id,
            labelAr: (q as { labelAr?: string | null }).labelAr ?? null,
            type: (q.type || '').toLowerCase(),
            optionsJson: q.options ?? null,
          }))
      : [];
    // Only show these demographics on the visual (filters, breakdown, charts)
    const allowedDemographicLabels = ['nationality', 'tenure', 'gender', 'age group', 'department'];
    const demographicQuestions = demographicQuestionsRaw.filter((q) =>
      allowedDemographicLabels.includes((q.label || '').toLowerCase().trim()),
    );

    // Scale questions by global order (so answers keyed by "0", "1", "2" can match first, second, third scale question)
    const scaleQuestionsByOrder: QuestionMeta[] = [];
    for (const sec of sections) {
      const qs = (sec.questions || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      for (const q of qs) {
        if ((q.type || '').toLowerCase() !== 'scale') continue;
        const meta = scaleQuestions.get(q.id);
        if (meta) scaleQuestionsByOrder.push(meta);
      }
    }

    // Filter responses by demographic filters (keep createdAt for trend)
    const totalRowsInDb = allResponses.length;
    const responses: Array<{ answers: string; createdAt: Date }> = [];
    for (const r of allResponses) {
      let answers: Record<string, string>;
      try {
        answers = JSON.parse(r.answers) as Record<string, string>;
      } catch {
        continue;
      }
      if (!answers || typeof answers !== 'object') continue;
      if (demographicFilters && Object.keys(demographicFilters).length > 0) {
        const match = Object.entries(demographicFilters).every(
          ([qId, val]) => {
            const answerVal = (answers[qId] || '').trim();
            const filterVal = (val || '').trim();
            if (filterVal === '(blank)' || filterVal === '') return !answerVal;
            return answerVal === filterVal;
          },
        );
        if (!match) continue;
      }
      responses.push({ answers: r.answers, createdAt: r.createdAt });
    }

    // Demographic counts (from filtered responses)
    const demographicCounts = new Map<string, Map<string, number>>();
    for (const q of demographicQuestions) {
      demographicCounts.set(q.id, new Map<string, number>());
    }
    for (const r of responses) {
      let answers: Record<string, string>;
      try {
        answers = JSON.parse(r.answers) as Record<string, string>;
      } catch {
        continue;
      }
      for (const q of demographicQuestions) {
        const val = (answers[q.id] || '').trim() || '(blank)';
        const m = demographicCounts.get(q.id)!;
        m.set(val, (m.get(val) || 0) + 1);
      }
    }
    const k = SurveyService.MIN_GROUP_SIZE;
    const companyProfile = await this.getCompanyProfile();
    const labelToCompanyKey: Record<string, keyof NonNullable<Awaited<ReturnType<typeof this.getCompanyProfile>>>> = {
      department: 'departments',
      tenure: 'tenureOptions',
      'age group': 'ageGroupOptions',
      gender: 'genderOptions',
      nationality: 'nationalityOptions',
    };
    const demographics = demographicQuestions.map((q) => {
      const countMap = demographicCounts.get(q.id)!;
      const rawOptions = Array.from(countMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
      const safeOptions: Array<{ value: string; count: number | null }> = [];
      let insufficientTotal = 0;
      for (const o of rawOptions) {
        if (o.count >= k) {
          safeOptions.push({ value: o.value, count: o.count });
        } else {
          insufficientTotal += o.count;
        }
      }
      if (insufficientTotal > 0) {
        safeOptions.push({
          value: 'Other (insufficient sample)',
          count: insufficientTotal >= k ? insufficientTotal : null,
        });
      }
      let allOptionsFromSchema: string[] = [];
      if (q.optionsJson) {
        try {
          const parsed =
            typeof q.optionsJson === 'string'
              ? (JSON.parse(q.optionsJson) as unknown)
              : q.optionsJson;
          if (Array.isArray(parsed)) {
            allOptionsFromSchema = parsed
              .map((x) => (typeof x === 'object' && x != null && 'value' in x ? String((x as { value: unknown }).value) : String(x)))
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } catch {
          // leave empty
        }
      }
      const labelKey = (q.label || '').toLowerCase().trim();
      const companyKey = labelToCompanyKey[labelKey];
      const companyOpts = companyProfile && companyKey ? (companyProfile[companyKey] as string[] | undefined) : undefined;
      const fromCompany = Array.isArray(companyOpts) ? companyOpts.filter(Boolean) : [];
      const fromData = [...new Set(rawOptions.map((o) => o.value))];
      const allOptions =
        fromCompany.length > 0
          ? [...new Set([...fromCompany, ...fromData])]
          : allOptionsFromSchema.length > 0
            ? allOptionsFromSchema
            : fromData;
      return {
        questionId: q.id,
        label: q.label,
        labelAr: q.labelAr ?? undefined,
        options: safeOptions,
        allOptions,
      };
    });

    if (responses.length < k) {
      return {
        ...empty,
        totalRowsInDb,
        totalResponses: responses.length,
        insufficientSample: true,
        demographics,
      };
    }

    const questionSums = new Map<string, { sum: number; count: number }>();
    const questionScoreArrays = new Map<string, number[]>();
    const questionRawCounts = new Map<string, [number, number, number, number, number]>();
    const layerScoreArrays = new Map<string, number[]>();
    const layerRawCounts = new Map<string, [number, number, number, number, number]>();
    const dimensionScoreArrays = new Map<string, number[]>();
    const dimensionRawCounts = new Map<string, [number, number, number, number, number]>();

    for (const r of responses) {
      let answers: Record<string, string>;
      try {
        answers = JSON.parse(r.answers) as Record<string, string>;
      } catch {
        continue;
      }
      if (!answers || typeof answers !== 'object') continue;
      for (const [qId, rawVal] of Object.entries(answers)) {
        let meta = scaleQuestions.get(qId);
        if (!meta) {
          const orderIdx = parseInt(qId, 10);
          if (Number.isInteger(orderIdx) && orderIdx >= 0 && orderIdx < scaleQuestionsByOrder.length) {
            meta = scaleQuestionsByOrder[orderIdx]!;
          }
        }
        if (!meta) continue;
        const raw = parseInt(rawVal, 10);
        if (Number.isNaN(raw) || raw < 1 || raw > 5) continue;
        const score100 = meta.isReversed ? (5 - raw) * 25 : (raw - 1) * 25;
        const id = meta.id;
        const prev = questionSums.get(id) ?? { sum: 0, count: 0 };
        questionSums.set(id, { sum: prev.sum + score100, count: prev.count + 1 });
        if (!questionScoreArrays.has(id)) questionScoreArrays.set(id, []);
        questionScoreArrays.get(id)!.push(score100);
        const counts = questionRawCounts.get(id) ?? [0, 0, 0, 0, 0];
        counts[raw - 1] += 1;
        questionRawCounts.set(id, counts);
        // Aggregate by layer (section title) and dimension (use meta.id for consistency)
        const layerKey = meta.sectionTitle;
        if (!layerScoreArrays.has(layerKey)) {
          layerScoreArrays.set(layerKey, []);
          layerRawCounts.set(layerKey, [0, 0, 0, 0, 0]);
        }
        layerScoreArrays.get(layerKey)!.push(score100);
        const layerCounts = layerRawCounts.get(layerKey)!;
        layerCounts[raw - 1] += 1;
        const dimKey = meta.dimensionId ?? null;
        if (dimKey) {
          if (!dimensionScoreArrays.has(dimKey)) {
            dimensionScoreArrays.set(dimKey, []);
            dimensionRawCounts.set(dimKey, [0, 0, 0, 0, 0]);
          }
          dimensionScoreArrays.get(dimKey)!.push(score100);
          const dimCounts = dimensionRawCounts.get(dimKey)!;
          dimCounts[raw - 1] += 1;
        }
      }
    }

    /** Median of 0–100 normalized scores (higher = better). */
    const medianScores = (arr: number[]): number | null => {
      if (arr.length === 0) return null;
      const s = [...arr].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      const v = s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
      return Math.round(v * 10) / 10;
    };

    /** Trend: previous vs current period (by month). */
    const periodKey = (d: Date) => d.toISOString().slice(0, 7);
    const periodQuestionMeans = new Map<string, Map<string, { sum: number; count: number }>>();
    for (const r of responses) {
      const key = periodKey(r.createdAt);
      if (!periodQuestionMeans.has(key)) periodQuestionMeans.set(key, new Map());
      const perQ = periodQuestionMeans.get(key)!;
      let answers: Record<string, string>;
      try {
        answers = JSON.parse(r.answers) as Record<string, string>;
      } catch {
        continue;
      }
      if (!answers || typeof answers !== 'object') continue;
      for (const [qId, rawVal] of Object.entries(answers)) {
        const meta = scaleQuestions.get(qId);
        if (!meta) continue;
        const raw = parseInt(rawVal, 10);
        if (Number.isNaN(raw) || raw < 1 || raw > 5) continue;
        const score100 = meta.isReversed ? (5 - raw) * 25 : (raw - 1) * 25;
        const prev = perQ.get(qId) ?? { sum: 0, count: 0 };
        perQ.set(qId, { sum: prev.sum + score100, count: prev.count + 1 });
      }
    }
    const sortedPeriods = Array.from(periodQuestionMeans.keys()).sort((a, b) => a.localeCompare(b));
    const lastTwoPeriods = sortedPeriods.slice(-2);
    const trendByQuestion = new Map<string, { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number }>();
    if (lastTwoPeriods.length === 2) {
      const [prevPeriod, currPeriod] = lastTwoPeriods;
      const prevMap = periodQuestionMeans.get(prevPeriod)!;
      const currMap = periodQuestionMeans.get(currPeriod)!;
      for (const qId of scaleQuestions.keys()) {
        const prev = prevMap.get(qId);
        const curr = currMap.get(qId);
        if (!prev || prev.count === 0 || !curr || curr.count === 0) continue;
        const previousValue = Math.round((prev.sum / prev.count) * 10) / 10;
        const currentValue = Math.round((curr.sum / curr.count) * 10) / 10;
        trendByQuestion.set(qId, {
          previousPeriod: prevPeriod,
          currentPeriod: currPeriod,
          previousValue,
          currentValue,
          change: Math.round((currentValue - previousValue) * 10) / 10,
        });
      }
    }
    // Trend by layer (section title) and dimension: aggregate question sums/counts per period
    const sectionToQIds = new Map<string, string[]>();
    const dimensionToQIds = new Map<string, string[]>();
    for (const [qId, meta] of scaleQuestions) {
      const st = meta.sectionTitle;
      if (!sectionToQIds.has(st)) sectionToQIds.set(st, []);
      sectionToQIds.get(st)!.push(qId);
      const dimId = meta.dimensionId;
      if (dimId) {
        if (!dimensionToQIds.has(dimId)) dimensionToQIds.set(dimId, []);
        dimensionToQIds.get(dimId)!.push(qId);
      }
    }
    const trendByLayer = new Map<string, { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number }>();
    const trendByDimension = new Map<string, { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number }>();
    if (lastTwoPeriods.length === 2) {
      const [prevPeriod, currPeriod] = lastTwoPeriods;
      const prevMap = periodQuestionMeans.get(prevPeriod)!;
      const currMap = periodQuestionMeans.get(currPeriod)!;
      for (const [sectionTitle, qIds] of sectionToQIds) {
        let prevSum = 0, prevCount = 0, currSum = 0, currCount = 0;
        for (const qId of qIds) {
          const p = prevMap.get(qId); if (p) { prevSum += p.sum; prevCount += p.count; }
          const c = currMap.get(qId); if (c) { currSum += c.sum; currCount += c.count; }
        }
        if (prevCount > 0 && currCount > 0) {
          trendByLayer.set(sectionTitle, {
            previousPeriod: prevPeriod,
            currentPeriod: currPeriod,
            previousValue: Math.round((prevSum / prevCount) * 10) / 10,
            currentValue: Math.round((currSum / currCount) * 10) / 10,
            change: Math.round((currSum / currCount - prevSum / prevCount) * 10) / 10,
          });
        }
      }
      for (const [dimId, qIds] of dimensionToQIds) {
        let prevSum = 0, prevCount = 0, currSum = 0, currCount = 0;
        for (const qId of qIds) {
          const p = prevMap.get(qId); if (p) { prevSum += p.sum; prevCount += p.count; }
          const c = currMap.get(qId); if (c) { currSum += c.sum; currCount += c.count; }
        }
        if (prevCount > 0 && currCount > 0) {
          trendByDimension.set(dimId, {
            previousPeriod: prevPeriod,
            currentPeriod: currPeriod,
            previousValue: Math.round((prevSum / prevCount) * 10) / 10,
            currentValue: Math.round((currSum / currCount) * 10) / 10,
            change: Math.round((currSum / currCount - prevSum / prevCount) * 10) / 10,
          });
        }
      }
    }

    const byQuestion: Array<{
      questionId: string;
      label: string;
      labelAr?: string | null;
      layerLabel: string | null;
      sectionTitle: string;
      dimensionId: string | null;
      dimensionName: string | null;
      dimensionNameAr?: string | null;
      isReversed: boolean;
      averageScore: number;
      medianScore: number | null;
      responseCount: number;
      distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
      pctFavorable: number | null;
      pctNeutral: number | null;
      pctUnfavorable: number | null;
      trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
      benchmarkGap: number | null;
    }> = [];

    for (const [qId, meta] of scaleQuestions) {
      const { sum, count } = questionSums.get(qId) ?? { sum: 0, count: 0 };
      const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      const scores = questionScoreArrays.get(qId) ?? [];
      const medianScore = medianScores(scores);
      const rawCounts = questionRawCounts.get(qId) ?? [0, 0, 0, 0, 0];
      const distribution = { 1: rawCounts[0]!, 2: rawCounts[1]!, 3: rawCounts[2]!, 4: rawCounts[3]!, 5: rawCounts[4]! };
      // Favorable = normalized 50–100, neutral = 25–50, unfavorable = 0–25 (higher = better)
      let pctFavorable: number | null = null;
      let pctNeutral: number | null = null;
      let pctUnfavorable: number | null = null;
      if (scores.length > 0) {
        const fav = scores.filter((s) => s >= 50).length;
        const neu = scores.filter((s) => s >= 25 && s < 50).length;
        const unf = scores.filter((s) => s < 25).length;
        pctFavorable = Math.round((fav / scores.length) * 1000) / 10;
        pctNeutral = Math.round((neu / scores.length) * 1000) / 10;
        pctUnfavorable = Math.round((unf / scores.length) * 1000) / 10;
      }
      const trend = trendByQuestion.get(qId) ?? null;
      byQuestion.push({
        questionId: qId,
        label: meta.label,
        labelAr: meta.labelAr || undefined,
        layerLabel: meta.layerLabel,
        sectionTitle: meta.sectionTitle,
        dimensionId: meta.dimensionId ?? null,
        dimensionName: meta.dimensionName ?? null,
        dimensionNameAr: meta.dimensionNameAr ?? undefined,
        isReversed: meta.isReversed,
        averageScore,
        medianScore,
        responseCount: count,
        distribution,
        pctFavorable,
        pctNeutral,
        pctUnfavorable,
        trend,
        benchmarkGap: null,
      });
    }

    byQuestion.sort((a, b) => {
      const secA = sectionById.get(scaleQuestions.get(a.questionId)?.sectionId ?? '')?.layerLabel ?? '';
      const secB = sectionById.get(scaleQuestions.get(b.questionId)?.sectionId ?? '')?.layerLabel ?? '';
      if (secA !== secB) return secA.localeCompare(secB);
      return a.label.localeCompare(b.label);
    });

    const layerSums = new Map<string, { sum: number; count: number }>();
    for (const q of byQuestion) {
      const key = q.sectionTitle;
      const prev = layerSums.get(key) ?? { sum: 0, count: 0 };
      if (q.responseCount > 0) {
        layerSums.set(key, { sum: prev.sum + q.averageScore, count: prev.count + 1 });
      }
    }

    const byLayer: Array<{
      layerTitle: string;
      layerTitleAr?: string | null;
      layerLabel: string | null;
      averageScore: number;
      medianScore: number | null;
      responseCount: number;
      distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
      pctFavorable: number | null;
      pctNeutral: number | null;
      pctUnfavorable: number | null;
      trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
      benchmarkGap: number | null;
    }> = [];
    for (const sec of sections) {
      const { sum, count } = layerSums.get(sec.title) ?? { sum: 0, count: 0 };
      const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      const scores = layerScoreArrays.get(sec.title) ?? [];
      const medianScore = medianScores(scores);
      const rawCounts = layerRawCounts.get(sec.title) ?? [0, 0, 0, 0, 0];
      const distribution = { 1: rawCounts[0]!, 2: rawCounts[1]!, 3: rawCounts[2]!, 4: rawCounts[3]!, 5: rawCounts[4]! };
      let pctFavorable: number | null = null;
      let pctNeutral: number | null = null;
      let pctUnfavorable: number | null = null;
      if (scores.length > 0) {
        pctFavorable = Math.round((scores.filter((s) => s >= 50).length / scores.length) * 1000) / 10;
        pctNeutral = Math.round((scores.filter((s) => s >= 25 && s < 50).length / scores.length) * 1000) / 10;
        pctUnfavorable = Math.round((scores.filter((s) => s < 25).length / scores.length) * 1000) / 10;
      }
      const secExt = sec as { titleAr?: string | null };
      byLayer.push({
        layerTitle: sec.title,
        layerTitleAr: secExt.titleAr ?? undefined,
        layerLabel: sec.layerLabel,
        averageScore,
        medianScore,
        responseCount: scores.length,
        distribution,
        pctFavorable,
        pctNeutral,
        pctUnfavorable,
        trend: trendByLayer.get(sec.title) ?? null,
        benchmarkGap: null,
      });
    }

    const dimensionSums = new Map<string, { sum: number; count: number }>();
    for (const q of byQuestion) {
      const meta = scaleQuestions.get(q.questionId);
      const dimId = meta?.dimensionId;
      if (!dimId) continue;
      const prev = dimensionSums.get(dimId) ?? { sum: 0, count: 0 };
      if (q.responseCount > 0) {
        dimensionSums.set(dimId, {
          sum: prev.sum + q.averageScore * q.responseCount,
          count: prev.count + q.responseCount,
        });
      }
    }
    // Map each dimension to the section(s) it belongs to (via its questions); use first section by order as "layer"
    const dimensionSectionIds = new Map<string, Set<string>>();
    for (const [, meta] of scaleQuestions) {
      const dimId = meta.dimensionId;
      if (!dimId || !meta.sectionId) continue;
      if (!dimensionSectionIds.has(dimId)) dimensionSectionIds.set(dimId, new Set());
      dimensionSectionIds.get(dimId)!.add(meta.sectionId);
    }
    const sectionOrderById = new Map(sections.map((s) => [s.id, s.order]));
    const byDimension: Array<{
      dimensionId: string;
      dimensionName: string;
      dimensionNameAr?: string | null;
      averageScore: number;
      medianScore: number | null;
      responseCount: number;
      layerLabel: string | null;
      sectionTitle: string | null;
      sectionTitleAr?: string | null;
      distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
      pctFavorable: number | null;
      pctNeutral: number | null;
      pctUnfavorable: number | null;
      trend: { previousPeriod: string; currentPeriod: string; previousValue: number; currentValue: number; change: number } | null;
      benchmarkGap: number | null;
    }> = [];
    for (const dim of dimensions) {
      const { sum, count } = dimensionSums.get(dim.id) ?? { sum: 0, count: 0 };
      const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      const scores = dimensionScoreArrays.get(dim.id) ?? [];
      const medianScore = medianScores(scores);
      const rawCounts = dimensionRawCounts.get(dim.id) ?? [0, 0, 0, 0, 0];
      const distribution = { 1: rawCounts[0]!, 2: rawCounts[1]!, 3: rawCounts[2]!, 4: rawCounts[3]!, 5: rawCounts[4]! };
      let pctFavorable: number | null = null;
      let pctNeutral: number | null = null;
      let pctUnfavorable: number | null = null;
      if (scores.length > 0) {
        pctFavorable = Math.round((scores.filter((s) => s >= 50).length / scores.length) * 1000) / 10;
        pctNeutral = Math.round((scores.filter((s) => s >= 25 && s < 50).length / scores.length) * 1000) / 10;
        pctUnfavorable = Math.round((scores.filter((s) => s < 25).length / scores.length) * 1000) / 10;
      }
      let layerLabel: string | null = null;
      let sectionTitle: string | null = null;
      const secIds = dimensionSectionIds.get(dim.id);
      if (secIds && secIds.size > 0) {
        const firstSecId = Array.from(secIds).sort(
          (a, b) => Number(sectionOrderById.get(a)) - Number(sectionOrderById.get(b)),
        )[0];
        const sec = sectionById.get(firstSecId);
        if (sec) {
          layerLabel = sec.layerLabel;
          sectionTitle = sec.title;
        }
      }
      const dimExt = dim as { nameAr?: string | null };
      const sec = secIds && secIds.size > 0 ? sectionById.get(Array.from(secIds).sort(
        (a, b) => Number(sectionOrderById.get(a)) - Number(sectionOrderById.get(b)),
      )[0]) : null;
      byDimension.push({
        dimensionId: dim.id,
        dimensionName: dim.name,
        dimensionNameAr: dimExt.nameAr ?? undefined,
        averageScore,
        medianScore,
        responseCount: scores.length,
        layerLabel,
        sectionTitle,
        sectionTitleAr: sec?.titleAr ?? undefined,
        distribution,
        pctFavorable,
        pctNeutral,
        pctUnfavorable,
        trend: trendByDimension.get(dim.id) ?? null,
        benchmarkGap: null,
      });
    }

    let totalSum = 0;
    let totalCount = 0;
    for (const q of byQuestion) {
      if (q.responseCount > 0) {
        totalSum += q.averageScore * q.responseCount;
        totalCount += q.responseCount;
      }
    }
    const overallIndex = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 0;

    // Pairwise Pearson correlation between scale questions (raw 1–5, same response)
    const scaleIds = Array.from(scaleQuestions.keys());
    const correlations: Array<{
      questionIdA: string;
      questionIdB: string;
      labelA: string;
      labelB: string;
      labelArA?: string | null;
      labelArB?: string | null;
      correlation: number;
      n: number;
      pValue: number | null;
    }> = [];
    for (let i = 0; i < scaleIds.length; i++) {
      for (let j = i + 1; j < scaleIds.length; j++) {
        const idA = scaleIds[i];
        const idB = scaleIds[j];
        const a: number[] = [];
        const b: number[] = [];
        for (const r of responses) {
          let answers: Record<string, string>;
          try {
            answers = JSON.parse(r.answers) as Record<string, string>;
          } catch {
            continue;
          }
          const vA = parseInt(answers[idA], 10);
          const vB = parseInt(answers[idB], 10);
          if (!Number.isNaN(vA) && vA >= 1 && vA <= 5 && !Number.isNaN(vB) && vB >= 1 && vB <= 5) {
            a.push(vA);
            b.push(vB);
          }
        }
        if (a.length < 2) continue;
        const r = SurveyService.pearson(a, b);
        if (Number.isFinite(r)) {
          const metaA = scaleQuestions.get(idA)!;
          const metaB = scaleQuestions.get(idB)!;
          correlations.push({
            questionIdA: idA,
            questionIdB: idB,
            labelA: metaA.label,
            labelB: metaB.label,
            labelArA: metaA.labelAr || undefined,
            labelArB: metaB.labelAr || undefined,
            correlation: r,
            n: a.length,
            pValue: SurveyService.correlationPValue(r, a.length),
          });
        }
      }
    }

    const responseActivity = (() => {
      if (allResponses.length === 0) {
        return { totalAllTime: 0, lastResponseAt: null as string | null, byWeek: [] as Array<{ week: string; count: number }> };
      }
      const dates = allResponses.map((r) => new Date(r.createdAt));
      const last = new Date(Math.max(...dates.map((d) => d.getTime())));
      const weekKey = (d: Date) => {
        const mon = new Date(d);
        mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
        return mon.toISOString().slice(0, 10);
      };
      const byWeekMap = new Map<string, number>();
      dates.forEach((d) => {
        const k = weekKey(d);
        byWeekMap.set(k, (byWeekMap.get(k) || 0) + 1);
      });
      const byWeek = Array.from(byWeekMap.entries())
        .map(([week, count]) => ({ week, count }))
        .sort((a, b) => a.week.localeCompare(b.week));
      return { totalAllTime: allResponses.length, lastResponseAt: last.toISOString(), byWeek };
    })();

    return {
      totalRowsInDb,
      overallIndex,
      byLayer,
      byDimension,
      byQuestion,
      demographics,
      totalResponses: responses.length,
      insufficientSample: false,
      correlations,
      responseActivity,
    };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('getAnalytics error', err);
      return empty;
    }
  }

  /** Insights engine: qualitative insights from metrics only. No causality; no mention of hidden groups. */
  async getInsights(
    demographicFilters?: Record<string, string>,
    scope?: { layerTitle?: string; dimensionId?: string; questionId?: string },
  ): Promise<{
    headline: string;
    what_we_see: string[];
    why_it_matters: string;
    segments_to_watch: Array<{ segment: string; n: number }>;
    confidence: 'low' | 'med' | 'high';
  }> {
    const k = SurveyService.MIN_GROUP_SIZE;
    const data = await this.getAnalytics(demographicFilters);
    const emptyInsight = {
      headline: 'Insufficient sample for reliable insights.',
      what_we_see: ['Not enough responses in this scope to generate insights while protecting anonymity.'],
      why_it_matters: 'Consider broadening the scope or waiting for more responses before interpreting patterns.',
      segments_to_watch: [] as Array<{ segment: string; n: number }>,
      confidence: 'low' as const,
    };
    if (data.insufficientSample || (data.totalResponses ?? 0) < k) {
      return emptyInsight;
    }
    const n = data.totalResponses ?? 0;
    const byLayer = data.byLayer ?? [];
    const byDimension = data.byDimension ?? [];
    const byQuestion = data.byQuestion ?? [];
    const correlations = data.correlations ?? [];
    const demographics = data.demographics ?? [];

    type Row = { averageScore: number; trend?: { change: number } | null; pctFavorable?: number | null; pctNeutral?: number | null; pctUnfavorable?: number | null };
    const distributionShape = (r: Row): 'polarization' | 'consensus' | 'mixed' => {
      const fav = r.pctFavorable ?? 0;
      const neu = r.pctNeutral ?? 0;
      const unf = r.pctUnfavorable ?? 0;
      if (fav > 25 && unf > 25) return 'polarization';
      if (neu >= 45 || fav >= 60 || unf >= 60) return 'consensus';
      return 'mixed';
    };
    const confidenceFromN = (sampleSize: number, effectSize?: number): 'low' | 'med' | 'high' => {
      const absEffect = effectSize != null ? Math.abs(effectSize) : 0;
      if (sampleSize >= 30 && absEffect >= 2) return 'high';
      if (sampleSize >= 15) return 'med';
      return 'low';
    };

    const segments_to_watch: Array<{ segment: string; n: number }> = [];
    for (const d of demographics) {
      const label = (d as { label?: string }).label ?? d.questionId;
      for (const opt of d.options ?? []) {
        const count = opt.count;
        if (count != null && count >= k) {
          segments_to_watch.push({
            segment: `${label}: ${opt.value === 'Other (insufficient sample)' ? 'Other' : opt.value}`,
            n: count,
          });
        }
      }
    }

    if (scope?.questionId) {
      const q = byQuestion.find((x) => x.questionId === scope.questionId);
      if (!q) return emptyInsight;
      const shape = distributionShape(q);
      const trendStr = q.trend ? ` (trend: ${q.trend.change >= 0 ? '+' : ''}${q.trend.change} vs prior period)` : '';
      const headline = `Score is ${q.averageScore} with ${shape} in responses${trendStr}.`;
      const bullets: string[] = [
        `Mean score ${q.averageScore} (0–100), n=${q.responseCount}.`,
      ];
      if (q.trend) bullets.push(`Trend: ${q.trend.previousPeriod} ${q.trend.previousValue} → ${q.trend.currentPeriod} ${q.trend.currentValue} (${q.trend.change >= 0 ? '+' : ''}${q.trend.change}).`);
      if (q.medianScore != null) bullets.push(`Median ${q.medianScore}; distribution shows ${shape}.`);
      if (q.pctFavorable != null && q.pctUnfavorable != null) bullets.push(`${q.pctFavorable}% favorable, ${q.pctNeutral ?? 0}% neutral, ${q.pctUnfavorable}% unfavorable.`);
      const why = q.averageScore >= 60
        ? 'Scores in this range suggest a solid base; focus on sustaining and spreading good practice.'
        : q.averageScore >= 40
          ? 'Room to improve; targeted actions on this dimension can move the needle.'
          : 'This area needs attention; consider it a priority for clarity and support.';
      return {
        headline,
        what_we_see: bullets.slice(0, 4),
        why_it_matters: why,
        segments_to_watch,
        confidence: confidenceFromN(q.responseCount, q.trend?.change),
      };
    }

    if (scope?.dimensionId) {
      const dim = byDimension.find((x) => x.dimensionId === scope.dimensionId);
      if (!dim) return emptyInsight;
      const shape = distributionShape(dim);
      const trendStr = dim.trend ? ` (trend: ${dim.trend.change >= 0 ? '+' : ''}${dim.trend.change})` : '';
      const headline = `Dimension score ${dim.averageScore} with ${shape}${trendStr}.`;
      const bullets: string[] = [
        `Dimension average ${dim.averageScore}, n=${dim.responseCount}.`,
      ];
      if (dim.trend) bullets.push(`Trend: ${dim.trend.currentPeriod} ${dim.trend.currentValue} (${dim.trend.change >= 0 ? '+' : ''}${dim.trend.change} vs ${dim.trend.previousPeriod}).`);
      bullets.push(`Distribution shape: ${shape}.`);
      const why = dim.averageScore >= 60
        ? 'Strong dimension performance; reinforce what works and share across teams.'
        : dim.averageScore >= 40
          ? 'Moderate scores indicate opportunity; align actions with dimension focus.'
          : 'Lower scores here warrant focused effort and resource allocation.';
      return {
        headline,
        what_we_see: bullets.slice(0, 4),
        why_it_matters: why,
        segments_to_watch,
        confidence: confidenceFromN(dim.responseCount, dim.trend?.change),
      };
    }

    if (scope?.layerTitle) {
      const layer = byLayer.find((x) => x.layerTitle === scope.layerTitle);
      if (!layer) return emptyInsight;
      const shape = distributionShape(layer);
      const trendStr = layer.trend ? ` (trend: ${layer.trend.change >= 0 ? '+' : ''}${layer.trend.change})` : '';
      const headline = `Layer score ${layer.averageScore} with ${shape}${trendStr}.`;
      const bullets: string[] = [
        `Layer average ${layer.averageScore}, n=${layer.responseCount}.`,
      ];
      if (layer.trend) bullets.push(`Trend: ${layer.trend.currentPeriod} ${layer.trend.currentValue} (${layer.trend.change >= 0 ? '+' : ''}${layer.trend.change} vs ${layer.trend.previousPeriod}).`);
      bullets.push(`Distribution: ${shape}.`);
      const topCorr = correlations
        .filter((c) => c.n >= k)
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0];
      if (topCorr) {
        const dir = topCorr.correlation > 0 ? 'move together' : 'move in opposite directions';
        bullets.push(`Strongest co-movement: two items ${dir} (r=${typeof topCorr.correlation === 'number' ? topCorr.correlation.toFixed(2) : topCorr.correlation}).`);
      }
      const why = layer.averageScore >= 60
        ? 'Layer performance is solid; use it as a foundation and identify pockets to lift.'
        : layer.averageScore >= 40
          ? 'Moderate layer results; prioritize dimensions with the lowest scores.'
          : 'This layer needs attention; focus on clarity and capability building.';
      return {
        headline,
        what_we_see: bullets.slice(0, 4),
        why_it_matters: why,
        segments_to_watch,
        confidence: confidenceFromN(layer.responseCount, layer.trend?.change),
      };
    }

    const overall = data.overallIndex ?? 0;
    const trendLayer = byLayer.find((l) => (l as Row).trend);
    const headline = `Overall index ${overall} across ${byLayer.length} layers (n=${n}).`;
    const bullets: string[] = [
      `Overall score ${overall} (0–100), based on ${n} responses.`,
    ];
    const t = trendLayer?.trend as { currentPeriod?: string; change: number } | undefined;
    if (t) bullets.push(`Example trend: ${t.currentPeriod ?? 'current'} (${t.change >= 0 ? '+' : ''}${t.change} vs prior period).`);
    if (byLayer.length > 0) bullets.push(`Scores by layer range from ${Math.min(...byLayer.map((l) => l.averageScore))} to ${Math.max(...byLayer.map((l) => l.averageScore))}.`);
    const topCorr = correlations.filter((c) => c.n >= k).sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0];
    if (topCorr) bullets.push(`Some items show co-movement (strongest r≈${typeof topCorr.correlation === 'number' ? topCorr.correlation.toFixed(2) : topCorr.correlation}).`);
    const why = overall >= 60
      ? 'Strong overall picture; sustain and spread best practices.'
      : overall >= 40
        ? 'Mixed picture; focus on the lowest layers and dimensions first.'
        : 'Overall scores indicate a need for broad focus on fundamentals.';
    return {
      headline,
      what_we_see: bullets.slice(0, 4),
      why_it_matters: why,
      segments_to_watch,
      confidence: confidenceFromN(n),
    };
  }

  /** Recommendations engine: derived from insights, same scope. */
  async getRecommendations(
    demographicFilters?: Record<string, string>,
    scope?: { layerTitle?: string; dimensionId?: string; questionId?: string },
  ): Promise<{
    recommended_actions: Array<{
      title: string;
      rationale: string;
      scope_link: { layer_id: string | null; dimension_id: string | null; question_id: string | null };
      owner_suggestion: 'HR' | 'Leadership' | 'Function Head';
      effort: 'S' | 'M' | 'L';
      impact: 'S' | 'M' | 'L';
      success_metrics: string;
      timeframe: 30 | 60 | 90;
    }>;
    quick_wins: Array<{
      title: string;
      rationale: string;
      scope_link: { layer_id: string | null; dimension_id: string | null; question_id: string | null };
      owner_suggestion: 'HR' | 'Leadership' | 'Function Head';
      effort: 'S' | 'M' | 'L';
      impact: 'S' | 'M' | 'L';
      success_metrics: string;
      timeframe: 30 | 60 | 90;
    }>;
    strategic_initiatives: Array<{
      title: string;
      rationale: string;
      scope_link: { layer_id: string | null; dimension_id: string | null; question_id: string | null };
      owner_suggestion: 'HR' | 'Leadership' | 'Function Head';
      effort: 'S' | 'M' | 'L';
      impact: 'S' | 'M' | 'L';
      success_metrics: string;
      timeframe: 30 | 60 | 90;
    }>;
  }> {
    const insight = await this.getInsights(demographicFilters, scope);
    const scopeLink = {
      layer_id: scope?.layerTitle ?? null,
      dimension_id: scope?.dimensionId ?? null,
      question_id: scope?.questionId ?? null,
    };
    const emptyAction = {
      title: 'No action recommended',
      rationale: 'Insufficient sample for this scope; recommendations will appear when more data is available.',
      scope_link: scopeLink,
      owner_suggestion: 'Leadership' as const,
      effort: 'S' as const,
      impact: 'S' as const,
      success_metrics: 'Response count and score at next pulse.',
      timeframe: 90 as const,
    };
    if (insight.confidence === 'low' && insight.what_we_see.length > 0 && insight.what_we_see[0]?.includes('Insufficient sample')) {
      return {
        recommended_actions: [emptyAction],
        quick_wins: [],
        strategic_initiatives: [],
      };
    }
    const ref = (which: string) => `Addresses the insight: "${which}".`;
    const actions: Array<{
      title: string;
      rationale: string;
      scope_link: typeof scopeLink;
      owner_suggestion: 'HR' | 'Leadership' | 'Function Head';
      effort: 'S' | 'M' | 'L';
      impact: 'S' | 'M' | 'L';
      success_metrics: string;
      timeframe: 30 | 60 | 90;
    }> = [];
    const headline = insight.headline;
    const bullets = insight.what_we_see ?? [];
    const why = insight.why_it_matters ?? '';

    if (bullets.length > 0) {
      actions.push({
        title: 'Share and discuss findings with the team',
        rationale: ref(headline),
        scope_link: scopeLink,
        owner_suggestion: 'Leadership',
        effort: 'S',
        impact: 'M',
        success_metrics: 'Stakeholder alignment; follow-up pulse score change.',
        timeframe: 30,
      });
    }
    if (bullets.some((b) => b.includes('Trend') && b.includes('+'))) {
      actions.push({
        title: 'Reinforce what is driving improvement',
        rationale: ref(bullets.find((b) => b.includes('Trend') && b.includes('+')) ?? headline),
        scope_link: scopeLink,
        owner_suggestion: 'Function Head',
        effort: 'S',
        impact: 'M',
        success_metrics: 'Sustain or improve trend in next benchmark.',
        timeframe: 60,
      });
    }
    if (bullets.some((b) => b.includes('polarization') || b.includes('consensus'))) {
      const shapeBullet = bullets.find((b) => b.includes('polarization') || b.includes('consensus'));
      actions.push({
        title: shapeBullet?.includes('polarization')
          ? 'Understand drivers of differing views'
          : 'Build on consensus and spread practice',
        rationale: ref(shapeBullet ?? 'Distribution shape.'),
        scope_link: scopeLink,
        owner_suggestion: 'HR',
        effort: 'M',
        impact: shapeBullet?.includes('polarization') ? 'L' : 'M',
        success_metrics: 'Shift in distribution (e.g. more favorable %) at next pulse.',
        timeframe: 60,
      });
    }
    actions.push({
      title: 'Align actions to why it matters',
      rationale: ref(why),
      scope_link: scopeLink,
      owner_suggestion: 'Leadership',
      effort: 'M',
      impact: 'L',
      success_metrics: 'Score and engagement in this scope at next survey.',
      timeframe: 90,
    });
    if (bullets.some((b) => b.includes('co-movement') || b.includes('Correlation'))) {
      actions.push({
        title: 'Prioritize linked areas together',
        rationale: ref(bullets.find((b) => b.includes('co-movement') || b.includes('Correlation')) ?? headline),
        scope_link: scopeLink,
        owner_suggestion: 'Function Head',
        effort: 'M',
        impact: 'M',
        success_metrics: 'Improvement in correlated dimensions next benchmark.',
        timeframe: 90,
      });
    }
    if (insight.segments_to_watch && insight.segments_to_watch.length > 0) {
      actions.push({
        title: 'Review segments to watch',
        rationale: `Addresses the insight: segments with sufficient sample (e.g. ${insight.segments_to_watch[0]?.segment ?? 'identified'}); use for targeted follow-up.`,
        scope_link: scopeLink,
        owner_suggestion: 'HR',
        effort: 'S',
        impact: 'M',
        success_metrics: 'Segment-level score and n at next pulse.',
        timeframe: 60,
      });
    }
    const recommended = actions.slice(0, 6);
    while (recommended.length < 3) {
      recommended.push({
        title: 'Monitor this scope at next pulse',
        rationale: ref(headline),
        scope_link: scopeLink,
        owner_suggestion: 'Leadership',
        effort: 'S',
        impact: 'S',
        success_metrics: 'Score and n at next survey.',
        timeframe: 60,
      });
    }
    const quickCandidates = recommended.filter((a) => a.timeframe === 30 && a.effort === 'S');
    const strategicCandidates = recommended.filter((a) => a.timeframe >= 60 && (a.effort === 'L' || a.effort === 'M'));
    const quick_wins: typeof recommended = [];
    for (let i = 0; i < 2; i++) {
      quick_wins.push(quickCandidates[i] ?? strategicCandidates[i] ?? recommended[i] ?? recommended[0]!);
    }
    const strategic_initiatives: typeof recommended = [];
    for (let i = 0; i < 2; i++) {
      strategic_initiatives.push(strategicCandidates[i] ?? recommended.filter((a) => !quick_wins.includes(a))[i] ?? recommended[i + 2] ?? recommended[0]!);
    }
    return {
      recommended_actions: recommended,
      quick_wins,
      strategic_initiatives,
    };
  }

  /** Analytics grouped by time period (month). For charts: previous vs current comparison. */
  async getAnalyticsByPeriod(): Promise<{
    byPeriod: Array<{
      period: string;
      overallIndex: number;
      totalResponses: number;
      byLayer: Array<{ layerTitle: string; layerLabel: string | null; averageScore: number }>;
      byDimension: Array<{ dimensionName: string; averageScore: number }>;
    }>;
  }> {
    const result: Array<{
      period: string;
      overallIndex: number;
      totalResponses: number;
      byLayer: Array<{ layerTitle: string; layerLabel: string | null; averageScore: number }>;
      byDimension: Array<{ dimensionName: string; averageScore: number }>;
    }> = [];
    try {
      const allResponses = await this.prisma.surveyResponse.findMany({
        select: { id: true, answers: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      const sections = await this.prisma.surveySection.findMany({
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { dimension: true },
          },
        },
      });
      const dimensions = await this.prisma.surveyDimension.findMany({ orderBy: { order: 'asc' } });

      type QuestionMeta = {
        id: string;
        sectionTitle: string;
        layerLabel: string | null;
        isReversed: boolean;
        dimensionId: string | null;
        dimensionName: string | null;
      };
      const scaleQuestions = new Map<string, QuestionMeta>();
      for (const sec of sections) {
        for (const q of sec.questions) {
          if ((q.type || '').toLowerCase() !== 'scale') continue;
          const label = q.label || '';
          const isReversed = label.endsWith(' (R)');
          const dim = q.dimension as { name?: string } | null;
          scaleQuestions.set(q.id, {
            id: q.id,
            sectionTitle: sec.title,
            layerLabel: sec.layerLabel,
            isReversed,
            dimensionId: q.dimensionId ?? null,
            dimensionName: dim?.name ?? null,
          });
        }
      }

      const periodKey = (d: Date) => d.toISOString().slice(0, 7);
      const byPeriodMap = new Map<string, Array<{ answers: string }>>();
      for (const r of allResponses) {
        const key = periodKey(new Date(r.createdAt));
        if (!byPeriodMap.has(key)) byPeriodMap.set(key, []);
        byPeriodMap.get(key)!.push(r);
      }

      const sectionOrderById = new Map(sections.map((s) => [s.id, s.order]));
      const dimensionSectionIds = new Map<string, Set<string>>();
      for (const [, meta] of scaleQuestions) {
        const dimId = meta.dimensionId;
        if (!dimId) continue;
        if (!dimensionSectionIds.has(dimId)) dimensionSectionIds.set(dimId, new Set());
      }

      for (const [period, periodResponses] of Array.from(byPeriodMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
        const questionSums = new Map<string, { sum: number; count: number }>();
        for (const r of periodResponses) {
          let answers: Record<string, string>;
          try {
            answers = JSON.parse(r.answers) as Record<string, string>;
          } catch {
            continue;
          }
          if (!answers || typeof answers !== 'object') continue;
          for (const [qId, rawVal] of Object.entries(answers)) {
            const meta = scaleQuestions.get(qId);
            if (!meta) continue;
            const raw = parseInt(rawVal, 10);
            if (Number.isNaN(raw) || raw < 1 || raw > 5) continue;
            const score100 = meta.isReversed ? (5 - raw) * 25 : (raw - 1) * 25;
            const prev = questionSums.get(qId) ?? { sum: 0, count: 0 };
            questionSums.set(qId, { sum: prev.sum + score100, count: prev.count + 1 });
          }
        }

        const byQuestion: Array<{ sectionTitle: string; averageScore: number; responseCount: number; dimensionId: string | null }> = [];
        for (const [qId, meta] of scaleQuestions) {
          const { sum, count } = questionSums.get(qId) ?? { sum: 0, count: 0 };
          const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
          byQuestion.push({
            sectionTitle: meta.sectionTitle,
            averageScore,
            responseCount: count,
            dimensionId: meta.dimensionId,
          });
        }

        const layerSums = new Map<string, { sum: number; count: number }>();
        for (const q of byQuestion) {
          const key = q.sectionTitle;
          const prev = layerSums.get(key) ?? { sum: 0, count: 0 };
          if (q.responseCount > 0) {
            layerSums.set(key, { sum: prev.sum + q.averageScore, count: prev.count + 1 });
          }
        }
        const byLayer = sections.map((sec) => {
          const { sum, count } = layerSums.get(sec.title) ?? { sum: 0, count: 0 };
          const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
          return { layerTitle: sec.title, layerLabel: sec.layerLabel, averageScore };
        });

        const dimensionSums = new Map<string, { sum: number; count: number }>();
        for (const q of byQuestion) {
          const dimId = q.dimensionId;
          if (!dimId) continue;
          const prev = dimensionSums.get(dimId) ?? { sum: 0, count: 0 };
          if (q.responseCount > 0) {
            dimensionSums.set(dimId, {
              sum: prev.sum + q.averageScore * q.responseCount,
              count: prev.count + q.responseCount,
            });
          }
        }
        const byDimension = dimensions.map((dim) => {
          const { sum, count } = dimensionSums.get(dim.id) ?? { sum: 0, count: 0 };
          const averageScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
          return { dimensionName: dim.name, averageScore };
        });

        let totalSum = 0;
        let totalCount = 0;
        for (const q of byQuestion) {
          if (q.responseCount > 0) {
            totalSum += q.averageScore * q.responseCount;
            totalCount += q.responseCount;
          }
        }
        const overallIndex = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 0;

        result.push({
          period,
          overallIndex,
          totalResponses: periodResponses.length,
          byLayer,
          byDimension,
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('getAnalyticsByPeriod error', err);
    }
    return { byPeriod: result };
  }

  /** Analytics grouped by one demographic (e.g. industry). For charts: compare companies/industries/demographics. */
  async getAnalyticsByDemographicGroup(questionId: string): Promise<{
    questionLabel: string;
    groups: Array<{
      value: string;
      label: string;
      overallIndex: number;
      totalResponses: number;
      byLayer: Array<{ layerTitle: string; layerLabel: string | null; averageScore: number }>;
      byDimension: Array<{ dimensionName: string; averageScore: number }>;
    }>;
  }> {
    const empty = { questionLabel: '', groups: [] };
    try {
      const full = await this.getAnalytics();
      const demo = full.demographics.find((d) => d.questionId === questionId);
      if (!demo) return empty;
      const values = demo.allOptions && demo.allOptions.length > 0 ? demo.allOptions : demo.options.map((o) => o.value);
      const groups: Array<{
        value: string;
        label: string;
        overallIndex: number;
        totalResponses: number;
        byLayer: Array<{ layerTitle: string; layerLabel: string | null; averageScore: number }>;
        byDimension: Array<{ dimensionName: string; averageScore: number }>;
      }> = [];
      for (const value of values) {
        const filtered = await this.getAnalytics({ [questionId]: value });
        groups.push({
          value,
          label: value === '(blank)' ? '(No answer)' : value,
          overallIndex: filtered.overallIndex,
          totalResponses: filtered.totalResponses,
          byLayer: filtered.byLayer.map((l) => ({ layerTitle: l.layerTitle, layerLabel: l.layerLabel, averageScore: l.averageScore })),
          byDimension: filtered.byDimension.map((d) => ({ dimensionName: d.dimensionName, averageScore: d.averageScore })),
        });
      }
      return { questionLabel: demo.label, groups };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('getAnalyticsByDemographicGroup error', err);
      return empty;
    }
  }

  /** Joint analysis: scores and counts by two demographics (e.g. Industry × Department). ADMIN only. */
  async getAnalyticsJoint(
    questionIdA: string,
    questionIdB: string,
  ): Promise<{
    questionLabelA: string;
    questionLabelB: string;
    rowLabels: string[];
    colLabels: string[];
    cells: Array<{ valueA: string; valueB: string; count: number; overallIndex: number }>;
  }> {
    const empty = {
      questionLabelA: '',
      questionLabelB: '',
      rowLabels: [] as string[],
      colLabels: [] as string[],
      cells: [] as Array<{ valueA: string; valueB: string; count: number; overallIndex: number }>,
    };
    try {
      const full = await this.getAnalytics();
      const demoA = full.demographics.find((d) => d.questionId === questionIdA);
      const demoB = full.demographics.find((d) => d.questionId === questionIdB);
      if (!demoA || !demoB || questionIdA === questionIdB) return empty;

      const rowLabels =
        demoA.allOptions && demoA.allOptions.length > 0
          ? demoA.allOptions
          : demoA.options.map((o) => o.value);
      const colLabels =
        demoB.allOptions && demoB.allOptions.length > 0
          ? demoB.allOptions
          : demoB.options.map((o) => o.value);

      const allResponses = await this.prisma.surveyResponse.findMany({
        select: { answers: true },
      });
      const sections = await this.prisma.surveySection.findMany({
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      const scaleQuestions = new Map<string, { isReversed: boolean }>();
      for (const sec of sections) {
        for (const q of sec.questions) {
          if ((q.type || '').toLowerCase() !== 'scale') continue;
          const label = q.label || '';
          scaleQuestions.set(q.id, { isReversed: label.endsWith(' (R)') });
        }
      }

      const cellMap = new Map<string, { sumScore: number; count: number }>();
      const key = (a: string, b: string) => a + '\t' + b;

      for (const r of allResponses) {
        let answers: Record<string, string>;
        try {
          answers = JSON.parse(r.answers) as Record<string, string>;
        } catch {
          continue;
        }
        if (!answers || typeof answers !== 'object') continue;

        const valueA = (answers[questionIdA] || '').trim() || '(blank)';
        const valueB = (answers[questionIdB] || '').trim() || '(blank)';

        let totalScore = 0;
        let scoreCount = 0;
        for (const [qId, rawVal] of Object.entries(answers)) {
          const meta = scaleQuestions.get(qId);
          if (!meta) continue;
          const raw = parseInt(rawVal, 10);
          if (Number.isNaN(raw) || raw < 1 || raw > 5) continue;
          const score100 = meta.isReversed ? (5 - raw) * 25 : (raw - 1) * 25;
          totalScore += score100;
          scoreCount += 1;
        }
        const responseOverall = scoreCount > 0 ? totalScore / scoreCount : 0;

        const k = key(valueA, valueB);
        const prev = cellMap.get(k) ?? { sumScore: 0, count: 0 };
        cellMap.set(k, {
          sumScore: prev.sumScore + responseOverall,
          count: prev.count + 1,
        });
      }

      const cells: Array<{ valueA: string; valueB: string; count: number; overallIndex: number }> = [];
      for (const [k, v] of cellMap) {
        const [valueA, valueB] = k.split('\t');
        const overallIndex =
          v.count > 0 ? Math.round((v.sumScore / v.count) * 10) / 10 : 0;
        cells.push({
          valueA,
          valueB,
          count: v.count,
          overallIndex,
        });
      }

      return {
        questionLabelA: demoA.label,
        questionLabelB: demoB.label,
        rowLabels,
        colLabels,
        cells,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('getAnalyticsJoint error', err);
      return empty;
    }
  }

  /** Scatter data for two scale questions (x, y) per response. ADMIN only. */
  async getScatterData(
    questionIdA: string,
    questionIdB: string,
    demographicFilters?: Record<string, string>,
  ): Promise<{ points: Array<{ x: number; y: number }> }> {
    const points: Array<{ x: number; y: number }> = [];
    try {
      const allResponses = await this.prisma.surveyResponse.findMany();
      const sections = await this.prisma.surveySection.findMany({
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
      const demographicSection = sections.find(
        (s) =>
          (s.title || '').toLowerCase() === 'demographic' ||
          (s.questions || []).some((q) => (q.type || '').toLowerCase() !== 'scale'),
      );
      const demographicQuestionIds = demographicSection
        ? (demographicSection.questions || [])
            .filter((q) => (q.type || '').toLowerCase() !== 'scale')
            .map((q) => q.id)
        : [];

      for (const r of allResponses) {
        let answers: Record<string, string>;
        try {
          answers = JSON.parse(r.answers) as Record<string, string>;
        } catch {
          continue;
        }
        if (!answers || typeof answers !== 'object') continue;
        if (demographicFilters && Object.keys(demographicFilters).length > 0) {
          const match = demographicQuestionIds.every((qId) => {
            const answerVal = (answers[qId] || '').trim();
            const filterVal = (demographicFilters[qId] || '').trim();
            if (filterVal === '(blank)' || filterVal === '') return !answerVal;
            return answerVal === filterVal;
          });
          if (!match) continue;
        }
        const vA = parseInt(answers[questionIdA], 10);
        const vB = parseInt(answers[questionIdB], 10);
        if (
          !Number.isNaN(vA) &&
          vA >= 1 &&
          vA <= 5 &&
          !Number.isNaN(vB) &&
          vB >= 1 &&
          vB <= 5
        ) {
          points.push({ x: vA, y: vB });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('getScatterData error', err);
    }
    return { points };
  }
}
