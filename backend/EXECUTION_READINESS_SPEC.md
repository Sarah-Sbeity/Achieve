# Execution Readiness Dashboard – Specification

This document defines the data model, metric logic, and dashboard layouts for an **Execution Readiness Dashboard** focused on whether the organization can **execute on decisions**, not just make them.

---

## 1. Execution Pillars & Categories (21 → 5)

| Pillar | Categories |
|--------|------------|
| **Decision Clarity** | Vision & Strategic Direction, External Positioning & Market Intelligence, Confidence & Competitive Positioning |
| **Decision Enablement** | Structure & Governance, Digital & Technology, Capabilities & Competencies |
| **Coordination & Flow** | Ways of Working & Collaboration, Relationship Quality, Leadership Effectiveness |
| **Psychological & Cultural Safety** | Trust & Psychological Safety, Voice & Agency, Fairness & Recognition, Culture & Values |
| **Energy & Sustainability** | Engagement & Energy, Wellbeing & Burnout, Meaning & Purpose, Silent Quitting / Disengagement, Retention Intent & Commitment |

*Map each survey dimension/section to one of these categories, and each category to one pillar.*

---

## 2. Data Model

### 2.1 Dimension Tables (reference / metadata)

```
ExecutionPillar
  id, name, order, weight (for Execution Readiness Score)
  e.g. Decision Clarity, Decision Enablement, ...

ExecutionCategory
  id, name, pillarId (FK), order
  e.g. Vision & Strategic Direction → Decision Clarity
```

**Mapping to existing schema:** Use `SurveyDimension` as **ExecutionCategory** (or add `categoryId` to it). Add table **ExecutionPillar** and link category → pillar. Link `SurveyQuestion` → category (existing `dimensionId` = category).

### 2.2 Respondent Dimensions (for variance & filters)

Store per response so we can slice by level, function, tenure, role:

```
ResponseDemographic (or in SurveyResponse.answers)
  responseId, level (leadership | individual_contributor | ...), function, tenure_band, role
```

**Practical approach:** Add optional `metadata` JSON to `SurveyResponse` (e.g. `{ "level": "leadership", "function": "Engineering", "tenure": "3-5 years" }`) populated from demographic questions or a post-submit dropdown.

### 2.3 Fact Tables (aggregated metrics)

**Option A – Store pre-aggregated metrics (for speed):**

```
CategoryMetric (by wave/period)
  categoryId, periodStart, periodEnd, respondentSegment (e.g. "all" | "leadership" | "individual_contributor")
  avgScore1to5, pctFavorable, responseCount

PillarMetric (by wave/period)
  pillarId, periodStart, periodEnd, respondentSegment
  avgScore1to5, pctFavorable, responseCount
```

**Option B – Compute on demand from raw responses:**  
Use `SurveyResponse` + `SurveyQuestion` → category → pillar; compute averages and % favorable in the analytics service. No separate fact tables.

*Recommendation:* Start with **Option B** (compute from responses). Add **Option A** later if you need fast dashboards over many waves.

### 2.4 Core Entity Relationship (logical)

```
SurveyQuestion → ExecutionCategory (dimensionId) → ExecutionPillar
SurveyResponse → answers (questionId → 1–5) + metadata (level, function, tenure)
```

---

## 3. Metric Definitions

### 3.1 Scale Convention

- Survey scale **1–5** (e.g. 1 = Strongly disagree, 5 = Strongly agree).
- **Reversed (R)** items: score = 6 − raw before averaging.
- **Average score (1–5)** for a category/pillar: mean of item scores in that category/pillar.
- **% Favorable:** proportion of responses that are 4 or 5 (after reversing (R) items).

### 3.2 Base Metrics (per category, per pillar, and by segment)

| Metric | Formula |
|--------|--------|
| **Average score (1–5)** | Mean of item scores in the category/pillar (per response, then average across responses; or aggregate sum/count). |
| **% Favorable** | (Count of responses 4 or 5) / (Count of valid scale responses) × 100. |
| **Variance by level** | Average score (or % favorable) for segment "leadership" minus segment "individual_contributor" (or same by level). |
| **Trend over time** | For each wave/period, compute average (or % favorable); trend = current period vs previous period (e.g. % point change). |

### 3.3 Derived Indices

| Index | Formula | Interpretation |
|-------|--------|----------------|
| **Execution Readiness Score** | Weighted average of the 5 pillar scores (e.g. 0–100). Weights configurable (default equal). | Overall ability to execute. |
| **Execution Friction Index** | Low enablement + high accountability: e.g. `(100 − EnablementScore) × AccountabilityWeight + AccountabilityScore × (1 − EnablementWeight)`. Or: high “we are held accountable” vs low “we have tools/structure.” | Where execution is blocked by lack of enablement despite high pressure. |
| **Execution Fatigue Index** | High clarity + low energy: e.g. `ClarityScore × (100 − EnergyScore) / 100`. | Decisions are clear but people lack energy to execute. |
| **Hidden Attrition Risk** | Engagement vs retention intent gap: e.g. `EngagementScore − RetentionIntentScore` (or segment by “silent quitters”: favorable on engagement, unfavorable on retention). | People who look engaged but are at risk of leaving. |

*All scores above can be on 0–100 scale (e.g. (avg 1–5) / 5 × 100) for consistency.*

### 3.4 Execution Readiness Score (detailed)

```
PillarScore_i = average of category scores in pillar i (0–100)
ExecutionReadinessScore = Σ (weight_i × PillarScore_i)  with Σ weight_i = 1
```

Default: equal weights. Weights stored in `ExecutionPillar.weight`.

---

## 4. Dashboard Layouts

### Dashboard 1: Executive Scorecard (single page, above the fold)

| Region | Content | Chart type |
|--------|--------|------------|
| Hero | **Execution Readiness Score** (big number, 0–100) + delta vs previous period | KPI + sparkline or trend arrow |
| Row 2 | **5-pillar heatmap**: one cell per pillar, color = red / amber / green by score band (e.g. &lt;40 red, 40–60 amber, &gt;60 green) | Heatmap or horizontal bar |
| Row 3 | **Top 3 execution blockers**: pillars or categories with lowest scores or largest decline | Horizontal bar or list with scores |
| Row 4 | **Trend vs previous period**: pillar-level or overall trend (e.g. +2.1 pts) | Small table or bar chart (current vs prior) |

**Filters:** Period/wave, optional segment (e.g. leadership vs all).

**Tooltips:** e.g. “Execution Readiness Score: weighted average of five pillars indicating how ready the organization is to execute on decisions.”

---

### Dashboard 2: Execution Breakdown

| Region | Content | Chart type |
|--------|--------|------------|
| Left | **Pillar scores by function** (e.g. Engineering, Product, …) | Grouped bar or heatmap (pillar × function) |
| Right | **Pillar scores by level** (e.g. leadership vs frontline) | Grouped bar or small multiples |
| Bottom | **Leadership vs frontline variance** (difference by pillar) | Bar chart (variance by pillar) |
| Optional | **Cross-team friction**: e.g. low “Coordination & Flow” in specific function × level | Heatmap with tooltips |

**Filters:** Role, function, tenure, level, period.

**Tooltips:** Explain “what this means for execution” (e.g. “Low Coordination & Flow here suggests decisions may not flow well from leadership to frontline.”).

---

### Dashboard 3: People & Execution Risk

| Region | Content | Chart type |
|--------|--------|------------|
| Top | **Burnout vs accountability scatter**: each point = team/segment; x = wellbeing/burnout score, y = accountability or pressure | Scatter plot |
| Middle | **Silent quitting risk segments**: e.g. % favorable on engagement vs % favorable on retention intent; quadrant or segment labels | Scatter (engagement × retention) or quadrant chart |
| Bottom | **Retention risk by team/function**: e.g. low retention intent or high “Hidden Attrition Risk” by segment | Bar chart or table |

**Filters:** Function, level, tenure, period.

**Tooltips:** e.g. “Hidden Attrition Risk: gap between engagement and retention intent; high values indicate people who may leave despite appearing engaged.”

---

## 5. Design Requirements Checklist

- **Executive-friendly, minimal:** One primary metric per block; avoid clutter.
- **Labels and tooltips:** Every chart has a short title and a tooltip explaining “what this means for execution.”
- **Chart types:** Prefer heatmaps, bar charts, radar charts (e.g. 5 pillars), and scatter plots as specified.
- **Filters:** Role, function, tenure, level; optional period/wave.
- **Focus:** Framing is “decision execution” (readiness, friction, fatigue, attrition risk), not engagement only.

---

## 6. Implementation Mapping to Current Platform

| Spec Concept | Current / Proposed |
|--------------|--------------------|
| Execution category | `SurveyDimension` (or new `ExecutionCategory` linked to dimension) |
| Execution pillar | New table `ExecutionPillar`; category has `pillarId` |
| Respondent level/function/tenure | Add `metadata` JSON to `SurveyResponse` or derive from demographic question ids in `answers` |
| Wave/period | Use `SurveyResponse.createdAt` and define periods (e.g. by month or by “wave” label in metadata) |
| Score 0–100 | Already in use; ensure (R) reversal and (value−1)×25 or /5×100 applied per item before aggregating |
| Filters (role, function, tenure, level) | Require demographic questions or post-submit fields stored in `metadata`; filter responses in analytics by metadata |

---

## 7. Next Steps

1. **Schema:** Add `ExecutionPillar`; add `pillarId` to dimension (or create `ExecutionCategory` and map dimensions to it); optionally add `SurveyResponse.metadata`.
2. **Seed:** Map existing dimensions to the 21 categories and 5 pillars; create pillar records and weights.
3. **Analytics API:** Extend `getAnalytics()` (or new `getExecutionAnalytics()`) to return pillar/category averages, % favorable, variance by level, and the four derived indices; support filters (level, function, tenure, period).
4. **Frontend:** Add three dashboard views (Executive Scorecard, Execution Breakdown, People & Execution Risk) with the suggested layouts and chart types; add filters and tooltips.

This spec is the single source of truth for the Execution Readiness data model, metrics, and dashboard design.
