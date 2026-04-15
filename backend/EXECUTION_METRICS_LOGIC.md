# Execution Readiness – Metric Logic (Implementation Reference)

All scale items: 1–5. Reversed (R) items: `score = 6 - raw`. Optional normalization to 0–100: `score100 = (score - 1) * 25` (or `score / 5 * 100`).

---

## 1. Base metrics (per category, per pillar, per segment)

```text
For a set of responses R and a set of scale questions Q (e.g. in one category):

  item_scores = for each r in R, for each q in Q: get answer r.answers[q.id], reverse if (R), else use raw
  valid_scores = item_scores where value in [1..5]

  average_score_1_5 = mean(valid_scores)
  average_score_100 = average_score_1_5 / 5 * 100

  favorable_count = count(valid_scores where value in [4, 5])
  pct_favorable = favorable_count / count(valid_scores) * 100
```

**By segment (e.g. level):** Filter R by `response.metadata.level === "leadership"` (or `"individual_contributor"`) then compute the same.

**Variance by level:**  
`variance = average_score(leadership) - average_score(individual_contributor)`  
(or same for % favorable).

**Trend over time:**  
Define periods (e.g. by `response.createdAt` or `response.metadata.wave`).  
`trend = average_score(current_period) - average_score(previous_period)` (in points).

---

## 2. Pillar score and Execution Readiness Score

```text
PillarScore_p = average of category scores in pillar p (each category = average of its question scores over responses)
  Option: weight categories equally within pillar, or by question count.

ExecutionReadinessScore = Σ (weight_p × PillarScore_p)   for p in 5 pillars
  where weight_p from ExecutionPillar.weight and Σ weight_p = 1.
  Output 0–100.
```

---

## 3. Execution Friction Index

```text
EnablementScore = score for pillar "Decision Enablement" (0–100)
AccountabilityScore = score from items about being held accountable / clarity of accountability (0–100)
  If no single “accountability” category, use a tagged subset of questions or one category.

ExecutionFrictionIndex = (100 - EnablementScore) * 0.5 + AccountabilityScore * 0.5
  Or: high when EnablementScore is low AND AccountabilityScore is high (interpret as “high pressure, low support”).
  Normalize to 0–100 for display; higher = more friction.
```

---

## 4. Execution Fatigue Index

```text
ClarityScore = score for pillar "Decision Clarity" (0–100)
EnergyScore   = score for pillar "Energy & Sustainability" (0–100)

ExecutionFatigueIndex = ClarityScore * (100 - EnergyScore) / 100
  Higher = decisions are clear but energy is low (fatigue risk).
  Normalize to 0–100 for display if needed.
```

---

## 5. Hidden Attrition Risk

```text
EngagementScore    = from category "Engagement & Energy" or relevant items (0–100)
RetentionIntentScore = from category "Retention Intent & Commitment" or relevant items (0–100)

HiddenAttritionRisk = EngagementScore - RetentionIntentScore
  Positive = more engaged than retention intent suggests (silent quitting risk).
  Can segment by team/function; show as bar or scatter (engagement vs retention intent).
```

---

## 6. Chart outputs for dashboards

| Dashboard | Metric / chart | Source |
|-----------|----------------|--------|
| Executive Scorecard | Execution Readiness Score | §2 |
| Executive Scorecard | 5-pillar heatmap | PillarScore_p, color by band |
| Executive Scorecard | Top 3 blockers | Min 3 of PillarScore or category scores |
| Executive Scorecard | Trend vs prior period | §1 trend |
| Execution Breakdown | Pillar by function/level | §1 by segment; group by metadata.function / metadata.level |
| Execution Breakdown | Leadership vs frontline variance | §1 variance by level |
| People & Execution Risk | Burnout vs accountability scatter | Wellbeing score (x) vs Accountability score (y) by segment |
| People & Execution Risk | Silent quitting segments | Engagement (x) vs Retention intent (y); quadrant |
| People & Execution Risk | Retention risk by team | HiddenAttritionRisk or low RetentionIntentScore by segment |

Use these formulas in the analytics service and expose results to the frontend for the three dashboard layouts in `EXECUTION_READINESS_SPEC.md`.
