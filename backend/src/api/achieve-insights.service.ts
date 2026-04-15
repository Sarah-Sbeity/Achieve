import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Achieve's Execution Diagnostics Engine.
You analyze numeric execution readiness scores (0–100) coming from employee survey results.
This is NOT an engagement survey.
Your job is to assess if employees are able to execute the company's initiatives successfully, identify execution friction, and translate results into clear executive insights.
Focus on: initiative execution capability, speed of execution, sustainability of execution, alignment, and commitment.
Avoid generic HR language, avoid long explanations, keep insights simple and professional.

Use score interpretation:
85–100 = Execution Strong
75–84 = Execution Healthy
65–74 = Execution Vulnerable
50–64 = Execution Risk
<50 = Execution Critical

Always output in this exact structure (no extra sections):
1) Executive Summary (2–4 sentences)
2) Execution Readiness Diagnosis
   - Overall classification
   - Primary constraint (which layer is lowest)
3) Key Strengths (max 3 bullets)
4) Key Risks (max 3 bullets)
5) Recommended Focus Area (1 sentence, action-oriented)`;

export interface AchieveScores {
  overall: number;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
}

@Injectable()
export class AchieveInsightsService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateReport(scores: AchieveScores): Promise<string> {
    if (!this.openai) {
      return this.fallbackReport(scores);
    }
    const userMessage = `Generate Achieve execution insights using these scores:
Overall OSR Index: ${scores.overall}
Layer 1 (Operational Enablement): ${scores.l1}
Layer 2 (Strategy & Leadership Alignment): ${scores.l2}
Layer 3 (Culture & Capacity): ${scores.l3}
Layer 4 (Commitment & Advocacy): ${scores.l4}
Return the insight report in the required structure.`;
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      return content || this.fallbackReport(scores);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Achieve insights OpenAI error:', err);
      return this.fallbackReport(scores);
    }
  }

  private fallbackReport(scores: AchieveScores): string {
    const cls =
      scores.overall >= 85 ? 'Execution Strong' :
      scores.overall >= 75 ? 'Execution Healthy' :
      scores.overall >= 65 ? 'Execution Vulnerable' :
      scores.overall >= 50 ? 'Execution Risk' : 'Execution Critical';
    const layers = [
      { name: 'Operational Enablement', score: scores.l1 },
      { name: 'Strategy & Leadership Alignment', score: scores.l2 },
      { name: 'Culture & Capacity', score: scores.l3 },
      { name: 'Commitment & Advocacy', score: scores.l4 },
    ];
    const lowest = layers.reduce((a, b) => (a.score <= b.score ? a : b));
    return `1) Executive Summary
Overall execution readiness is ${scores.overall}/100. ${cls}. The primary constraint is ${lowest.name} (${lowest.score}).

2) Execution Readiness Diagnosis
   - Overall classification: ${cls}
   - Primary constraint: ${lowest.name} (${lowest.score})

3) Key Strengths
   - Use the dashboard to identify dimensions above 75 as strengths.
   - Focus leadership communication on areas where scores are highest.
   - Reinforce practices in stronger layers to sustain execution.

4) Key Risks
   - ${lowest.name} is the lowest layer and may block execution.
   - Scores below 65 indicate vulnerability; address root causes.
   - Monitor trends and re-run the diagnostic after actions.

5) Recommended Focus Area
   Prioritize improving ${lowest.name} to lift overall execution readiness (target next pulse: ${Math.min(100, lowest.score + 10)}).`;
  }
}
