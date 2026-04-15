# Where survey answers are stored & where to put questions

- **Structure:** One **page per layer** (section): Demographic first, then each survey layer on its own page with Previous / Next / Submit. **Demographic** uses mixed types: **select** (dropdown with options) and **text** (free text). Other sections use **scale** (1–5) in a **matrix layout** with legend "1: Strongly disagree | 5: Strongly agree". Sections have **title**, optional **description**, and optional **layer label**.

## Where are the answers?

- **Database:** Table `SurveyResponse` in SQLite (`backend/prisma/dev.db`).
- **API (ADMIN only):** `GET /survey/responses` returns all responses (used by the Dashboard).
- **Dashboard:** Log in as ADMIN and open **Dashboard** to see all responses (anonymous, with date and answers).

## Where can I put / edit the questions?

Questions are stored in the **`SurveyQuestion`** table.

### Option 1: Prisma Studio (edit in the app)

1. From `backend` folder run: `npx prisma studio`
2. Open **SurveyQuestion** in the left panel.
3. Add, edit, or delete rows. Fields:
   - **label** – question text
   - **type** – `scale` (1–5), `text`, `textarea`, or `select`
   - **section** – `demographic` (shown first) or `main` (survey)
   - **options** – for `select` only: JSON array; for `scale` leave null
   - **order** – number to control order (lower = first)

### Option 2: Seed script (default questions)

- File: `backend/prisma/seed.ts`
- The seed creates two default questions if the table is empty. You can change those or add more in the `createMany` data array, then run: `npm run prisma:seed`

### Option 3: Direct database / SQL

- You can insert or update rows in `SurveyQuestion` with any SQLite client or migration.

### Question types

- **scale** – 1–5 rating (no options needed)
- **text** – single-line input
- **textarea** – multi-line input (optional)
- **select** – dropdown; **options** must be a JSON array of strings

## Data & metrics (Analytics)

For any scope (layer, dimension, or question), analytics compute:

- **Mean score** – 0–100 scale (higher = better).
- **Median** – median of normalized scores (0–100).
- **Likert distribution** – counts for raw responses 1–5 (before normalization).
- **% Favorable / Neutral / Unfavorable** – on normalized 0–100: unfavorable &lt; 25, neutral 25–50, favorable ≥ 50.
- **Trend vs previous period** – comparison of current month vs previous month (by response `createdAt`).
- **Benchmark gap** – placeholder; set when a benchmark cohort exists (current mean − cohort mean).
- **Response count (n)** – number of responses in scope.

**Reverse-scored items:** Questions whose label ends with `(R)` are normalized so higher always means “better”: raw 1–5 is mapped to 0–100 via `(5 - raw) * 25` for reversed and `(raw - 1) * 25` for non-reversed. All reported means, medians, and favorable % use this normalized scale.
